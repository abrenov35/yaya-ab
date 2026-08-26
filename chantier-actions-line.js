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
      #pane-chantiers .chantier-fin-toolbar > .btn2.chantier-expense-btn{
        background:#fff8e1!important;
        border:1px solid #e4cf8a!important;
        color:#7a5a00!important;
        font-weight:700!important;
      }
      #pane-chantiers .chantier-fin-toolbar > .btn2.chantier-expense-btn:hover{
        background:#fff2bf!important;
        border-color:#d8bd62!important;
      }
      #pane-chantiers .chantier-fin-toolbar > .chantier-delete-btn{
        order:999!important;
        margin-left:0!important;
        background:#fff1f1!important;
        border:1px solid #e3b4b4!important;
        color:#b42318!important;
        font-weight:700!important;
      }
      #pane-chantiers .chantier-fin-toolbar > .chantier-delete-btn:hover{
        background:#fde7e7!important;
        border-color:#d79a9a!important;
        color:#991b1b!important;
      }
      @media(max-width:640px){
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

    const allButtons=[...card.querySelectorAll('button')];
    const del=allButtons.find(isDeleteButton);
    const close=allButtons.find(b=>String(b.getAttribute('onclick')||'').includes('toggleChantier')&&String(b.textContent||'').trim()==='Fermer');

    if(close)close.remove();

    if(del){
      del.classList.add('chantier-delete-btn');
      del.removeAttribute('style');
      if(toolbar.lastElementChild!==del)toolbar.appendChild(del);
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
