(function(){
  'use strict';

  if(window.__yayaDocumentsMailListRestoreV1)return;
  window.__yayaDocumentsMailListRestoreV1=true;

  const SECTION_ID='yaya-documents-mail-section';
  const STYLE_ID='yaya-documents-mail-list-restore-v1';
  let timer=0;

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function text(v){return String(v==null?'':v).trim();}

  function isMail(d){
    if(!d)return false;
    const up=function(v){return text(v).toUpperCase();};
    if(up(d.type)==='MAIL'||up(d.origine)==='MAIL'||up(d.origineMail)==='MAIL')return true;
    return !!(d.contenuMail||d.corpsMail||d.mailBody||d.emailBody||d.objetMail||d.mailSubject||d.emailSubject||d.expediteur||d.from);
  }

  function sender(d){
    try{if(typeof window.nomMailYaya==='function')return text(window.nomMailYaya(d))||'Expéditeur non renseigné';}catch(e){}
    return text(d&&(d.nomMail||d.expediteur||d.from||d.sender||d.sujet))||'Expéditeur non renseigné';
  }

  function subject(d){
    try{if(typeof window.objetMailYaya==='function')return text(window.objetMailYaya(d))||'Objet non renseigné';}catch(e){}
    const direct=text(d&&(d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet));
    if(direct)return direct;
    const raw=String(d&&d.titre||'');
    const m=raw.match(/^\s*(?:Objet|Subject)\s*:\s*([^\r\n]+)/i);
    if(m&&m[1])return text(m[1]);
    const first=text(raw.split(/\r?\n/)[0]);
    return first||'Objet non renseigné';
  }

  function canonicalId(id){
    id=text(id);
    try{if(typeof window.yayaCanonicalChantierId==='function')return text(window.yayaCanonicalChantierId(id))||id;}catch(e){}
    return id;
  }

  function chantierName(id){
    id=canonicalId(id);
    try{
      if(typeof window.chantierById==='function'){
        const c=window.chantierById(id);
        if(c)return text(c.nom||c.numero)||'—';
      }
    }catch(e){}
    try{
      const list=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))?S.chantiers:[];
      const c=list.find(function(x){return canonicalId(x&&x.id)===id;});
      if(c)return text(c.nom||c.numero)||'—';
    }catch(e){}
    return '—';
  }

  function dateFr(v){
    const s=text(v).slice(0,10);
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?m[3]+'/'+m[2]+'/'+m[1]:(s||'—');
  }

  function mailTime(d,i){
    const t=Date.parse(d&&(
      d.horodatage||d.createdAt||d.dateCreation||d.date||''
    ));
    return Number.isFinite(t)?t:i;
  }

  function mails(){
    try{
      const list=typeof window.yayaMailRows==='function'
        ? window.yayaMailRows()
        : [];
      return list.map(function(d,i){return {d:d,i:i};})
        .filter(function(x){return isMail(x.d);})
        .sort(function(a,b){return mailTime(b.d,b.i)-mailTime(a.d,a.i)||b.i-a.i;})
        .slice(0,10)
        .map(function(x){return x.d;});
    }catch(e){return [];}
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-documents #${SECTION_ID}{margin:10px 0 8px!important}
      #pane-documents #${SECTION_ID} .yaya-doc-mail-label{padding:8px 12px!important;background:#f3eaf8!important;border-bottom:1px solid #dac9e7!important;color:#68418a!important;font-size:11px!important;font-weight:900!important;letter-spacing:.04em!important}
      #pane-documents #${SECTION_ID} .yaya-doc-mail-card{background:#fff!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important;overflow:hidden!important}
      #pane-documents #${SECTION_ID} .yaya-doc-mail-row{display:grid!important;grid-template-columns:minmax(190px,.8fr) minmax(320px,1.8fr) minmax(150px,.7fr) 100px!important;gap:14px!important;align-items:center!important;min-height:60px!important;padding:8px 14px!important;border-bottom:1px solid #d9e2ec!important;cursor:pointer!important;background:#fff!important}
      #pane-documents #${SECTION_ID} .yaya-doc-mail-row:hover{background:#f8f5fb!important}
      #pane-documents #${SECTION_ID} .yaya-doc-mail-sender{min-width:0!important;color:#071b38!important;font-size:12.5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-documents #${SECTION_ID} .yaya-doc-mail-subject{min-width:0!important;color:#52657a!important;font-size:12px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-documents #${SECTION_ID} .yaya-doc-mail-chantier{min-width:0!important;color:#304760!important;font-size:11.5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-documents #${SECTION_ID} .yaya-doc-mail-date{text-align:right!important;color:#52657a!important;font-size:10.5px!important;white-space:nowrap!important}
      @media(max-width:760px){
        #pane-documents #${SECTION_ID} .yaya-doc-mail-row{grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:'sender date' 'subject subject' 'chantier chantier'!important;gap:5px 8px!important;min-height:88px!important;padding:9px 10px!important}
        #pane-documents #${SECTION_ID} .yaya-doc-mail-sender{grid-area:sender!important}
        #pane-documents #${SECTION_ID} .yaya-doc-mail-subject{grid-area:subject!important}
        #pane-documents #${SECTION_ID} .yaya-doc-mail-chantier{grid-area:chantier!important}
        #pane-documents #${SECTION_ID} .yaya-doc-mail-date{grid-area:date!important}
      }
    `;
    document.head.appendChild(style);
  }

  function findInsertPoint(pane){
    const children=Array.from(pane.children||[]);
    const docLabel=children.find(function(el){return /^\s*2\s*-\s*DOCUMENTS\s*$/i.test(text(el.textContent));});
    if(docLabel)return docLabel;
    const card=children.find(function(el){return el.classList&&el.classList.contains('card');});
    if(card)return card;
    const toolbar=children.find(function(el){return el.querySelector&&el.querySelector('button[onclick*="openDocumentModal"]');});
    return toolbar?toolbar.nextSibling:null;
  }

  function renderSection(){
    installStyle();
    const pane=document.getElementById('pane-documents');
    if(!pane)return;

    const rows=mails();
    let section=document.getElementById(SECTION_ID);
    if(!rows.length){if(section)section.remove();return;}

    const signature=JSON.stringify(rows.map(function(d){return [d.id||'',d.date||'',sender(d),subject(d),d.chantierId||''];}));
    if(!section){
      section=document.createElement('div');
      section.id=SECTION_ID;
    }

    if(section.dataset.signature!==signature){
      section.dataset.signature=signature;
      section.innerHTML='<div class="yaya-doc-mail-label">1 - MAIL</div><div class="yaya-doc-mail-card">'
        +rows.map(function(d){
          const id=String(d.id||'');
          return '<div class="yaya-doc-mail-row" data-mail-id="'+esc(id)+'" tabindex="0" role="button">'
            +'<strong class="yaya-doc-mail-sender" title="'+esc(sender(d))+'">'+esc(sender(d))+'</strong>'
            +'<span class="yaya-doc-mail-subject" title="'+esc(subject(d))+'">'+esc(subject(d))+'</span>'
            +'<span class="yaya-doc-mail-chantier" title="'+esc(chantierName(d.chantierId))+'">'+esc(chantierName(d.chantierId))+'</span>'
            +'<span class="yaya-doc-mail-date">'+esc(dateFr(d.date||d.horodatage||d.createdAt))+'</span>'
          +'</div>';
        }).join('')
        +'</div>';
    }

    const before=findInsertPoint(pane);
    if(section.parentNode!==pane||section.nextSibling!==before){
      pane.insertBefore(section,before||null);
    }
  }

  function schedule(delay){
    clearTimeout(timer);
    timer=setTimeout(function(){timer=0;requestAnimationFrame(renderSection);},Math.max(0,Number(delay)||0));
  }

  document.addEventListener('click',function(e){
    const row=e.target&&e.target.closest?e.target.closest('#'+SECTION_ID+' .yaya-doc-mail-row'):null;
    if(!row)return;
    e.preventDefault();
    const id=String(row.dataset.mailId||'');
    if(id&&typeof window.voirMessageYaya==='function')window.voirMessageYaya(id);
  },false);

  document.addEventListener('keydown',function(e){
    const row=e.target&&e.target.closest?e.target.closest('#'+SECTION_ID+' .yaya-doc-mail-row'):null;
    if(!row||(e.key!=='Enter'&&e.key!==' '))return;
    e.preventDefault();
    const id=String(row.dataset.mailId||'');
    if(id&&typeof window.voirMessageYaya==='function')window.voirMessageYaya(id);
  },false);

  function install(){
    const pane=document.getElementById('pane-documents');
    if(!pane){setTimeout(install,150);return;}
    new MutationObserver(function(){schedule(20);}).observe(pane,{childList:true,subtree:false});
    window.addEventListener('yaya:data-refreshed',function(){schedule(30);});
    window.addEventListener('hashchange',function(){schedule(60);});
    [0,120,400,1000].forEach(function(ms){setTimeout(function(){schedule(0);},ms);});
  }

  install();
})();
