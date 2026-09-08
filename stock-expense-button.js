(function(){
  'use strict';

  const STYLE_ID='yaya-stock-expense-style-v1';
  const MODAL_CLASS='yaya-stock-expense-overlay';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-stock-action-buttons{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:7px!important;margin-left:auto!important;flex-wrap:wrap!important}
      .yaya-stock-expense-button{background:#eef6f0!important;border-color:#b9d5c0!important;color:#2f6b41!important}
      .yaya-stock-expense-button:hover{background:#e1f0e5!important;border-color:#9fc5aa!important;color:#235532!important}
      .yaya-stock-expense-overlay{position:fixed!important;inset:0!important;z-index:27000!important;background:rgba(22,45,73,.48)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:16px!important;overflow:auto!important}
      .yaya-stock-expense-modal{width:min(500px,100%)!important;background:#fff!important;border-radius:14px!important;padding:20px!important;box-shadow:0 18px 55px rgba(0,0,0,.28)!important;color:#162d49!important}
      .yaya-stock-expense-modal h3{margin:0 0 4px!important;font-size:18px!important}
      .yaya-stock-expense-sub{margin:0 0 16px!important;color:#68778a!important;font-size:12.5px!important}
      .yaya-stock-expense-grid{display:grid!important;grid-template-columns:1fr 115px 135px!important;gap:10px!important}
      .yaya-stock-expense-field{display:flex!important;flex-direction:column!important;gap:5px!important}
      .yaya-stock-expense-field.wide{grid-column:1/-1!important}
      .yaya-stock-expense-field label{font-size:11px!important;font-weight:750!important;color:#596579!important}
      .yaya-stock-expense-field input{width:100%!important;min-height:40px!important;border:1px solid #cbd5e1!important;border-radius:8px!important;padding:8px 10px!important;font:inherit!important;color:#162d49!important;background:#fff!important}
      .yaya-stock-expense-total{margin-top:12px!important;padding:10px 12px!important;border-radius:9px!important;background:#f4f7f9!important;border:1px solid #d9e2ea!important;font-size:13px!important;display:flex!important;justify-content:space-between!important;align-items:center!important;gap:10px!important}
      .yaya-stock-expense-total b{font-size:17px!important}
      .yaya-stock-expense-actions{display:flex!important;justify-content:flex-end!important;gap:10px!important;margin-top:18px!important}
      .yaya-stock-expense-actions button{min-height:40px!important;padding:8px 15px!important;border-radius:8px!important;font-weight:750!important;cursor:pointer!important}
      .yaya-stock-expense-cancel{background:#fff!important;border:1px solid #cbd5e1!important;color:#334155!important}
      .yaya-stock-expense-save{background:#2e7d46!important;border:1px solid #2e7d46!important;color:#fff!important}
      .yaya-stock-expense-save:disabled{opacity:.6!important;cursor:default!important}
      @media(max-width:640px){
        .yaya-stock-action-buttons{width:100%!important;justify-content:flex-end!important}
        .yaya-stock-expense-grid{grid-template-columns:1fr 1fr!important}
        .yaya-stock-expense-field:first-child{grid-column:1/-1!important}
      }
    `;
    document.head.appendChild(style);
  }

  function esc(value){
    const d=document.createElement('div');
    d.textContent=String(value==null?'':value);
    return d.innerHTML;
  }

  function today(){
    const d=new Date();
    d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
    return d.toISOString().slice(0,10);
  }

  function cardId(card){
    if(!card)return '';
    const main=card.querySelector('.yaya-detail-market-row .yaya-detail-document-edit[data-kind="main"][data-row-id]');
    if(main&&main.dataset.rowId)return String(main.dataset.rowId);
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);}catch(e){}
    return '';
  }

  function chantierName(id){
    try{
      const c=Array.isArray(S&&S.chantiers)?S.chantiers.find(function(row){return String(row&&row.id||'')===String(id);}):null;
      return c?String(c.nom||'Chantier'):'';
    }catch(e){return '';}
  }

  function toastSafe(message,error){
    try{if(typeof toast==='function')toast(message,!!error);else if(error)alert(message);}catch(e){}
  }

  function closeModal(){
    document.querySelectorAll('.'+MODAL_CLASS).forEach(function(x){x.remove();});
  }

  function makeId(){
    try{if(typeof uid==='function')return uid();}catch(e){}
    return 'STOCK_'+Date.now()+'_'+Math.random().toString(36).slice(2,9);
  }

  function saveCache(){
    try{
      const key='YAYA_CACHE_DATA_V2';
      const raw=localStorage.getItem(key);
      const cached=raw?JSON.parse(raw):{};
      if(!cached||typeof cached!=='object')return;
      cached.achats=Array.isArray(S&&S.achats)?S.achats:[];
      localStorage.setItem(key,JSON.stringify(cached));
    }catch(e){}
  }

  function openModal(chantierId){
    installStyle();
    closeModal();
    if(!chantierId){toastSafe('Chantier introuvable',true);return;}

    const overlay=document.createElement('div');
    overlay.className=MODAL_CLASS;
    overlay.innerHTML=`
      <div class="yaya-stock-expense-modal" role="dialog" aria-modal="true" aria-label="Affecter du stock au chantier">
        <h3>＋ Stock consommé</h3>
        <p class="yaya-stock-expense-sub">${esc(chantierName(chantierId))}</p>
        <div class="yaya-stock-expense-grid">
          <div class="yaya-stock-expense-field">
            <label>Article / désignation</label>
            <input type="text" class="yaya-stock-expense-article" placeholder="Ex. Peinture blanche" autocomplete="off">
          </div>
          <div class="yaya-stock-expense-field">
            <label>Quantité</label>
            <input type="number" class="yaya-stock-expense-qty" min="0" step="0.01" inputmode="decimal" placeholder="0">
          </div>
          <div class="yaya-stock-expense-field">
            <label>Prix unitaire HT</label>
            <input type="number" class="yaya-stock-expense-unit" min="0" step="0.01" inputmode="decimal" placeholder="0,00 €">
          </div>
          <div class="yaya-stock-expense-field wide">
            <label>Date d'affectation</label>
            <input type="date" class="yaya-stock-expense-date" value="${today()}">
          </div>
        </div>
        <div class="yaya-stock-expense-total"><span>Montant affecté dans Dépenses</span><b class="yaya-stock-expense-total-value">0,00 € HT</b></div>
        <div class="yaya-stock-expense-actions">
          <button type="button" class="yaya-stock-expense-cancel">Annuler</button>
          <button type="button" class="yaya-stock-expense-save">Enregistrer dans Dépenses</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    const article=overlay.querySelector('.yaya-stock-expense-article');
    const qty=overlay.querySelector('.yaya-stock-expense-qty');
    const unit=overlay.querySelector('.yaya-stock-expense-unit');
    const date=overlay.querySelector('.yaya-stock-expense-date');
    const totalEl=overlay.querySelector('.yaya-stock-expense-total-value');
    const save=overlay.querySelector('.yaya-stock-expense-save');

    function num(input){
      const n=Number(String(input&&input.value||'').replace(',','.'));
      return Number.isFinite(n)?n:0;
    }
    function total(){return Math.round(num(qty)*num(unit)*100)/100;}
    function refreshTotal(){
      totalEl.textContent=total().toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' € HT';
    }
    qty.addEventListener('input',refreshTotal);
    unit.addEventListener('input',refreshTotal);
    overlay.querySelector('.yaya-stock-expense-cancel').onclick=closeModal;
    overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal();});

    save.onclick=async function(){
      const libelle=String(article.value||'').trim();
      const quantite=num(qty);
      const prixUnitaire=num(unit);
      const montant=total();
      const dateValue=String(date.value||today());

      if(!libelle){toastSafe('Indique l’article ou la désignation',true);article.focus();return;}
      if(quantite<=0){toastSafe('Indique la quantité utilisée',true);qty.focus();return;}
      if(prixUnitaire<=0){toastSafe('Indique le prix unitaire HT',true);unit.focus();return;}
      if(montant<=0){toastSafe('Montant HT invalide',true);return;}

      save.disabled=true;
      save.textContent='Enregistrement…';

      const achat={
        id:makeId(),
        chantierId:String(chantierId),
        typeDoc:'Stock',
        fournisseur:'STOCK',
        designation:libelle+' — '+quantite.toLocaleString('fr-FR')+' × '+prixUnitaire.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' € HT',
        date:dateValue,
        montantHT:montant,
        sousTraitant:'',
        lien:'',
        statutValidation:'VALIDEE',
        origine:'STOCK_MANUEL'
      };

      try{
        if(!Array.isArray(S.achats))S.achats=[];
        S.achats.push(achat);
        saveCache();
        try{if(typeof render==='function')render();}catch(e){}

        if(typeof apiPost!=='function')throw new Error('API Yaya indisponible');
        const ok=await apiPost('addAchat',achat);
        if(!ok)throw new Error('Enregistrement Yaya refusé');

        closeModal();
        try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}
        toastSafe('Stock affecté dans Dépenses ✓');
      }catch(err){
        try{S.achats=(S.achats||[]).filter(function(a){return String(a&&a.id||'')!==String(achat.id);});saveCache();if(typeof render==='function')render();}catch(e){}
        save.disabled=false;
        save.textContent='Enregistrer dans Dépenses';
        toastSafe('Affectation du stock impossible',true);
      }
    };

    setTimeout(function(){article.focus();},0);
  }

  function decorateRow(row){
    if(!row||row.dataset.section!=='depenses')return;
    const existing=row.querySelector('.yaya-detail-section-action-button:not(.yaya-stock-expense-button)');
    if(!existing)return;

    let group=row.querySelector('.yaya-stock-action-buttons');
    if(!group){
      group=document.createElement('span');
      group.className='yaya-stock-action-buttons';
      existing.parentNode.insertBefore(group,existing);
      group.appendChild(existing);
    }else if(existing.parentNode!==group){
      group.insertBefore(existing,group.firstChild);
    }

    let button=group.querySelector('.yaya-stock-expense-button');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='yaya-detail-section-action-button yaya-stock-expense-button';
      button.textContent='＋ Stock';
      button.title='Affecter du stock consommé au chantier';
      group.appendChild(button);
      button.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        const card=row.closest('.card');
        openModal(cardId(card));
      });
    }
  }

  function decorate(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-section-action-row[data-section="depenses"]').forEach(decorateRow);
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;decorate();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
