(function(){
  'use strict';

  if(window.__yayaChantierOriginLabelV1)return;
  window.__yayaChantierOriginLabelV1=true;

  const MARK=' [yaya]';
  let scheduled=false;

  function chantiers(){
    try{return Array.isArray(S&&S.chantiers)?S.chantiers.filter(function(c){return c&&c.id&&!String(c.id).startsWith('__');}):[];}catch(e){return [];}
  }

  function isExtranet(c){
    const id=String(c&&c.id||'').trim();
    const origine=String(c&&c.origine||c&&c.source||'').trim().toUpperCase();
    return origine==='EXTRANET'||/^C\d+$/i.test(id);
  }

  function cleanName(v){
    return String(v==null?'':v).replace(/\s*\[yaya\]\s*$/i,'').trim();
  }

  function displayName(c){
    const name=cleanName(c&&c.nom||'Chantier');
    return isExtranet(c)?name:name+MARK;
  }

  function byId(id){
    id=String(id||'');
    return chantiers().find(function(c){return String(c.id)===id;})||null;
  }

  function decorateNameLinks(){
    document.querySelectorAll('#pane-chantiers .yaya-chantier-name-edit-link[data-chantier-id]').forEach(function(el){
      const c=byId(el.dataset.chantierId);
      if(!c)return;
      const wanted=displayName(c);
      if(String(el.textContent||'').trim()!==wanted)el.textContent=wanted;
    });
  }

  function decorateSelectors(){
    const all=chantiers();
    if(!all.length)return;
    const map=new Map(all.map(function(c){return [String(c.id),c];}));

    document.querySelectorAll('select').forEach(function(select){
      const opts=[...select.options];
      if(!opts.some(function(o){return map.has(String(o.value||''));}))return;

      opts.forEach(function(option){
        const c=map.get(String(option.value||''));
        if(!c)return;
        const base=cleanName(c.nom||'Chantier');
        const current=String(option.textContent||'');
        let suffix='';
        if(/archiv/i.test(current)||String(c.statut||'').trim().toLowerCase()==='archivé')suffix=' — Archivé';
        const wanted=displayName(c)+suffix;
        if(current!==wanted)option.textContent=wanted;
      });
    });
  }

  function decorateUniquePlainNames(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    const counts=new Map();
    chantiers().forEach(function(c){
      const name=cleanName(c.nom||'');
      if(!name)return;
      counts.set(name,(counts.get(name)||0)+1);
    });

    const localByName=new Map();
    chantiers().forEach(function(c){
      const name=cleanName(c.nom||'');
      if(name&&!isExtranet(c)&&counts.get(name)===1)localByName.set(name,c);
    });
    if(!localByName.size)return;

    const walker=document.createTreeWalker(pane,NodeFilter.SHOW_TEXT,{
      acceptNode:function(node){
        const parent=node&&node.parentElement;
        if(!parent)return NodeFilter.FILTER_REJECT;
        if(parent.closest('script,style,option,button,input,textarea,.yaya-chantier-name-edit-link'))return NodeFilter.FILTER_REJECT;
        const text=String(node.nodeValue||'').trim();
        return localByName.has(text)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });

    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const name=String(node.nodeValue||'').trim();
      const c=localByName.get(name);
      if(c)node.nodeValue=node.nodeValue.replace(name,displayName(c));
    });
  }

  function apply(){
    decorateNameLinks();
    decorateSelectors();
    decorateUniquePlainNames();
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      apply();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
