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
    pane.querySelectorAll('.card .top').forEach(function(top){
      const spans=[...top.querySelectorAll('span')];
      const pctEl=spans.find(function(el){
        return /^(-?\d+(?:[.,]\d+)?)\s*%$/.test(String(el.textContent||'').trim());
      });
      if(!pctEl)return;

      const m=String(pctEl.textContent||'').trim().match(/^(-?\d+(?:[.,]\d+)?)\s*%$/);
      if(!m)return;
      const pct=parseFloat(m[1].replace(',','.'));
      if(!Number.isFinite(pct))return;

      const p=palette(pct);
      pctEl.style.setProperty('background',p.bg,'important');
      pctEl.style.setProperty('color',p.fg,'important');
      pctEl.style.removeProperty('border');
      pctEl.style.removeProperty('box-shadow');

      const margeEl=spans.find(function(el){
        return /^Marge\b/i.test(String(el.textContent||'').trim());
      });
      if(margeEl){
        margeEl.style.setProperty('color',p.fg,'important');
        margeEl.querySelectorAll('b').forEach(function(b){
          b.style.setProperty('color',p.fg,'important');
        });
      }
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
