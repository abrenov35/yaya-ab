(function(){
  'use strict';

  const STYLE_ID='yaya-signed-quotes-display-style';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .card > .top > b + .num{
        display:none!important;
      }
      .yaya-signed-quote-kpi{
        display:block;
        margin-top:3px;
        color:#315779!important;
        font-size:11px!important;
        font-weight:650!important;
      }
    `;
    document.head.appendChild(style);
  }

  function chantierId(card){
    const nodes=card?[...card.querySelectorAll('[onclick]')]:[];
    for(const node of nodes){
      const raw=String(node.getAttribute('onclick')||'');
      const match=raw.match(/(?:toggleChantier|editMontantDevis|openAvenant|openExistingChantierModal)\(['"]([^'"]+)/);
      if(match&&match[1])return String(match[1]);
    }
    try{return typeof focusChantier!=='undefined'&&focusChantier?String(focusChantier):'';}catch(e){return '';}
  }

  function chantierByCard(card){
    const cid=chantierId(card);
    if(!cid)return null;
    try{return Array.isArray(S.chantiers)?S.chantiers.find(c=>String(c.id)===cid)||null:null;}catch(e){return null;}
  }

  function signedQuoteTotal(chantier){
    if(!chantier)return 0;
    let total=Number(chantier.montantDevisHT)||0;
    try{
      if(Array.isArray(S.avenants)){
        total+=S.avenants
          .filter(item=>String(item.chantierId)===String(chantier.id))
          .reduce((sum,item)=>sum+(Number(item.montantHT)||0),0);
      }
    }catch(e){}
    return total;
  }

  function euro(value){
    return Math.round(Number(value)||0).toLocaleString('fr-FR')+' €';
  }

  function decorateCard(card){
    const chantier=chantierByCard(card);
    if(!chantier)return;
    const total=euro(signedQuoteTotal(chantier));
    const kpis=card.querySelector(':scope > .kpis');
    if(kpis){
      const marketStat=[...kpis.querySelectorAll(':scope > .stat')].find(stat=>{
        const label=stat.querySelector('small');
        return /^Marché HT$/i.test(String(label&&label.textContent||'').trim());
      });
      if(marketStat){
        let line=marketStat.querySelector('.yaya-signed-quote-kpi');
        if(!line){
          line=document.createElement('span');
          line.className='sub yaya-signed-quote-kpi';
          marketStat.appendChild(line);
        }
        const wanted='Devis signé : '+total;
        if(line.textContent!==wanted)line.textContent=wanted;
      }
    }
  }

  let scheduled=false;
  function decorate(){
    scheduled=false;
    installStyle();
    document.querySelectorAll('#pane-chantiers .card').forEach(decorateCard);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(decorate);
  }

  function install(){
    installStyle();
    schedule();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
