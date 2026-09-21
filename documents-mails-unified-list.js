(function(){
  'use strict';
  if(window.__yayaDocumentsMailsUnifiedV1)return;
  window.__yayaDocumentsMailsUnifiedV1=true;

  const STYLE_ID='yaya-documents-mails-unified-v1';
  const ALIASES={'mtiureohm15c':'C454','planning-12':'C458','msm3za2i1tpw':'C459','mtqylt0du6sy':'C460','mtk4fpwm5tka':'C461','mtlmue3aefv2':'C462','planning-28':'C463','mrrui7k8nrtg':'C464','mthmmenk2njd':'C465','mrsvjujxia59':'C466','mtovzolwurte':'C468','mrrum5gnhn92':'C469','mrrp7dywt2x7':'C473'};

  function text(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function upper(v){return text(v).toUpperCase();}
  function canon(v){
    const raw=text(v);if(!raw)return '';
    try{if(typeof window.yayaCanonicalChantierId==='function')return text(window.yayaCanonicalChantierId(raw))||raw;}catch(e){}
    return ALIASES[raw]||raw;
  }
  function isMail(d){
    if(!d)return false;
    return upper(d.type)==='MAIL'||upper(d.origineMail)==='MAIL'||upper(d.origine)==='MAIL'||!!(d.contenuMail||d.corpsMail||d.bodyMail||d.mailBody||d.expediteur||d.from||d.objetMail||d.mailSubject||d.emailSubject);
  }
  function isAttachment(d){return upper(d&&d.type)==='MAIL_PJ';}
  function cardId(card){
    if(!card)return '';
    for(const node of card.querySelectorAll('[onclick]')){
      const match=text(node.getAttribute('onclick')).match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['"]([^'"]+)/);
      if(match&&match[1])return canon(match[1]);
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return canon(focusChantier);}catch(e){}
    return '';
  }
  function dateValue(d){return d?text(d.date||d.horodatage||d.createdAt||d.updatedAt):'';}
  function timestamp(v){
    v=text(v);if(!v)return 0;
    const fr=v.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if(fr)return Date.parse(fr[3]+'-'+fr[2]+'-'+fr[1])||0;
    return Date.parse(v)||0;
  }
  function dateFr(v){
    v=text(v);if(!v)return '—';
    const iso=v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return iso?iso[3]+'/'+iso[2]+'/'+iso[1]:v.slice(0,10);
  }
  function sender(d){
    try{if(typeof window.nomMailYaya==='function')return text(window.nomMailYaya(d))||'Expéditeur non renseigné';}catch(e){}
    return text(d.nomMail||d.expediteur||d.from||d.sender||d.sujet).replace(/<.*$/,'')||'Expéditeur non renseigné';
  }
  function subject(d){
    try{if(typeof window.objetMailYaya==='function')return text(window.objetMailYaya(d))||'Objet non renseigné';}catch(e){}
    return text(d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet||d.titre).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ')||'Objet non renseigné';
  }
  function documentTitle(d){
    const raw=text(d.titre),parts=raw.split('/').map(text).filter(Boolean);
    if(upper(d.origine)==='DOCS_CHANTIER'&&parts.length>=3)return parts[1]||text(d.sujet)||'Document';
    return text(d.sujet||d.fournisseur)||parts[0]||raw||'Document';
  }
  function documentDetail(d){
    const raw=text(d.titre),parts=raw.split('/').map(text).filter(Boolean);
    let detail=upper(d.origine)==='DOCS_CHANTIER'&&parts.length>=3?(parts.slice(3).join(' / ')||text(d.sujet)||raw):raw;
    if(upper(detail)===upper(documentTitle(d)))detail='';
    return detail;
  }
  function rowsFor(card){
    const cid=cardId(card);if(!cid)return [];
    let all=[];try{all=(typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){}
    return all.filter(function(d){return !isAttachment(d)&&canon(d&&d.chantierId||d&&d.chantier_id)===cid;}).sort(function(a,b){
      return timestamp(dateValue(b))-timestamp(dateValue(a))||text(b&&b.id).localeCompare(text(a&&a.id));
    });
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane:not(.yaya-docmail-unified-pane),
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane,
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-force-mails-pane{display:none!important}
      #pane-chantiers .yaya-docmail-unified-pane{display:none!important;margin:0 0 8px!important;border:1px solid #dce5ee!important;border-radius:9px!important;overflow:hidden!important;background:#fff!important}
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-docmail-unified-pane[data-empty="0"]{display:block!important}
      #pane-chantiers .yaya-docmail-unified-pane::before{content:none!important;display:none!important}
      #pane-chantiers .yaya-docmail-unified-pane > .yaya-documents-compact-title{display:none!important}
      #pane-chantiers .yaya-docmail-unified-title{min-height:30px!important;display:flex!important;align-items:center!important;padding:0 10px!important;background:#eef5fb!important;border-bottom:1px solid #d3e1ee!important;color:#285f96!important;font-size:10.5px!important;font-weight:900!important;letter-spacing:.045em!important}
      #pane-chantiers .yaya-docmail-unified-row{display:grid!important;grid-template-columns:minmax(150px,.85fr) minmax(220px,1.65fr) 82px 92px!important;align-items:center!important;gap:10px!important;min-height:42px!important;padding:6px 10px!important;border-bottom:1px solid #e7ecf2!important;background:#fff!important;cursor:pointer!important}
      #pane-chantiers .yaya-docmail-unified-row:last-child{border-bottom:0!important}
      #pane-chantiers .yaya-docmail-primary,#pane-chantiers .yaya-docmail-secondary{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      #pane-chantiers .yaya-docmail-primary{color:#17324f!important;font-size:12px!important;font-weight:850!important}
      #pane-chantiers .yaya-docmail-secondary{color:#53677c!important;font-size:11.5px!important;font-weight:500!important}
      #pane-chantiers .yaya-docmail-kind{justify-self:start!important;padding:3px 7px!important;border-radius:999px!important;background:#edf4fa!important;color:#285f96!important;font-size:9.5px!important;font-weight:850!important;white-space:nowrap!important}
      #pane-chantiers .yaya-docmail-kind[data-kind="mail"]{background:#f5eff9!important;color:#69448a!important}
      #pane-chantiers .yaya-docmail-date{color:#8793a1!important;font-size:10.5px!important;font-weight:500!important;text-align:right!important;white-space:nowrap!important}
      #pane-chantiers .yaya-docmail-unified-row > .yaya-detail-document-view{display:none!important}
      @media(max-width:760px){#pane-chantiers .yaya-docmail-unified-row{grid-template-columns:minmax(0,1fr) auto auto!important;grid-template-rows:auto auto!important;gap:3px 7px!important;min-height:54px!important;padding:7px 9px!important}.yaya-docmail-primary{grid-column:1!important;grid-row:1!important}.yaya-docmail-secondary{grid-column:1/-1!important;grid-row:2!important}.yaya-docmail-kind{grid-column:2!important;grid-row:1!important}.yaya-docmail-date{grid-column:3!important;grid-row:1!important}}
    `;document.head.appendChild(style);
  }
  function renderCard(card){
    const rows=rowsFor(card);
    let pane=card.querySelector(':scope > .yaya-docmail-unified-pane');
    if(!pane){pane=document.createElement('div');pane.className='yaya-detail-section-node yaya-detail-documents-pane yaya-docmail-unified-pane';pane.dataset.section='documents';const anchor=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="documents"]');if(anchor)anchor.insertAdjacentElement('afterend',pane);else card.appendChild(pane);}
    pane.dataset.empty=rows.length?'0':'1';
    const signature=JSON.stringify(rows.map(function(d){return [d.id,dateValue(d),isMail(d),d.titre,d.sujet,d.objet,d.objetMail,d.expediteur,d.from,d.lien];}));
    if(pane.dataset.signature===signature)return;
    pane.dataset.signature=signature;
    pane.innerHTML='<div class="yaya-docmail-unified-title">DOCUMENTS &amp; MAILS · '+rows.length+'</div>'+rows.map(function(d){
      const mail=isMail(d),id=text(d.id),primary=mail?sender(d):documentTitle(d),secondary=mail?subject(d):documentDetail(d),url=mail?'':text(d.lien||d.url||d.webUrl||d.downloadUrl);
      return '<div class="yaya-docmail-unified-row yaya-detail-document-row'+(mail?' yaya-detail-mail-row':'')+'" '+(mail?'data-mail-id':'data-row-id')+'="'+esc(id)+'">'
        +'<strong class="yaya-docmail-primary" title="'+esc(primary)+'">'+esc(primary)+'</strong>'
        +'<span class="yaya-docmail-secondary" title="'+esc(secondary)+'">'+esc(secondary||'—')+'</span>'
        +'<span class="yaya-docmail-kind" data-kind="'+(mail?'mail':'document')+'">'+(mail?'Mail':'Document')+'</span>'
        +'<span class="yaya-docmail-date">'+esc(dateFr(dateValue(d)))+'</span>'
        +(url?'<button type="button" class="yaya-detail-document-view" data-doc-id="'+esc(id)+'" data-lien="'+esc(url)+'">Voir</button>':'')
        +'</div>';
    }).join('');
  }
  function apply(){
    installStyle();const root=document.getElementById('pane-chantiers');if(!root)return;
    root.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(renderCard);
  }
  let timer=0;function schedule(delay){clearTimeout(timer);timer=setTimeout(function(){timer=0;requestAnimationFrame(apply);},Number(delay)||0);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){schedule(0);},{once:true});else schedule(0);
  const root=document.getElementById('pane-chantiers')||document.body;
  new MutationObserver(function(mutations){for(const m of mutations){if(m.addedNodes&&m.addedNodes.length){schedule(20);break;}}}).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',function(){schedule(30);});
  window.addEventListener('hashchange',function(){schedule(50);});
})();
