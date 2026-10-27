/* Shared browser/Worker billing calendar. No payments are charged by this module. */
(function(root){
 const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!isNaN(Date.parse(d+'T12:00Z'))&&new Date(d+'T12:00Z').toISOString().slice(0,10)===d;
 function dateFor(date,frequency,anchor){
  if(!valid(date)||!valid(anchor)||!['weekly','biweekly','monthly'].includes(frequency))return null;
  if(date<=anchor)return anchor;
  const start=new Date(anchor+'T12:00Z'),day=new Date(date+'T12:00Z');
  if(frequency!=='monthly'){const step=frequency==='weekly'?7:14,n=Math.ceil((day-start)/86400000/step);start.setUTCDate(start.getUTCDate()+n*step);return start.toISOString().slice(0,10)}
  let month=(day.getUTCFullYear()-start.getUTCFullYear())*12+day.getUTCMonth()-start.getUTCMonth();
  const candidate=n=>{const d=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+n,1,12));d.setUTCDate(Math.min(start.getUTCDate(),new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate()));return d.toISOString().slice(0,10)};
  let result=candidate(month);return result<date?candidate(month+1):result;
 }
 function queue(ws,p,v,pricing){
  if(ws.set?.autoInvoice===false||p.autoInvoice===false||v.invoiceId||v.billingPending)return;
  const due=dateFor(v.date,ws.set?.billingFrequency,ws.set?.billingAnchor);if(!due)return;
  v.billingPending={date:due,amount:pricing.amt,base:pricing.pricing?.base??pricing.base??pricing.amt,mode:pricing.pricing?.mode||'absorb'};
 }
 function collect(ws,today){
  const output=[];
  for(const p of ws.bp||[]){if(ws.set?.autoInvoice===false||p.autoInvoice===false||p.setupPending)continue;
   const groups=new Map();for(const v of p.visits||[]){if(v.invoiceId||!v.billingPending||v.billingPending.date>today)continue;const due=v.billingPending.date;if(!groups.has(due))groups.set(due,[]);groups.get(due).push(v)}
   for(const [due,visits] of groups){
    const id='INV-CYCLE-'+crypto.randomUUID(),items=visits.map(v=>({serviceId:v.id||'date:'+v.date,date:v.date,amount:v.billingPending.amount})),amt=Math.round(items.reduce((sum,x)=>sum+x.amount,0)*100)/100;
    if(!Number.isFinite(amt)||amt<=0)continue;
    const invoice={id,date:due,desc:visits.length+' lawn service'+(visits.length===1?'':'s')+' · '+items.map(x=>x.date).sort().join(', '),amt,paid:false,delivery:'queued',billingCycle:true,serviceIds:items.map(x=>x.serviceId),items,pricing:{base:Math.round(visits.reduce((sum,v)=>sum+v.billingPending.base,0)*100)/100,mode:'absorb'}};
    p.inv=p.inv||[];p.inv.unshift(invoice);for(const v of visits){v.invoiceId=id;delete v.billingPending}output.push({property:p,invoice});
   }
  }return output;
 }
 root.TurfBilling={valid,dateFor,queue,collect};
})(globalThis);
