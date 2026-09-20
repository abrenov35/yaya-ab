(function(){
  'use strict';
  if(window.__yayaAchatCreateModalStableV1)return;
  window.__yayaAchatCreateModalStableV1=true;

  function escHtml(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }

  function currentChantierId(){
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);}catch(e){}
    try{return new URL(window.location.href).searchParams.get('chantier')||'';}catch(e){return '';}
  }

  function chantierSelectHtml(){
    const cid=currentChantierId();
    if(cid)return '<input type="hidden" id="acCh" value="'+escHtml(cid)+'">';
    let rows=[];
    try{rows=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))?S.chantiers:[];}catch(e){}
    return '<select class="inp" id="acCh" style="width:100%"><option value="">— Choisir le chantier —</option>'+
      rows.filter(function(c){return c&&c.statut!=="Terminé"&&c.statut!=="Archivé";})
        .sort(function(a,b){return String(a.nom||'').localeCompare(String(b.nom||''),'fr',{sensitivity:'base'});})
        .map(function(c){return '<option value="'+escHtml(c.id)+'">'+escHtml(c.nom||'')+'</option>';}).join('')+
      '</select>';
  }

  function openStable(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const today=new Date().toISOString().slice(0,10);
    root.innerHTML=''
      +'<div class="overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal" style="max-width:650px">'
      +'<h5>Enregistrer un achat / une facture</h5>'
      +'<div class="yaya-achat-required-fields" style="display:grid;grid-template-columns:minmax(150px,1fr) minmax(180px,1.5fr) minmax(120px,.8fr);gap:10px;margin:16px 0 10px">'
      +'<input class="inp" id="acFour" placeholder="Fournisseur" style="width:100%">'
      +'<input class="inp" id="acDes" placeholder="Désignation" style="width:100%">'
      +'<input class="inp" id="acMt" type="number" step="0.01" placeholder="Montant HT €" style="width:100%">'
      +'</div>'
      +chantierSelectHtml()
      +'<input type="hidden" id="acType" value="Facture">'
      +'<input type="hidden" id="acDate" value="'+today+'">'
      +'<input type="hidden" id="acST" value="">'
      +'<input type="file" id="achatFile" accept="application/pdf,image/*" style="display:none" onchange="lireAchat(this)">'
      +'<span class="note" id="achatEtat"></span>'
      +'<div class="mfoot yaya-achat-create-actions-fixed" style="display:flex;justify-content:center;gap:12px;margin-top:16px">'
      +'<button type="button" class="btnp yaya-achat-import-btn" style="background:#249457" onclick="document.getElementById(\'achatFile\').click()">Importer</button>'
      +'<button type="button" class="btnp go yaya-achat-save-btn" onclick="addAchat();closeModal()">Enregistrer</button>'
      +'<button type="button" class="btn2 yaya-achat-close-btn" onclick="closeModal()">Fermer</button>'
      +'</div>'
      +'</div></div>';
  }

  function install(){
    try{window.openAchatModal=openStable;}catch(e){}
    try{openAchatModal=openStable;}catch(e){}
  }

  install();
  setTimeout(install,100);
  setTimeout(install,500);
  setTimeout(install,1500);
})();
