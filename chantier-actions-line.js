(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-actions-line-v9';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers button[onclick="fermerFocus()"]{
        display:none!important;
      }
      #pane-chantiers .chantier-fin-toolbar{
        display:flex!important;
        align-items:center!important;
        flex-wrap:nowrap!important;
        gap:9px!important;
        overflow-x:auto!important;
        scrollbar-width:thin;
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

  function applyBlueActionStyle(el){
    if(!el||!el.style)return;
    const palette={background:'#FFFFFF',color:'#003D7A',border:'#003D7A'};
    el.style.setProperty('background',palette.background,'important');
    el.style.setProperty('color',palette.color,'important');
    el.style.setProperty('border','1px solid '+palette.border,'important');
    el.style.setProperty('border-radius','7px','important');
    el.style.setProperty('box-shadow','none','important');
    el.style.setProperty('min-height','38px','important');
    el.style.setProperty('height','38px','important');
    el.style.setProperty('padding','0 15px','important');
    el.style.setProperty('font-size','12px','important');
    el.style.setProperty('font-weight','700','important');
  }

  function styleLeftActionButtons(toolbar){
    if(!toolbar)return;
    const controls=[...toolbar.children].filter(function(el){
      return el && (el.tagName==='BUTTON' || el.tagName==='A');
    });
    controls.slice(0,3).forEach(applyBlueActionStyle);
  }

  function isDeleteButton(button){
    if(!button)return false;
    const onclick=String(button.getAttribute('onclick')||'');
    const txt=String(button.textContent||'').trim().toLowerCase();
    return onclick.includes('delChantier') || txt==='supprimer' || txt==='supprimer chantier';
  }

  function removeCloseButtons(root){
    if(!root)return;
    root.querySelectorAll('button').forEach(function(btn){
      if(String(btn.textContent||'').trim().toLowerCase()==='fermer')btn.remove();
    });
  }

  function cleanToolbar(toolbar){
    if(!toolbar)return;
    addExpenseButton(toolbar);
    styleLeftActionButtons(toolbar);
  }

  function cleanCard(card){
    if(!card)return;
    removeCloseButtons(card);
    const toolbar=card.querySelector('.chantier-fin-toolbar');
    const top=card.querySelector('.top');
    if(toolbar)cleanToolbar(toolbar);
    if(!top)return;
    top.querySelectorAll('select').forEach(sel=>{
      const onchange=String(sel.getAttribute('onchange')||'');
      const txt=String(sel.textContent||'');
      if(onchange.includes('setStatut')||(txt.includes('En cours')&&txt.includes('Terminé')))sel.remove();
    });
    const allButtons=[...card.querySelectorAll('button')];
    const del=allButtons.find(isDeleteButton);
    if(del&&toolbar){
      del.classList.add('chantier-delete-btn');
      del.removeAttribute('style');
      if(toolbar.lastElementChild!==del)toolbar.appendChild(del);
      styleLeftActionButtons(toolbar);
    }
  }

  function apply(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    removeCloseButtons(pane);
    pane.querySelectorAll('.chantier-fin-toolbar').forEach(cleanToolbar);
    pane.querySelectorAll('.card').forEach(cleanCard);
  }

  const obs=new MutationObserver(()=>apply());
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(apply,50);
  setTimeout(apply,300);
  setTimeout(apply,1000);
})();
