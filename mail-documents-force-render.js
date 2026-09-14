(function(){
  'use strict';
  if(window.__yayaForceMailDocumentsV1)return;
  window.__yayaForceMailDocumentsV1=true;

  const ALIASES=Object.freeze({
    'mtiureohm15c':'C454',
    'planning-12':'C458',
    'msm3za2i1tpw':'C459',
    'mtqylt0du6sy':'C460',
    'mtk4fpwm5tka':'C461',
    'mtlmue3aefv2':'C462',
    'planning-28':'C463',
    'mrrui7k8nrtg':'C464',
    'mthmmenk2njd':'C465',
    'mrsvjujxia59':'C466',
    'mtovzolwurte':'C468',
    'mrrum5gnhn92':'C469',
    'mrrp7dywt2x7':'C473'
  });

  function canon(value){
    const id=String(value==null?'':value).trim();
    return ALIASES[id]||id;
  }
  function normalise(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
  }
  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function isMail(row){
    if(!row)return false;
    const upper=function(v){return String(v||'').trim().toUpperCase();};
    if(upper(row.type)==='MAIL'||upper(row.origineMail)==='MAIL'||upper(row.origine)==='MAIL')return true;
    if(row.contenuMail||row.corpsMail||row.expediteur||row.from||row.objetMail||row.mailSubject||row.emailSubject)return true;
    return /\b(?:envoy[eé]|sent|from|objet)\s*:/i.test(String(row.titre||row.objet||''));
  }
  function chantierIdFromCard(card){
    if(!card)return '';
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return canon(m[1]);
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return canon(focusChantier);}catch(e){}
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers)){
        const title=card.querySelector('.top b');
        const name=normalise(title&&title.textContent);
        const found=S.chantiers.find(c=>normalise(c&&c.nom)===name);
        if(found&&found.id)return canon(found.id);
      }
    }catch(e){}
    return '';
  }
  function mailRowsFor(cid){
    try{
      if(!cid||typeof S==='undefined'||!S||!Array.isArray(S.documents))return [];
      return S.documents.filter(function(row){
        return isMail(row)&&canon(row.chantierId||row.chantier_id)===canon(cid);
      }).sort(function(a,b){
        return String(b.date||'').localeCompare(String(a.date||''))||String(b.id||'').localeCompare(String(a.id||''));
      });
    }catch(e){return [];}
  }
  function sender(row){
    try{if(typeof nomMailYaya==='function')return String(nomMailYaya(row)||'').trim();}catch(e){}
    return String(row.nomMail||row.expediteur||row.from||row.sujet||'Expéditeur non renseigné').replace(/<.*$/,'').trim();
  }
  function subject(row){
    try{if(typeof objetMailYaya==='function')return String(objetMailYaya(row)||'').trim();}catch(e){}
    return String(row.objetMail||row.mailSubject||row.emailSubject||row.subject||row.sujet||row.objet||'Objet non renseigné').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  }
  function dateFr(value){
    const s=String(value||'').slice(0,10);
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?m[3]+'/'+m[2]+'/'+m[1]:(s||'—');
  }
  function ensureCard(card){
    const cid=chantierIdFromCard(card);
    if(!cid)return;
    const rows=mailRowsFor(cid);
    let pane=card.querySelector(':scope > .yaya-force-mails-pane');
    if(!rows.length){if(pane)pane.remove();return;}
    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-section-node yaya-detail-mails-pane yaya-force-mails-pane';
      pane.dataset.section='documents';
      const action=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="documents"]');
      const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
      if(action)action.insertAdjacentElement('afterend',pane);
      else if(tabs)tabs.insertAdjacentElement('afterend',pane);
      else card.appendChild(pane);
    }
    pane.dataset.empty='0';
    const active=String(card.dataset.yayaDetailSection||'');
    pane.style.setProperty('display',active==='documents'||active==='mail'?'block':'none','important');
    const sig=JSON.stringify(rows.map(r=>[r.id||'',r.chantierId||r.chantier_id||'',r.date||'',sender(r),subject(r)]));
    if(pane.dataset.signature===sig)return;
    pane.dataset.signature=sig;
    pane.innerHTML=rows.map(function(row){
      const id=String(row.id||'');
      return '<div class="yaya-detail-document-row yaya-detail-mail-row">'
        +'<strong class="yaya-mail-sender" title="'+esc(sender(row))+'">'+esc(sender(row))+'</strong>'
        +'<span class="yaya-mail-subject" title="'+esc(subject(row))+'">'+esc(subject(row))+'</span>'
        +'<span class="yaya-detail-charge-cost">'+esc(dateFr(row.date))+'</span>'
        +'<button type="button" class="yaya-detail-document-view yaya-force-mail-view" data-mail-id="'+esc(id)+'" title="Voir" aria-label="Voir">👁</button>'
        +'<button type="button" class="yaya-detail-document-edit yaya-force-mail-edit" data-mail-id="'+esc(id)+'" title="Modifier" aria-label="Modifier">✏️</button>'
        +'<button type="button" class="yaya-detail-document-delete yaya-force-mail-delete" data-mail-id="'+esc(id)+'" title="Supprimer" aria-label="Supprimer">🗑️</button>'
      +'</div>';
    }).join('');
  }
  function apply(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    pane.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(ensureCard);
  }
  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;apply();});
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('.yaya-force-mail-view,.yaya-force-mail-edit,.yaya-force-mail-delete'):null;
    if(btn){
      e.preventDefault();e.stopPropagation();
      const id=String(btn.dataset.mailId||'');
      if(!id)return;
      if(btn.classList.contains('yaya-force-mail-view')){
        try{if(typeof voirMessageYaya==='function'){voirMessageYaya(id);return;}}catch(err){}
        try{
          const row=(S.documents||[]).find(d=>String(d.id)===id);
          if(row&&row.lien)window.open(String(row.lien),'_blank','noopener');
        }catch(err){}
        return;
      }
      if(btn.classList.contains('yaya-force-mail-edit')){
        try{if(typeof editDocument==='function')editDocument(id);}catch(err){}
        return;
      }
      if(btn.classList.contains('yaya-force-mail-delete')){
        try{if(typeof delDocument==='function')delDocument(id);}catch(err){}
      }
      return;
    }
    if(e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab'))setTimeout(schedule,0);
  },true);

  const root=document.getElementById('pane-chantiers')||document.body;
  if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
  window.addEventListener('hashchange',schedule);
  [0,150,500,1200,2500].forEach(ms=>setTimeout(schedule,ms));
})();
