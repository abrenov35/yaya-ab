(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-actions-line-v5';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .chantier-fin-toolbar{
        display:flex!important;
        align-items:center!important;
        flex-wrap:nowrap!important;
        gap:9px!important;
        overflow-x:auto!important;
        scrollbar-width:thin;
      }

      /* En-tête : Nom | actions de gestion | Fermer */
      #pane-chantiers .card > .top{
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        flex-wrap:nowrap!important;
      }
      #pane-chantiers .yaya-header-actions{
        margin-left:auto!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:8px!important;
        flex:0 0 auto!important;
      }
      #pane-chantiers .yaya-header-actions > button,
      #pane-chantiers .card > .top > .chantier-close-btn{
        min-height:30px!important;
        height:30px!important;
        padding:0 12px!important;
        border-radius:7px!important;
        font-size:11.5px!important;
        font-weight:700!important;
        white-space:nowrap!important;
        box-shadow:none!important;
      }
      #pane-chantiers .yaya-header-actions > .yaya-edit-chantier-btn,
      #pane-chantiers .yaya-header-actions > .chantier-archive-btn{
        margin-left:0!important;
        background:#fff!important;
        border:1px solid #003D7A!important;
        color:#003D7A!important;
      }
      #pane-chantiers .yaya-header-actions > .yaya-edit-chantier-btn:hover,
      #pane-chantiers .yaya-header-actions > .chantier-archive-btn:hover{
        background:#E8F2F9!important;
      }
      #pane-chantiers .yaya-header-actions > .chantier-delete-btn{
        margin-left:0!important;
        background:#fff!important;
        border:1px solid #EF4444!important;
        color:#EF4444!important;
        font-weight:700!important;
      }
      #pane-chantiers .yaya-header-actions > .chantier-delete-btn:hover{
        background:#FEE2E2!important;
      }
      #pane-chantiers .card > .top > .chantier-close-btn{
        margin-left:4px!important;
        background:#fff!important;
        border:1px solid #003D7A!important;
        color:#003D7A!important;
        flex:0 0 auto!important;
      }
      #pane-chantiers .card > .top > .chantier-close-btn:hover{
        background:#E8F2F9!important;
      }

      /* Les 3 actions de saisie restent ensemble en dessous */
      #pane-chantiers .chantier-fin-toolbar > .btn2.chantier-expense-btn{
        background:#fff!important;
        border:1px solid #cfd8e3!important;
        color:#003D7A!important;
        font-weight:700!important;
      }
      #pane-chantiers .chantier-fin-toolbar > .btn2.chantier-expense-btn:hover{
        background:#f5f8fb!important;
        border-color:#b9c8d8!important;
      }

      @media(max-width:760px){
        #pane-chantiers .card > .top{
          flex-wrap:wrap!important;
        }
        #pane-chantiers .yaya-header-actions{
          order:10!important;
          margin-left:0!important;
          width:100%!important;
          justify-content:flex-start!important;
          overflow-x:auto!important;
          padding-top:4px!important;
        }
        #pane-chantiers .card > .top > .chantier-close-btn{
          position:absolute!important;
          right:12px!important;
          top:12px!important;
        }
        #pane-chantiers .chantier-fin-toolbar{
          display:flex!important;
          grid-template-columns:none!important;
          flex-wrap:nowrap!important;
          overflow-x:auto!important;
          gap:7px!important;
          padding-bottom:6px!important;
        }
        #pane-chantiers .chantier-fin-toolbar > button{
          width:auto!important;
          flex:0 0 auto!important;
          min-width:max-content!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  window.openAchatForChantier=function(cid){
    if(typeof window.openAchatModal!=='function')return;
    window.openAchatModal();

    const preselect=function(){
      const sel=document.getElementById('acCh');
      if(!sel)return false;
      sel.value=String(cid||'');
      sel.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    };

    requestAnimationFrame(preselect);
    setTimeout(preselect,40);
    setTimeout(preselect,120);
  };

  function addExpenseButton(toolbar){
    if(!toolbar||toolbar.querySelector('.chantier-expense-btn'))return;

    const toolbarButtons=[...toolbar.querySelectorAll('button')];
    const devisBtn=toolbarButtons.find(b=>String(b.getAttribute('onclick')||'').includes('openAvenant'));
    if(!devisBtn)return;

    const match=String(devisBtn.getAttribute('onclick')||'').match(/openAvenant\(['"]([^'"]+)['"]\)/);
    if(!match||!match[1])return;

    const cid=match[1];
    const expense=document.createElement('button');
    expense.type='button';
    expense.className='btn2 chantier-expense-btn';
    expense.textContent='＋ Dépense';
    expense.title='Ajouter une dépense à ce chantier';
    expense.onclick=function(){ window.openAchatForChantier(cid); };

    const docBtn=toolbarButtons.find(b=>String(b.getAttribute('onclick')||'').includes('openDocumentModal'));
    if(docBtn)toolbar.insertBefore(expense,docBtn);
    else if(devisBtn.nextSibling)toolbar.insertBefore(expense,devisBtn.nextSibling);
    else toolbar.appendChild(expense);
  }

  function isDeleteButton(button){
    if(!button)return false;
    const onclick=String(button.getAttribute('onclick')||'');
    const txt=String(button.textContent||'').trim().toLowerCase();
    return onclick.includes('delChantier') || txt==='supprimer' || txt==='supprimer chantier';
  }

  function isArchiveButton(button){
    if(!button)return false;
    const onclick=String(button.getAttribute('onclick')||'');
    const txt=String(button.textContent||'').trim().toLowerCase();
    return button.classList.contains('chantier-archive-btn') || onclick.includes('archiverChantier') || txt==='archiver chantier';
  }

  function isEditButton(button){
    if(!button)return false;
    const txt=String(button.textContent||'').trim().toLowerCase();
    return button.classList.contains('yaya-edit-chantier-btn') || txt.includes('modifier chantier');
  }

  function cleanCard(card){
    if(!card)return;
    const toolbar=card.querySelector('.chantier-fin-toolbar');
    if(!toolbar)return;
    const top=card.querySelector('.top');
    if(!top)return;

    addExpenseButton(toolbar);

    top.querySelectorAll('select').forEach(sel=>{
      const onchange=String(sel.getAttribute('onchange')||'');
      const txt=String(sel.textContent||'');
      if(onchange.includes('setStatut')||(txt.includes('En cours')&&txt.includes('Terminé'))){
        sel.remove();
      }
    });

    let headerActions=top.querySelector('.yaya-header-actions');
    if(!headerActions){
      headerActions=document.createElement('div');
      headerActions.className='yaya-header-actions';
      top.appendChild(headerActions);
    }

    const allButtons=[...card.querySelectorAll('button')];
    const edit=allButtons.find(isEditButton);
    const archive=allButtons.find(isArchiveButton);
    const del=allButtons.find(isDeleteButton);
    const close=allButtons.find(b=>String(b.getAttribute('onclick')||'').includes('toggleChantier')&&String(b.textContent||'').trim()==='Fermer');

    if(edit){
      edit.classList.add('yaya-edit-chantier-btn');
      edit.removeAttribute('style');
      if(edit.parentElement!==headerActions)headerActions.appendChild(edit);
    }
    if(archive){
      archive.classList.add('chantier-archive-btn');
      archive.removeAttribute('style');
      if(archive.parentElement!==headerActions)headerActions.appendChild(archive);
    }
    if(del){
      del.classList.add('chantier-delete-btn');
      del.removeAttribute('style');
      if(del.parentElement!==headerActions)headerActions.appendChild(del);
    }

    if(close){
      close.classList.add('chantier-close-btn');
      close.removeAttribute('style');
      if(close.parentElement!==top)top.appendChild(close);
      else if(top.lastElementChild!==close)top.appendChild(close);
    }
  }

  function apply(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    pane.querySelectorAll('.card').forEach(cleanCard);
  }

  const obs=new MutationObserver(()=>apply());
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(apply,50);
  setTimeout(apply,300);
})();
