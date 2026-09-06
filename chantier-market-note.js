(function(){
  'use strict';

  const STORE_ID='__CA_SIGNE_2026__';
  const STORE_PREFIX='YAYA_CHANTIER_NOTES_V1:';
  const STYLE_ID='yaya-chantier-market-note-style-v1';

  function toastSafe(message,error){
    try{if(typeof toast==='function')toast(message,!!error);}catch(e){}
  }

  function esc(value){
    const div=document.createElement('div');
    div.textContent=String(value||'');
    return div.innerHTML;
  }

  function formatDate(value){
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return '';
    return d.toLocaleDateString('fr-FR');
  }

  function storeDocument(){
    try{
      return Array.isArray(S&&S.documents)
        ? S.documents.find(d=>String(d&&d.id)===STORE_ID)||null
        : null;
    }catch(e){return null;}
  }

  function readEnvelope(){
    const doc=storeDocument();
    const raw=String(doc&&doc.lien||'');
    if(!raw.startsWith(STORE_PREFIX)){
      return {notes:{},legacyLink:raw};
    }
    try{
      const parsed=JSON.parse(raw.slice(STORE_PREFIX.length));
      if(parsed&&parsed.notes&&typeof parsed.notes==='object'){
        return {
          notes:parsed.notes,
          legacyLink:String(parsed.legacyLink||'')
        };
      }
      if(parsed&&typeof parsed==='object')return {notes:parsed,legacyLink:''};
    }catch(e){}
    return {notes:{},legacyLink:''};
  }

  function noteFor(chantierId){
    const envelope=readEnvelope();
    const item=envelope.notes[String(chantierId)]||null;
    if(!item)return {text:'',updatedAt:''};
    if(typeof item==='string')return {text:item,updatedAt:''};
    return {
      text:String(item.text||''),
      updatedAt:String(item.updatedAt||'')
    };
  }

  async function writeNotes(nextNotes){
    if(typeof S==='undefined'||!S||!Array.isArray(S.documents))return false;
    if(typeof apiPost!=='function')return false;

    const before=S.documents.map(d=>({...d}));
    const envelope=readEnvelope();
    let doc=storeDocument();

    if(!doc){
      doc={
        id:STORE_ID,
        chantierId:'',
        type:'Divers',
        titre:'Historique CA signé 2026',
        sujet:'[]',
        date:'2026-01-01',
        lien:''
      };
      S.documents.push(doc);
    }

    doc.lien=STORE_PREFIX+JSON.stringify({
      notes:nextNotes,
      legacyLink:envelope.legacyLink||''
    });

    try{
      const ok=await apiPost('setDocuments',S.documents);
      if(!ok)throw new Error('enregistrement impossible');
      try{
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(S));
      }catch(e){}
      window.dispatchEvent(new CustomEvent('yaya:chantier-note-changed'));
      return true;
    }catch(e){
      S.documents=before;
      return false;
    }
  }

  function cardId(card){
    if(!card)return '';

    const main=card.querySelector('.yaya-detail-market-row .yaya-detail-document-edit[data-kind="main"]');
    if(main&&main.dataset.rowId)return String(main.dataset.rowId);

    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
    }

    try{
      if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);
    }catch(e){}
    return '';
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-note-box{
        display:none!important;
        margin:10px 0 8px!important;
        padding:12px 13px!important;
        border:1px solid #cbd3dc!important;
        border-radius:10px!important;
        background:#f4f5f6!important;
        color:#1c2b48!important;
      }
      #pane-chantiers .card[data-yaya-detail-section="marche"] > .yaya-chantier-note-box{
        display:block!important;
      }
      #pane-chantiers .yaya-chantier-note-head{
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        margin-bottom:8px!important;
      }
      #pane-chantiers .yaya-chantier-note-title{
        flex:1!important;
        font-size:11px!important;
        font-weight:800!important;
        letter-spacing:.07em!important;
        color:#29415e!important;
      }
      #pane-chantiers .yaya-chantier-note-actions{
        display:flex!important;
        gap:6px!important;
      }
      #pane-chantiers .yaya-chantier-note-action{
        width:29px!important;
        height:29px!important;
        min-width:29px!important;
        min-height:29px!important;
        padding:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border-radius:7px!important;
        background:#fff!important;
        box-shadow:none!important;
        font-size:13px!important;
      }
      #pane-chantiers .yaya-chantier-note-edit{border:1px solid #a8d5b5!important;color:#26703b!important}
      #pane-chantiers .yaya-chantier-note-delete{border:1px solid #e6a7a7!important;color:#c83c3c!important}
      #pane-chantiers .yaya-chantier-note-text{
        white-space:pre-wrap!important;
        overflow-wrap:anywhere!important;
        font-size:13px!important;
        line-height:1.48!important;
        color:#2f3f52!important;
      }
      #pane-chantiers .yaya-chantier-note-date{
        margin-top:8px!important;
        color:#7a8798!important;
        font-size:10.5px!important;
        font-weight:600!important;
      }
      #pane-chantiers .yaya-chantier-note-add{
        width:100%!important;
        min-height:38px!important;
        padding:8px 12px!important;
        border:1px dashed #9aa8b8!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#40566f!important;
        font-size:12px!important;
        font-weight:750!important;
      }
      .yaya-note-modal-textarea{
        width:100%!important;
        min-height:150px!important;
        resize:vertical!important;
        padding:11px 12px!important;
        border:1px solid #cbd5e1!important;
        border-radius:9px!important;
        font:inherit!important;
        font-size:14px!important;
        line-height:1.45!important;
        color:#1c2b48!important;
        background:#fff!important;
      }
      .yaya-note-delete-overlay{
        position:fixed!important;
        inset:0!important;
        z-index:130000!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:18px!important;
        background:rgba(22,45,73,.48)!important;
      }
      .yaya-note-delete-box{
        width:min(420px,calc(100vw - 32px))!important;
        padding:22px!important;
        border-radius:14px!important;
        background:#fff!important;
        box-shadow:0 18px 55px rgba(0,0,0,.28)!important;
        text-align:center!important;
        color:#162d49!important;
      }
      .yaya-note-delete-box h3{margin:0 0 8px!important;font-size:18px!important}
      .yaya-note-delete-box p{margin:0 0 18px!important;color:#66758a!important;font-size:13px!important}
      .yaya-note-delete-actions{display:flex!important;gap:10px!important}
      .yaya-note-delete-actions button{flex:1!important;min-height:42px!important;border-radius:9px!important;font-weight:750!important}
      .yaya-note-delete-cancel{background:#fff!important;border:1px solid #cbd5e1!important;color:#334155!important}
      .yaya-note-delete-ok{background:#d93636!important;border:1px solid #d93636!important;color:#fff!important}
      @media(max-width:640px){
        #pane-chantiers .yaya-chantier-note-box{padding:11px!important}
        .yaya-note-modal-textarea{min-height:180px!important;font-size:16px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function noteMarkup(cid){
    const note=noteFor(cid);
    if(!note.text.trim()){
      return '<div class="yaya-chantier-note-head"><div class="yaya-chantier-note-title">📝 NOTE CHANTIER</div></div>'+
        '<button type="button" class="yaya-chantier-note-add" data-chantier-id="'+esc(cid)+'">+ Ajouter une note</button>';
    }

    const date=formatDate(note.updatedAt);
    return '<div class="yaya-chantier-note-head">'+
      '<div class="yaya-chantier-note-title">📝 NOTE CHANTIER</div>'+
      '<div class="yaya-chantier-note-actions">'+
        '<button type="button" class="yaya-chantier-note-action yaya-chantier-note-edit" data-chantier-id="'+esc(cid)+'" title="Modifier la note" aria-label="Modifier la note">✏️</button>'+
        '<button type="button" class="yaya-chantier-note-action yaya-chantier-note-delete" data-chantier-id="'+esc(cid)+'" title="Supprimer la note" aria-label="Supprimer la note">🗑️</button>'+
      '</div>'+
    '</div>'+
    '<div class="yaya-chantier-note-text">'+esc(note.text)+'</div>'+
    (date?'<div class="yaya-chantier-note-date">Modifiée le '+esc(date)+'</div>':'');
  }

  function decorateCard(card){
    const cid=cardId(card);
    if(!cid)return;
    const market=card.querySelector(':scope > .yaya-detail-markets-pane');
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!market&&!tabs)return;

    let box=card.querySelector(':scope > .yaya-chantier-note-box');
    if(!box){
      box=document.createElement('div');
      box.className='yaya-detail-section-node yaya-chantier-note-box';
      box.dataset.section='marche';
      if(market)market.insertAdjacentElement('afterend',box);
      else tabs.insertAdjacentElement('afterend',box);
    }

    box.dataset.chantierId=cid;
    const note=noteFor(cid);
    const signature=JSON.stringify([cid,note.text,note.updatedAt]);
    if(box.dataset.signature!==signature){
      box.innerHTML=noteMarkup(cid);
      box.dataset.signature=signature;
    }
  }

  function decorate(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .card').forEach(decorateCard);
  }

  function closeNoteModal(){
    try{if(typeof closeModal==='function'){closeModal();return;}}catch(e){}
    const root=document.getElementById('modalRoot');
    if(root)root.innerHTML='';
  }

  function openEditor(cid){
    const root=document.getElementById('modalRoot');
    if(!root){toastSafe('Modale indisponible',true);return;}
    const note=noteFor(cid);
    root.innerHTML='<div class="overlay"><div class="modal">'+
      '<h5>📝 Note chantier<button type="button" class="yaya-note-close">Fermer</button></h5>'+
      '<div class="mrow" style="display:block"><textarea class="yaya-note-modal-textarea" id="yayaChantierNoteText" placeholder="Écrire une note chantier…">'+esc(note.text)+'</textarea></div>'+
      '<div class="mfoot"><button type="button" class="btnp go yaya-note-save">Enregistrer</button><button type="button" class="btn2 yaya-note-cancel">Annuler</button></div>'+
    '</div></div>';

    const textarea=root.querySelector('#yayaChantierNoteText');
    const save=root.querySelector('.yaya-note-save');
    const close=()=>closeNoteModal();
    root.querySelector('.yaya-note-close').onclick=close;
    root.querySelector('.yaya-note-cancel').onclick=close;

    save.onclick=async function(){
      const text=String(textarea&&textarea.value||'').trim();
      if(!text){toastSafe('Écris une note avant d’enregistrer',true);return;}
      this.disabled=true;
      this.textContent='Enregistrement…';
      const envelope=readEnvelope();
      const notes={...envelope.notes};
      notes[String(cid)]={text,updatedAt:new Date().toISOString()};
      const ok=await writeNotes(notes);
      if(ok){
        close();
        decorate();
        toastSafe('Note chantier enregistrée ✓');
      }else{
        this.disabled=false;
        this.textContent='Enregistrer';
        toastSafe('Enregistrement de la note impossible',true);
      }
    };

    setTimeout(()=>{try{textarea.focus();textarea.setSelectionRange(textarea.value.length,textarea.value.length);}catch(e){}},0);
  }

  function confirmDelete(cid){
    document.querySelector('.yaya-note-delete-overlay')?.remove();
    const overlay=document.createElement('div');
    overlay.className='yaya-note-delete-overlay';
    overlay.innerHTML='<div class="yaya-note-delete-box" role="dialog" aria-modal="true">'+
      '<div style="font-size:28px;margin-bottom:8px">🗑️</div>'+
      '<h3>Supprimer la note chantier ?</h3>'+
      '<p>La note sera supprimée définitivement de ce chantier.</p>'+
      '<div class="yaya-note-delete-actions"><button type="button" class="yaya-note-delete-cancel">Annuler</button><button type="button" class="yaya-note-delete-ok">Supprimer</button></div>'+
    '</div>';
    document.body.appendChild(overlay);
    const close=()=>overlay.remove();
    overlay.querySelector('.yaya-note-delete-cancel').onclick=close;
    overlay.querySelector('.yaya-note-delete-ok').onclick=async function(){
      this.disabled=true;
      this.textContent='Suppression…';
      const envelope=readEnvelope();
      const notes={...envelope.notes};
      delete notes[String(cid)];
      const ok=await writeNotes(notes);
      if(ok){
        close();
        decorate();
        toastSafe('Note chantier supprimée ✓');
      }else{
        this.disabled=false;
        this.textContent='Supprimer';
        toastSafe('Suppression de la note impossible',true);
      }
    };
  }

  document.addEventListener('click',function(event){
    const add=event.target.closest&&event.target.closest('.yaya-chantier-note-add');
    if(add){event.preventDefault();event.stopPropagation();openEditor(String(add.dataset.chantierId||''));return;}
    const edit=event.target.closest&&event.target.closest('.yaya-chantier-note-edit');
    if(edit){event.preventDefault();event.stopPropagation();openEditor(String(edit.dataset.chantierId||''));return;}
    const del=event.target.closest&&event.target.closest('.yaya-chantier-note-delete');
    if(del){event.preventDefault();event.stopPropagation();confirmDelete(String(del.dataset.chantierId||''));}
  },true);

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;decorate();});
  }

  installStyle();
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
  window.addEventListener('yaya:chantier-note-changed',schedule);
})();
