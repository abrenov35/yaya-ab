(function(){
  'use strict';
  if(window.__yayaMailSeparateStorageV2)return;
  window.__yayaMailSeparateStorageV2=true;

  const previousEdit=window.editDocument;
  const previousSave=window.saveDocumentEdit;
  const previousDelete=window.delDocument;
  const previousApiPost=window.apiPost;

  function esc(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function isMailView(row){
    if(!row)return false;
    const type=String(row.type||'').trim().toUpperCase();
    const id=String(row.id||'').trim().toUpperCase();
    return type==='MAIL'||id.indexOf('MAIL_')===0||String(row.origineMail||row.origine||'').trim().toUpperCase()==='MAIL';
  }

  function raw(id){
    try{
      if(typeof window.yayaMailRawById==='function')return window.yayaMailRawById(id);
    }catch(e){}
    return null;
  }

  function mapped(id){
    try{
      if(typeof window.yayaMailById==='function')return window.yayaMailById(id);
    }catch(e){}
    return null;
  }

  function mailViews(){
    try{return typeof window.yayaMailRows==='function'?window.yayaMailRows():[];}catch(e){return [];}
  }

  function rebuildDocumentsView(){
    // Architecture actuelle : MAILS et documents sont deux stockages distincts.
    // On purge seulement d'éventuelles anciennes lignes MAIL de S.documents.
    try{
      if(typeof S==='undefined'||!S)return false;
      const before=Array.isArray(S.documents)?S.documents:[];
      const docs=before.filter(function(d){return !isMailView(d);});
      const changed=docs.length!==before.length;
      S.documents=docs;
      return changed;
    }catch(e){return false;}
  }

  // Sécurité centrale : même si un ancien module appelle encore setDocuments,
  // aucune ligne MAIL ne peut repartir dans la feuille DOCUMENTS.
  if(typeof previousApiPost==='function'&&!previousApiPost.__yayaMailStorageGuardV2){
    const guarded=function(action,data){
      if(String(action)==='setDocuments'&&Array.isArray(data)){
        data=data.filter(function(row){return !isMailView(row);});
      }
      return previousApiPost.call(this,action,data);
    };
    guarded.__yayaMailStorageGuardV2=true;
    guarded.__yayaWrappedApiPost=previousApiPost;
    window.apiPost=guarded;
  }

  function syncCache(){
    try{
      const value=localStorage.getItem('YAYA_CACHE_DATA_V2');
      if(!value)return;
      const cache=JSON.parse(value);
      if(!cache||typeof cache!=='object')return;
      if(typeof S!=='undefined'&&S&&Array.isArray(S.MAILS)){
        cache.MAILS=S.MAILS.map(function(x){return Object.assign({},x);});
      }
      if(typeof S!=='undefined'&&S&&Array.isArray(S.documents)){
        cache.documents=S.documents.filter(function(x){return !isMailView(x);}).map(function(x){return Object.assign({},x);});
      }
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cache));
    }catch(e){}
  }

  function refresh(){
    rebuildDocumentsView();
    try{if(typeof render==='function')render();}catch(e){}
  }

  window.voirMessageYaya=function(id){
    const d=mapped(id);
    if(!d)return;
    const date=String(d.date||'').slice(0,10).split('-').reverse().join('/');
    const contenu=esc(d.contenuMail||'Contenu du mail indisponible dans Yaya.').replace(/\r?\n/g,'<br>');
    const root=document.getElementById('modalRoot');if(!root)return;
    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal message-modal">'
      +'<h5><span>Échange chantier</span><button class="btn2" onclick="closeModal()">Fermer</button></h5>'
      +'<div class="message-meta"><span class="badge b-mail">MAIL</span>'
      +'<span class="badge b-df">'+esc(d.expediteur||d.nomMail||'Expéditeur non renseigné')+'</span>'
      +(date?'<span>'+esc(date)+'</span>':'')+'</div>'
      +'<div style="font-weight:700;margin:8px 0">'+esc(d.objet||d.objetMail||'Objet non renseigné')+'</div>'
      +'<div class="message-extrait">'+contenu+'</div>'
      +'</div></div>';
  };

  window.editDocument=function(id){
    const d=raw(id);
    if(!d){
      if(typeof previousEdit==='function')return previousEdit.apply(this,arguments);
      return;
    }
    const root=document.getElementById('modalRoot');if(!root)return;
    let chantiers=[];
    try{chantiers=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))?S.chantiers:[];}catch(e){}
    const options=chantiers.map(function(c){
      return '<option value="'+esc(c.id)+'"'+(String(c.id)===String(d.chantierId)?' selected':'')+'>'+esc(c.nom||c.numero||'Chantier')+'</option>';
    }).join('');
    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">'
      +'<h5>Modifier le mail</h5>'
      +'<div class="mrow"><select class="msel" id="edMailCh">'+options+'</select></div>'
      +'<div class="mrow"><input class="msel" id="edMailSender" value="'+esc(d.expediteur||'')+'" placeholder="Expéditeur"></div>'
      +'<div class="mrow"><input class="msel" id="edMailObject" value="'+esc(d.objet||'')+'" placeholder="Objet du mail"></div>'
      +'<div class="mfoot"><button class="btnp go" onclick="saveDocumentEdit(\''+esc(id)+'\')">Enregistrer</button><button class="btn2" onclick="closeModal()">Annuler</button></div>'
      +'</div></div>';
  };

  window.__yayaSaveMailSubject=async function(id){
    const d=raw(id);
    if(!d)return false;
    const input=document.getElementById('edDocTitre')||document.getElementById('edMailObject');
    if(!input)return false;
    const object=String(input.value||'').trim();
    if(!object){
      try{if(typeof toast==='function')toast('Indique un objet',true);}catch(e){}
      input.focus();
      return false;
    }
    const before=String(d.objet||'');
    d.objet=object;
    syncCache();
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    refresh();
    let ok=false;
    try{
      ok=typeof window.apiPost==='function'
        ? await window.apiPost('updateMail',{id:String(d.id),objet:object})
        : false;
    }catch(e){ok=false;}
    if(ok){
      syncCache();refresh();
      try{if(typeof toast==='function')toast('Objet du mail enregistré ✓');}catch(e){}
      return true;
    }
    d.objet=before;
    syncCache();refresh();
    try{if(typeof toast==='function')toast('Objet du mail non enregistré',true);}catch(e){}
    return false;
  };

  window.delDocument=async function(id){
    const d=raw(id);
    if(!d){
      if(typeof previousDelete==='function')return previousDelete.apply(this,arguments);
      return false;
    }
    let index=-1;
    try{
      index=(typeof S!=='undefined'&&S&&Array.isArray(S.MAILS))
        ? S.MAILS.findIndex(function(row){return String(row&&row.id||'')===String(id);})
        : -1;
    }catch(e){}
    const backup=index>=0?Object.assign({},S.MAILS[index]):Object.assign({},d);
    if(index>=0)S.MAILS.splice(index,1);
    syncCache();
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    refresh();

    let ok=false;
    try{
      ok=typeof window.apiPost==='function'
        ? await window.apiPost('deleteMail',{id:String(id)})
        : false;
    }catch(e){ok=false;}
    if(ok){
      syncCache();refresh();
      try{if(typeof toast==='function')toast('Mail supprimé ✓');}catch(e){}
      return true;
    }

    try{
      if(typeof S!=='undefined'&&S){
        if(!Array.isArray(S.MAILS))S.MAILS=[];
        if(!S.MAILS.some(function(row){return String(row&&row.id||'')===String(id);}))S.MAILS.push(backup);
      }
    }catch(e){}
    syncCache();refresh();
    try{if(typeof toast==='function')toast('Suppression du mail non enregistrée',true);}catch(e){}
    return false;
  };
  try{delDocument=window.delDocument;}catch(e){}

  window.saveDocumentEdit=async function(id){
    const d=raw(id);
    if(!d){
      if(typeof previousSave==='function')return previousSave.apply(this,arguments);
      return;
    }
    const ch=document.getElementById('edMailCh');
    const sender=document.getElementById('edMailSender');
    const object=document.getElementById('edMailObject');
    if(!ch||!sender||!object)return;

    const patch={
      id:String(d.id),
      chantierId:String(ch.value||''),
      expediteur:String(sender.value||'').trim(),
      objet:String(object.value||'').trim()
    };
    if(!patch.objet){
      try{if(typeof toast==='function')toast('Indique un objet',true);}catch(e){}
      object.focus();
      return;
    }

    const before={chantierId:d.chantierId,expediteur:d.expediteur,objet:d.objet};
    d.chantierId=patch.chantierId;
    d.expediteur=patch.expediteur;
    d.objet=patch.objet;
    syncCache();
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    refresh();

    let ok=false;
    try{ok=typeof window.apiPost==='function'?await window.apiPost('updateMail',patch):false;}catch(e){ok=false;}
    if(ok){
      syncCache();
      refresh();
      try{if(typeof toast==='function')toast('Mail modifié ✓');}catch(e){}
      return true;
    }

    d.chantierId=before.chantierId;
    d.expediteur=before.expediteur;
    d.objet=before.objet;
    syncCache();
    refresh();
    try{if(typeof toast==='function')toast('La modification du mail a échoué',true);}catch(e){}
    return false;
  };

  let refreshing=false;
  window.addEventListener('yaya:data-refreshed',function(){
    if(refreshing)return;
    refreshing=true;
    try{rebuildDocumentsView();syncCache();}finally{refreshing=false;}
    try{if(typeof render==='function'&&!document.querySelector('#modalRoot .overlay'))requestAnimationFrame(function(){render();});}catch(e){}
  });

  async function ensureMailsLoaded(){
    try{
      if(typeof S==='undefined'||!S)return;
      if(typeof API!=='string'||!API)return;
      const sep=API.indexOf('?')>=0?'&':'?';
      const r=await fetch(API+sep+'tabs=MAILS&_mailstore='+Date.now(),{cache:'no-store'});
      const j=await r.json();
      if(j&&j.ok&&j.data&&Array.isArray(j.data.MAILS)){
        S.MAILS=j.data.MAILS;
        rebuildDocumentsView();
        syncCache();
        refresh();
      }
    }catch(e){console.warn('Yaya MAILS chargement différé :',e);}
  }

  rebuildDocumentsView();
  syncCache();
  setTimeout(ensureMailsLoaded,0);
})();
