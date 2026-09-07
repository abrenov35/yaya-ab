(function(){
  'use strict';

  if(window.__yayaManageChantierToolbarInstalled)return;
  window.__yayaManageChantierToolbarInstalled=true;

  const STYLE_ID='yaya-manage-chantier-toolbar-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-edit-chantier-btn{
        display:none!important;
      }
      .hdr .tabs #yayaCreateChantierBtn{
        min-width:142px!important;
      }
      @media(max-width:760px){
        .hdr .tabs #yayaCreateChantierBtn{
          min-width:auto!important;
          padding-left:10px!important;
          padding-right:10px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function currentChantierId(){
    try{
      return String(focusChantier||'').trim();
    }catch(e){
      return '';
    }
  }

  function manageChantier(){
    const cid=currentChantierId();
    if(cid && typeof window.openExistingChantierModal==='function'){
      window.openExistingChantierModal(cid);
      return;
    }
    if(typeof window.openChantierModal==='function'){
      window.openChantierModal();
    }
  }

  function bindButton(){
    const btn=document.getElementById('yayaCreateChantierBtn');
    if(!btn)return false;

    btn.textContent='🛠️ Gérer chantier';
    btn.title='Ajouter ou modifier un chantier';
    btn.setAttribute('aria-label','Gérer chantier');

    if(btn.dataset.yayaManageBound==='1')return true;
    btn.dataset.yayaManageBound='1';

    btn.addEventListener('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
      manageChantier();
    },true);

    return true;
  }

  function refresh(){
    bindButton();
    document.querySelectorAll('#pane-chantiers .yaya-edit-chantier-btn').forEach(function(btn){
      btn.style.display='none';
    });
  }

  const observer=new MutationObserver(function(){
    refresh();
  });

  observer.observe(document.documentElement,{childList:true,subtree:true});
  refresh();
  setTimeout(refresh,100);
  setTimeout(refresh,500);
})();
