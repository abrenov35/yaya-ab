(function(){
  'use strict';

  const INSTALL_FLAG='__yayaRecentFirstAllV1';
  if(window[INSTALL_FLAG])return;
  window[INSTALL_FLAG]=true;

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

    let m=raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?/);
    if(m){
      const ms=m[7]?Number(('0.'+m[7]))*1000:0;
      return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0),ms).getTime();
    }

    m=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[\sT](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if(m)return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();

    m=raw.match(/^(\d{4})-(\d{2})$/);
    if(m)return new Date(Number(m[1]),Number(m[2])-1,1).getTime();

    m=raw.match(/^(\d{1,2})\/(\d{4})$/);
    if(m)return new Date(Number(m[2]),Number(m[1])-1,1).getTime();

    const d=new Date(raw);
    return Number.isNaN(d.getTime())?0:d.getTime();
  }

  function recentTime(item,extraKeys){
    if(!item)return 0;
    const keys=DATE_KEYS.concat(extraKeys||[]);
    for(const key of keys){
      const t=parseDate(item[key]);
      if(t)return t;
    }
    return 0;
  }

  function dataArray(name){
    try{return typeof S!=='undefined'&&S&&Array.isArray(S[name])?S[name]:[];}catch(e){return [];}
  }

  function byId(list,id){
    const sid=String(id||'');
    return list.find(x=>String(x&&x.id||'')===sid)||null;
  }

  function indexOfItem(list,item){
    if(!item)return -1;
    const direct=list.indexOf(item);
    if(direct>=0)return direct;
    const id=String(item.id||'');
    return id?list.findIndex(x=>String(x&&x.id||'')===id):-1;
  }

  function sortElements(container,elements,resolver){
    if(!container||elements.length<2)return;
    const decorated=elements.map((el,pos)=>{
      const info=resolver(el)||{};
      return {
        el,
        time:Number(info.time)||0,
        order:Number.isFinite(info.order)?info.order:pos,
        pos
      };
    });
    const sorted=decorated.slice().sort((a,b)=>
      (b.time-a.time)||(b.order-a.order)||(a.pos-b.pos)
    );
    let changed=false;
    for(let i=0;i<sorted.length;i++){
      if(sorted[i].el!==elements[i]){changed=true;break;}
    }
    if(!changed)return;
    sorted.forEach(x=>container.appendChild(x.el));
  }

  function onclickId(row,regex){
    const nodes=[...row.querySelectorAll('[onclick]')];
    for(const node of nodes){
      const raw=String(node.getAttribute('onclick')||'');
      const m=raw.match(regex);
      if(m&&m[1])return String(m[1]);
    }
    return '';
  }

  function sortDocumentsPage(){
    const list=dataArray('documents');
    document.querySelectorAll('#pane-documents .card').forEach(card=>{
      const rows=[...card.querySelectorAll(':scope > .achligne.ligR[data-id]')];
      sortElements(card,rows,row=>{
        const item=byId(list,row.dataset.id);
        return {time:recentTime(item),order:indexOfItem(list,item)};
      });
    });
  }

  function sortExpensesPage(){
    const list=dataArray('achats');
    document.querySelectorAll('#pane-achats .card').forEach(card=>{
      const rows=[...card.querySelectorAll(':scope > .achligne.ligR')];
      sortElements(card,rows,row=>{
        const id=onclickId(row,/(?:editAchat|editMontantAchat|delAchat)\(['\"]([^'\"]+)/);
        const item=byId(list,id);
        return {time:recentTime(item),order:indexOfItem(list,item)};
      });
    });
  }

  function sortDetailExpenses(){
    const list=dataArray('achats');
    document.querySelectorAll('.yaya-detail-expenses-pane').forEach(pane=>{
      const rows=[...pane.querySelectorAll(':scope > .yaya-detail-expense-row')];
      sortElements(pane,rows,row=>{
        const btn=row.querySelector('[data-achat-id]');
        const item=byId(list,btn&&btn.dataset.achatId);
        return {time:recentTime(item),order:indexOfItem(list,item)};
      });
    });
  }

  function sortDetailDocuments(){
    const list=dataArray('documents');
    document.querySelectorAll('.yaya-detail-documents-pane').forEach(pane=>{
      const rows=[...pane.querySelectorAll(':scope > .yaya-detail-document-row')];
      sortElements(pane,rows,row=>{
        const btn=row.querySelector('[data-doc-id]');
        const item=byId(list,btn&&btn.dataset.docId);
        return {time:recentTime(item),order:indexOfItem(list,item)};
      });
    });
  }

  function sortDetailCommandes(){
    const list=dataArray('commandes');
    document.querySelectorAll('.yaya-detail-commandes-pane').forEach(pane=>{
      const rows=[...pane.querySelectorAll(':scope > .yaya-detail-commande-row')];
      sortElements(pane,rows,row=>{
        const item=byId(list,row.dataset.commandeId);
        return {time:recentTime(item),order:indexOfItem(list,item)};
      });
    });
  }

  function sortDetailMarkets(){
    const avenants=dataArray('avenants');
    const chantiers=dataArray('chantiers');
    document.querySelectorAll('.yaya-detail-markets-pane').forEach(pane=>{
      const rows=[...pane.querySelectorAll(':scope > .yaya-detail-market-row')];
      sortElements(pane,rows,row=>{
        const edit=row.querySelector('.yaya-detail-document-edit[data-kind]');
        const kind=String(edit&&edit.dataset.kind||'');
        const id=String(edit&&edit.dataset.rowId||'');
        if(kind==='avenant'){
          const item=byId(avenants,id);
          return {time:recentTime(item),order:indexOfItem(avenants,item)+1};
        }
        const chantier=byId(chantiers,id);
        return {time:recentTime(chantier,['dateSignature']),order:0};
      });
    });
  }

  // La page Sous-traitant possède déjà son tri décroissant natif.
  // On ne réécrit pas ses données : son rendu utilise horodatage/createdAt/dateCreation/date.

  let scheduled=false;
  function apply(){
    scheduled=false;
    try{sortDocumentsPage();}catch(e){}
    try{sortExpensesPage();}catch(e){}
    try{sortDetailExpenses();}catch(e){}
    try{sortDetailDocuments();}catch(e){}
    try{sortDetailCommandes();}catch(e){}
    try{sortDetailMarkets();}catch(e){}
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(apply);
  }

  function install(){
    apply();
    const root=document.querySelector('.body')||document.body;
    if(root&&!root.__yayaRecentFirstObserved){
      root.__yayaRecentFirstObserved=true;
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
