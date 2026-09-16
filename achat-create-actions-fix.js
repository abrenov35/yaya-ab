(function(){
  'use strict';

  if(window.__yayaAchatCreateActionsFixV3)return;
  window.__yayaAchatCreateActionsFixV3=true;

  const STYLE_ID='yaya-achat-create-actions-fix-v3';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-achat-required-fields{
        display:grid!important;
        grid-template-columns:minmax(150px,1fr) minmax(180px,1.5fr) minmax(120px,.8fr)!important;
        gap:10px!important;
        align-items:center!important;
        margin:16px 0 4px!important;
        width:100%!important;
      }
      .yaya-achat-required-fields > input{
        display:block!important;
        visibility:visible!important;
        opacity:1!important;
        width:100%!important;
        min-width:0!important;
        height:42px!important;
        margin:0!important;
      }
      .yaya-achat-create-actions-fixed{
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        justify-content:center!important;
        gap:12px!important;
        flex-wrap:nowrap!important;
        margin-top:14px!important;
      }
      .yaya-achat-create-actions-fixed > button{
        height:44px!important;
        min-height:44px!important;
        margin:0!important;
        margin-left:0!important;
        margin-right:0!important;
        white-space:nowrap!important;
      }
      .yaya-achat-create-actions-fixed .yaya-achat-import-btn{
        order:1!important;
        background:#249457!important;
        border:1px solid #249457!important;
        color:#fff!important;
        opacity:1!important;
        filter:none!important;
        padding:0 22px!important;
        font-weight:700!important;
        cursor:pointer!important;
      }
      .yaya-achat-create-actions-fixed .yaya-achat-save-btn{order:2!important;}
      .yaya-achat-create-actions-fixed .yaya-achat-close-btn{order:3!important;}
      .yaya-achat-create-actions-fixed .yaya-achat-import-btn:hover{
        background:#1f7f4b!important;
        border-color:#1f7f4b!important;
        color:#fff!important;
      }
      @media(max-width:640px){
        .yaya-achat-required-fields{
          grid-template-columns:1fr!important;
          gap:8px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function bindImportButton(upload,modal){
    if(!upload||!modal)return;
    upload.type='button';
    upload.removeAttribute('onclick');
    upload.onclick=function(event){
      event.preventDefault();
      event.stopPropagation();
      const input=modal.querySelector('#achatFile')||document.getElementById('achatFile');
      if(!input){
        console.warn('Import achat : champ fichier #achatFile introuvable');
        if(typeof toast==='function')toast('Import impossible : sélecteur de fichier introuvable',true);
        return;
      }
      try{input.value='';}catch(_){}
      input.click();
    };
  }

  function findCreateModal(root){
    return Array.from(root.querySelectorAll('.modal')).find(function(modal){
      const h=modal.querySelector('h5,h4,h3');
      const title=String(h&&h.textContent||'').replace(/\s+/g,' ').trim();
      return /Enregistrer un achat|Ajouter une charge sous-traitant/i.test(title) && !/^Modifier\s+/i.test(title);
    })||null;
  }

  function makeInput(id,placeholder,type){
    const input=document.createElement('input');
    input.id=id;
    input.className='inp';
    input.type=type||'text';
    input.placeholder=placeholder;
    return input;
  }

  function currentChantierId(){
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);}catch(e){}
    try{return new URL(window.location.href).searchParams.get('chantier')||'';}catch(e){return '';}
  }

  function ensureSupportFields(modal){
    if(!modal.querySelector('#acCh')){
      const cid=currentChantierId();
      if(cid){
        const ch=makeInput('acCh','', 'hidden');
        ch.value=cid;
        modal.appendChild(ch);
      }
    }
    if(!modal.querySelector('#acType')){
      const type=makeInput('acType','', 'hidden');
      type.value='Facture';
      modal.appendChild(type);
    }
    if(!modal.querySelector('#acDate')){
      const date=makeInput('acDate','', 'hidden');
      date.value=new Date().toISOString().slice(0,10);
      modal.appendChild(date);
    }
    if(!modal.querySelector('#acST')){
      modal.appendChild(makeInput('acST','', 'hidden'));
    }
  }

  function ensureRequiredFields(modal){
    ensureSupportFields(modal);

    let fournisseur=modal.querySelector('#acFour');
    let designation=modal.querySelector('#acDes');
    let montant=modal.querySelector('#acMt');

    if(!fournisseur)fournisseur=makeInput('acFour','Fournisseur');
    if(!designation)designation=makeInput('acDes','Désignation');
    if(!montant){
      montant=makeInput('acMt','Montant HT €','number');
      montant.step='0.01';
    }

    fournisseur.placeholder='Fournisseur';
    designation.placeholder='Désignation';
    montant.placeholder='Montant HT €';

    let row=modal.querySelector('.yaya-achat-required-fields');
    if(!row){
      row=document.createElement('div');
      row.className='yaya-achat-required-fields';
      const footer=modal.querySelector('.yaya-achat-create-actions-fixed');
      if(footer)modal.insertBefore(row,footer);
      else modal.appendChild(row);
    }

    [fournisseur,designation,montant].forEach(function(field){
      if(field.parentElement!==row)row.appendChild(field);
      field.removeAttribute('aria-hidden');
      field.style.removeProperty('display');
      field.style.removeProperty('visibility');
      field.style.removeProperty('opacity');
    });
  }

  function patch(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const modal=findCreateModal(root);
    if(!modal)return;

    ensureRequiredFields(modal);

    const buttons=[...modal.querySelectorAll('button')];
    const paste=buttons.find(function(button){
      return /Coller une capture/i.test(String(button.textContent||''));
    });
    if(paste)paste.remove();

    const upload=[...modal.querySelectorAll('button')].find(function(button){
      const txt=String(button.textContent||'');
      const onclick=String(button.getAttribute('onclick')||'');
      return /Déposer un BL|facture.*PDF|facture.*photo|Importer/i.test(txt) || /achatFile/.test(onclick);
    });
    const save=[...modal.querySelectorAll('button')].find(function(button){
      const txt=String(button.textContent||'').trim();
      const onclick=String(button.getAttribute('onclick')||'');
      return /^Enregistrer$/i.test(txt) || /addAchat/.test(onclick);
    });
    const close=[...modal.querySelectorAll('button')].find(function(button){
      return /^Fermer$/i.test(String(button.textContent||'').trim());
    });

    if(!upload||!save||!close)return;

    upload.textContent='Importer';
    upload.classList.add('yaya-achat-import-btn');
    bindImportButton(upload,modal);
    save.classList.add('yaya-achat-save-btn');
    close.classList.add('yaya-achat-close-btn');

    let footer=modal.querySelector('.yaya-achat-create-actions-fixed');
    if(!footer){
      footer=document.createElement('div');
      footer.className='mfoot yaya-achat-create-actions-fixed';
      modal.appendChild(footer);
    }

    [upload,save,close].forEach(function(button,index){
      if(button.parentElement!==footer)footer.appendChild(button);
      button.style.setProperty('order',String(index+1),'important');
      button.style.setProperty('margin','0','important');
      button.style.setProperty('margin-left','0','important');
      button.style.setProperty('margin-right','0','important');
    });

    const fields=modal.querySelector('.yaya-achat-required-fields');
    if(fields&&fields.nextElementSibling!==footer)modal.insertBefore(fields,footer);

    [...modal.children].forEach(function(child){
      if(child===footer||child===fields)return;
      if(child.matches&&child.matches('.mfoot') && !child.querySelector('button') && !String(child.textContent||'').trim()){
        child.style.display='none';
      }
    });
  }

  function install(){
    installStyle();
    patch();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    let raf=0;
    const observer=new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){raf=0;patch();});
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
