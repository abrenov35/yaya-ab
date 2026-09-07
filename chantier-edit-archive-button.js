(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-edit-archive-style-v2';
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
      archive.addEventListener('click',function(){
        if(typeof window.archiverChantier==='function')window.archiverChantier(cid);
      });
    }

    foot.replaceChildren(del,archive,save,cancel);
    modal.dataset.archiveButtonReady='1';
  }

  const root=document.getElementById('modalRoot')||document.documentElement;
  const observer=new MutationObserver(function(){
    if(document.querySelector('.yaya-chantier-edit-modal:not([data-archive-button-ready="1"])')){
      decorateModal();
    }
  });
  observer.observe(root,{childList:true,subtree:true});
  setTimeout(decorateModal,0);
})();
