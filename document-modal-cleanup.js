(function(){
  'use strict';

  if(window.__yayaDocumentModalCleanupV1)return;
  window.__yayaDocumentModalCleanupV1=true;

  function hideOpenAIWarning(modal){
    if(!modal)return;
    Array.from(modal.querySelectorAll('div,span,p,small,label')).forEach(function(el){
      if(el.children&&el.children.length)return;
      const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/Clé\s+OpenAI\s+absente/i.test(txt)||/OPENAI_API_KEY/i.test(txt)){
        el.style.setProperty('display','none','important');
        el.setAttribute('aria-hidden','true');
      }
    });
  }

  function clean(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const modal=Array.from(root.querySelectorAll('.modal')).find(function(item){
      return !!(item.querySelector('#docFile')||item.querySelector('#docSujet')||item.querySelector('#docType'));
    });
    if(!modal)return;

    hideOpenAIWarning(modal);
  }

  clean();
  const root=document.getElementById('modalRoot');
  if(root){
    new MutationObserver(clean).observe(root,{childList:true,subtree:true,characterData:true});
  }
})();
