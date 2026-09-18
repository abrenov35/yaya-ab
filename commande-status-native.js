(function(){
  'use strict';
  if(window.__yayaCommandeNativeStatusV1)return;
  window.__yayaCommandeNativeStatusV1=true;

  const STATUSES=[
    ['choice','Attente choix client'],
    ['todo','À commander'],
    ['ordered','Commandé'],
    ['received','Reçu']
  ];
  let busy=new Set();

  function txt(v){return String(v==null?'':v).trim();}
  function normalize(v){
    const raw=txt(v);
    if(STATUSES.some(x=>x[0]===raw))return raw;
    const n=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
    if(n==='A COMMANDER')return 'todo';
    if(n==='COMMANDE')return 'ordered';
    if(n==='RECU')return 'received';
    return 'choice';
  }
  function toastSafe(msg,err){try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}}
  function cache(){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const data=raw?JSON.parse(raw):{};
      if(data&&typeof data==='object'){
        data.commandes=Array.isArray(S&&S.commandes)?S.commandes:[];
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(data));
      }
    }catch(e){}
  }
  async function persist(id,status,select){
    if(busy.has(id))return;
    busy.add(id);
    const rows=Array.isArray(S&&S.commandes)?S.commandes:[];
    const idx=rows.findIndex(c=>txt(c&&c.id)===id);
    if(idx<0){busy.delete(id);return;}
    const before=Object.assign({},rows[idx]);
    const updated=Object.assign({},before,{statut:status,status:undefined});
    const next=rows.slice();
    next[idx]=updated;
    try{
      if(select)select.disabled=true;
      if(typeof apiPost!=='function')throw new Error('API Yaya indisponible');
      const ok=await apiPost('setCommandes',next);
      if(!ok)throw new Error('Écriture refusée');
      S.commandes=next;
      cache();
      toastSafe('Statut commande enregistré ✓');
      try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}
    }catch(err){
      if(select)select.value=normalize(before.statut||before.status);
      toastSafe('Statut non enregistré — '+txt(err&&err.message||err),true);
    }finally{
      if(select)select.disabled=false;
      busy.delete(id);
    }
  }
  function makeSelect(row,data){
    const id=txt(row.dataset.commandeId);
    if(!id)return null;
    const current=normalize(data&& (data.statut||data.status));
    const sel=document.createElement('select');
    sel.className='yaya-commande-native-status';
    sel.dataset.commandeId=id;
    STATUSES.forEach(([v,l])=>{
      const o=document.createElement('option');
      o.value=v;o.textContent=l;if(v===current)o.selected=true;
      sel.appendChild(o);
    });
    sel.addEventListener('click',e=>e.stopPropagation());
    sel.addEventListener('change',function(e){
      e.stopPropagation();
      persist(id,this.value,this);
    });
    return sel;
  }
  function patch(){
    let rows=[];
    try{rows=Array.isArray(S&&S.commandes)?S.commandes:[];}catch(e){}
    document.querySelectorAll('#pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-row').forEach(function(row){
      const id=txt(row.dataset.commandeId);
      if(!id)return;
      const data=rows.find(c=>txt(c&&c.id)===id);
      const host=row.querySelector('.yaya-detail-charge-hours');
      if(!host)return;
      let sel=host.querySelector('.yaya-commande-native-status');
      if(!sel){
        host.textContent='';
        sel=makeSelect(row,data);
        if(sel)host.appendChild(sel);
      }else{
        const wanted=normalize(data&&(data.statut||data.status));
        if(!busy.has(id)&&sel.value!==wanted)sel.value=wanted;
      }
    });
  }
  const style=document.createElement('style');
  style.textContent=`
    #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-charge-hours{overflow:visible!important}
    #pane-chantiers .yaya-commande-native-status{
      width:100%!important;min-width:150px!important;height:32px!important;
      border:1px solid #b9c7d8!important;border-radius:7px!important;
      background:#fff!important;color:#17324f!important;
      padding:0 26px 0 8px!important;font-size:11px!important;font-weight:700!important;
      cursor:pointer!important;box-sizing:border-box!important;
    }
    #pane-chantiers .yaya-commande-native-status:disabled{opacity:.65!important;cursor:wait!important}
    @media(max-width:640px){
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-row{
        grid-template-columns:minmax(0,1fr) 150px 70px 40px!important;
      }
      #pane-chantiers .yaya-commande-native-status{min-width:145px!important;font-size:10.5px!important}
    }
  `;
  document.head.appendChild(style);

  let raf=0;
  function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;patch();});}
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();