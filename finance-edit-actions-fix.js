(function(){
  'use strict';

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

  function patchModal(modal){
    if(!isFinanceEditModal(modal))return;
    modal.classList.add('yaya-finance-edit-modal');

    const save=modal.querySelector('.yaya-achat-single-save')||[...modal.querySelectorAll('button')].find(function(button){
      const txt=String(button.textContent||'').trim();
      const aria=String(button.getAttribute('aria-label')||'');
      const title=String(button.getAttribute('title')||'');
      const onclick=String(button.getAttribute('onclick')||'');
      return /saveAchat/.test(onclick)||button.classList.contains('achat-icon-save')||/enregistrer/i.test(txt)||/enregistrer/i.test(aria)||/enregistrer/i.test(title)||txt==='✓';
    });
    if(!save)return;

    const heading=modal.querySelector('h5');
    if(heading){
      heading.querySelectorAll('button,[role="button"]').forEach(function(button){button.remove();});
      if(isCharge(modal)&&String(heading.textContent||'').trim()!=='Modifier la charge')heading.textContent='Modifier la charge';
    }

    if(save.title!=='Enregistrer')save.title='Enregistrer';
    if(save.getAttribute('aria-label')!=='Enregistrer')save.setAttribute('aria-label','Enregistrer');
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
      actions.insertBefore(save,actions.firstChild);
    }

    let cancel=actions.querySelector('.yaya-finance-edit-cancel');
    if(!cancel){
      cancel=document.createElement('button');
      cancel.type='button';
      cancel.className='btn2 yaya-finance-edit-cancel';
      cancel.textContent='Annuler';
      cancel.addEventListener('click',function(){
        try{
          if(typeof closeModal==='function')closeModal();
          else modal.closest('.overlay')?.remove();
        }catch(e){
          modal.closest('.overlay')?.remove();
        }
      });
      actions.appendChild(cancel);
    }
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
})();
