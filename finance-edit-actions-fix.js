(function(){
  'use strict';

  const STYLE_ID='yaya-finance-edit-actions-v2';

  function isFinanceEditModal(modal){
    if(!modal)return false;
    if(modal.classList.contains('yaya-finance-edit-modal')||modal.classList.contains('achat-edit-modal')||modal.classList.contains('charge-edit-modal'))return true;
    return !!modal.querySelector('#eaCh,#eaType,#eaFour,#eaDes,#eaDate,#eaMt');
  }

  function isCharge(modal){
    if(!modal)return false;
    if(modal.classList.contains('charge-edit-modal'))return true;
    const type=modal.querySelector('#eaType');
    let txt='';
    if(type){
      txt=String(type.value||'');
      if(type.options&&type.selectedIndex>=0&&type.options[type.selectedIndex])txt+=' '+String(type.options[type.selectedIndex].text||'');
    }
    return /sous[-\s]?trait/i.test(txt);
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .achat-edit-modal .yaya-finance-edit-actions{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:10px!important;
        margin-top:18px!important;
        align-items:stretch!important;
      }
      .achat-edit-modal .yaya-finance-edit-actions>button{
        width:100%!important;
        min-width:0!important;
        min-height:46px!important;
        margin:0!important;
        border-radius:9px!important;
        font-weight:750!important;
      }
      .achat-edit-modal .yaya-achat-edit-import{
        background:#249457!important;
        color:#fff!important;
        border:1px solid #249457!important;
      }
      .achat-edit-modal .yaya-achat-edit-import:hover{
        background:#1f814c!important;
        border-color:#1f814c!important;
      }
      .achat-edit-modal .yaya-achat-single-save{
        background:#064b8e!important;
        color:#fff!important;
        border:1px solid #064b8e!important;
      }
      .achat-edit-modal .yaya-achat-edit-delete{
        background:#fff3f3!important;
        color:#b42318!important;
        border:1px solid #efb4b4!important;
      }
      .achat-edit-modal .yaya-achat-edit-delete:hover{
        background:#ffe7e7!important;
        border-color:#e78d8d!important;
      }
      .achat-edit-modal .yaya-achat-edit-close{
        margin-left:auto!important;
        width:40px!important;
        height:40px!important;
        padding:0!important;
        border:1px solid #d7dee8!important;
        border-radius:10px!important;
        background:#fff!important;
        color:#697586!important;
        font-size:24px!important;
        line-height:1!important;
      }
      @media(max-width:640px){
        .achat-edit-modal .yaya-finance-edit-actions{gap:8px!important;}
        .achat-edit-modal .yaya-finance-edit-actions>button{min-height:44px!important;font-size:12px!important;padding:0 8px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function achatIdFromModal(modal,save){
    let raw='';
    if(save)raw=String(save.getAttribute('onclick')||'');
    let match=raw.match(/saveAchat\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/);
    if(match&&match[1])return String(match[1]);
    const stored=String(modal&&modal.dataset&&modal.dataset.yayaAchatId||'').trim();
    if(stored)return stored;
    return '';
  }

  function closeFinanceModal(modal){
    try{
      if(typeof closeModal==='function')closeModal();
      else modal.closest('.overlay')?.remove();
    }catch(e){
      modal.closest('.overlay')?.remove();
    }
  }

  function patchHeading(modal,charge){
    const heading=modal.querySelector('h5');
    if(!heading)return;
    heading.querySelectorAll('button,[role="button"]').forEach(function(button){button.remove();});
    if(charge){
      if(String(heading.textContent||'').trim()!=='Modifier la charge')heading.textContent='Modifier la charge';
      return;
    }
    if(!/^Modifier l[’']achat/i.test(String(heading.textContent||'').trim()))heading.childNodes[0].nodeValue="Modifier l'achat";
    const close=document.createElement('button');
    close.type='button';
    close.className='yaya-achat-edit-close';
    close.textContent='×';
    close.title='Fermer';
    close.setAttribute('aria-label','Fermer');
    close.addEventListener('click',function(){closeFinanceModal(modal);});
    heading.appendChild(close);
  }

  function patchModal(modal){
    if(!isFinanceEditModal(modal))return;
    ensureStyle();
    modal.classList.add('yaya-finance-edit-modal');

    const charge=isCharge(modal);
    if(!charge)modal.classList.add('achat-edit-modal');

    const save=modal.querySelector('.yaya-achat-single-save')||[...modal.querySelectorAll('button')].find(function(button){
      const txt=String(button.textContent||'').trim();
      const aria=String(button.getAttribute('aria-label')||'');
      const title=String(button.getAttribute('title')||'');
      const onclick=String(button.getAttribute('onclick')||'');
      return /saveAchat/.test(onclick)||button.classList.contains('achat-icon-save')||/enregistrer/i.test(txt)||/enregistrer/i.test(aria)||/enregistrer/i.test(title)||txt==='✓';
    });
    if(!save)return;

    patchHeading(modal,charge);

    save.title='Enregistrer';
    save.setAttribute('aria-label','Enregistrer');
    save.textContent='Enregistrer';
    save.classList.add('yaya-achat-single-save');

    let actions=modal.querySelector('.yaya-finance-edit-actions');
    if(!actions){
      const oldParent=save.parentElement;
      actions=document.createElement('div');
      actions.className='yaya-finance-edit-actions';
      if(oldParent)oldParent.insertAdjacentElement('afterend',actions);
      else modal.appendChild(actions);
      actions.appendChild(save);
      if(oldParent&&!oldParent.children.length&&!String(oldParent.textContent||'').trim())oldParent.remove();
    }else if(save.parentElement!==actions){
      actions.appendChild(save);
    }

    if(charge){
      let cancel=actions.querySelector('.yaya-finance-edit-cancel');
      if(!cancel){
        cancel=document.createElement('button');
        cancel.type='button';
        cancel.className='btn2 yaya-finance-edit-cancel';
        cancel.textContent='Annuler';
        cancel.addEventListener('click',function(){closeFinanceModal(modal);});
        actions.appendChild(cancel);
      }
      return;
    }

    actions.querySelectorAll('.yaya-finance-edit-cancel,.achat-icon-cancel').forEach(function(button){button.remove();});

    const id=achatIdFromModal(modal,save);
    if(id)modal.dataset.yayaAchatId=id;

    let importer=actions.querySelector('.yaya-achat-edit-import');
    if(!importer){
      importer=document.createElement('button');
      importer.type='button';
      importer.className='yaya-achat-edit-import';
      importer.textContent='📎 Importer';
      importer.title='Changer la pièce jointe';
      importer.setAttribute('aria-label','Changer la pièce jointe');
      importer.addEventListener('click',function(event){
        event.preventDefault();
        const achatId=String(modal.dataset.yayaAchatId||achatIdFromModal(modal,save)||'').trim();
        if(!achatId)return;
        if(typeof ajouterPJachat==='function')ajouterPJachat(achatId);
      });
    }
    if(importer.parentElement!==actions)actions.insertBefore(importer,save);
    else if(importer.nextElementSibling!==save)actions.insertBefore(importer,save);

    let del=actions.querySelector('.yaya-achat-edit-delete');
    if(!del){
      del=document.createElement('button');
      del.type='button';
      del.className='yaya-achat-edit-delete';
      del.textContent='Supprimer';
      del.title='Supprimer cet achat';
      del.setAttribute('aria-label','Supprimer cet achat');
      del.addEventListener('click',async function(event){
        event.preventDefault();
        const achatId=String(modal.dataset.yayaAchatId||achatIdFromModal(modal,save)||'').trim();
        if(!achatId)return;
        if(typeof delAchat!=='function')return;
        await delAchat(achatId);
        try{
          const exists=typeof S!=='undefined'&&S&&Array.isArray(S.achats)&&S.achats.some(function(a){return String(a&&a.id||'')===achatId;});
          if(!exists)closeFinanceModal(modal);
        }catch(e){}
      });
    }
    if(del.parentElement!==actions)actions.appendChild(del);
    else actions.appendChild(del);
  }

  function apply(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.querySelectorAll('.overlay .modal').forEach(patchModal);
  }

  apply();
  const root=document.getElementById('modalRoot');
  if(root){
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){raf=0;apply();});
    }).observe(root,{childList:true,subtree:true});
  }

  if(!document.querySelector('script[data-yaya-charge-delete-direct]')){
    const s=document.createElement('script');
    s.src='charge-delete-direct.js?v=chargedel-direct-1';
    s.async=false;
    s.setAttribute('data-yaya-charge-delete-direct','1');
    document.head.appendChild(s);
  }
})();
