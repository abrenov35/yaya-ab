(function(){
  'use strict';

  function palette(pct){
    if(pct>=100) return {bg:'#E8F2F9', fg:'#003D7A'};
    if(pct>=70)  return {bg:'#ECFDF5', fg:'#047857'};
    if(pct>=30)  return {bg:'#FFF7ED', fg:'#C2410C'};
    return {bg:'#FEF2F2', fg:'#B91C1C'};
  }

  function applyMarginBadgeColors(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    pane.querySelectorAll('.card .top span').forEach(function(el){
      const txt=String(el.textContent||'').trim();
      const m=txt.match(/^(-?\d+(?:[.,]\d+)?)\s*%$/);
      if(!m)return;
      const pct=parseFloat(m[1].replace(',','.'));
      if(!Number.isFinite(pct))return;
      const p=palette(pct);
      el.style.setProperty('background',p.bg,'important');
      el.style.setProperty('color',p.fg,'important');
      el.style.removeProperty('border');
      el.style.removeProperty('box-shadow');
    });
  }

  const oldRender=window.renderChantiers;
  if(typeof oldRender==='function'&&!oldRender.__yayaMarginColors){
    const wrapped=function(){
      const r=oldRender.apply(this,arguments);
      applyMarginBadgeColors();
      return r;
    };
    wrapped.__yayaMarginColors=true;
    window.renderChantiers=wrapped;
  }

  setTimeout(applyMarginBadgeColors,50);
  setTimeout(applyMarginBadgeColors,400);
  setTimeout(applyMarginBadgeColors,1200);
})();
