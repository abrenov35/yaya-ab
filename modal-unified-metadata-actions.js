(function(){
  'use strict';

  if(window.__yayaUnifiedModalMetadataV1)return;
  window.__yayaUnifiedModalMetadataV1=true;

  const WRAP_FLAG='__yayaUnifiedMetaWrapped';
  const STYLE_ID='yaya-unified-modal-metadata-v1';
  const DELETED_INITIAL='__YAYA_DEVIS_INITIAL_SUPPRIME__';
  const TAB_ACTION={achats:'setAchats',documents:'setDocuments',avenants:'setAvenants',chantiers:'setChantiers'};
  let current={kind:'',id:'',url:''};
  let decorateTimer=0;
  let saving=false;

  function text(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function toastSafe(msg,err){try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}}
  function stateArray(tab){try{return (typeof S!=='undefined'&&S&&Array.isArray(S[tab]))?S[tab]:[];}catch(e){return [];}}

  function isMail(d){
    if(!d)return false;
    const up=function(v){return text(v).toUpperCase();};
    if(up(d.type)==='MAIL'||up(d.origine)==='MAIL'||up(d.origineMail)==='MAIL')return true;
    return !!(d.contenuMail||d.corpsMail||d.mailBody||d.emailBody||d.objetMail||d.mailSubject||d.emailSubject||d.expediteur||d.from);
  }

  function linkKey(v){
    const raw=text(v);if(!raw)return '';
    const drive=raw.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);if(drive&&drive[1])return 'drive:'+drive[1];
    try{
      const u=new URL(raw,location.href);
      u.hash='';
      ['raw','dl','usp'].forEach(function(k){u.searchParams.delete(k);});
      return u.origin+u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():'');
    }catch(e){return raw.split('#')[0];}
  }

  function docUrls(d){
    if(!d)return [];
    return [d.lien,d.lienPieceJointe,d.pieceJointeUrl,d.attachmentUrl,d.fichierUrl,d.fileUrl,d.oneDriveWebUrl,d.dropboxUrl].map(linkKey).filter(Boolean);
  }

  function findByUrl(url){
    const key=linkKey(url);if(!key)return {kind:'',id:'',url:text(url)};
    let row=stateArray('achats').find(function(a){return linkKey(a&&a.lien)===key;});
    if(row)return {kind:'achat',id:text(row.id),url:text(url)};

    row=stateArray('documents').find(function(d){return docUrls(d).indexOf(key)>=0;});
    if(row)return {kind:isMail(row)?'mail':'document',id:text(row.id),url:text(url)};

    row=stateArray('avenants').find(function(v){return linkKey(v&&v.lien)===key;});
    if(row)return {kind:'devis-extra',id:text(row.id),url:text(url)};

    row=stateArray('chantiers').find(function(c){return /^https?:\/\//i.test(text(c&&c.notes))&&linkKey(c.notes)===key;});
    if(row)return {kind:'devis-main',id:text(row.id),url:text(url)};

    return {kind:'',id:'',url:text(url)};
  }

  function byId(kind,id){
    id=text(id);if(!id)return null;
    if(kind==='achat')return stateArray('achats').find(function(x){return text(x&&x.id)===id;})||null;
    if(kind==='document'||kind==='mail')return stateArray('documents').find(function(x){return text(x&&x.id)===id;})||null;
    if(kind==='devis-extra')return stateArray('avenants').find(function(x){return text(x&&x.id)===id;})||null;
    if(kind==='devis-main')return stateArray('chantiers').find(function(x){return text(x&&x.id)===id;})||null;
    return null;
  }

  function mailTitle(d){
    try{if(typeof window.objetMailYaya==='function')return text(window.objetMailYaya(d));}catch(e){}
    const direct=text(d&&(d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet));
    if(direct)return direct;
    const m=String(d&&d.titre||'').match(/^\s*(?:Objet|Subject)\s*:\s*([^\r\n]+)/i);
    if(m&&m[1])return text(m[1]);
    return 'Objet non renseigné';
  }

  function mailBody(d){
    try{if(typeof window.contenuMailYaya==='function')return String(window.contenuMailYaya(d)||'').trim();}catch(e){}
    const direct=String(d&&(d.contenuMail||d.corpsMail||d.mailBody||d.emailBody)||'').trim();
    if(direct)return direct;
    const raw=String(d&&d.titre||'');
    const m=raw.match(/^\s*(?:Objet|Subject)\s*:[^\r\n]*(?:\r?\n){1,2}([\s\S]*)$/i);
    return m&&m[1]?m[1].trim():raw.trim();
  }

  function packedMailTitle(title,body){
    title=text(title)||'Objet non renseigné';
    body=String(body||'').trim();
    return body?'Objet : '+title+'\n\n'+body:title;
  }

  function initialMeta(c){
    const raw=text(c&&c.notes);
    let title='Devis 1',description='';
    try{
      const u=new URL(raw);
      const p=new URLSearchParams((u.hash||'').replace(/^#/,''));
      title=text(p.get('yaya_title'))||title;
      description=String(p.get('yaya_desc')||'').trim();
    }catch(e){}
    return {title:title,description:description};
  }

  function withInitialMeta(raw,title,description){
    raw=text(raw);if(!/^https?:\/\//i.test(raw))return raw;
    try{
      const u=new URL(raw);
      const p=new URLSearchParams((u.hash||'').replace(/^#/,''));
      if(text(title))p.set('yaya_title',text(title));else p.delete('yaya_title');
      if(text(description))p.set('yaya_desc',text(description));else p.delete('yaya_desc');
      const h=p.toString();u.hash=h?h:'';
      return u.toString();
    }catch(e){return raw;}
  }

  function values(ctx){
    const d=byId(ctx.kind,ctx.id);if(!d)return {title:'',description:''};
    if(ctx.kind==='achat')return {title:text(d.fournisseur)||text(d.typeDoc)||'Achat',description:text(d.designation)};
    if(ctx.kind==='document')return {title:text(d.titre)||text(d.pieceNom)||'Document',description:text(d.sujet)};
    if(ctx.kind==='mail')return {title:mailTitle(d),description:mailBody(d)};
    if(ctx.kind==='devis-extra'){
      const parts=String(d.libelle||'').split(/\r?\n/);
      return {title:text(parts.shift())||'Devis',description:text(parts.join('\n'))};
    }
    if(ctx.kind==='devis-main')return initialMeta(d);
    return {title:'',description:''};
  }

  function cacheTab(tab,list){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      cached[tab]=list;
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
    }catch(e){}
  }

  async function fetchTab(tab){
    let api='';try{api=typeof API==='string'?API:'';}catch(e){}
    if(!api)return null;
    const sep=api.indexOf('?')>=0?'&':'?';
    try{
      const r=await fetch(api+sep+'tabs='+encodeURIComponent(tab)+'&_yaya_edit='+Date.now(),{method:'GET',cache:'no-store'});
      const j=await r.json();
      const rows=j&&j.ok&&j.data&&Array.isArray(j.data[tab])?j.data[tab]:null;
      return rows;
    }catch(e){return null;}
  }

  async function postList(tab,list){
    const action=TAB_ACTION[tab];if(!action)throw new Error('Rubrique inconnue');
    let ok=false;
    if(typeof window.apiPost==='function'){
      try{ok=!!(await window.apiPost(action,list));}catch(e){ok=false;}
    }else if(typeof apiPost==='function'){
      try{ok=!!(await apiPost(action,list));}catch(e){ok=false;}
    }
    if(!ok){
      let api='';try{api=typeof API==='string'?API:'';}catch(e){}
      if(!api)throw new Error('API Yaya indisponible');
      const r=await fetch(api,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,data:list})});
      const j=await r.json();
      if(!j||!j.ok)throw new Error(j&&j.error||'Enregistrement refusé');
    }
    try{if(typeof S!=='undefined'&&S)S[tab]=list;}catch(e){}
    cacheTab(tab,list);
    try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:[tab],source:'unified-modal-edit'}}));}catch(e){}
    return true;
  }

  async function updateOne(tab,id,mutate){
    let list=await fetchTab(tab);
    if(!Array.isArray(list))list=stateArray(tab).map(function(x){return x&&typeof x==='object'?Object.assign({},x):x;});
    const index=list.findIndex(function(x){return text(x&&x.id)===text(id);});
    if(index<0)throw new Error('Élément introuvable dans Yaya');
    const item=Object.assign({},list[index]);
    mutate(item);
    list[index]=item;
    await postList(tab,list);
    return item;
  }

  async function saveContext(ctx,title,description){
    title=text(title);description=String(description||'').trim();
    if(!title)throw new Error('Le titre est obligatoire');
    if(ctx.kind==='achat')return updateOne('achats',ctx.id,function(a){a.fournisseur=title;a.designation=description;});
    if(ctx.kind==='document')return updateOne('documents',ctx.id,function(d){d.titre=title;d.sujet=description;});
    if(ctx.kind==='mail')return updateOne('documents',ctx.id,function(d){d.titre=packedMailTitle(title,description);d.objetMail=title;d.contenuMail=description;});
    if(ctx.kind==='devis-extra')return updateOne('avenants',ctx.id,function(v){v.libelle=title+(description?'\n'+description:'');});
    if(ctx.kind==='devis-main')return updateOne('chantiers',ctx.id,function(c){c.notes=withInitialMeta(c.notes,title,description);});
    throw new Error('Élément non reconnu');
  }

  function closeModalSafe(){
    try{if(typeof window.closeModal==='function')window.closeModal();else if(typeof closeModal==='function')closeModal();}catch(e){}
  }

  async function fallbackDelete(tab,id){
    if(!confirm('Supprimer cet élément de Yaya ?\n\nLe fichier Drive / Dropbox sera conservé.'))return false;
    let list=await fetchTab(tab);
    if(!Array.isArray(list))list=stateArray(tab).slice();
    const after=list.filter(function(x){return text(x&&x.id)!==text(id);});
    if(after.length===list.length)return true;
    await postList(tab,after);
    return true;
  }

  async function deleteContext(ctx){
    if(ctx.kind==='achat'){
      if(typeof window.delAchat==='function'){
        await window.delAchat(ctx.id);
        return !byId('achat',ctx.id);
      }
      return fallbackDelete('achats',ctx.id);
    }
    if(ctx.kind==='document'||ctx.kind==='mail'){
      if(typeof window.delDocument==='function'){
        await window.delDocument(ctx.id);
        return !byId(ctx.kind,ctx.id);
      }
      return fallbackDelete('documents',ctx.id);
    }
    if(ctx.kind==='devis-extra'){
      if(typeof window.delAvenant==='function'){
        await window.delAvenant(ctx.id);
        return !byId('devis-extra',ctx.id);
      }
      return fallbackDelete('avenants',ctx.id);
    }
    if(ctx.kind==='devis-main'){
      if(!confirm('Supprimer le devis 1 de Yaya ?\n\nLe fichier source sera conservé et le montant du marché HT ne sera pas modifié.'))return false;
      await updateOne('chantiers',ctx.id,function(c){c.montantDevisHT=0;c.notes=DELETED_INITIAL;});
      return true;
    }
    return false;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      #modalRoot .yaya-unified-meta-active>.piece-preview-head>button,
      #modalRoot .yaya-unified-meta-active>.piece-preview-head .yaya-view-delete-btn,
      #modalRoot .yaya-unified-meta-active>h5>button{display:none!important}
      #modalRoot .yaya-unified-meta-bar{display:grid!important;grid-template-columns:minmax(170px,.8fr) minmax(240px,1.35fr) auto!important;gap:10px!important;align-items:end!important;padding:10px 0 11px!important;margin:0 0 7px!important;border-bottom:1px solid #dce4ee!important;background:#fff!important;flex:0 0 auto!important}
      #modalRoot .yaya-unified-meta-field{display:grid!important;gap:4px!important;min-width:0!important}
      #modalRoot .yaya-unified-meta-field>span{font-size:10.5px!important;font-weight:800!important;color:#52657a!important;text-transform:uppercase!important;letter-spacing:.045em!important}
      #modalRoot .yaya-unified-meta-field input,#modalRoot .yaya-unified-meta-field textarea{width:100%!important;box-sizing:border-box!important;border:1px solid #b8c6d6!important;border-radius:8px!important;background:#fff!important;color:#162d49!important;font:inherit!important;font-size:12.5px!important;padding:7px 9px!important;outline:none!important;resize:vertical!important}
      #modalRoot .yaya-unified-meta-field input{height:36px!important}
      #modalRoot .yaya-unified-meta-field textarea{height:36px!important;min-height:36px!important;max-height:84px!important;line-height:1.25!important}
      #modalRoot .yaya-unified-meta-field input:focus,#modalRoot .yaya-unified-meta-field textarea:focus{border-color:#6e9fd6!important;box-shadow:0 0 0 2px rgba(110,159,214,.14)!important}
      #modalRoot .yaya-unified-meta-actions{display:flex!important;gap:7px!important;align-items:center!important;justify-content:flex-end!important;white-space:nowrap!important}
      #modalRoot .yaya-unified-meta-actions button{height:36px!important;min-height:36px!important;padding:0 11px!important;border-radius:8px!important;font-size:11.5px!important;font-weight:800!important;cursor:pointer!important;white-space:nowrap!important}
      #modalRoot .yaya-unified-save{border:1px solid #166534!important;background:#166534!important;color:#fff!important}
      #modalRoot .yaya-unified-delete{border:1px solid #efaaa4!important;background:#fff3f2!important;color:#c72d24!important}
      #modalRoot .yaya-unified-close{border:1px solid #b9c6d4!important;background:#fff!important;color:#24415f!important}
      #modalRoot .yaya-unified-meta-actions button:disabled{opacity:.55!important;cursor:default!important}
      #modalRoot .yaya-unified-meta-active>.yaya-read-actions .yaya-delete,#modalRoot .yaya-unified-meta-active>.yaya-read-actions .yaya-edit,#modalRoot .yaya-unified-meta-active>.yaya-read-actions .btnp:not(.yaya-open){display:none!important}
      @media(max-width:760px){#modalRoot .yaya-unified-meta-bar{grid-template-columns:1fr!important;gap:7px!important;padding:7px 0 9px!important}#modalRoot .yaya-unified-meta-actions{justify-content:stretch!important}#modalRoot .yaya-unified-meta-actions button{flex:1 1 0!important;padding:0 7px!important}#modalRoot .yaya-unified-meta-field textarea{height:42px!important}}
    `;
    document.head.appendChild(s);
  }

  function entityLabel(ctx){
    if(ctx.kind==='achat'){
      const a=byId('achat',ctx.id);return a&&((String(a.typeDoc||'').toLowerCase()==='facture sous-traitant'||text(a.sousTraitant))?'Charge':'Achat');
    }
    if(ctx.kind==='mail')return 'Mail';
    if(ctx.kind==='document')return 'Document';
    return 'Devis';
  }

  function buildBar(modal,ctx){
    if(!modal||!ctx||!ctx.kind||!ctx.id)return;
    const existing=modal.querySelector(':scope > .yaya-unified-meta-bar');
    if(existing&&existing.dataset.kind===ctx.kind&&existing.dataset.id===ctx.id)return;
    if(existing)existing.remove();

    const v=values(ctx);
    const bar=document.createElement('div');bar.className='yaya-unified-meta-bar';bar.dataset.kind=ctx.kind;bar.dataset.id=ctx.id;
    bar.innerHTML=''
      +'<label class="yaya-unified-meta-field"><span>Titre</span><input type="text" class="yaya-unified-title" value="'+esc(v.title)+'" autocomplete="off"></label>'
      +'<label class="yaya-unified-meta-field"><span>Description</span><textarea class="yaya-unified-description" rows="1">'+esc(v.description)+'</textarea></label>'
      +'<div class="yaya-unified-meta-actions">'
        +'<button type="button" class="yaya-unified-save">Enregistrer</button>'
        +'<button type="button" class="yaya-unified-delete">Supprimer</button>'
        +'<button type="button" class="yaya-unified-close">Fermer</button>'
      +'</div>';

    const head=modal.querySelector(':scope > .piece-preview-head,:scope > h5');
    if(head)head.insertAdjacentElement('afterend',bar);else modal.insertBefore(bar,modal.firstChild);
    modal.classList.add('yaya-unified-meta-active');
    modal.dataset.yayaUnifiedKind=ctx.kind;modal.dataset.yayaUnifiedId=ctx.id;

    const save=bar.querySelector('.yaya-unified-save');
    const del=bar.querySelector('.yaya-unified-delete');
    const close=bar.querySelector('.yaya-unified-close');
    const title=bar.querySelector('.yaya-unified-title');
    const desc=bar.querySelector('.yaya-unified-description');

    close.onclick=function(e){e.preventDefault();e.stopPropagation();if(!saving)closeModalSafe();};
    save.onclick=async function(e){
      e.preventDefault();e.stopPropagation();if(saving)return;
      saving=true;save.disabled=del.disabled=close.disabled=true;save.textContent='Enregistrement…';
      try{
        await saveContext(ctx,title.value,desc.value);
        toastSafe(entityLabel(ctx)+' enregistré ✓');
        closeModalSafe();
      }catch(err){
        console.error('Yaya édition modale :',err);toastSafe('Enregistrement impossible : '+String(err&&err.message||err),true);
        save.disabled=del.disabled=close.disabled=false;save.textContent='Enregistrer';
      }finally{saving=false;}
    };
    del.onclick=async function(e){
      e.preventDefault();e.stopPropagation();if(saving)return;
      saving=true;save.disabled=del.disabled=close.disabled=true;del.textContent='Suppression…';
      try{
        const removed=await deleteContext(ctx);
        if(removed){toastSafe(entityLabel(ctx)+' supprimé de Yaya — fichier conservé ✓');closeModalSafe();}
        else{save.disabled=del.disabled=close.disabled=false;del.textContent='Supprimer';}
      }catch(err){
        console.error('Yaya suppression modale :',err);toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
        save.disabled=del.disabled=close.disabled=false;del.textContent='Supprimer';
      }finally{saving=false;}
    };
  }

  function decorate(){
    installStyle();
    const root=document.getElementById('modalRoot');if(!root||!current.kind||!current.id)return;
    const modal=root.querySelector('.piece-preview-modal,.yaya-document-read-modal,.yaya-mail-body-modal,.message-modal');
    if(!modal)return;
    if(!byId(current.kind,current.id))return;
    buildBar(modal,current);
  }

  function scheduleDecorate(){
    clearTimeout(decorateTimer);
    decorateTimer=setTimeout(function(){decorateTimer=0;requestAnimationFrame(decorate);},0);
  }

  function setCurrent(ctx){
    if(!ctx||!ctx.kind||!ctx.id)return;
    current={kind:ctx.kind,id:text(ctx.id),url:text(ctx.url)};
    scheduleDecorate();
  }

  function rowId(row){
    if(!row)return '';
    const ds=row.dataset||{};
    const direct=[ds.id,ds.rowId,ds.mailId,ds.documentId,ds.docId,ds.achatId];
    for(const v of direct){if(text(v))return text(v);}
    const raw=Array.from(row.querySelectorAll('[onclick]')).map(function(el){return String(el.getAttribute('onclick')||'');}).join(' ');
    const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument|delAchat|editAchat|editMontantAchat)\(['\"]([^'\"]+)/i);
    return m&&m[1]?text(m[1]):'';
  }

  function contextFromPointer(target){
    if(!target||!target.closest)return null;
    const market=target.closest('#pane-chantiers .yaya-detail-market-row');
    if(market){
      const ref=market.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');
      if(ref){const kind=String(ref.dataset.kind||'')==='main'?'devis-main':'devis-extra';return {kind:kind,id:text(ref.dataset.rowId)};}
    }
    const row=target.closest('#pane-chantiers .yaya-detail-mail-row,#pane-chantiers .yaya-force-mails-pane .yaya-detail-mail-row,#pane-chantiers .yaya-detail-document-row,#pane-documents .achligne.ligR[data-id],#pane-chantiers .yaya-detail-charge-row,#pane-achats .achligne');
    if(row){
      const id=rowId(row);if(!id)return null;
      const d=stateArray('documents').find(function(x){return text(x&&x.id)===id;});if(d)return {kind:isMail(d)?'mail':'document',id:id};
      const a=stateArray('achats').find(function(x){return text(x&&x.id)===id;});if(a)return {kind:'achat',id:id};
    }
    return null;
  }

  document.addEventListener('pointerdown',function(e){
    const ctx=contextFromPointer(e.target);if(ctx)setCurrent(ctx);
  },true);

  function installVoirPiece(){
    const fn=window.voirPiece;if(typeof fn!=='function'||fn[WRAP_FLAG])return;
    const wrapped=function(url){setCurrent(findByUrl(url));return fn.apply(this,arguments);};
    wrapped[WRAP_FLAG]=true;wrapped.__yayaUnifiedOriginal=fn;window.voirPiece=wrapped;
  }

  function installVoirMail(){
    const fn=window.voirMessageYaya;if(typeof fn!=='function'||fn[WRAP_FLAG])return;
    const wrapped=function(id){const d=stateArray('documents').find(function(x){return text(x&&x.id)===text(id);});if(d)setCurrent({kind:'mail',id:text(id)});return fn.apply(this,arguments);};
    wrapped[WRAP_FLAG]=true;wrapped.__yayaUnifiedOriginal=fn;window.voirMessageYaya=wrapped;
  }

  function install(){
    installStyle();installVoirPiece();installVoirMail();
    const root=document.getElementById('modalRoot');
    if(root&&!root.__yayaUnifiedMetaObserved){root.__yayaUnifiedMetaObserved=true;new MutationObserver(scheduleDecorate).observe(root,{childList:true,subtree:true});}
    scheduleDecorate();
  }

  install();
  setTimeout(install,150);
  setTimeout(install,700);
  setInterval(function(){installVoirPiece();installVoirMail();},1200);
  window.addEventListener('yaya:data-refreshed',scheduleDecorate);
})();
