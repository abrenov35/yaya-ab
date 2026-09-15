(function(){
  'use strict';

  if(window.__yayaMailUnderDocumentsV3)return;
  window.__yayaMailUnderDocumentsV3=true;

  const ALIASES={
    'mtiureohm15c':'C454','planning-12':'C458','msm3za2i1tpw':'C459','mtqylt0du6sy':'C460',
    'mtk4fpwm5tka':'C461','mtlmue3aefv2':'C462','planning-28':'C463','mrrui7k8nrtg':'C464',
    'mthmmenk2njd':'C465','mrsvjujxia59':'C466','mtovzolwurte':'C468','mrrum5gnhn92':'C469','mrrp7dywt2x7':'C473'
  };

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function canon(v){
    const raw=String(v==null?'':v).trim();
    if(!raw)return '';
    try{
      if(typeof window.yayaCanonicalChantierId==='function')return String(window.yayaCanonicalChantierId(raw)||raw);
    }catch(e){}
    return ALIASES[raw]||raw;
  }

  function isMail(d){
    if(!d)return false;
    const upper=function(v){return String(v||'').trim().toUpperCase();};
    if(upper(d.type)==='MAIL'||upper(d.origineMail)==='MAIL'||upper(d.origine)==='MAIL')return true;
    if(d.contenuMail||d.corpsMail||d.bodyMail||d.mailBody||d.expediteur||d.from||d.objetMail||d.mailSubject||d.emailSubject)return true;
    return /\b(?:envoy[eé]|sent|from|objet)\s*:/i.test(String(d.titre||d.objet||''));
  }

  function sender(d){
    try{if(typeof nomMailYaya==='function')return String(nomMailYaya(d)||'').trim();}catch(e){}
    return String(d.nomMail||d.expediteur||d.from||d.sender||d.sujet||'Expéditeur non renseigné').replace(/<.*$/,'').trim();
  }

  function subject(d){
    try{if(typeof objetMailYaya==='function')return String(objetMailYaya(d)||'').trim();}catch(e){}
    return String(d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet||d.titre||'Objet non renseigné')
      .replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  }

  function dateFr(v){
    const s=String(v||'').slice(0,10);
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?m[3]+'/'+m[2]+'/'+m[1]:(s||'—');
  }

  function cardId(card){
    if(!card)return '';
    const nodes=card.querySelectorAll('[onclick]');
    for(let i=0;i<nodes.length;i++){
      const raw=String(nodes[i].getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return canon(m[1]);
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return canon(focusChantier);}catch(e){}
    return '';
  }

  function rowsFor(cid){
    try{
      if(!cid||typeof S==='undefined'||!S||!Array.isArray(S.documents))return [];
      return S.documents.filter(function(d){
        return isMail(d)&&canon(d.chantierId||d.chantier_id)===canon(cid);
      }).sort(function(a,b){
        return String(b.date||'').localeCompare(String(a.date||''))||String(b.id||'').localeCompare(String(a.id||''));
      });
    }catch(e){return [];}
  }

  function installStyle(){
    const id='yaya-mails-under-documents-v3';
    if(document.getElementById(id))return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      #pane-chantiers .yaya-force-mails-pane{display:none!important;margin:8px 0 0!important}
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-force-mails-pane[data-empty="0"]{display:block!important}
      #pane-chantiers .yaya-force-mails-pane::before{content:'MAIL';display:block;padding:7px 10px;background:#f3eaf8;border-bottom:1px solid #dac9e7;color:#68418a;font-size:11px;font-weight:900;letter-spacing:.04em}
      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row{display:grid!important;grid-template-columns:minmax(150px,.85fr) minmax(220px,1.8fr) 90px!important;align-items:center!important;gap:10px!important;min-height:42px!important;padding:7px 10px!important;border-bottom:1px solid #e6ebf1!important;cursor:pointer!important}
      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:hover{background:#faf7fc!important}
      #pane-chantiers .yaya-mail-restored-row .yaya-mail-restored-sender,#pane-chantiers .yaya-mail-restored-row .yaya-mail-restored-subject{min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-chantiers .yaya-mail-restored-row .yaya-mail-restored-date{text-align:right!important;color:#7a8798!important;font-size:10.5px!important;white-space:nowrap!important}
      @media(max-width:640px){#pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row{grid-template-columns:minmax(105px,.8fr) minmax(130px,1.4fr) 74px!important;gap:6px!important;padding:7px 6px!important}}
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="commandes"] small{display:none!important}
      #pane-chantiers .yaya-detail-section-tab[data-section="commandes"] small[data-yaya-count]::after{content:none!important;display:none!important}
    `;
    document.head.appendChild(s);
  }

  function syncCard(card){
    const cid=cardId(card);
    if(!cid)return;
    const rows=rowsFor(cid);
    let pane=card.querySelector(':scope > .yaya-force-mails-pane');

    const nativePane=card.querySelector(':scope > .yaya-detail-mails-pane:not(.yaya-force-mails-pane)');
    const nativeHasRows=!!(nativePane&&nativePane.querySelector('.yaya-detail-mail-row'));
    if(nativeHasRows){
      if(pane)pane.remove();
      return;
    }

    if(!rows.length){
      if(pane)pane.remove();
      return;
    }

    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-section-node yaya-detail-mails-pane yaya-force-mails-pane';
      pane.dataset.section='documents';
      const docPane=card.querySelector(':scope > .yaya-detail-documents-pane');
      const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
      if(docPane)docPane.insertAdjacentElement('afterend',pane);
      else if(tabs)tabs.insertAdjacentElement('afterend',pane);
      else card.appendChild(pane);
    }

    pane.dataset.empty='0';
    const signature=JSON.stringify(rows.map(function(r){return [r.id||'',r.date||'',sender(r),subject(r)];}));
    if(pane.dataset.signature!==signature){
      pane.dataset.signature=signature;
      pane.innerHTML=rows.map(function(r){
        const id=String(r.id||'');
        return '<div class="yaya-mail-restored-row" data-mail-id="'+esc(id)+'" tabindex="0" role="button">'
          +'<strong class="yaya-mail-restored-sender" title="'+esc(sender(r))+'">'+esc(sender(r))+'</strong>'
          +'<span class="yaya-mail-restored-subject" title="'+esc(subject(r))+'">'+esc(subject(r))+'</span>'
          +'<span class="yaya-mail-restored-date">'+esc(dateFr(r.date))+'</span>'
          +'</div>';
      }).join('');
    }
  }

  function refresh(){
    installStyle();
    const root=document.getElementById('pane-chantiers');
    if(!root)return;
    root.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(syncCard);
  }

  let timer=0;
  function schedule(delay){
    clearTimeout(timer);
    timer=setTimeout(function(){timer=0;requestAnimationFrame(refresh);},Math.max(0,Number(delay)||0));
  }

  document.addEventListener('click',function(e){
    const row=e.target&&e.target.closest?e.target.closest('.yaya-mail-restored-row'):null;
    if(row){
      const id=String(row.dataset.mailId||'');
      if(id&&typeof window.voirMessageYaya==='function')window.voirMessageYaya(id);
      return;
    }
    const target=e.target&&e.target.closest?e.target.closest('.yaya-detail-section-tab,[onclick*="toggleChantier("]'):null;
    if(target){schedule(30);setTimeout(function(){schedule(0);},180);}
  },false);

  document.addEventListener('keydown',function(e){
    const row=e.target&&e.target.closest?e.target.closest('.yaya-mail-restored-row'):null;
    if(!row||(e.key!=='Enter'&&e.key!==' '))return;
    e.preventDefault();
    const id=String(row.dataset.mailId||'');
    if(id&&typeof window.voirMessageYaya==='function')window.voirMessageYaya(id);
  },false);

  window.addEventListener('yaya:data-refreshed',function(){schedule(40);});
  window.addEventListener('hashchange',function(){schedule(80);});

  function installRenderHook(){
    if(typeof window.render!=='function'){setTimeout(installRenderHook,150);return;}
    if(window.render.__yayaMailRestoreV3)return;
    const original=window.render;
    const wrapped=function(){
      const result=original.apply(this,arguments);
      schedule(50);
      return result;
    };
    wrapped.__yayaMailRestoreV3=true;
    wrapped.__yayaOriginalRender=original;
    window.render=wrapped;
  }

  installRenderHook();
  [0,150,500,1200].forEach(function(ms){setTimeout(function(){schedule(0);},ms);});

  // Charger le correctif de persistance après mail-edit-sync-fix.js.
  setTimeout(function(){
    if(window.__yayaMailEditPersistV2)return;
    const existing=document.querySelector('script[data-yaya-mail-persist-v2]');
    if(existing)return;
    const script=document.createElement('script');
    script.src='mail-edit-persist-v2.js?v=2';
    script.dataset.yayaMailPersistV2='1';
    script.async=false;
    document.head.appendChild(script);
  },0);
})();
