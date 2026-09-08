(function(){
  'use strict';

  const STYLE_ID='yaya-consumables-expense-style-v2';
  const MODAL_CLASS='yaya-consumables-overlay';
  const DEFAULT_COEFF=1;
  const OLD_DEFAULT_COEFF=2;
  const COEFFS=[1,1.5,2,2.5,3];
  const TYPE='Consommables';
  const FOURNISSEUR='FORFAIT CONSOMMABLES';
  const MARKER='YAYA_CONSOMMABLES';
  let syncTimer=null;
  let renderTimer=null;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #pane-chantiers .yaya-consumables-button{height:34px!important;min-height:34px!important;min-width:126px!important;padding:3px 10px!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#fff8ec!important;border-color:#e9cf9c!important;color:#7a560e!important;line-height:1.05!important}
      #pane-chantiers .yaya-consumables-button:hover{background:#fdf0d7!important;border-color:#dcb66d!important}
      #pane-chantiers .yaya-consumables-button strong{font-size:11px!important;font-weight:800!important;white-space:nowrap!important}
      #pane-chantiers .achligne.ligD > span:nth-child(2){text-align:center!important;justify-self:stretch!important}
      .yaya-consumables-overlay{position:fixed!important;inset:0!important;z-index:28000!important;background:rgba(22,45,73,.48)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:16px!important;overflow:auto!important}
      .yaya-consumables-modal{width:min(430px,100%)!important;background:#fff!important;border-radius:14px!important;padding:20px!important;box-shadow:0 18px 55px rgba(0,0,0,.28)!important;color:#162d49!important}
      .yaya-consumables-modal h3{margin:0 0 4px!important;font-size:18px!important}
      .yaya-consumables-sub{margin:0 0 14px!important;color:#68778a!important;font-size:12.5px!important}
      .yaya-consumables-summary{display:grid!important;grid-template-columns:1fr auto!important;gap:6px 12px!important;align-items:end!important;margin:12px 0 16px!important;padding:12px 14px!important;border:1px solid #dce4ec!important;border-radius:10px!important;background:#f8fafc!important}
      .yaya-consumables-summary span{font-size:11px!important;color:#64748b!important}.yaya-consumables-summary b{font-size:19px!important}.yaya-consumables-summary small{grid-column:1/-1!important;font-size:10.5px!important;color:#7a8798!important}
      .yaya-consumables-choices{display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:7px!important}
      .yaya-consumables-choice{min-height:43px!important;border:1px solid #cbd5e1!important;border-radius:9px!important;background:#fff!important;color:#334155!important;font-size:13px!important;font-weight:800!important;cursor:pointer!important}
      .yaya-consumables-choice.on{background:#294796!important;border-color:#294796!important;color:#fff!important}
      .yaya-consumables-close{width:100%!important;margin-top:14px!important;min-height:40px!important;border:1px solid #cbd5e1!important;border-radius:8px!important;background:#fff!important;color:#334155!important;font-weight:750!important;cursor:pointer!important}
      @media(max-width:640px){#pane-chantiers .yaya-consumables-button{min-width:112px!important;padding-left:7px!important;padding-right:7px!important}.yaya-consumables-choices{grid-template-columns:repeat(3,1fr)!important}}
    `;
    document.head.appendChild(s);
  }

  function esc(v){const d=document.createElement('div');d.textContent=String(v==null?'':v);return d.innerHTML;}
  function euro(v){return (Number(v)||0).toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:2})+' €';}
  function today(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}
  function makeId(){try{if(typeof uid==='function')return uid();}catch(e){}return 'CONSOMMABLES_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);}

  function cardId(card){
    if(!card)return '';
    for(const el of card.querySelectorAll('[onclick]')){
      const m=String(el.getAttribute('onclick')||'').match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);}catch(e){}
    return '';
  }

  function chantierName(id){try{const c=Array.isArray(S&&S.chantiers)?S.chantiers.find(x=>String(x&&x.id||'')===String(id)):null;return c?String(c.nom||'Chantier'):'';}catch(e){return '';}}

  function hoursFor(cid){
    try{
      const heures=Array.isArray(S&&S.heures)?S.heures:[];
      const salaries=Array.isArray(S&&S.salaries)?S.salaries:[];
      return heures.reduce((total,h)=>{
        if(!h||h.type!=='chantier'||String(h.ref)!==String(cid))return total;
        const salarie=salaries.find(s=>String(s&&s.id||'')===String(h.salarieId||''));
        if(!salarie||String(salarie.type||'')==='Sous-traitant')return total;
        const n=Number(h.heures)||0;
        return n>0?total+n:total;
      },0);
    }catch(e){return 0;}
  }

  function findExpense(cid){
    try{return (Array.isArray(S&&S.achats)?S.achats:[]).find(a=>a&&String(a.chantierId||'')===String(cid)&&(String(a.typeDoc||'')===TYPE||String(a.fournisseur||'')===FOURNISSEUR||String(a.designation||'').includes(MARKER)))||null;}catch(e){return null;}
  }

  function validCoeff(v){const n=Number(v);return COEFFS.some(x=>Math.abs(x-n)<0.001)?n:null;}
  function coeffKey(cid){return 'YAYA_CONSOMMABLES_COEFF_'+String(cid||'');}
  function coefficientFor(cid){
    try{
      const local=validCoeff(localStorage.getItem(coeffKey(cid)));
      if(local!=null)return local;
    }catch(e){}

    const expense=findExpense(cid);
    if(expense){
      const stored=validCoeff(expense.coefficientConsommables);
      const mode=String(expense.coefficientConsommablesMode||'').toUpperCase();
      if(mode==='MANUEL'&&stored!=null)return stored;
      if(mode==='DEFAUT')return DEFAULT_COEFF;
      if(stored!=null){
        if(String(expense.origine||'')==='CONSOMMABLES_AUTO'&&Math.abs(stored-OLD_DEFAULT_COEFF)<0.001)return DEFAULT_COEFF;
        return stored;
      }
      const m=String(expense.designation||'').match(/coef\s*=\s*(1(?:\.5)?|2(?:\.5)?|3)(?:\b|\])/i);
      if(m){const n=validCoeff(m[1]);if(n!=null)return n;}
    }
    return DEFAULT_COEFF;
  }

  function amountFor(cid,coeff){return Math.round(hoursFor(cid)*Number(coeff||DEFAULT_COEFF)*100)/100;}

  function saveCache(){try{const key='YAYA_CACHE_DATA_V2';const raw=localStorage.getItem(key);const cached=raw?JSON.parse(raw):{};if(!cached||typeof cached!=='object')return;cached.achats=Array.isArray(S&&S.achats)?S.achats:[];localStorage.setItem(key,JSON.stringify(cached));}catch(e){}}
  function persistSoon(now){if(syncTimer)clearTimeout(syncTimer);syncTimer=setTimeout(async()=>{syncTimer=null;try{if(typeof apiPost==='function')await apiPost('setAchats',Array.isArray(S&&S.achats)?S.achats:[]);}catch(e){console.warn('Consommables non synchronisés',e);}},now?0:800);}
  function scheduleRender(){if(renderTimer)return;renderTimer=setTimeout(()=>{renderTimer=null;try{if(typeof render==='function')render();}catch(e){}try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}},0);}

  function ensureExpense(cid,forceCreate){
    if(!cid||typeof S==='undefined')return false;
    if(!Array.isArray(S.achats))S.achats=[];
    const coeff=coefficientFor(cid),amount=amountFor(cid,coeff);
    let expense=findExpense(cid);
    if(!expense&&!forceCreate&&hoursFor(cid)<=0)return false;
    let changed=false;
    if(!expense){
      expense={id:makeId(),chantierId:String(cid),typeDoc:TYPE,fournisseur:FOURNISSEUR,designation:'',coefficientConsommables:coeff,coefficientConsommablesMode:'DEFAUT',date:today(),montantHT:amount,sousTraitant:'',lien:'',statutValidation:'VALIDEE',origine:'CONSOMMABLES_AUTO'};
      S.achats.push(expense);changed=true;
    }else{
      if(String(expense.typeDoc||'')!==TYPE){expense.typeDoc=TYPE;changed=true;}
      if(String(expense.fournisseur||'')!==FOURNISSEUR){expense.fournisseur=FOURNISSEUR;changed=true;}
      if(String(expense.designation||'')!==''){expense.designation='';changed=true;}
      if(Math.abs((Number(expense.coefficientConsommables)||0)-coeff)>0.001){expense.coefficientConsommables=coeff;changed=true;}
      if(!String(expense.coefficientConsommablesMode||'')&&String(expense.origine||'')==='CONSOMMABLES_AUTO'){expense.coefficientConsommablesMode='DEFAUT';changed=true;}
      if(Math.abs((Number(expense.montantHT)||0)-amount)>0.009){expense.montantHT=amount;changed=true;}
      if(String(expense.statutValidation||'')!=='VALIDEE'){expense.statutValidation='VALIDEE';changed=true;}
    }
    if(changed){saveCache();persistSoon(false);}return changed;
  }

  function toastSafe(message,error){try{if(typeof toast==='function')toast(message,!!error);else if(error)alert(message);}catch(e){}}
  function closeModal(){document.querySelectorAll('.'+MODAL_CLASS).forEach(x=>x.remove());}

  function openModal(cid){
    installStyle();closeModal();if(!cid){toastSafe('Chantier introuvable',true);return;}
    const coeff=coefficientFor(cid),h=hoursFor(cid),amount=amountFor(cid,coeff);
    const overlay=document.createElement('div');overlay.className=MODAL_CLASS;
    overlay.innerHTML=`<div class="yaya-consumables-modal" role="dialog" aria-modal="true" aria-label="Coefficient consommables"><h3>Consommables</h3><p class="yaya-consumables-sub">${esc(chantierName(cid))}</p><div class="yaya-consumables-summary"><span>Montant calculé</span><b>${esc(euro(amount))}</b><small>${esc(h.toLocaleString('fr-FR',{maximumFractionDigits:2}))} h × ${esc(Number(coeff).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}))} €/h</small></div><div class="yaya-consumables-choices">${COEFFS.map(value=>'<button type="button" class="yaya-consumables-choice'+(Math.abs(value-coeff)<0.001?' on':'')+'" data-coeff="'+value+'">'+value.toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+'</button>').join('')}</div><button type="button" class="yaya-consumables-close">Fermer</button></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal();});
    overlay.querySelector('.yaya-consumables-close').onclick=closeModal;
    overlay.querySelectorAll('.yaya-consumables-choice').forEach(btn=>btn.addEventListener('click',()=>{
      const selected=validCoeff(btn.dataset.coeff);if(selected==null)return;
      try{localStorage.setItem(coeffKey(cid),String(selected));}catch(e){}
      const expense=findExpense(cid);if(expense){expense.designation='';expense.coefficientConsommables=selected;expense.coefficientConsommablesMode='MANUEL';expense.montantHT=amountFor(cid,selected);expense.typeDoc=TYPE;expense.fournisseur=FOURNISSEUR;expense.statutValidation='VALIDEE';}
      ensureExpense(cid,true);saveCache();persistSoon(true);closeModal();scheduleRender();toastSafe('Consommables mis à jour ✓');
    }));
  }

  function updateButton(button,cid){const coeff=coefficientFor(cid);const amount=amountFor(cid,coeff);const signature=String(amount)+'|'+String(coeff);if(button.dataset.signature===signature)return;button.dataset.signature=signature;button.innerHTML='<strong>Consommables : '+esc(euro(amount))+'</strong>';button.title='Voir ou modifier les consommables — '+Number(coeff).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+' €/h';}

  function decorateRow(row){
    if(!row||row.dataset.section!=='depenses')return;
    const group=row.querySelector('.yaya-stock-action-buttons');if(!group)return;
    const cid=cardId(row.closest('.card'));if(!cid)return;
    if(ensureExpense(cid,false))scheduleRender();
    let button=group.querySelector('.yaya-consumables-button');
    if(!button){button=document.createElement('button');button.type='button';button.className='yaya-detail-section-action-button yaya-consumables-button';button.title='Voir ou modifier les consommables';const stock=group.querySelector('.yaya-stock-expense-button');if(stock)group.insertBefore(button,stock);else group.appendChild(button);button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openModal(cid);});}
    updateButton(button,cid);
  }

  function decorate(){installStyle();document.querySelectorAll('#pane-chantiers .yaya-detail-section-action-row[data-section="depenses"]').forEach(decorateRow);}
  let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
