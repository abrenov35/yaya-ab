(function(){
  'use strict';

  if(window.__yayaChantierOriginLabelV4)return;
  window.__yayaChantierOriginLabelV4=true;
  window.__yayaChantierOriginLabelV3=true;

  const MARK_TEXT='► [yaya]';
  const MARK=' '+MARK_TEXT;
  const STYLE_ID='yaya-origin-label-style-v4';
  const MARK_CLASS='yaya-origin-label-mark';
  let scheduled=false;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .${MARK_CLASS}{
        color:#7f8790!important;
        font-weight:600!important;
      }
    `;
    document.head.appendChild(style);
  }

  function chantiers(){
    try{
      return Array.isArray(S&&S.chantiers)
        ?S.chantiers.filter(function(c){return c&&c.id&&!String(c.id).startsWith('__');})
        :[];
    }catch(e){return [];}
  }

  function isExtranet(c){
    const id=String(c&&c.id||'').trim();
    const origine=String(c&&c.origine||c&&c.source||'').trim().toUpperCase();
    return origine==='EXTRANET'||/^C\d+$/i.test(id);
  }

  function cleanName(v){
    return String(v==null?'':v).replace(/\s*(?:►\s*)?\[yaya\]\s*$/i,'').trim();
  }

  function displayName(c){
    const name=cleanName(c&&c.nom||'Chantier');
    return isExtranet(c)?name:name+MARK;
  }

  function byId(id){
    id=String(id||'');
    return chantiers().find(function(c){return String(c.id)===id;})||null;
  }

  function hasAdjacentMark(node){
    const next=node&&node.nextSibling;
    return !!(next&&next.nodeType===Node.ELEMENT_NODE&&next.classList&&next.classList.contains(MARK_CLASS));
  }

  function replaceNodeWithGreyMark(node,base){
    if(!node||!node.parentNode||hasAdjacentMark(node))return;
    const raw=String(node.nodeValue||'');
    const lead=(raw.match(/^\s*/)||[''])[0];
    const trail=(raw.match(/\s*$/)||[''])[0];
    const frag=document.createDocumentFragment();
    frag.appendChild(document.createTextNode(lead+base+' '));
    const mark=document.createElement('span');
    mark.className=MARK_CLASS;
    mark.textContent=MARK_TEXT;
    frag.appendChild(mark);
    if(trail)frag.appendChild(document.createTextNode(trail));
    node.parentNode.replaceChild(frag,node);
  }

  function removeWrongMark(root,c){
    if(!root||!c||!isExtranet(c))return;
    const base=cleanName(c.nom||'');
    root.querySelectorAll('.'+MARK_CLASS).forEach(function(mark){
      const prev=mark.previousSibling;
      const prevText=prev&&prev.nodeType===Node.TEXT_NODE?cleanName(prev.nodeValue||''):'';
      if(!base||prevText===base){
        if(prev&&prev.nodeType===Node.TEXT_NODE)prev.nodeValue=String(prev.nodeValue||'').replace(/\s+$/,'');
        mark.remove();
      }
    });
  }

  function setElementName(el,c){
    if(!el||!c)return;
    const base=cleanName(c.nom||'Chantier');
    if(isExtranet(c)){
      if(String(el.textContent||'').trim()!==base)el.textContent=base;
      return;
    }
    const current=String(el.textContent||'').trim();
    const existing=el.querySelector('.'+MARK_CLASS);
    if(current===base+MARK&&existing)return;
    el.textContent='';
    el.appendChild(document.createTextNode(base+' '));
    const mark=document.createElement('span');
    mark.className=MARK_CLASS;
    mark.textContent=MARK_TEXT;
    el.appendChild(mark);
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
        if(hasAdjacentMark(node))return NodeFilter.FILTER_REJECT;
        const text=String(node.nodeValue||'').trim();
        return (text===base||text===wanted)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(node){replaceNodeWithGreyMark(node,base);});
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
      if(!c)return;
      if(isExtranet(c))removeWrongMark(card,c);
      else replaceExactName(card,c);
    });
  }

  function decorateNameLinks(){
    document.querySelectorAll('#pane-chantiers .yaya-chantier-name-edit-link[data-chantier-id]').forEach(function(el){
      const c=byId(el.dataset.chantierId);
      if(c)setElementName(el,c);
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

    const all=chantiers();
    const extranetNames=new Set(
      all.filter(isExtranet).map(function(c){return cleanName(c.nom||'');}).filter(Boolean)
    );
    const locals=all.filter(function(c){return !isExtranet(c);});
    const map=new Map();

    locals.forEach(function(c){
      const name=cleanName(c.nom||'');
      if(name&&!extranetNames.has(name)&&!map.has(name))map.set(name,c);
    });
    if(!map.size)return;

    const walker=document.createTreeWalker(pane,NodeFilter.SHOW_TEXT,{
      acceptNode:function(node){
        const parent=node&&node.parentElement;
        if(!parent||parent.closest('script,style,option,input,textarea'))return NodeFilter.FILTER_REJECT;
        if(hasAdjacentMark(node))return NodeFilter.FILTER_REJECT;

        const card=parent.closest('.card');
        if(card){
          const id=cardChantierId(card);
          if(id&&byId(id))return NodeFilter.FILTER_REJECT;
        }

        const text=String(node.nodeValue||'').trim();
        return map.has(text)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });

    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const base=String(node.nodeValue||'').trim();
      if(map.has(base))replaceNodeWithGreyMark(node,base);
    });
  }

  function apply(){
    installStyle();
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

  installStyle();
  window.yayaApplyOriginLabels=apply;
  schedule();
  [120,350,800,1600,3000].forEach(function(ms){setTimeout(schedule,ms);});
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
