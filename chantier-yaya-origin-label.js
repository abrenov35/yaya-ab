(function(){
  'use strict';

  if(window.__yayaChantierOriginLabelV2)return;
  window.__yayaChantierOriginLabelV2=true;

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

  function replaceExactName(root,c){
    if(!root||!c||isExtranet(c))return;
    const base=cleanName(c.nom||'');
    if(!base)return;
    const wanted=base+MARK;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode:function(node){
        const parent=node&&node.parentElement;
        if(!parent||parent.closest('script,style,option,input,textarea'))return NodeFilter.FILTER_REJECT;
        const text=String(node.nodeValue||'').trim();
        return (text===base||text===wanted)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const raw=String(node.nodeValue||'');
      const lead=(raw.match(/^\s*/)||[''])[0];
      const trail=(raw.match(/\s*$/)||[''])[0];
      node.nodeValue=lead+wanted+trail;
    });
  }

  function cardChantierId(card){
    if(!card)return '';
    const data=card.querySelector('[data-chantier-id]');
    if(data&&data.dataset&&data.dataset.chantierId)return String(data.dataset.chantierId);
    const els=[...card.querySelectorAll('[onclick]')];
    for(const el of els){
      const code=String(el.getAttribute('onclick')||'');
      let m=code.match(/toggleChantier\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
      m=code.match(/openExistingChantierModal\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
      m=code.match(/editMontantDevis\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
    }
    return '';
  }

  function decorateCards(){
    document.querySelectorAll('#pane-chantiers .card').forEach(function(card){
      const id=cardChantierId(card);
      const c=id?byId(id):null;
      if(c)replaceExactName(card,c);
    });
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
      [...select.options].forEach(function(option){
        const c=map.get(String(option.value||''));
        if(!c)return;
        const current=String(option.textContent||'');
        const suffix=(/archiv/i.test(current)||String(c.statut||'').trim().toLowerCase()==='archivé')?' — Archivé':'';
        const wanted=displayName(c)+suffix;
        if(current!==wanted)option.textContent=wanted;
      });
    });
  }

  function decoratePaneByName(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    const locals=chantiers().filter(function(c){return !isExtranet(c);});
    const map=new Map();
    locals.forEach(function(c){
      const name=cleanName(c.nom||'');
      if(name&&!map.has(name))map.set(name,c);
    });
    if(!map.size)return;
    const walker=document.createTreeWalker(pane,NodeFilter.SHOW_TEXT,{
      acceptNode:function(node){
        const parent=node&&node.parentElement;
        if(!parent||parent.closest('script,style,option,input,textarea'))return NodeFilter.FILTER_REJECT;
        const text=String(node.nodeValue||'').trim();
        return map.has(text)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const base=String(node.nodeValue||'').trim();
      const c=map.get(base);
      if(c)replaceExactName(node.parentElement,c);
    });
  }

  function apply(){
    if(!chantiers().length)return;
    decorateCards();
    decorateNameLinks();
    decorateSelectors();
    decoratePaneByName();
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;apply();});
  }

  window.yayaApplyOriginLabels=apply;
  schedule();
  [120,350,800,1600,3000].forEach(function(ms){setTimeout(schedule,ms);});
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
