(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-edit-archive-style-v4';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-chantier-edit-modal .mfoot{
        display:grid!important;
        grid-template-columns:minmax(0,1.35fr) minmax(0,1.15fr) minmax(0,1fr) minmax(0,.9fr)!important;
        gap:8px!important;
        align-items:stretch!important;
        justify-content:stretch!important;
        flex-wrap:nowrap!important;
      }
      .yaya-chantier-edit-modal .mfoot > button{
        width:100%!important;
        min-width:0!important;
        margin:0!important;
        padding:10px 6px!important;
        white-space:nowrap!important;
        font-size:11px!important;
        line-height:1.15!important;
      }
      .yaya-archive-chantier-modal-btn{
        background:#fff7e8!important;
        border:1px solid #efb86f!important;
        color:#9a4d00!important;
        font-weight:750!important;
      }
      .yaya-archive-chantier-modal-btn:hover{
        background:#ffefd2!important;
        border-color:#d8953b!important;
      }
      #yaya-archive-warning{
        z-index:40000!important;
        pointer-events:auto!important;
      }
      #pane-chantiers .yaya-edit-chantier-btn{
        display:none!important;
      }
      .hdr .tabs #yayaCreateChantierBtn{
        min-width:142px!important;
      }
      @media(max-width:640px){
        .yaya-chantier-edit-modal .mfoot{
          grid-template-columns:minmax(0,1.35fr) minmax(0,1.15fr) minmax(0,1fr) minmax(0,.9fr)!important;
          gap:5px!important;
        }
        .yaya-chantier-edit-modal .mfoot > button{
          padding:9px 3px!important;
          font-size:9.5px!important;
          letter-spacing:-.01em!important;
        }
        .hdr .tabs #yayaCreateChantierBtn{
          min-width:auto!important;
          padding-left:10px!important;
          padding-right:10px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function extractCid(modal){
    const save=modal&&modal.querySelector('#editChSave');
    const onclick=String(save&&save.getAttribute('onclick')||'');
    const match=onclick.match(/saveExistingChantier\(['\"]([^'\"]+)/);
    return match&&match[1]?match[1]:'';
  }

  function elevateArchiveWarning(){
    const warning=document.getElementById('yaya-archive-warning');
    if(!warning)return false;

    if(warning.parentNode!==document.body){
      document.body.appendChild(warning);
    }

    warning.style.setProperty('position','fixed','important');
    warning.style.setProperty('inset','0','important');
    warning.style.setProperty('z-index','40000','important');
    warning.style.setProperty('pointer-events','auto','important');
    return true;
  }

  function decorateModal(){
    const modal=document.querySelector('.yaya-chantier-edit-modal');
    if(!modal||modal.dataset.archiveButtonReady==='1')return;
    const foot=modal.querySelector('.mfoot');
    if(!foot)return;

    const del=foot.querySelector('.yaya-delete-chantier-modal-btn');
    const save=foot.querySelector('#editChSave');
    const cancel=foot.querySelector('#editChCancel');
    if(!del||!save||!cancel)return;

    const cid=extractCid(modal);
    if(!cid)return;

    let archive=foot.querySelector('.yaya-archive-chantier-modal-btn');
    if(!archive){
      archive=document.createElement('button');
      archive.type='button';
      archive.className='btn2 yaya-archive-chantier-modal-btn';
      archive.textContent='Archiver chantier';
      archive.addEventListener('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        if(typeof window.archiverChantier!=='function')return;

        window.archiverChantier(cid);
        elevateArchiveWarning();
        requestAnimationFrame(elevateArchiveWarning);
        setTimeout(elevateArchiveWarning,40);
      });
    }

    foot.replaceChildren(del,archive,save,cancel);
    modal.dataset.archiveButtonReady='1';
  }

  function currentChantierId(){
    try{
      return String(focusChantier||'').trim();
    }catch(e){
      return '';
    }
  }

  function syncManageToolbar(){
    const btn=document.getElementById('yayaCreateChantierBtn');
    if(!btn)return false;
    btn.textContent='🛠️ Gérer chantier';
    btn.title='Ajouter ou modifier un chantier';
    btn.setAttribute('aria-label','Gérer chantier');
    return true;
  }

  function manageChantier(){
    const cid=currentChantierId();
    if(cid&&typeof window.openExistingChantierModal==='function'){
      window.openExistingChantierModal(cid);
      return;
    }
    if(typeof window.openChantierModal==='function'){
      window.openChantierModal();
    }
  }

  document.addEventListener('click',function(event){
    const btn=event.target&&event.target.closest
      ?event.target.closest('#yayaCreateChantierBtn')
      :null;
    if(!btn)return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function'){
      event.stopImmediatePropagation();
    }
    manageChantier();
  },true);

  function installToolbarObserver(){
    const header=document.querySelector('.hdr');
    if(!header){
      setTimeout(installToolbarObserver,120);
      return;
    }
    if(header.dataset.yayaManageToolbarObserved==='1'){
      syncManageToolbar();
      return;
    }
    header.dataset.yayaManageToolbarObserved='1';
    new MutationObserver(function(){
      syncManageToolbar();
    }).observe(header,{childList:true,subtree:true});
    syncManageToolbar();
  }

  const root=document.getElementById('modalRoot')||document.documentElement;
  const observer=new MutationObserver(function(){
    if(document.querySelector('.yaya-chantier-edit-modal:not([data-archive-button-ready="1"])')){
      decorateModal();
    }
  });
  observer.observe(root,{childList:true,subtree:true});

  setTimeout(decorateModal,0);
  installToolbarObserver();
  setTimeout(syncManageToolbar,250);
  setTimeout(syncManageToolbar,800);
})();
