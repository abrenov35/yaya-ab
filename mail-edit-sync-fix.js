(function(){
  'use strict';

  const originalEdit=typeof window.editDocument==='function'?window.editDocument:null;
  const originalSave=typeof window.saveDocumentEdit==='function'?window.saveDocumentEdit:null;

  function text(v){
    return String(v==null?'':v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  }

  function html(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function looksLikeBody(v){
    const raw=String(v||'').trim();
    if(!raw)return false;
    if(raw.length>180)return true;
    if((raw.match(/\r?\n/g)||[]).length>=2)return true;
    if(/\b(?:bonjour|bonsoir|cordialement|bien à vous|merci|envoy[eé]\s*:|sent\s*:|from\s*:|téléphone|https?:\/\/|www\.)\b/i.test(raw)&&raw.length>70)return true;
    return false;
  }

  function isMail(d){
    if(!d)return false;
    if(String(d.type||'').toUpperCase()==='MAIL')return true;
    if(String(d.origineMail||d.origine||'').toUpperCase()==='MAIL')return true;
    return !!(d.nomMail||d.expediteur||d.from||d.objetMail||d.mailSubject||d.emailSubject||d.contenuMail||d.corpsMail||d.mailBody||d.emailBody||d.messageBody);
  }

  function mailName(d){
    return text(d&&(d.nomMail||d.expediteur||d.from||d.sujet))||'Expéditeur non renseigné';
  }

  function mailBody(d){
    if(!d)return '';
    const directs=[d.contenuMail,d.corpsMail,d.contenu,d.body,d.mailBody,d.emailBody,d.messageBody,d.texte];
    for(const v of directs){
      if(String(v||'').trim())return String(v);
    }
    if(looksLikeBody(d.description))return String(d.description);
    if(looksLikeBody(d.titre))return String(d.titre);
    return '';
  }

  function cleanObject(v,sender){
    let out=text(v).replace(/^(?:objet|subject)\s*[:\-]\s*/i,'').replace(/[#*]+$/,'').trim();
    if(!out||out===sender||looksLikeBody(out)||out.length>180)return '';
    return out;
  }

  function mailObject(d){
    if(!d)return 'Objet non renseigné';
    const sender=mailName(d);
    const directs=[d.objetMail,d.mailSubject,d.emailSubject,d.subject,d.objet,d.messageSubject,d.gmailSubject,d.subjectMail,d.titreMail,d.intitule];
    for(const v of directs){
      const out=cleanObject(v,sender);
      if(out)return out;
    }

    const body=mailBody(d);
    if(body){
      const m=String(body).match(/(?:^|\n)\s*(?:objet|subject)\s*:\s*(.+?)(?=\r?\n|$)/i);
      if(m){
        const out=cleanObject(m[1],sender);
        if(out)return out;
      }
    }

    const titre=cleanObject(d.titre,sender);
    if(titre)return titre;
    return 'Objet non renseigné';
  }

  window.voirMessageYaya=function(id){
    const d=(window.S&&Array.isArray(S.documents))?S.documents.find(x=>String(x.id)===String(id)):null;
    if(!d)return;

    const lien=String(d.lien||'');
    if(!isMail(d)&&lien.startsWith('http')&&!/mail\.google\.com/i.test(lien)){
      if(typeof window.voirPiece==='function')window.voirPiece(lien);
      return;
    }

    const date=String(d.date||'').slice(0,10).split('-').reverse().join('/');
    const body=mailBody(d);
    const contenu=html(body||'Aucun contenu disponible.').replace(/\r?\n/g,'<br>');
    const root=document.getElementById('modalRoot');
    if(!root)return;

    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal message-modal">'
      +'<h5><span>Échange chantier</span><button class="btn2" onclick="closeModal()">Fermer</button></h5>'
      +'<div class="message-meta"><span class="badge b-mail">MAIL</span>'
      +'<span class="badge b-df">'+html(mailName(d))+'</span>'
      +(date?'<span>'+html(date)+'</span>':'')+'</div>'
      +'<div style="font-weight:700;margin:8px 0">'+html(mailObject(d))+'</div>'
      +'<div class="message-extrait">'+contenu+'</div>'
      +'</div></div>';
  };

  window.editDocument=function(id){
    const d=(window.S&&Array.isArray(S.documents))?S.documents.find(x=>String(x.id)===String(id)):null;
    if(!d)return;
    if(!isMail(d)){
      if(originalEdit)return originalEdit(id);
      return;
    }

    const root=document.getElementById('modalRoot');
    if(!root)return;
    const chantiers=Array.isArray(S.chantiers)?S.chantiers:[];
    const chOpts=chantiers.map(c=>'<option value="'+html(c.id)+'"'+(String(c.id)===String(d.chantierId)?' selected':'')+'>'+html(c.nom)+'</option>').join('');
    const types=(typeof TYPES_DOC2!=='undefined'&&Array.isArray(TYPES_DOC2))?TYPES_DOC2:['MAIL','Document'];

    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">'
      +'<h5>Modifier le mail<button onclick="closeModal()" style="margin-left:8px;padding:6px 16px;border-radius:10px;border:1.5px solid #ddd;background:#fff;color:#555;font-size:13px;font-weight:600;cursor:pointer">Fermer</button></h5>'
      +'<div class="mrow"><select class="msel" id="edDocCh">'+chOpts+'</select></div>'
      +'<div class="mrow"><select class="msel" id="edDocType">'+types.map(t=>'<option'+(String(d.type)===String(t)?' selected':'')+'>'+html(t)+'</option>').join('')+'</select></div>'
      +'<div class="mrow"><input class="msel" id="edDocSujet" value="'+html(mailName(d))+'" placeholder="Expéditeur"></div>'
      +'<div class="mrow"><input class="msel" id="edDocTitre" value="'+html(mailObject(d)==='Objet non renseigné'?'':html(mailObject(d))+'" placeholder="Objet du mail"></div>'
      +'<div class="mfoot"><button class="btnp go" onclick="saveDocumentEdit(\''+html(id)+'\')">Enregistrer</button><button class="btn2" onclick="closeModal()">Annuler</button></div>'
      +'</div></div>';
  };

  window.saveDocumentEdit=async function(id){
    const d=(window.S&&Array.isArray(S.documents))?S.documents.find(x=>String(x.id)===String(id)):null;
    if(!d)return;
    if(!isMail(d)){
      if(originalSave)return originalSave(id);
      return;
    }

    const ch=document.getElementById('edDocCh');
    const type=document.getElementById('edDocType');
    const sender=document.getElementById('edDocSujet');
    const object=document.getElementById('edDocTitre');
    if(!ch||!type||!sender||!object)return;

    const nouveauCh=String(ch.value||'');
    const nouveauType=String(type.value||'');
    const nouveauNom=String(sender.value||'').trim();
    const nouvelObjet=String(object.value||'').trim();
    const ancienNom=mailName(d)==='Expéditeur non renseigné'?'':mailName(d);
    const ancienObjet=mailObject(d)==='Objet non renseigné'?'':mailObject(d);

    if(String(d.chantierId||'')===nouveauCh&&String(d.type||'')===nouveauType&&ancienNom===nouveauNom&&ancienObjet===nouvelObjet){
      if(typeof window.toast==='function')toast('Aucune modification à enregistrer');
      return;
    }

    const avant={...d};
    const corpsAvant=mailBody(d);
    const ancienType=String(d.type||'');

    d.chantierId=nouveauCh;
    d.type=nouveauType;
    d.sujet=nouveauNom;
    d.nomMail=nouveauNom;
    d.objetMail=nouvelObjet;
    d.titre=nouvelObjet;

    if(corpsAvant)d.contenuMail=corpsAvant;
    if(nouveauType.toUpperCase()!=='MAIL')d.origineMail='MAIL';
    if(ancienType.toUpperCase()==='MAIL'&&nouveauType.toUpperCase()!=='MAIL')d.origineMail='MAIL';

    if(typeof window.closeModal==='function')closeModal();
    if(typeof window.render==='function')render();

    const ok=typeof window.apiPost==='function'?await apiPost('setDocuments',S.documents):false;
    if(ok){
      if(typeof window.toast==='function')toast('Mail modifié ✓');
      window.dispatchEvent(new Event('yaya:data-refreshed'));
    }else{
      Object.keys(d).forEach(k=>delete d[k]);
      Object.assign(d,avant);
      if(typeof window.render==='function')render();
      if(typeof window.toast==='function')toast('La modification du mail a échoué',true);
    }
  };

  function fixRows(){
    if(!window.S||!Array.isArray(S.documents))return;
    document.querySelectorAll('#pane-chantiers .yaya-detail-mail-row').forEach(row=>{
      const btn=row.querySelector('[data-mail-id]');
      const id=String(btn&&btn.dataset.mailId||'');
      if(!id)return;
      const d=S.documents.find(x=>String(x.id)===id);
      if(!d)return;
      const sender=row.querySelector('.yaya-mail-sender');
      const subject=row.querySelector('.yaya-mail-subject');
      if(sender&&sender.textContent!==mailName(d))sender.textContent=mailName(d);
      if(subject&&subject.textContent!==mailObject(d))subject.textContent=mailObject(d);
    });
  }

  let pending=false;
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(()=>{pending=false;fixRows();});
  }

  fixRows();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
