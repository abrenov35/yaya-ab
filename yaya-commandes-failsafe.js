(function(){
  'use strict';
  if(window.__yayaCommandesFailsafeV1)return;
  window.__yayaCommandesFailsafeV1=true;

  const APP='https://abrenov35.github.io/ab-commandes/';

  function active(card){
    if(String(card?.dataset?.yayaDetailSection||'')==='commandes')return true;
    const tab=card?.querySelector(':scope > .yaya-detail-section-tabs [data-section="commandes"]');
    return !!(tab&&(tab.classList.contains('on')||tab.getAttribute('aria-selected')==='true'));
  }

  function chantier(){
    let id='';
    try{id=String(typeof focusChantier!=='undefined'&&focusChantier||'').trim();}catch(e){}
    let name='';
    try{
      const c=typeof S!=='undefined'&&Array.isArray(S.chantiers)?S.chantiers.find(x=>String(x.id||'')===id):null;
      name=String(c&&c.nom||'').trim();
    }catch(e){}
    return {id,name};
  }

  function urlFor(id,name,embed){
    const u=new URL(APP);
    if(id)u.searchParams.set('chantierId',id);
    if(name)u.searchParams.set('chantierName',name);
    if(embed)u.searchParams.set('embed','1');
    return u.toString();
  }

  function restore(){
    document.querySelectorAll('#pane-chantiers .card').forEach(card=>{
      if(!active(card))return;
      const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
      if(!tabs)return;
      let block=card.querySelector(':scope > .yaya-ab-commandes-link');
      if(!block){
        const c=chantier();
        if(!c.id&&!c.name)return;
        block=document.createElement('div');
        block.className='yaya-detail-section-node yaya-ab-commandes-link';
        block.dataset.section='commandes';
        block.style.cssText='display:block!important;width:100%;margin:0 0 6px;border:1px solid #cbd9e9;border-radius:10px;background:#fff;overflow:hidden';
        block.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:#f3f7fc;border-bottom:1px solid #dbe5ef"><strong style="font-size:12px;color:#173b60">📦 AB COMMANDES</strong><a target="_blank" rel="noopener" style="font-size:11px;font-weight:800;color:#174d7d;text-decoration:none">Ouvrir en grand ↗</a></div><iframe title="Suivi des commandes chantier" style="display:block;width:100%;height:320px;border:0;background:#fff"></iframe>';
        const pane=card.querySelector(':scope > .yaya-detail-commandes-pane');
        if(pane)card.insertBefore(block,pane);else tabs.insertAdjacentElement('afterend',block);
        block.querySelector('a').href=urlFor(c.id,c.name,false);
        block.querySelector('iframe').src=urlFor(c.id,c.name,true);
      }
      block.style.setProperty('display','block','important');
    });
  }

  let t=0;
  function queue(){clearTimeout(t);t=setTimeout(restore,30);}
  const root=document.getElementById('pane-chantiers')||document.body;
  if(root)new MutationObserver(queue).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-yaya-detail-section','class']});
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-section="commandes"]')){queue();setTimeout(restore,150);}},true);
  window.addEventListener('yaya:data-refreshed',queue);
  window.addEventListener('focus',queue);
  queue();
})();
