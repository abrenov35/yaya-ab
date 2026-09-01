(async function(){
'use strict';
const raw=await fetch('chantier-detail-section-tabs.js?v=detailtabs-21',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('detailtabs '+r.status);return r.text();});
let src=raw;
function rep(a,b){if(!src.includes(a))throw new Error('Onglets chantier: point introuvable');src=src.replace(a,b);}

// COMMANDES + MAIL deviennent des sections natives du même moteur.
rep("const ORDER=['marche','depenses','charges','documents'];","const ORDER=['marche','commandes','depenses','charges','documents','mail'];");
rep("const LABELS={marche:'Marché',depenses:'Dépenses',charges:'Charges',documents:'Documents'};","const LABELS={marche:'Marché',commandes:'Commande',depenses:'Dépenses',charges:'Charges',documents:'Documents',mail:'Mail'};");
rep("const EMPTY_LABELS={marche:'Aucun devis',depenses:'Aucune dépense',charges:'Aucune charge',documents:'Aucun document'};","const EMPTY_LABELS={marche:'Aucun devis',commandes:'Aucune commande',depenses:'Aucune dépense',charges:'Aucune charge',documents:'Aucun document',mail:'Aucun mail'};");
rep("const EMPTY_META={marche:'0 €',depenses:'0 €',charges:'0 €',documents:''};","const EMPTY_META={marche:'0 €',commandes:'0 €',depenses:'0 €',charges:'0 €',documents:'',mail:''};");

rep("      .yaya-detail-section-tab[data-section=\"documents\"] small{display:none!important}\n      .yaya-detail-section-tab[data-section=\"documents\"].on{background:#deedff!important;border-color:#6e9fd6!important}\n","      .yaya-detail-section-tab[data-section=\"documents\"] small{display:none!important}\n      .yaya-detail-section-tab[data-section=\"documents\"].on{background:#deedff!important;border-color:#6e9fd6!important}\n\n      .yaya-detail-section-tab[data-section=\"commandes\"]{background:#f5f1e5!important;border-color:#d7c690!important;color:#745e18!important}\n      .yaya-detail-section-tab[data-section=\"commandes\"] small{background:#ebe1bd!important}\n      .yaya-detail-section-tab[data-section=\"commandes\"].on{background:#eadfae!important;border-color:#b99b35!important;color:#59470f!important}\n\n      .yaya-detail-section-tab[data-section=\"mail\"]{background:#f3e4d8!important;border-color:#c7a58b!important;color:#7a5138!important}\n      .yaya-detail-section-tab[data-section=\"mail\"] small{display:none!important}\n      .yaya-detail-section-tab[data-section=\"mail\"].on{background:#ead3c1!important;border-color:#a97855!important;color:#6c432b!important;box-shadow:inset 0 0 0 1px #a97855!important}\n");

rep("      .yaya-detail-section-tab[data-section=\"documents\"] small{display:none!important}\n\n      .card[data-yaya-detail-section=\"marche\"]", "      .yaya-detail-section-tab[data-section=\"documents\"] small{display:none!important}\n      .yaya-detail-section-tab[data-section=\"mail\"] small{display:none!important}\n\n      .card[data-yaya-detail-section=\"marche\"]");

rep("      .card[data-yaya-detail-section=\"documents\"] > .yaya-detail-section-node:not([data-section=\"documents\"]){\n        display:none!important;\n      }","      .card[data-yaya-detail-section=\"documents\"] > .yaya-detail-section-node:not([data-section=\"documents\"]),\n      .card[data-yaya-detail-section=\"commandes\"] > .yaya-detail-section-node:not([data-section=\"commandes\"]),\n      .card[data-yaya-detail-section=\"mail\"] > .yaya-detail-section-node:not([data-section=\"mail\"]){\n        display:none!important;\n      }");

rep("      .card[data-yaya-detail-section=\"documents\"] > .yaya-detail-empty-pane[data-section=\"documents\"][data-empty=\"1\"]{\n        display:block!important;\n      }","      .card[data-yaya-detail-section=\"documents\"] > .yaya-detail-empty-pane[data-section=\"documents\"][data-empty=\"1\"],\n      .card[data-yaya-detail-section=\"commandes\"] > .yaya-detail-empty-pane[data-section=\"commandes\"][data-empty=\"1\"],\n      .card[data-yaya-detail-section=\"mail\"] > .yaya-detail-empty-pane[data-section=\"mail\"][data-empty=\"1\"]{\n        display:block!important;\n      }");

rep("      .card[data-yaya-detail-section=\"marche\"] > .yaya-detail-markets-pane[data-empty=\"0\"]{display:block!important}\n      .yaya-detail-mails-pane", "      .card[data-yaya-detail-section=\"marche\"] > .yaya-detail-markets-pane[data-empty=\"0\"]{display:block!important}\n      .yaya-detail-commandes-pane{display:none!important;margin:0 0 8px!important}\n      .card[data-yaya-detail-section=\"commandes\"] > .yaya-detail-commandes-pane[data-empty=\"0\"]{display:block!important}\n      .yaya-detail-mails-pane");

rep("    if(key==='documents')return '';","    if(key==='documents'||key==='mail')return '';");

// Données Commandes : exclusivement S.commandes filtré par chantierId.
rep("  function marketRowsFor(card){","  function commandesFor(card){\n    const cid=cardId(card);\n    if(!cid||typeof S==='undefined'||!Array.isArray(S.commandes))return [];\n    return S.commandes.filter(c=>\n      String(c.chantierId||'')===cid\n      && String(c.statutValidation||'')!=='REJETEE'\n      && String(c.statutValidation||'')!=='DOUBLON'\n    ).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.id||'').localeCompare(String(a.id||'')));\n  }\n\n  function marketRowsFor(card){");

// Pane native Commandes.
rep("  function ensureMarketPane(card,tabs,rows){","  function ensureCommandesPane(card,tabs,rows){\n    let pane=card.querySelector(':scope > .yaya-detail-commandes-pane');\n    if(!pane){\n      pane=document.createElement('div');\n      pane.className='yaya-detail-section-node yaya-detail-commandes-pane';\n      pane.dataset.section='commandes';\n      tabs.insertAdjacentElement('afterend',pane);\n    }\n    pane.dataset.empty=rows.length?'0':'1';\n    const html=rows.map(row=>{\n      const lien=String(row.lien||row.oneDriveWebUrl||'');\n      return '<div class=\"yaya-detail-charge-row yaya-detail-commande-row\">'\n        +'<strong>'+escapeHtml(row.fournisseur||'Fournisseur')+(row.designation||row.pieceNom?'<small style=\"display:block;font-weight:500;color:#718096\">'+escapeHtml(row.designation||row.pieceNom)+'</small>':'')+(dateFr(row.date)?'<small class=\"yaya-history-date\">'+escapeHtml(dateFr(row.date))+'</small>':'')+'</strong>'\n        +'<span class=\"yaya-detail-charge-hours\">Commande</span>'\n        +'<span class=\"yaya-detail-charge-cost\">'+euro(Number(row.montantHT)||0)+'</span>'\n        +'<button type=\"button\" class=\"yaya-detail-charge-view yaya-detail-commande-view\" title=\"Voir\" aria-label=\"Voir\" data-lien=\"'+escapeHtml(lien)+'\"'+(lien?'':' disabled')+'>👁</button>'\n      +'</div>';\n    }).join('');\n    const signature=JSON.stringify(rows.map(row=>[row.id||'',row.fournisseur||'',row.designation||'',row.pieceNom||'',row.montantHT||0,row.date||'',row.lien||'',row.oneDriveWebUrl||'']));\n    if(pane._yayaRowsSignature!==signature){pane.innerHTML=html;pane._yayaRowsSignature=signature;}\n    pane.querySelectorAll('.yaya-detail-commande-view:not(:disabled)').forEach(btn=>{\n      if(btn._yayaViewBound)return;\n      btn._yayaViewBound=true;\n      btn.addEventListener('click',function(e){\n        e.preventDefault();e.stopPropagation();\n        const lien=String(btn.dataset.lien||'');\n        if(lien&&typeof voirPiece==='function')voirPiece(lien);\n        else if(lien)window.open(lien,'_blank','noopener,noreferrer');\n      });\n    });\n    return pane;\n  }\n\n  function ensureMarketPane(card,tabs,rows){");

// Mail reste une section native distincte.
rep("      section.nodes.forEach(node=>{\n        if(section.key==='depenses'){","      section.nodes.forEach(node=>{\n        if(node.classList?.contains('message-ligne')||node.querySelector?.('.b-mail')){\n          node.classList.add('yaya-detail-section-node');\n          node.dataset.section='mail';\n          node.dataset.yayaMailSource='1';\n          node.style.setProperty('display','none','important');\n          return;\n        }\n        if(section.key==='depenses'){");

rep("    const chargeRows=chargesFor(card);\n    const depenseRows=depensesFor(card);", "    const chargeRows=chargesFor(card);\n    const commandeRows=commandesFor(card);\n    const depenseRows=depensesFor(card);");

rep("      const meta=key==='documents'\n        ? ''\n        : key==='charges'", "      const meta=(key==='documents'||key==='mail')\n        ? ''\n        : key==='commandes'\n          ? euro(commandeRows.reduce((total,row)=>total+(Number(row.montantHT)||0),0))\n        : key==='charges'");

rep("      if(small)small.style.display=key==='documents'?'none':'';","      if(small)small.style.display=(key==='documents'||key==='mail')?'none':'';");

rep("      empty.dataset.empty=key==='charges'\n        ? (chargeRows.length?'0':'1')\n        : key==='depenses'\n          ? (depenseRows.length?'0':'1')\n          : key==='documents'\n            ? (documentRows.length?'0':'1')\n            : (section?'0':'1');","      empty.dataset.empty=key==='charges'\n        ? (chargeRows.length?'0':'1')\n        : key==='commandes'\n          ? (commandeRows.length?'0':'1')\n        : key==='depenses'\n          ? (depenseRows.length?'0':'1')\n          : key==='documents'\n            ? (documentRows.length?'0':'1')\n            : key==='mail'\n              ? (mailRows.length?'0':'1')\n              : (section?'0':'1');");

rep("    ensureChargesPane(card,tabs,chargeRows);\n    ensureExpensesPane(card,tabs,depenseRows);","    ensureChargesPane(card,tabs,chargeRows);\n    ensureCommandesPane(card,tabs,commandeRows);\n    ensureExpensesPane(card,tabs,depenseRows);");

(0,eval)(src+'\n//# sourceURL=chantier-detail-section-tabs-native-commandes-mail.js');

window.__YAYA_DIRECT_LINK_VERSION='1.0';

// Lien direct fiche chantier : ?chantier=ID#chantiers
let yayaDirectPendingId='';
try{yayaDirectPendingId=String(new URL(window.location.href).searchParams.get('chantier')||'').trim();}catch(e){}

function yayaSetDirectUrl(id){
  try{
    const url=new URL(window.location.href);
    const value=String(id||'').trim();
    if(value){url.searchParams.set('chantier',value);url.hash='chantiers';}
    else{url.searchParams.delete('chantier');if(url.hash==='#chantiers'||!url.hash)url.hash='chantiers';}
    history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  }catch(e){}
}

function yayaSyncDirectUrl(){
  try{
    if(typeof focusChantier!=='undefined'&&focusChantier){yayaSetDirectUrl(focusChantier);return;}
    if(!yayaDirectPendingId)yayaSetDirectUrl('');
  }catch(e){}
}

function yayaOpenDirectChantier(){
  if(!yayaDirectPendingId)return true;
  try{
    if(typeof chantierById!=='function'||typeof render!=='function')return false;
    const id=String(yayaDirectPendingId);
    const chantier=chantierById(id);
    if(!chantier)return false;
    if(typeof tab!=='undefined')tab='chantiers';
    if(typeof focusChantier!=='undefined')focusChantier=id;
    if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.clear==='function'){expChantiers.clear();expChantiers.add(id);}
    yayaDirectPendingId='';
    yayaSetDirectUrl(id);
    render();window.scrollTo(0,0);return true;
  }catch(e){return false;}
}

const directStateObserver=new MutationObserver(()=>{yayaSyncDirectUrl();if(yayaDirectPendingId)yayaOpenDirectChantier();});
directStateObserver.observe(document.documentElement,{childList:true,subtree:true});

if(yayaDirectPendingId){
  yayaSetDirectUrl(yayaDirectPendingId);
  let directAttempts=0;
  const directTimer=setInterval(()=>{directAttempts++;if(yayaOpenDirectChantier()||directAttempts>=120)clearInterval(directTimer);},100);
  setTimeout(yayaOpenDirectChantier,0);setTimeout(yayaOpenDirectChantier,250);setTimeout(yayaOpenDirectChantier,800);
}
})().catch(err=>console.error(err));
