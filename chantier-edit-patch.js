(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-edit-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent='\n      #yayaCreateChantierBtn,#yayaCreateChantierWrap{display:none!important;}\n      #pane-chantiers button[onclick*="delChantier"],#pane-chantiers .chantier-delete-btn{display:none!important;}\n      .yaya-edit-chantier-btn{margin-left:auto!important;padding:5px 10px!important;font-size:11.5px!important;white-space:nowrap!important;}\n      .yaya-delete-chantier-modal-btn{margin-right:auto!important;background:#fff1f0!important;border:1px solid #e6a09a!important;color:#b42318!important;font-weight:750!important;}\n      .yaya-delete-chantier-modal-btn:hover{background:#fee4e2!important;border-color:#cf6d64!important;}\n      .yaya-signature-fields{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,.9fr);gap:8px;}\n      .yaya-signature-fields .inp{width:100%!important;min-width:0!important;background:#fff!important;}\n      @media(max-width:640px){.yaya-edit-chantier-btn{margin-left:0!important}.yaya-chantier-edit-modal{max-width:calc(100vw - 16px)!important;padding:14px!important}.yaya-delete-chantier-modal-btn{width:100%!important;margin:0 0 8px!important}.yaya-chantier-edit-modal .mfoot{flex-wrap:wrap!important}.yaya-signature-fields{grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);}}\n    ';
    document.head.appendChild(style);
  }

  function ready(){
    try{return typeof S!=='undefined'&&Array.isArray(S.chantiers)&&typeof apiPost==='function'&&typeof render==='function';}
    catch(e){return false;}
  }

  function escAttr(v){
    return String(v==null?'':v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function escHtml(v){
    return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function getChantier(cid){
    try{return S.chantiers.find(c=>String(c.id)===String(cid))||null;}catch(e){return null;}
  }

  function cidFromCard(card){
    if(!card)return '';
    const el=card.querySelector('[onclick*="editMontantDevis"]');
    const s=el&&el.getAttribute('onclick')||'';
    const m=s.match(/editMontantDevis\(['\"]([^'\"]+)/);
    return m?m[1]:'';
  }

  function monthValue(v){
    const s=String(v||'').trim();
    let m=s.match(/^(\d{4})-(\d{2})/);
    if(m)return m[1]+'-'+m[2];
    const clean=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const y=(clean.match(/(20\d{2})/)||[])[1];
    if(!y)return '';
    const months=[['janv',1],['fevr',2],['mars',3],['avr',4],['mai',5],['juin',6],['juil',7],['aout',8],['sept',9],['oct',10],['nov',11],['dec',12]];
    const found=months.find(x=>clean.includes(x[0]));
    return found?y+'-'+String(found[1]).padStart(2,'0'):'';
  }

  function signatureParts(v){
    const value=monthValue(v);
    const m=value.match(/^(\d{4})-(\d{2})$/);
    return m?{year:m[1],month:m[2]}:{year:'',month:''};
  }

  function monthOptions(selected){
    const labels=[
      ['01','Janvier'],['02','Février'],['03','Mars'],['04','Avril'],
      ['05','Mai'],['06','Juin'],['07','Juillet'],['08','Août'],
      ['09','Septembre'],['10','Octobre'],['11','Novembre'],['12','Décembre']
    ];
    return '<option value="">Mois</option>'+labels.map(function(x){
      return '<option value="'+x[0]+'"'+(x[0]===selected?' selected':'')+'>'+escHtml(x[1])+'</option>';
    }).join('');
  }

  function yearOptions(selected){
    const now=new Date().getFullYear();
    const selectedYear=parseInt(selected,10)||now;
    const start=Math.min(now-2,selectedYear);
    const end=Math.max(now+5,selectedYear);
    let html='<option value="">Année</option>';
    for(let y=start;y<=end;y++){
      const s=String(y);
      html+='<option value="'+s+'"'+(s===selected?' selected':'')+'>'+s+'</option>';
    }
    return html;
  }

  function dateValue(v){
    const s=String(v||'').trim();
    const m=s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m?m[1]:'';
  }

  window.syncEditChSignature=function(){
    const month=document.getElementById('editChSignatureMonth');
    const year=document.getElementById('editChSignatureYear');
    const hidden=document.getElementById('editChSignature');
    if(!month||!year||!hidden)return '';
    const value=(month.value&&year.value)?year.value+'-'+month.value:'';
    hidden.value=value;
    return value;
  };

  function valuesToChantier(c){
    const nom=document.getElementById('editChNom');
    const sig=document.getElementById('editChSignature');
    const sigMonth=document.getElementById('editChSignatureMonth');
    const sigYear=document.getElementById('editChSignatureYear');
    const dem=document.getElementById('editChDemarrage');
    const mt=document.getElementById('editChMarcheHT');
    if(!nom||!sig||!sigMonth||!sigYear||!dem||!mt)return {ok:false};
    const name=nom.value.trim();
    if(!name){toast('Indique le nom du chantier',true);nom.focus();return {ok:false};}
    if((sigMonth.value&&!sigYear.value)||(!sigMonth.value&&sigYear.value)){
      toast('Choisis le mois et l’année de signature',true);
      (sigMonth.value?sigYear:sigMonth).focus();
      return {ok:false};
    }
    const signature=window.syncEditChSignature();
    const brut=String(mt.value||'0').trim().replace(/\s/g,'').replace(',','.');
    const montant=Number(brut||0);
    if(!Number.isFinite(montant)||montant<0){toast('Chiffre d’affaires HT invalide',true);mt.focus();return {ok:false};}
    c.nom=name;
    c.dateSignature=signature;
    c.dateDemarrageEstime=dem.value||'';
    c.montantMarcheHT=montant;
    return {ok:true};
  }

  window.saveExistingChantier=async function(cid){
    const c=getChantier(cid);if(!c)return;
    if(!valuesToChantier(c).ok)return;
    const btn=document.getElementById('editChSave');
    if(btn){btn.disabled=true;btn.textContent='Enregistrement…';}
    const ok=await apiPost('setChantiers',S.chantiers);
    if(ok){closeModal();render();toast('Chantier mis à jour ✓');}
    else if(btn){btn.disabled=false;btn.textContent='Enregistrer';}
  };

  window.deleteExistingChantier=async function(cid){
    const avant=S.chantiers.length;
    await delChantier(cid);
    if(S.chantiers.length<avant)closeModal();
  };

  window.openExistingChantierModal=function(cid){
    const c=getChantier(cid);if(!c)return;
    const root=document.getElementById('modalRoot');if(!root)return;
    const signature=signatureParts(c.dateSignature);
    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal yaya-chantier-edit-modal" style="max-width:520px">'
      +'<h5>Modifier le chantier<button onclick="closeModal()" aria-label="Fermer">×</button></h5>'
      +'<div style="display:grid;gap:12px;margin-top:16px">'
      +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Nom du chantier<input class="inp" id="editChNom" autocomplete="off" value="'+escAttr(c.nom||'')+'"></label>'
      +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Signé le <span style="font-size:11px;font-weight:400;opacity:.65">mois et année</span><span class="yaya-signature-fields"><select class="inp" id="editChSignatureMonth" onchange="syncEditChSignature()">'+monthOptions(signature.month)+'</select><select class="inp" id="editChSignatureYear" onchange="syncEditChSignature()">'+yearOptions(signature.year)+'</select></span><input type="hidden" id="editChSignature" value="'+escAttr(monthValue(c.dateSignature))+'"></label>'
      +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Démarrage estimé <span style="font-size:11px;font-weight:400;opacity:.65">date complète</span><input class="inp" id="editChDemarrage" type="date" value="'+escAttr(dateValue(c.dateDemarrageEstime||c.dateDebut))+'"></label>'
      +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Chiffre d’affaires HT <span style="font-size:11px;font-weight:400;opacity:.65">montant officiel du marché</span><input class="inp" id="editChMarcheHT" type="number" min="0" step="0.01" inputmode="decimal" value="'+escAttr(Number(c.montantMarcheHT)||0)+'"></label>'
      +'</div>'
      +'<div class="mfoot" style="justify-content:flex-end"><button class="btn2 yaya-delete-chantier-modal-btn" type="button" onclick="deleteExistingChantier(\''+escAttr(cid)+'\')">Supprimer le chantier</button><button class="btn2 yaya-chantier-edit-cancel" id="editChCancel" type="button" onclick="closeModal()">Annuler</button><button class="btnp go" id="editChSave" type="button" onclick="saveExistingChantier(\''+escAttr(cid)+'\')">Enregistrer</button></div>'
      +'</div></div>';
  };

  function decorateCards(){
    if(!ready())return;
    const pane=document.getElementById('pane-chantiers');if(!pane)return;
    pane.querySelectorAll('button[onclick*="delChantier"],.chantier-delete-btn').forEach(btn=>btn.remove());
    pane.querySelectorAll('.card').forEach(card=>{
      if(card.querySelector('.yaya-edit-chantier-btn'))return;
      const cid=cidFromCard(card);if(!cid)return;
      const c=getChantier(cid);if(!c||String(cid).startsWith('__'))return;
      const toolbar=card.querySelector('.chantier-fin-toolbar');
      if(!toolbar)return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='btn2 yaya-edit-chantier-btn';
      btn.textContent='✏️ Modifier chantier';
      btn.addEventListener('click',()=>openExistingChantierModal(cid));
      toolbar.appendChild(btn);
    });
  }

  function install(){
    if(!ready())return setTimeout(install,150);
    decorateCards();
    const pane=document.getElementById('pane-chantiers');
    if(pane&&!pane.dataset.yayaChantierEditObserved){
      pane.dataset.yayaChantierEditObserved='1';
      new MutationObserver(decorateCards).observe(pane,{childList:true,subtree:true});
    }
    window.addEventListener('yaya:data-refreshed',decorateCards);
  }
  install();
})();
