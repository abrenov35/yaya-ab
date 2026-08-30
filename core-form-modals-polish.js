(function(){
  'use strict';

  const STYLE_ID='yaya-core-form-modals-polish-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-core-form-overlay{
        background:rgba(16,42,70,.48)!important;
        backdrop-filter:blur(2px)!important;
      }
      #modalRoot .yaya-core-form-modal{
        box-sizing:border-box!important;
        border:1px solid #d8e2ec!important;
        background:#fff!important;
        color:#263b52!important;
        box-shadow:0 22px 60px rgba(16,42,70,.28)!important;
      }
      #modalRoot .yaya-core-form-modal h5{
        align-items:center!important;
        color:#263b52!important;
        font-size:15px!important;
        font-weight:750!important;
      }
      #modalRoot .yaya-core-form-modal h5 button{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:34px!important;
        padding:0 13px!important;
        border:1px solid #d4dde7!important;
        border-radius:9px!important;
        background:#f7f9fb!important;
        color:#43566b!important;
        box-shadow:0 1px 3px rgba(16,42,70,.08)!important;
        font-family:inherit!important;
        font-size:12px!important;
        font-weight:650!important;
        cursor:pointer!important;
      }
      #modalRoot .yaya-core-form-modal h5 button:hover{
        background:#eef3f7!important;
        border-color:#b9c8d7!important;
      }
      #modalRoot .yaya-core-form-modal .inp,
      #modalRoot .yaya-core-form-modal .msel,
      #modalRoot .yaya-core-form-modal .mnum{
        min-height:40px!important;
        box-sizing:border-box!important;
        border:1px solid #c7d3df!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#263b52!important;
      }
      #modalRoot .yaya-core-form-modal .inp:focus,
      #modalRoot .yaya-core-form-modal .msel:focus,
      #modalRoot .yaya-core-form-modal .mnum:focus{
        border-color:#5f8fbd!important;
        outline:3px solid rgba(95,143,189,.16)!important;
        outline-offset:0!important;
      }
      #modalRoot .yaya-core-form-modal .row,
      #modalRoot .yaya-core-form-modal .mrow{
        gap:10px!important;
      }
      #modalRoot .yaya-core-form-modal .mfoot{
        justify-content:center!important;
        gap:10px!important;
        padding-top:14px!important;
        border-top:1px solid #e7edf3!important;
      }
      #modalRoot .yaya-core-form-modal .mfoot button{
        min-height:38px!important;
        padding-left:16px!important;
        padding-right:16px!important;
      }
      #modalRoot .yaya-quote-form-modal .mrow > .msel,
      #modalRoot .yaya-quote-form-modal .mrow > .mnum{
        width:100%!important;
      }
      #modalRoot .yaya-purchase-form-modal #acCh{flex:1 1 230px!important}
      #modalRoot .yaya-purchase-form-modal #acType{flex:1 1 150px!important}
      #modalRoot .yaya-purchase-form-modal #acFour{flex:1 1 160px!important;width:auto!important}
      #modalRoot .yaya-purchase-form-modal #acDes{flex:2 1 240px!important;width:auto!important}
      #modalRoot .yaya-purchase-form-modal #acDate{flex:1 1 150px!important;width:auto!important}
      #modalRoot .yaya-purchase-form-modal #acMt{flex:1 1 125px!important;width:auto!important}
      #modalRoot .yaya-purchase-form-modal #acST{flex:1 1 190px!important;width:auto!important}
      #modalRoot .yaya-chantier-edit-modal .yaya-planning-box{
        padding:12px!important;
        border-color:#d8e2ec!important;
        background:#f7f9fb!important;
      }

      @media(min-width:761px){
        #modalRoot .yaya-core-form-overlay{
          align-items:center!important;
          justify-content:center!important;
          padding:24px!important;
          overflow:auto!important;
        }
        #modalRoot .yaya-core-form-modal{
          width:calc(100% - 32px)!important;
          max-height:calc(100dvh - 48px)!important;
          margin:auto!important;
          padding:22px!important;
          border-radius:16px!important;
          overflow-y:auto!important;
        }
        #modalRoot .yaya-quote-form-modal{max-width:500px!important}
        #modalRoot .yaya-purchase-form-modal{max-width:560px!important}
        #modalRoot .yaya-chantier-edit-modal{max-width:520px!important}
        #modalRoot .yaya-core-form-modal h5{
          margin:0 0 16px!important;
          padding:0 0 13px!important;
          border-bottom:1px solid #e7edf3!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function decorate(){
    const root=document.getElementById('modalRoot');
    const modal=root&&root.querySelector('.modal');
    if(!modal)return;
    const title=String(modal.querySelector('h5')?.textContent||'').replace(/\s+/g,' ').trim();
    let kind='';
    if(/^Ajouter le devis\b/i.test(title))kind='yaya-quote-form-modal';
    else if(/^Enregistrer un achat\s*\/\s*une facture\b/i.test(title))kind='yaya-purchase-form-modal';
    else if(/^Modifier le chantier\b/i.test(title))kind='yaya-chantier-edit-modal';
    if(!kind)return;
    modal.classList.add('yaya-core-form-modal',kind);
    modal.closest('.overlay')?.classList.add('yaya-core-form-overlay');
  }

  function install(){
    installStyle();
    decorate();
    const root=document.getElementById('modalRoot');
    if(root)new MutationObserver(()=>requestAnimationFrame(decorate)).observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
