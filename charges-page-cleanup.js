(function(){
  'use strict';

  function installStyle(){
    if(document.getElementById('yaya-charges-voir-style-v1'))return;
    const style=document.createElement('style');
    style.id='yaya-charges-voir-style-v1';
    style.textContent=`
      #pane-achats .charge-open-btn{
        width:28px!important;
        min-width:28px!important;
        max-width:28px!important;
        height:28px!important;
        min-height:28px!important;
        padding:0!important;
        margin:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #a9c8e8!important;
        border-radius:7px!important;
        background:#f3f8fd!important;
        color:#174d7d!important;
        box-shadow:0 1px 3px rgba(22,45,73,.14)!important;
        font-size:0!important;
        line-height:1!important;
        cursor:pointer!important;
      }
      #pane-achats .charge-open-btn::before{
        content:"👁"!important;
        font-size:15px!important;
        line-height:1!important;
      }
      #pane-achats .charge-open-btn:hover{
        background:#e9f3fc!important;
        border-color:#83b2df!important;
        box-shadow:0 2px 5px rgba(22,45,73,.17)!important;
      }
    `;
    document.head.appendChild(style);
  }

  function clean(){
    const pane=document.getElementById('pane-achats');
    if(!pane)return;
    pane.querySelectorAll('button').forEach(btn=>{
      const txt=(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(txt.includes('ajouter un achat')||txt.includes('ajouter une charge')){
        btn.remove();
      }
    });
  }

  installStyle();
  clean();
  const obs=new MutationObserver(()=>clean());
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
