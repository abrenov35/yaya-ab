(function(){
  'use strict';
  if(window.__yayaMailSeparateEditV1)return;
  window.__yayaMailSeparateEditV1=true;

  const previousEdit=window.editDocument;
  const previousSave=window.saveDocumentEdit;

  function esc(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
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
  function syncCache(){
    try{
      const value=localStorage.getItem('YAYA_CACHE_DATA_V2');
      if(!value)return;
      const cache=JSON.parse(value);
      if(!cache||typeof cache!=='object')return;
      if(typeof S!=='undefined'&&S&&Array.isArray(S.MAILS)){
        cache.MAILS=S.MAILS.map(function(x){return Object.assign({},x);});
      }
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cache));
    }catch(e){}
  }
  function refresh(){
    try{if(typeof render==='function')render();}catch(e){}
    try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['MAILS'],source:'mail-storage'}}));}catch(e){}
  }

  window.voirMessageYaya=function(id){
    const d=mapped(id);
    if(!d){
      if(typeof previousEdit==='function'&&typeof window.__yayaLegacyViewMail==='function')return window.__yayaLegacyViewMail(id);
      return;
    }
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
    if(!patch.objet){try{if(typeof toast==='function')toast('Indique un objet',true);}catch(e){};object.focus();return;}

    const before={
      chantierId:d.chantierId,
      expediteur:d.expediteur,
      objet:d.objet
    };
    d.chantierId=patch.chantierId;
    d.expediteur=patch.expediteur;
    d.objet=patch.objet;
    syncCache();
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    refresh();

    let ok=false;
    try{ok=typeof apiPost==='function'?await apiPost('updateMail',patch):false;}catch(e){ok=false;}
    if(ok){
      syncCache();
      try{if(typeof toast==='function')toast('Mail modifié ✓');}catch(e){}
      refresh();
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

  document.addEventListener('click',function(e){
    const edit=e.target&&e.target.closest&&e.target.closest('[data-mail-id].yaya-detail-document-edit,.yaya-detail-mail-row .yaya-detail-document-edit,.message-ligne .yaya-mail-edit');
    if(!edit)return;
    const id=String(edit.getAttribute('data-mail-id')||(edit.closest('[data-mail-id]')&&edit.closest('[data-mail-id]').getAttribute('data-mail-id'))||'');
    if(!id||!raw(id))return;
    e.preventDefault();e.stopImmediatePropagation();
    window.editDocument(id);
  },true);
})();