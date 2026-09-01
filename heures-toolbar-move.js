(function(){
  'use strict';

  const STYLE_ID='yaya-hours-toolbar-move-style';
  let syncing=false;

  function norm(v){
    return String(v||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim()
      .toUpperCase();
  }

  function isHoursButton(el){
    if(!(el instanceof HTMLButtonElement))return false;
    const txt=norm(el.textContent);
    return txt==='HEURES' || txt.endsWith(' HEURES') || txt.includes('HEURES');
  }

  function removeMailTab(tabs){
    if(!tabs)return;
    tabs.querySelectorAll('#yayaMailsTab, .tab[data-tab="mails"], .tab[data-tab="mail"]').forEach(b=>b.remove());
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .hdr .tabs .yaya-hours-toolbar-btn{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:6px!important;
        min-height:38px!important;
        padding:7px 13px!important;
        border:1px solid rgba(255,255,255,.35)!important;
        border-radius:7px!important;
        background:#294796!important;
        color:#fff!important;
        font-size:13px!important;
        font-weight:700!important;
        line-height:1!important;
        white-space:nowrap!important;
        box-shadow:none!important;
      }
      .hdr .tabs .yaya-hours-toolbar-btn:hover{background:#3453a2!important}
      @media(max-width:760px){
        .hdr .tabs .yaya-hours-toolbar-btn{
          min-height:36px!important;
          padding:6px 10px!important;
          font-size:12px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function moveHours(){
    if(syncing)return;
    syncing=true;
    try{
      const tabs=document.querySelector('.hdr .tabs');
      if(!tabs)return;
      removeMailTab(tabs);
      const buttons=[...document.querySelectorAll('button')].filter(isHoursButton);
      if(!buttons.length)return;
      let toolbarBtn=buttons.find(b=>tabs.contains(b));
      const outside=buttons.filter(b=>!tabs.contains(b));
      if(!toolbarBtn && outside.length){
        toolbarBtn=outside.shift();
        toolbarBtn.classList.add('tab','yaya-hours-toolbar-btn');
        toolbarBtn.setAttribute('data-yaya-hours-toolbar','1');
        tabs.appendChild(toolbarBtn);
      }
      if(toolbarBtn){
        toolbarBtn.classList.add('tab','yaya-hours-toolbar-btn');
        toolbarBtn.setAttribute('data-yaya-hours-toolbar','1');
      }
      outside.forEach(b=>b.remove());
      removeMailTab(tabs);
    }finally{
      syncing=false;
    }
  }

  function install(){
    installStyle();
    moveHours();
    const obs=new MutationObserver(()=>{
      clearTimeout(window.__yayaHoursToolbarTimer);
      window.__yayaHoursToolbarTimer=setTimeout(moveHours,0);
    });
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(moveHours,120);
    setTimeout(moveHours,500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();

(function(){
  if(document.querySelector('script[data-yaya-achat-st-modal-fix]'))return;
  const s=document.createElement('script');
  s.src='achat-soustraitant-modal-fix.js?v=stmodal-1';
  s.async=false;
  s.setAttribute('data-yaya-achat-st-modal-fix','1');
  document.head.appendChild(s);
})();

(function(){
  function loadCommandeActions(){
    document.querySelectorAll('script[data-yaya-commande-actions]').forEach(x=>x.remove());
    const s=document.createElement('script');
    s.src='commande-actions.js?v=commande-actions-7';
    s.async=false;
    s.setAttribute('data-yaya-commande-actions','1');
    document.head.appendChild(s);
  }
  setTimeout(loadCommandeActions,0);
})();

(function(){
  'use strict';

  const STYLE_ID='yaya-marche-eye-color-style';

  function installMarcheEyeStyle(){
    let s=document.getElementById(STYLE_ID);
    if(!s){
      s=document.createElement('style');
      s.id=STYLE_ID;
      document.head.appendChild(s);
    }
    s.textContent=`
      .yaya-detail-markets-pane button::before,
      .yaya-detail-markets-pane button::after,
      [data-section="marche"] button::before,
      [data-section="marche"] button::after{
        content:none!important;
        display:none!important;
      }
    `;
  }

  function forceMarcheEyeColor(){
    installMarcheEyeStyle();
    document.querySelectorAll('.yaya-detail-markets-pane button, [data-section="marche"] button').forEach(function(btn){
      const t=String(btn.title||btn.getAttribute('aria-label')||btn.textContent||'').toLowerCase();
      if(t.includes('voir')||t.includes('œil')||t.includes('oeil')){
        btn.textContent='👁️';
        btn.style.setProperty('font-size','16px','important');
      }
    });
  }

  forceMarcheEyeColor();
  const root=document.getElementById('pane-chantiers')||document.documentElement;
  const obs=new MutationObserver(function(){
    clearTimeout(window.__yayaMarcheEyeTimer);
    window.__yayaMarcheEyeTimer=setTimeout(forceMarcheEyeColor,0);
  });
  obs.observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',forceMarcheEyeColor);
  setTimeout(forceMarcheEyeColor,50);
  setTimeout(forceMarcheEyeColor,250);
  setTimeout(forceMarcheEyeColor,800);
})();

(function(){
  'use strict';

  const STYLE_ID='yaya-native-commande-actions-style';

  function norm(v){
    return String(v||'').trim().toUpperCase();
  }

  function frDate(v){
    const m=String(v||'').slice(0,10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v||'');
  }

  function installStyle(){
    let st=document.getElementById(STYLE_ID);
    if(!st){
      st=document.createElement('style');
      st.id=STYLE_ID;
      document.head.appendChild(st);
    }
    st.textContent=`
      .yaya-commande-actions{
        display:flex!important;
        justify-content:flex-end!important;
        align-items:center!important;
        gap:6px!important;
      }
      .yaya-commande-actions button{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:30px!important;
        height:30px!important;
        min-width:30px!important;
        padding:0!important;
        border-radius:7px!important;
        font-size:15px!important;
      }
      .yaya-detail-commande-view::before,
      .yaya-detail-commande-view::after{
        content:none!important;
        display:none!important;
      }
    `;
  }

  function makeButton(cls,title,text){
    const b=document.createElement('button');
    b.type='button';
    b.className=cls;
    b.title=title;
    b.setAttribute('aria-label',title);
    b.textContent=text;
    return b;
  }

  function restoreNativeCommandeActions(){
    installStyle();
    if(typeof S==='undefined'||!Array.isArray(S.commandes))return;

    document.querySelectorAll('.yaya-detail-commandes-pane .yaya-detail-commande-row').forEach(function(row){
      let actions=row.querySelector('.yaya-commande-actions');
      if(!actions){
        actions=document.createElement('span');
        actions.className='yaya-commande-actions';
        row.appendChild(actions);
      }

      [...row.querySelectorAll(':scope > button')].forEach(function(button){
        actions.appendChild(button);
      });

      if(actions.querySelectorAll(':scope > button').length===3)return;

      const strong=row.querySelector('strong');
      const fournisseur=norm(strong&&strong.childNodes&&strong.childNodes[0] ? strong.childNodes[0].textContent : '');
      const costNode=row.querySelector('.yaya-detail-charge-cost, .yaya-commande-amount');
      const montant=parseFloat(String(costNode&&costNode.textContent||'').replace(/[^\d,.-]/g,'').replace(',','.'))||0;
      const dateNode=row.querySelector('.yaya-history-date, .yaya-commande-date');
      const date=String(dateNode&&dateNode.textContent||'').trim();

      const commande=S.commandes.find(function(c){
        return norm(c.fournisseur)===fournisseur &&
          Number(c.montantHT||0)===montant &&
          frDate(c.date)===date;
      });
      if(!commande)return;

      const lien=String(commande.lien||commande.oneDriveWebUrl||'');
      const id=String(commande.id||'');
      actions.innerHTML='';

      const eye=makeButton('yaya-detail-commande-view','Voir','👁️');
      eye.dataset.lien=lien;
      if(!lien)eye.disabled=true;

      const edit=makeButton('yaya-detail-commande-edit','Modifier','✏️');
      edit.dataset.commandeId=id;

      const del=makeButton('yaya-detail-commande-delete','Supprimer','🗑️');
      del.dataset.commandeId=id;

      actions.append(eye,edit,del);
    });
  }

  restoreNativeCommandeActions();
  const root=document.getElementById('pane-chantiers')||document.documentElement;
  const obs=new MutationObserver(function(){
    clearTimeout(window.__yayaRestoreCommandeActionsTimer);
    window.__yayaRestoreCommandeActionsTimer=setTimeout(restoreNativeCommandeActions,0);
  });
  obs.observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',restoreNativeCommandeActions);
  setTimeout(restoreNativeCommandeActions,50);
  setTimeout(restoreNativeCommandeActions,250);
  setTimeout(restoreNativeCommandeActions,800);
})();

(function(){
  'use strict';
  const STYLE_ID='yaya-commande-actions-position-final';
  let st=document.getElementById(STYLE_ID);
  if(!st){
    st=document.createElement('style');
    st.id=STYLE_ID;
    document.head.appendChild(st);
  }
  st.textContent=`
    .yaya-detail-commande-row{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) 105px 90px 110px!important;
      align-items:center!important;
      gap:12px!important;
    }
    .yaya-detail-commande-row .yaya-commande-actions{
      grid-column:4!important;
      display:flex!important;
      flex-direction:row!important;
      align-items:center!important;
      justify-content:flex-end!important;
      gap:6px!important;
      position:static!important;
      width:110px!important;
      margin:0!important;
      padding:0!important;
    }
    .yaya-detail-commande-row .yaya-commande-actions > button,
    .yaya-detail-commande-row .yaya-detail-charge-edit,
    .yaya-detail-commande-row .yaya-detail-charge-delete,
    .yaya-detail-commande-row .yaya-detail-charge-view{
      position:static!important;
      top:auto!important;
      right:auto!important;
      bottom:auto!important;
      left:auto!important;
      transform:none!important;
      float:none!important;
      margin:0!important;
      flex:0 0 30px!important;
      width:30px!important;
      height:30px!important;
      min-width:30px!important;
      min-height:30px!important;
      padding:0!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
    }
    .yaya-detail-commande-view::before,
    .yaya-detail-commande-view::after{
      content:none!important;
      display:none!important;
    }
  `;
})();
