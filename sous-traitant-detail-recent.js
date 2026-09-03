(function(){
  'use strict';

  if(window.__yayaSousTraitantDetailRecentV1)return;
  window.__yayaSousTraitantDetailRecentV1=true;

  const DATE_KEYS=[
    'dateDepot','date_depot','horodatageDepot','horodatage_depot',
    'deposeLe','depose_le','uploadedAt','uploaded_at',
    'createdAt','created_at','dateCreation','date_creation',
    'horodatage','timestamp','date'
  ];

  function parseDate(value){
    if(value==null||value==='')return 0;
    if(typeof value==='number'&&Number.isFinite(value))return value;
    const raw=String(value).trim();
    if(!raw)return 0;

    let m=raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if(m)return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();

    m=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if(m)return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();

    const d=new Date(raw);
    return Number.isNaN(d.getTime())?0:d.getTime();
  }

  function recentTime(item){
    if(!item)return 0;
    for(const key of DATE_KEYS){
      const t=parseDate(item[key]);
      if(t)return t;
    }
    return 0;
  }

  function achats(){
    try{return typeof S!=='undefined'&&S&&Array.isArray(S.achats)?S.achats:[];}catch(e){return [];}
  }

  function achatById(id){
    const sid=String(id||'');
    return achats().find(a=>String(a&&a.id||'')===sid)||null;
  }

  function sortPane(pane){
    if(!pane)return;
    const rows=[...pane.querySelectorAll(':scope > .yaya-detail-charge-row')]
      .filter(row=>row.querySelector('[data-achat-id]'));
    if(rows.length<2)return;

    const ranked=rows.map((row,pos)=>{
      const btn=row.querySelector('[data-achat-id]');
      const item=achatById(btn&&btn.dataset.achatId);
      return {row,pos,time:recentTime(item),order:item?achats().indexOf(item):-1};
    }).sort((a,b)=>(b.time-a.time)||(b.order-a.order)||(a.pos-b.pos));

    ranked.forEach(x=>pane.appendChild(x.row));
  }

  let scheduled=false;
  function apply(){
    scheduled=false;
    document.querySelectorAll('.yaya-detail-charges-pane').forEach(sortPane);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(apply);
  }

  function install(){
    apply();
    const root=document.querySelector('.body')||document.body;
    if(root&&!root.__yayaSousTraitantRecentObserved){
      root.__yayaSousTraitantRecentObserved=true;
      new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    }
    window.addEventListener('yaya:data-refreshed',schedule);
    window.addEventListener('hashchange',schedule);
    document.addEventListener('click',schedule,true);
  }

  setTimeout(install,0);
  setTimeout(schedule,180);
  setTimeout(schedule,600);
})();
