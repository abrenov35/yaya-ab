(function(){
  'use strict';

  const STYLE_ID='yaya-devis-edit-fast-style-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-devis-fast-overlay{
        align-items:center!important;
        justify-content:center!important;
        padding:18px 12px!important;
      }
      .yaya-devis-fast-modal{
        width:min(520px,calc(100vw - 24px))!important;
        max-width:520px!important;
        padding:18px!important;
        border-radius:12px!important;
        box-shadow:0 16px 50px rgba(15,30,50,.22)!important;
      }
      .yaya-devis-fast-head{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:14px!important;
        margin:0 0 16px!important;
      }
      .yaya-devis-fast-head h5{
        margin:0!important;
        color:#374151!important;
        font-size:19px!important;
        font-weight:800!important;
      }
      .yaya-devis-fast-close{
        width:36px!important;
        height:36px!important;
        min-width:36px!important;
        padding:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #DDE3EA!important;
        border-radius:9px!important;
        background:#fff!important;
        color:#6B7280!important;
        font-size:22px!important;
        font-weight:500!important;
        line-height:1!important;
        box-shadow:none!important;
      }
      .yaya-devis-fast-fields{
        display:grid!important;
        gap:12px!important;
      }
      .yaya-devis-fast-field{
        display:grid!important;
        gap:5px!important;
        margin:0!important;
        color:#596579!important;
        font-size:11.5px!important;
        font-weight:750!important;
        letter-spacing:.015em!important;
      }
      .yaya-devis-fast-field input{
        width:100%!important;
        min-height:44px!important;
        padding:9px 12px!important;
        border:1px solid #C7D0DA!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#374151!important;
        font-size:15px!important;
        font-weight:500!important;
        box-shadow:none!important;
      }
      .yaya-devis-fast-amount{
        position:relative!important;
      }
      .yaya-devis-fast-amount input{
        padding-right:62px!important;
        text-align:right!important;
        font-variant-numeric:tabular-nums!important;
      }
      .yaya-devis-fast-suffix{
        position:absolute!important;
        right:12px!important;
        top:50%!important;
        transform:translateY(-50%)!important;
        color:#7A8798!important;
        font-size:12px!important;
        font-weight:750!important;
        pointer-events:none!important;
      }
      .yaya-devis-fast-piece{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:10px!important;
        margin-top:12px!important;
        padding:9px 11px!important;
        border:1px solid #E5E7EB!important;
        border-radius:8px!important;
        background:#F8F9FA!important;
        color:#6B7280!important;
        font-size:11.5px!important;
      }
      .yaya-devis-fast-piece button{
        flex:0 0 auto!important;
        min-height:32px!important;
        padding:6px 11px!important;
        border:1px solid #F59E0B!important;
        border-radius:7px!important;
        background:#FEF3C7!important;
        color:#92400E!important;
        font-size:11.5px!important;
        font-weight:750!important;
        box-shadow:none!important;
      }
      .yaya-devis-fast-foot{
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        gap:10px!important;
        margin-top:18px!important;
      }
      .yaya-devis-fast-foot button{
        width:100%!important;
        min-height:44px!important;
        margin:0!important;
        border-radius:8px!important;
        font-size:14px!important;
        font-weight:800!important;
      }
      .yaya-devis-fast-save{
        background:#003D7A!important;
        color:#fff!important;
        border:1px solid #003D7A!important;
      }
      .yaya-devis-fast-cancel{
        background:#fff!important;
        color:#003D7A!important;
        border:1px solid #C7D0DA!important;
      }
      @media(max-width:640px){
        .yaya-devis-fast-overlay{align-items:flex-start!important;padding:12px 8px!important;}
        .yaya-devis-fast-modal{width:calc(100vw - 16px)!important;padding:14px!important;margin-top:max(8px,env(safe-area-inset-top))!important;}
        .yaya-devis-fast-head{margin-bottom:13px!important;}
        .yaya-devis-fast-head h5{font-size:18px!important;}
        .yaya-devis-fast-fields{gap:10px!important;}
        .yaya-devis-fast-field input{min-height:42px!important;font-size:16px!important;}
        .yaya-devis-fast-foot{margin-top:15px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function list(name){
    try{return typeof S!=='undefined'&&S&&Array.isArray(S[name])?S[name]:[];}catch(e){return [];}
  }

  function chantier(id){
    return list('chantiers').find(function(x){return String(x&&x.id)===String(id);})||null;
  }

  function avenant(id){
    return list('avenants').find(function(x){return String(x&&x.id)===String(id);})||null;
  }

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function renderSafe(){
    try{if(typeof render==='function')render();}catch(e){}
  }

  function closeSafe(){
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
  }

  function pieceHtml(url,label){
    if(!/^https?:\/\//i.test(String(url||'')))return '';
    return '<div class="yaya-devis-fast-piece"><span>Pièce jointe conservée — aucune analyse IA</span><button type="button" id="yayaFastPieceBtn">'+esc(label||'Voir')+'</button></div>';
  }

  function openDevis(id){
    const c=chantier(id);if(!c)return;
    const root=document.getElementById('modalRoot');if(!root)return;
    root.innerHTML=''
      +'<div class="overlay yaya-devis-fast-overlay" id="yayaFastOverlay">'
      +'<div class="modal yaya-devis-fast-modal" role="dialog" aria-modal="true" aria-labelledby="yayaFastTitle">'
      +'<div class="yaya-devis-fast-head"><h5 id="yayaFastTitle">Modifier le devis</h5><button type="button" class="yaya-devis-fast-close" id="yayaFastClose" aria-label="Fermer">×</button></div>'
      +'<div class="yaya-devis-fast-fields">'
      +'<label class="yaya-devis-fast-field">Client / chantier<input id="edNom" autocomplete="off" value="'+esc(c.nom||'')+'"></label>'
      +'<label class="yaya-devis-fast-field">Objet / lot<input id="edNum" autocomplete="off" value="'+esc(c.numero||'')+'"></label>'
      +'<label class="yaya-devis-fast-field">Montant HT<div class="yaya-devis-fast-amount"><input id="edMt" type="number" inputmode="decimal" min="0" step="0.01" value="'+esc(Number(c.montantDevisHT)||'')+'"><span class="yaya-devis-fast-suffix">€ HT</span></div></label>'
      +'</div>'
      +pieceHtml(c.notes,'Voir le devis')
      +'<div class="yaya-devis-fast-foot"><button type="button" class="yaya-devis-fast-save" id="yayaFastSave">Enregistrer</button><button type="button" class="yaya-devis-fast-cancel" id="yayaFastCancel">Annuler</button></div>'
      +'</div></div>';

    const overlay=document.getElementById('yayaFastOverlay');
    const close=document.getElementById('yayaFastClose');
    const cancel=document.getElementById('yayaFastCancel');
    const save=document.getElementById('yayaFastSave');
    const piece=document.getElementById('yayaFastPieceBtn');
    if(overlay)overlay.addEventListener('click',function(e){if(e.target===overlay)closeSafe();});
    if(close)close.addEventListener('click',closeSafe);
    if(cancel)cancel.addEventListener('click',closeSafe);
    if(save)save.addEventListener('click',function(){saveDevis(id);});
    if(piece)piece.addEventListener('click',function(){try{if(typeof voirPiece==='function')voirPiece(c.notes);}catch(e){}});
  }

  async function saveDevis(id){
    const c=chantier(id);if(!c)return;
    const nom=document.getElementById('edNom');
    const numero=document.getElementById('edNum');
    const montant=document.getElementById('edMt');
    if(!nom||!numero||!montant)return;
    const name=nom.value.trim();
    if(!name){toastSafe('Le nom ne peut pas être vide',true);nom.focus();return;}
    const amount=Number(String(montant.value||'0').replace(',','.'))||0;
    const before={nom:c.nom,numero:c.numero,montantDevisHT:c.montantDevisHT};
    c.nom=name;c.numero=numero.value.trim();c.montantDevisHT=amount;
    closeSafe();renderSafe();
    try{
      const ok=typeof apiPost==='function'?await apiPost('setChantiers',S.chantiers):false;
      if(ok)toastSafe('Devis modifié ✓');
      else throw new Error('Enregistrement impossible');
    }catch(e){
      c.nom=before.nom;c.numero=before.numero;c.montantDevisHT=before.montantDevisHT;
      renderSafe();toastSafe('La modification du devis a échoué',true);
    }
  }

  function openAvenant(id){
    const v=avenant(id);if(!v)return;
    const root=document.getElementById('modalRoot');if(!root)return;
    root.innerHTML=''
      +'<div class="overlay yaya-devis-fast-overlay" id="yayaFastOverlay">'
      +'<div class="modal yaya-devis-fast-modal" role="dialog" aria-modal="true" aria-labelledby="yayaFastTitle">'
      +'<div class="yaya-devis-fast-head"><h5 id="yayaFastTitle">Modifier le devis</h5><button type="button" class="yaya-devis-fast-close" id="yayaFastClose" aria-label="Fermer">×</button></div>'
      +'<div class="yaya-devis-fast-fields">'
      +'<label class="yaya-devis-fast-field">Objet / lot<input id="eavLib" autocomplete="off" value="'+esc(v.libelle||'')+'"></label>'
      +'<label class="yaya-devis-fast-field">Montant HT<div class="yaya-devis-fast-amount"><input id="eavMt" type="number" inputmode="decimal" min="0" step="0.01" value="'+esc(Number(v.montantHT)||'')+'"><span class="yaya-devis-fast-suffix">€ HT</span></div></label>'
      +'</div>'
      +pieceHtml(v.lien,'Voir le devis')
      +'<div class="yaya-devis-fast-foot"><button type="button" class="yaya-devis-fast-save" id="yayaFastSave">Enregistrer</button><button type="button" class="yaya-devis-fast-cancel" id="yayaFastCancel">Annuler</button></div>'
      +'</div></div>';

    const overlay=document.getElementById('yayaFastOverlay');
    const close=document.getElementById('yayaFastClose');
    const cancel=document.getElementById('yayaFastCancel');
    const save=document.getElementById('yayaFastSave');
    const piece=document.getElementById('yayaFastPieceBtn');
    if(overlay)overlay.addEventListener('click',function(e){if(e.target===overlay)closeSafe();});
    if(close)close.addEventListener('click',closeSafe);
    if(cancel)cancel.addEventListener('click',closeSafe);
    if(save)save.addEventListener('click',function(){saveAvenant(id);});
    if(piece)piece.addEventListener('click',function(){try{if(typeof voirPiece==='function')voirPiece(v.lien);}catch(e){}});
  }

  async function saveAvenant(id){
    const v=avenant(id);if(!v)return;
    const lib=document.getElementById('eavLib');
    const montant=document.getElementById('eavMt');
    if(!lib||!montant)return;
    const label=lib.value.trim();
    if(!label){toastSafe('Indique un libellé',true);lib.focus();return;}
    const amount=Number(String(montant.value||'0').replace(',','.'))||0;
    const before={libelle:v.libelle,montantHT:v.montantHT};
    v.libelle=label;v.montantHT=amount;
    closeSafe();renderSafe();
    try{
      const ok=typeof apiPost==='function'?await apiPost('setAvenants',S.avenants):false;
      if(ok)toastSafe('Devis modifié ✓');
      else throw new Error('Enregistrement impossible');
    }catch(e){
      v.libelle=before.libelle;v.montantHT=before.montantHT;
      renderSafe();toastSafe('La modification du devis a échoué',true);
    }
  }

  function install(){
    window.editMontantDevis=openDevis;
    window.editAvenantComplet=openAvenant;
    window.editMontantAvenant=openAvenant;
    window.yayaEditAvenantDirect=openAvenant;
    try{editMontantDevis=openDevis;}catch(e){}
    try{editAvenantComplet=openAvenant;}catch(e){}
    try{editMontantAvenant=openAvenant;}catch(e){}
  }

  install();
  setTimeout(install,700);
  setTimeout(install,1200);
  window.addEventListener('yaya:data-refreshed',function(){setTimeout(install,0);});
})();
