(function(){
  'use strict';
  if(window.__yayaMailUnderDocumentsV2)return;
  window.__yayaMailUnderDocumentsV2=true;

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

  const STYLE_ID='yaya-mails-under-documents-v2';
  let style=document.getElementById(STYLE_ID);
  if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
  style.textContent=`
    #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-force-mails-pane[data-empty="0"]{
      display:block!important;
    }
    #pane-chantiers .yaya-detail-documents-pane[data-empty="0"]::before{
      content:'1 - DOCUMENTS'!important;
    }
    #pane-chantiers .yaya-force-mails-pane[data-empty="0"]::before{
      content:'2 - MAIL'!important;
      display:block!important;
      margin:8px 0 0!important;
      padding:8px 10px!important;
      background:#f3eaf8!important;
      border-bottom:1px solid #dac9e7!important;
      color:#68418a!important;
      font-size:11px!important;
      font-weight:900!important;
      letter-spacing:.04em!important;
    }
    #pane-chantiers .yaya-force-mails-pane .yaya-detail-mail-row{
      grid-template-columns:minmax(170px,.85fr) minmax(260px,1.8fr) 105px!important;
    }
    @media(max-width:640px){
      #pane-chantiers .yaya-force-mails-pane .yaya-detail-mail-row{
        grid-template-columns:minmax(120px,1fr) minmax(150px,1.35fr) 82px!important;
        gap:7px!important;
      }
    }
  `;

  function canon(value){
    const id=String(value==null?'':value).trim();
    return ALIASES[id]||id;
  }
  function normalise(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
  }
  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function isMail(row){
    if(!row)return false;
    const upper=function(v){return String(v||'').trim().toUpperCase();};
    if(upper(row.type)==='MAIL'||upper(row.origineMail)==='MAIL'||upper(row.origine)==='MAIL')return true;
    if(row.contenuMail||row.corpsMail||row.bodyMail||row.mailBody||row.expediteur||row.from||row.objetMail||row.mailSubject||row.emailSubject)return true;
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
    return String(row.nomMail||row.expediteur||row.from||row.sender||row.sujet||'Expéditeur non renseigné').replace(/<.*$/,'').trim();
  }
  function subject(row){
    try{if(typeof objetMailYaya==='function')return String(objetMailYaya(row)||'').trim();}catch(e){}
    return String(row.objetMail||row.mailSubject||row.emailSubject||row.subject||row.objet||row.sujet||'Objet non renseigné').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  }
  function dateFr(value){
    const s=String(value||'').slice(0,10);
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?m[3]+'/'+m[2]+'/'+m[1]:(s||'—');
  }

  function syncEmptyState(card,mailCount){
    const docPane=card.querySelector(':scope > .yaya-detail-documents-pane');
    const empty=card.querySelector(':scope > .yaya-detail-empty-pane[data-section="documents"]');
    if(!empty)return;
    const hasDocs=!!(docPane&&docPane.querySelector('.yaya-detail-document-row'));
    const hasAnything=hasDocs||mailCount>0;
    empty.dataset.empty=hasAnything?'0':'1';
    if(!hasAnything)empty.textContent='Aucun document ni mail';
  }

  function ensureCard(card){
    if(!card)return;
    const cid=chantierIdFromCard(card);
    if(!cid)return;
    const rows=mailRowsFor(cid);
    let pane=card.querySelector(':scope > .yaya-force-mails-pane');

    if(!rows.length){
      if(pane)pane.remove();
      syncEmptyState(card,0);
      return;
    }

    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-section-node yaya-detail-mails-pane yaya-force-mails-pane';
      pane.dataset.section='documents';
    }

    const docPane=card.querySelector(':scope > .yaya-detail-documents-pane');
    const docAction=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="documents"]');
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(docPane){
      if(pane.parentNode!==card||pane.previousElementSibling!==docPane)docPane.insertAdjacentElement('afterend',pane);
    }else if(docAction){
      if(pane.parentNode!==card)docAction.insertAdjacentElement('afterend',pane);
    }else if(tabs){
      if(pane.parentNode!==card)tabs.insertAdjacentElement('afterend',pane);
    }else if(pane.parentNode!==card){
      card.appendChild(pane);
    }

    pane.dataset.empty='0';
    pane.dataset.section='documents';
    const active=String(card.dataset.yayaDetailSection||'');
    pane.style.setProperty('display',active==='documents'||active==='mail'?'block':'none','important');

    const signature=JSON.stringify(rows.map(r=>[r.id||'',r.date||'',sender(r),subject(r)]));
    if(pane.dataset.signature!==signature){
      pane.dataset.signature=signature;
      pane.innerHTML=rows.map(function(row){
        const id=String(row.id||'');
        return '<div class="yaya-detail-document-row yaya-detail-mail-row" data-mail-id="'+esc(id)+'" tabindex="0" role="button">'
          +'<strong class="yaya-mail-sender" title="'+esc(sender(row))+'">'+esc(sender(row))+'</strong>'
          +'<span class="yaya-mail-subject" title="'+esc(subject(row))+'">'+esc(subject(row))+'</span>'
          +'<span class="yaya-detail-charge-cost">'+esc(dateFr(row.date))+'</span>'
        +'</div>';
      }).join('');
    }
    syncEmptyState(card,rows.length);
  }

  function refreshOpenCards(){
    const root=document.getElementById('pane-chantiers');
    if(!root)return;
    root.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(ensureCard);
  }

  let timer=0;
  function schedule(delay){
    clearTimeout(timer);
    timer=setTimeout(function(){
      timer=0;
      requestAnimationFrame(refreshOpenCards);
    },Math.max(0,Number(delay)||0));
  }

  function installRenderHook(){
    if(typeof window.render!=='function'){setTimeout(installRenderHook,160);return;}
    if(window.render.__yayaMailUnderDocumentsV2)return;
    const original=window.render;
    const wrapped=function(){
      const result=original.apply(this,arguments);
      schedule(40);
      return result;
    };
    wrapped.__yayaMailUnderDocumentsV2=true;
    wrapped.__yayaOriginalRender=original;
    window.render=wrapped;
  }

  document.addEventListener('click',function(e){
    const target=e.target&&e.target.closest?e.target.closest('.yaya-detail-section-tab,[onclick*="toggleChantier("]'):null;
    if(!target)return;
    schedule(20);
    setTimeout(function(){schedule(0);},140);
  },false);

  window.addEventListener('yaya:data-refreshed',function(){schedule(30);});
  window.addEventListener('hashchange',function(){schedule(80);});
  installRenderHook();
  [0,120,400,1000].forEach(function(ms){setTimeout(function(){schedule(0);},ms);});
})();
