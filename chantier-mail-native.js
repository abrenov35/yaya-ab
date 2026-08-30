(function(){
'use strict';

const STYLE_ID='yaya-chantier-mail-native-style';
let scheduled=false;

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #pane-chantiers .yaya-detail-section-tab[data-section="mail"]{
      background:#f3e4d8!important;
      border-color:#c7a58b!important;
      color:#7a5138!important;
    }
    #pane-chantiers .yaya-detail-section-tab[data-section="mail"].on{
      background:#ead3c1!important;
      border-color:#a97855!important;
      color:#6c432b!important;
      box-shadow:inset 0 0 0 1px #a97855!important;
    }
    #pane-chantiers .yaya-detail-section-tab[data-section="mail"] small{display:none!important}
    #pane-chantiers .yaya-detail-mail-pane{
      display:none!important;
      margin:0 0 8px!important;
    }
    #pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-mail-pane{
      display:block!important;
    }
    #pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-section-node:not(.yaya-detail-mail-pane){
      display:none!important;
    }
    #pane-chantiers .yaya-detail-mail-pane > .message-ligne{
      display:grid!important;
    }
  `;
  document.head.appendChild(style);
}

function ensureMailPane(card,tabs){
  let pane=card.querySelector(':scope > .yaya-detail-mail-pane');
  if(!pane){
    pane=document.createElement('div');
    pane.className='yaya-detail-section-node yaya-detail-mail-pane';
    pane.dataset.section='mail';
    tabs.insertAdjacentElement('afterend',pane);
  }

  const rows=[...card.querySelectorAll('.message-ligne')].filter(row=>!pane.contains(row));
  rows.forEach(row=>{
    row.dataset.section='mail';
    row.classList.remove('yaya-detail-section-node');
    row.style.removeProperty('display');
    pane.appendChild(row);
  });
  pane.dataset.section='mail';
  return pane;
}

function applyMail(card,tabs,pane){
  card.dataset.yayaDetailSection='mail';

  card.querySelectorAll(':scope > .yaya-detail-section-node').forEach(node=>{
    if(node===pane || node.dataset.section==='mail')node.style.removeProperty('display');
    else node.style.setProperty('display','none','important');
  });

  pane.style.removeProperty('display');
  pane.querySelectorAll('.message-ligne').forEach(row=>{
    row.dataset.section='mail';
    row.style.setProperty('display','grid','important');
  });

  tabs.querySelectorAll('.yaya-detail-section-tab').forEach(btn=>{
    const on=btn.dataset.section==='mail';
    btn.classList.toggle('on',on);
    btn.setAttribute('aria-selected',on?'true':'false');
  });
}

function prepare(card){
  if(!card || card.classList.contains('yaya-docs-only-card'))return;
  const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
  if(!tabs)return;
  const docs=tabs.querySelector(':scope > .yaya-detail-section-tab[data-section="documents"]');
  if(!docs)return;

  const pane=ensureMailPane(card,tabs);
  let mail=tabs.querySelector(':scope > .yaya-detail-section-tab[data-section="mail"]');
  if(!mail){
    mail=document.createElement('button');
    mail.type='button';
    mail.className='yaya-detail-section-tab';
    mail.dataset.section='mail';
    mail.setAttribute('role','tab');
    mail.setAttribute('aria-selected','false');
    mail.innerHTML='<strong>Mail</strong><small></small>';
    docs.insertAdjacentElement('afterend',mail);
  }

  if(mail.dataset.yayaNativeMailBound!=='1'){
    mail.dataset.yayaNativeMailBound='1';
    mail.addEventListener('click',function(e){
      e.preventDefault();
      applyMail(card,tabs,pane);
    });
  }
}

function decorate(){
  scheduled=false;
  installStyle();
  const root=document.getElementById('pane-chantiers');
  if(!root)return;
  root.querySelectorAll('.card').forEach(prepare);
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(decorate);
}

function install(){
  const root=document.getElementById('pane-chantiers');
  if(!root){setTimeout(install,150);return;}
  decorate();
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
}

install();
})();
