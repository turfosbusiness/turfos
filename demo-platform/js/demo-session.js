(()=>{
const account={id:'preview-owner',businessId:'preview-business',email:'owner@example.com',companyName:'Green Lawn LLC',ownerName:'Business Owner',role:'owner',businessCode:'TURF-DEMO'};
const stamp=new Date().toISOString();
let workspace={mode:'biz',bp:[{id:'preview-property',name:'Jordan Smith',customerName:'Jordan Smith',street:'123 Sample Lane',email:'customer@example.com',phone:'',sqft:4000,customPrice:35,zones:[],obstacles:[],visits:[],probs:[],msgs:[],inv:[{id:'INV-DEMO-PAID',date:'2026-10-12',desc:'Lawn mowing service',amt:36.36,paid:true,paymentManaged:true,paymentStatus:'paid',paymentFee:1.35,paymentNet:35.01,paymentRefunded:0,delivery:'sent'},{id:'INV-DEMO-BANK',date:'2026-10-13',desc:'Lawn mowing service · bank payment',amt:36.36,paid:false,paymentManaged:true,paymentStatus:'processing',delivery:'sent'}],autoInvoice:true,customerPortalId:'CUST-DEMO'}],bsel:0,set:{businessName:account.companyName,businessEmail:account.email,price:35,autoPrice:false,autoInvoice:true,paymentPricing:'include',paymentFeePercent:2.9,paymentFeeFixed:0.3,h:'3.5"',rain:12,rot:3,requireProofPhoto:true,invoiceEmailEndpoint:'/api/send-invoice',mowingTimeMinutes:2,mowingTimeArea:1000},cloudUpdatedAt:stamp};

const memory=new Map([['turfos-auth-token-v1','sample-business-session']]);
Object.defineProperty(window,'localStorage',{value:{getItem:k=>memory.get(String(k))??null,setItem:(k,v)=>memory.set(String(k),String(v)),removeItem:k=>memory.delete(String(k)),clear:()=>memory.clear(),key:i=>[...memory.keys()][i]??null,get length(){return memory.size}}});
const originalFetch=window.fetch.bind(window);
const reply=(data,status=200)=>Promise.resolve(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}}));
window.fetch=(input,options={})=>{
 const url=new URL(typeof input==='string'?input:input.url,location.href), route=url.pathname;
 if(route.startsWith('/api/')){
 let body={};try{body=JSON.parse(options.body||'{}')}catch(e){}
 if(route==='/api/auth/me')return reply({ok:true,account});
 if(route==='/api/auth/crew')return reply({ok:true,crew:[]});
 if(route==='/api/workspace'){if(options.method==='PUT')workspace=body.workspace;return reply({ok:true,workspace,updatedAt:new Date().toISOString()})}
 if(route==='/api/payments/status')return reply({configured:true,connected:true,mode:'test',chargesEnabled:true,payoutsEnabled:true,bankPaymentsEnabled:true,requirements:[]});
 if(route==='/api/payments/refresh')return reply({ok:true});
 if(route==='/api/vision/surfaces')return reply({available:false});
 if(route==='/api/address-search')return reply({matches:[]});
 return reply({error:'This is a sample business account. Payments, emails, account changes, and live AI requests are unavailable in the demo.'},409);
 }
 if(url.origin!==location.origin&&options.method&&options.method.toUpperCase()!=='GET')return reply({error:'External changes are unavailable in this demo.'},409);
 return originalFetch(input,options);
};
})();
