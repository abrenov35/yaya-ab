(function(){
  'use strict';

  const originalEdit=typeof editDocument==='function'?editDocument:null;
  const originalSave=typeof saveDocumentEdit==='function'?saveDocumentEdit:null;

  function docs(){
    try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){return [];}
  }
  function txt(v){return String(v==null?'':v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function looksLikeBody(v){
    const raw=String(v||'').trim();
    if(!raw)return false;
    if(raw.length>180)return true;
    if((raw.match(/\r?\n/g)||[]).length>=2)return true;
    return /\b(?:bonjour|bonsoir|cordialement|bien à vous|merci|envoy[eé]\s*:|sent\s*:|from\s*:|téléphone|https?:\/\/|www\.)\b/i.test(raw)&&raw.length>70;
  }
  function isMail(d){
    if(!d)return false;
    if(String(d.type||'').toUpperCase()==='MAIL')return true;
    if(String(d.origineMail||d.origine||'').toUpperCase()==='MAIL')return true;
    return !!(d.nomMail||d.expediteur||d.from||d.objetMail||d.mailSubject||d.emailSubject||d.contenuMail||d.corpsMail||d.mailBody||d.emailBody||d.messageBody);
  }
  function mailName(d){return txt(d&&(d.nomMail||d.expediteur||d.from||d.sujet))||'Expéditeur non renseigné';}
  function explicitBody(d){
    if(!d)return '';
    const fields=[d.contenuMail,d.corpsMail,d.contenu,d.body,d.mailBody,d.emailBody,d.messageBody,d.texte];
    for(const v of fields){if(String(v||'').trim())return String(v);}
    if(looksLikeBody(d.description))return String(d.description);
    return '';
  }
  function cachedBody(d){
    if(!d)return '';
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      if(!raw)return '';
      const cache=JSON.parse(raw);
      const old=cache&&Array.isArray(cache.documents)?cache.documents.find(x=>String(x.id)===String(d.id)):null;
      if(!old)return '';
      const body=explicitBody(old);
      if(body)return body;
      if(looksLikeBody(old.titre))return String(old.titre);
    }catch(e){}
    return '';
  }
  function mailBody(d){
    if(!d)return '';
    const body=explicitBody(d);
    if(body)return body;
    if(looksLikeBody(d.titre))return String(d.titre);
    return cachedBody(d);
  }
  function cleanObject(v,sender){
    let out=txt(v).replace(/^(?:objet|subject)\s*[:\-]\s*/i,'').replace(/[#*]+$/,'').trim();
    if(!out||out===sender||looksLikeBody(out)||out.length>180)return '';
    return out;
  }
  function mailObject(d){
    if(!d)return 'Objet non renseigné';
    const sender=mailName(d);
    const direct=[d.objetMail,d.mailSubject,d.emailSubject,d.subject,d.objet,d.messageSubject,d.gmailSubject,d.subjectMail,d.titreMail,d.intitule];
    for(const v of direct){const out=cleanObject(v,sender);if(out)return out;}
    if(!looksLikeBody(d.titre)){
      const titre=cleanObject(d.titre,sender);
      if(titre)return titre;
    }
    const body=mailBody(d);
    if(body){
      const m=String(body).match(/(?:^|\n)\s*(?:objet|subject)\s*:\s*(.+?)(?=\r?\n|$)/i);
      if(m){const out=cleanObject(m[1],sender);if(out)return out;}
    }
    return 'Objet non renseigné';
  }

  window.nomMailYaya=function(d){return mailName(d);};
  window.objetMailYaya=function(d){return mailObject(d);};
  window.contenuMailYaya=function(d){return mailBody(d);};

  function getDoc(id){return docs().find(x=>String(x.id)===String(id))||null;}

  function openMail(id){
    const d=getDoc(id);if(!d)return;
    const lien=String(d.lien||'');
    if(!isMail(d)&&lien.startsWith('http')&&!/mail\.google\.com/i.test(lien)){
      if(typeof voirPiece==='function')voirPiece(lien);
      return;
    }
    const date=String(d.date||'').slice(0,10).split('-').reverse().join('/');
    const body=mailBody(d);
    const contenu=esc(body||'Contenu du mail indisponible dans Yaya.').replace(/\r?\n/g,'<br>');
    const root=document.getElementById('modalRoot');if(!root)return;
    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal message-modal">'
      +'<h5><span>Échange chantier</span><button class="btn2" onclick="closeModal()">Fermer</button></h5>'
      +'<div class="message-meta"><span class="badge b-mail">MAIL</span>'
      +'<span class="badge b-df">'+esc(mailName(d))+'</span>'
      +(date?'<span>'+esc(date)+'</span>':'')+'</div>'
      +'<div style="font-weight:700;margin:8px 0">'+esc(mailObject(d))+'</div>'
      +'<div class="message-extrait">'+contenu+'</div>'
      +'</div></div>';
  }
  window.voirMessageYaya=openMail;

  function openEdit(id){
    const d=getDoc(id);if(!d)return;
    if(!isMail(d)){if(originalEdit)originalEdit(id);return;}
    const root=document.getElementById('modalRoot');if(!root)return;
    let chantiers=[];try{chantiers=(typeof S!=='undefined'&&Array.isArray(S.chantiers))?S.chantiers:[];}catch(e){}
    const chOpts=chantiers.map(c=>'<option value="'+esc(c.id)+'"'+(String(c.id)===String(d.chantierId)?' selected':'')+'>'+esc(c.nom||c.numero||'Chantier')+'</option>').join('');
    let types=['MAIL','Document'];try{if(typeof TYPES_DOC2!=='undefined'&&Array.isArray(TYPES_DOC2))types=TYPES_DOC2;}catch(e){}
    const objet=mailObject(d)==='Objet non renseigné'?'':mailObject(d);
    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">'
      +'<h5>Modifier le mail<button onclick="closeModal()" style="margin-left:8px;padding:6px 16px;border-radius:10px;border:1.5px solid #ddd;background:#fff;color:#555;font-size:13px;font-weight:600;cursor:pointer">Fermer</button></h5>'
      +'<div class="mrow"><select class="msel" id="edDocCh">'+chOpts+'</select></div>'
      +'<div class="mrow"><select class="msel" id="edDocType">'+types.map(t=>'<option'+(String(d.type)===String(t)?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></div>'
      +'<div class="mrow"><input class="msel" id="edDocSujet" value="'+esc(mailName(d))+'" placeholder="Expéditeur"></div>'
      +'<div class="mrow"><input class="msel" id="edDocTitre" value="'+esc(objet)+'" placeholder="Objet du mail"></div>'
      +'<div class="mfoot"><button class="btnp go" onclick="saveDocumentEdit(\''+esc(id)+'\')">Enregistrer</button><button class="btn2" onclick="closeModal()">Annuler</button></div>'
      +'</div></div>';
  }
  window.editDocument=openEdit;

  window.saveDocumentEdit=async function(id){
    const d=getDoc(id);if(!d)return;
    if(!isMail(d)){if(originalSave)return originalSave(id);return;}
    const ch=document.getElementById('edDocCh');
    const type=document.getElementById('edDocType');
    const sender=document.getElementById('edDocSujet');
    const object=document.getElementById('edDocTitre');
    if(!ch||!type||!sender||!object)return;

    const avant={...d};
    const corpsAvant=mailBody(d);
    const ancienTitre=String(d.titre||'');

    d.chantierId=String(ch.value||'');
    d.type=String(type.value||'');
    d.sujet=String(sender.value||'').trim();
    d.nomMail=d.sujet;
    d.objetMail=String(object.value||'').trim();

    if(corpsAvant){
      d.contenuMail=corpsAvant;
      if(looksLikeBody(ancienTitre))d.titre=ancienTitre;
    }
    if(String(d.type||'').toUpperCase()!=='MAIL')d.origineMail='MAIL';

    if(typeof closeModal==='function')closeModal();
    if(typeof render==='function')render();

    let ok=false;try{ok=typeof apiPost==='function'?await apiPost('setDocuments',docs()):false;}catch(e){ok=false;}
    if(ok){
      if(typeof toast==='function')toast('Mail modifié ✓');
      window.dispatchEvent(new Event('yaya:data-refreshed'));
    }else{
      Object.keys(d).forEach(k=>delete d[k]);Object.assign(d,avant);
      if(typeof render==='function')render();
      if(typeof toast==='function')toast('La modification du mail a échoué',true);
    }
  };

  function mailIdFromButton(btn){
    return String(btn&&((btn.getAttribute('data-mail-id'))||(btn.dataset&&btn.dataset.mailId)||'')||'');
  }
  function idFromOnclick(el){
    const m=String(el&&el.getAttribute('onclick')||'').match(/['\"]([^'\"]+)['\"]/);
    return m&&m[1]?String(m[1]):'';
  }

  document.addEventListener('click',function(e){
    const view=e.target&&e.target.closest&&e.target.closest('.yaya-detail-mail-row .yaya-detail-document-view,.message-ligne .yaya-mail-view');
    if(view){const id=mailIdFromButton(view)||idFromOnclick(view);if(id){e.preventDefault();e.stopImmediatePropagation();openMail(id);}return;}
    const edit=e.target&&e.target.closest&&e.target.closest('.yaya-detail-mail-row .yaya-detail-document-edit,.message-ligne .yaya-mail-edit');
    if(edit){const id=mailIdFromButton(edit)||idFromOnclick(edit);if(id){e.preventDefault();e.stopImmediatePropagation();openEdit(id);}}
  },true);

  function fixRows(){
    const list=docs();
    document.querySelectorAll('#pane-chantiers .yaya-detail-mail-row').forEach(row=>{
      const btn=row.querySelector('[data-mail-id]');
      const id=String(btn&&btn.dataset.mailId||'');
      const d=list.find(x=>String(x.id)===id);if(!d)return;
      const sender=row.querySelector('.yaya-mail-sender');
      const subject=row.querySelector('.yaya-mail-subject');
      if(sender){sender.textContent=mailName(d);sender.title=mailName(d);}
      if(subject){subject.textContent=mailObject(d);subject.title=mailObject(d);}
    });
  }

  let pending=false;
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;fixRows();});}
  fixRows();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
