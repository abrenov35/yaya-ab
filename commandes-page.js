(function(){
  'use strict';

  function ensureCommandesState(){
    try{
      if(typeof S!=='undefined'&&!Array.isArray(S.commandes)) S.commandes=[];
    }catch(e){}
  }

  function chantierCommande(chantierId){
    try{
      const id=String(chantierId||'');
      const c=(S.chantiers||[]).find(function(x){return String(x.id||'')===id;});
      if(!c) return '—';
      const nom=String(c.nom||'').trim();
      const numero=String(c.numero||'').trim();
      if(nom&&numero) return nom+' · '+numero;
      return nom||numero||'—';
    }catch(e){return '—';}
  }

  function dateCommande(v){
    const s=String(v||'').trim();
    if(!s) return '—';
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? (m[3]+'/'+m[2]+'/'+m[1]) : s;
  }

  function lienCommande(c){
    return String((c&&c.lien)||(c&&c.oneDriveWebUrl)||'').trim();
  }

  function ensureCommandesStyle(){
    if(document.getElementById('yaya-commandes-style')) return;
    const style=document.createElement('style');
    style.id='yaya-commandes-style';
    style.textContent=`
      .hdr .tab[data-tab="commandes"]::before{content:"🛒";font-size:12px}
      #pane-commandes{color:var(--navy)}
      .commandes-head{display:grid;grid-template-columns:minmax(135px,1fr) minmax(220px,2fr) minmax(145px,1.25fr) 95px 88px 64px;gap:10px;align-items:center;padding:7px 10px;border-bottom:1px solid rgba(22,45,73,.12);font-size:10px;text-transform:uppercase;letter-spacing:.07em;opacity:.6;font-weight:700}
      .commande-ligne{display:grid;grid-template-columns:minmax(135px,1fr) minmax(220px,2fr) minmax(145px,1.25fr) 95px 88px 64px;gap:10px;align-items:center;padding:9px 10px;border-bottom:1px solid rgba(22,45,73,.08);font-size:12.5px;background:#fff}
      .commande-ligne:hover{background:#fafafa}
      .commande-four{font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .commande-des{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#4b5563}
      .commande-chantier{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px}
      .commande-montant{text-align:right;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
      .commande-date{font-size:11px;color:#8a8f98;white-space:nowrap;text-align:right}
      .commande-actions{text-align:right}
      .commande-voir{font-size:10.5px;font-weight:700;padding:2px 9px;border-radius:12px;border:1px solid rgba(201,162,39,.55);background:rgba(201,162,39,.14);color:#7d630e;cursor:pointer;white-space:nowrap}
      .commande-vide{padding:22px 10px;color:#7b8190;font-size:13px}
      @media(max-width:760px){
        #pane-commandes{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .commandes-head,.commande-ligne{min-width:760px;grid-template-columns:135px 220px 145px 90px 85px 60px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCommandesUi(){
    ensureCommandesState();
    ensureCommandesStyle();

    try{
      if(typeof TABS!=='undefined'&&Array.isArray(TABS)&&TABS.indexOf('commandes')===-1){
        const pos=TABS.indexOf('achats');
        TABS.splice(pos>=0?pos+1:TABS.length,0,'commandes');
      }
    }catch(e){}

    const tabs=document.querySelector('.hdr .tabs');
    if(tabs){
      let btn=tabs.querySelector('.tab[data-tab="commandes"]');
      if(!btn){
        btn=document.createElement('button');
        btn.className='tab';
        btn.dataset.tab='commandes';
        btn.textContent='Commandes';
        const achats=tabs.querySelector('.tab[data-tab="achats"]');
        if(achats&&achats.nextSibling) tabs.insertBefore(btn,achats.nextSibling);
        else if(achats) tabs.appendChild(btn);
        else tabs.appendChild(btn);
      }
      btn.onclick=function(){
        try{tab='commandes';}catch(e){}
        location.hash='commandes';
        if(typeof render==='function') render();
      };
    }

    let pane=document.getElementById('pane-commandes');
    if(!pane){
      pane=document.createElement('div');
      pane.id='pane-commandes';
      pane.style.display='none';
      const achats=document.getElementById('pane-achats');
      if(achats&&achats.parentNode){
        if(achats.nextSibling) achats.parentNode.insertBefore(pane,achats.nextSibling);
        else achats.parentNode.appendChild(pane);
      }else{
        const body=document.querySelector('.body');
        if(body) body.appendChild(pane);
      }
    }
    return pane;
  }

  function renderCommandes(){
    const el=ensureCommandesUi();
    if(!el) return;
    ensureCommandesState();

    const items=(S.commandes||[]).slice().sort(function(a,b){
      const db=String((b&&b.date)||'');
      const da=String((a&&a.date)||'');
      return db.localeCompare(da)||String((b&&b.id)||'').localeCompare(String((a&&a.id)||''));
    });

    let html='<div class="section-header"><span>Commandes</span><span style="font-size:11px;font-weight:500;opacity:.65">'+items.length+' enregistrée'+(items.length>1?'s':'')+'</span></div>';

    if(!items.length){
      html+='<div class="commande-vide">Aucune commande enregistrée.</div>';
      el.innerHTML=html;
      return;
    }

    html+='<div class="commandes-head"><span>Fournisseur</span><span>Description</span><span>Chantier</span><span style="text-align:right">Montant HT</span><span style="text-align:right">Date</span><span></span></div>';

    items.forEach(function(c,index){
      const lien=lienCommande(c);
      html+='<div class="commande-ligne">'
        +'<span class="commande-four">'+esc(c.fournisseur||'—')+'</span>'
        +'<span class="commande-des" title="'+esc(c.designation||'')+'">'+esc(c.designation||'—')+'</span>'
        +'<span class="commande-chantier">'+esc(chantierCommande(c.chantierId))+'</span>'
        +'<span class="commande-montant">'+eur(c.montantHT||0)+' €</span>'
        +'<span class="commande-date">'+esc(dateCommande(c.date))+'</span>'
        +'<span class="commande-actions">'+(lien?'<button class="commande-voir" data-commande-index="'+index+'">VOIR</button>':'')+'</span>'
        +'</div>';
    });

    el.innerHTML=html;
    el.querySelectorAll('.commande-voir').forEach(function(btn){
      btn.onclick=function(){
        const i=Number(btn.dataset.commandeIndex);
        const c=items[i];
        const url=lienCommande(c);
        if(!url) return;
        try{
          if(typeof voirPiece==='function') voirPiece(url);
          else window.open(url,'_blank','noopener,noreferrer');
        }catch(e){window.open(url,'_blank','noopener,noreferrer');}
      };
    });
  }

  const renderOriginal=typeof render==='function'?render:null;
  if(renderOriginal){
    render=function(){
      ensureCommandesUi();
      renderOriginal.apply(this,arguments);
      const pane=document.getElementById('pane-commandes');
      if(pane) pane.style.display=(tab==='commandes'?'':'none');
      if(tab==='commandes') renderCommandes();
    };
  }

  ensureCommandesUi();
  if(location.hash.slice(1)==='commandes'){
    try{tab='commandes';}catch(e){}
  }
  if(typeof render==='function') render();
})();
