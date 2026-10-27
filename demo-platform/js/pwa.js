// Shared website lifecycle: check on reopen and let people finish work before refreshing.
(()=>{
  if(!('serviceWorker' in navigator))return;
  let registration,notice;
  const offerUpdate=()=>{
    if(!registration?.waiting||notice)return;
    notice=document.createElement('div');
    notice.setAttribute('role','status');
    notice.style.cssText='position:fixed;bottom:20px;left:16px;right:16px;z-index:10000;background:#17351f;color:white;padding:16px;border-radius:12px;box-shadow:0 4px 24px #0004;font:16px system-ui;display:flex;gap:12px;align-items:center;flex-wrap:wrap';
    const message=document.createElement('span');message.textContent='A TurfOS update is ready. Save your work, then refresh.';
    const button=document.createElement('button');button.className='btn';button.textContent='Refresh TurfOS';button.style.cssText='background:#fff;color:#304b35;border-color:#bbcdb0';
    button.onclick=()=>{button.disabled=true;const worker=registration.waiting;if(!worker){location.reload();return}navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});worker.postMessage({type:'SKIP_WAITING'})};
    notice.append(message,button);document.body.append(notice);
  };
  addEventListener('load',async()=>{
    try{
      registration=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});
      offerUpdate();
      registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)offerUpdate()})});
      const check=()=>{if(navigator.onLine)registration.update().then(offerUpdate).catch(()=>{})};
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
      addEventListener('online',check);check();
    }catch(error){console.warn('TurfOS offline startup unavailable',error)}
  });
})();
