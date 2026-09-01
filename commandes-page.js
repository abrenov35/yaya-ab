(function(){
  'use strict';

  const PANE_IDS=[
    'pane-heures','pane-chantiers','pane-achats','pane-documents',
    'pane-equipe','pane-evolution','pane-planning','pane-mails',
    'pane-soustraitant','pane-commandes'
  ];

  function ensureState(){
    try{
      if(typeof S!=='undefined'&&!Array.isArray(S.commandes)) S.commandes=[];
    }catch(e){}
  }

  function escSafe(v){
    try{
      if(typeof esc==='function') return esc(v);
    }catch(e){}
    return String(v==null?'':v)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function eurSafe(v){
    try{
      if(typeof eur==='function') return eur(v);
    }catch(e){}
    const n=Number(v||0);
    return (isFinite(n)?n:0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  function chantierCommande(chantierId){
    try{
      const id=String(chantierId||'');
      const c=((typeof S!=='undefined'&&S.chantiers)||[]).find(function(x){
        return String(x.id||'')===id;
      });
      if(!c) return '—';
      const nom=String(c.nom||'').trim();
      const numero=String(c.numero||'').trim();
      return nom&&numero ? nom+' · '+numero : (nom||numero||'—');
    }catch(e){return '—';}
  }

  function dateCommande(v){
    const s=String(v||'').trim();
    if(!s) return '—';
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[3]+'/'+m[2]+'/'+m[1] : s;
  }

  function lienCommande(c){
    return String((c&&c.lien)||(c&&c.oneDriveWebUrl)||'').trim();
  }

  function installStyle(){
    if(document.getElementById('yaya-commandes-style')) return;
    const style=document.createElement('style');
    style.id='yaya-commandes-style';
    style.textContent=`
      .hdr .tab[data-tab="commandes"]::before{content:"🛒";font-size:12px;margin-right:4px}
      #pane-commandes{color:var(--navy);width:100%;max-width:100%;min-width:0}
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
      @media(max-width:760px){#pane-commandes{overflow-x:auto;-webkit-overflow-scrolling:touch}.commandes-head,.commande-ligne{min-width:760px;grid-template-columns:135px 220px 145px 90px 85px 60px}}
    `;
    document.head.appendChild(style);
  }

  function ensureUi(){
    ensureState();
    installStyle();

    try{
      if(typeof TABS!=='undefined'&&Array.isArray(TABS)&&TABS.indexOf('commandes')===-1){
        const p=TABS.indexOf('achats');
        TABS.splice(p>=0?p+1:TABS.length,0,'commandes');
      }
    }catch(e){}

    const tabs=document.querySelector('.hdr .tabs');
    if(tabs){
      let btn=tabs.querySelector('.tab[data-tab="commandes"]');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.className='tab';
        btn.dataset.tab='commandes';
        btn.textContent='Commandes';
        const achats=tabs.querySelector('.tab[data-tab="achats"]');
        if(achats&&achats.nextSibling) tabs.insertBefore(btn,achats.nextSibling);
        else tabs.appendChild(btn);
      }
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
    const el=ensureUi();
    if(!el) return;
    ensureState();

    const items=((typeof S!=='undefined'&&S.commandes)||[]).slice().sort(function(a,b){
      return String((b&&b.date)||'').localeCompare(String((a&&a.date)||'')) ||
        String((b&&b.id)||'').localeCompare(String((a&&a.id)||''));
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
        +'<span class="commande-four">'+escSafe(c.fournisseur||'—')+'</span>'
        +'<span class="commande-des" title="'+escSafe(c.designation||'')+'">'+escSafe(c.designation||'—')+'</span>'
        +'<span class="commande-chantier">'+escSafe(chantierCommande(c.chantierId))+'</span>'
        +'<span class="commande-montant">'+eurSafe(c.montantHT||0)+' €</span>'
        +'<span class="commande-date">'+escSafe(dateCommande(c.date))+'</span>'
        +'<span class="commande-actions">'+(lien?'<button type="button" class="commande-voir" data-commande-index="'+index+'">VOIR</button>':'')+'</span>'
        +'</div>';
    });

    el.innerHTML=html;
    el.querySelectorAll('.commande-voir').forEach(function(btn){
      btn.addEventListener('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        const c=items[Number(btn.dataset.commandeIndex)];
        const url=lienCommande(c);
        if(!url) return;
        try{
          if(typeof voirPiece==='function') voirPiece(url);
          else window.open(url,'_blank','noopener,noreferrer');
        }catch(e){window.open(url,'_blank','noopener,noreferrer');}
      });
    });
  }

  function activateCommandes(){
    const pane=ensureUi();
    if(!pane) return;

    try{tab='commandes';}catch(e){}

    document.querySelectorAll('.hdr .tab').forEach(function(b){
      b.classList.toggle('on',b.getAttribute('data-tab')==='commandes');
    });

    PANE_IDS.forEach(function(id){
      const p=document.getElementById(id);
      if(p) p.style.display=(id==='pane-commandes'?'':'none');
    });

    renderCommandes();
    pane.style.display='';

    try{
      if(location.hash!=='#commandes') history.replaceState(null,'','#commandes');
    }catch(e){}
  }

  function leaveCommandesIfNeeded(target){
    if(!target) return;
    if(target.matches&&target.matches('.tab[data-tab="commandes"]')) return;
    const pane=document.getElementById('pane-commandes');
    if(pane) pane.style.display='none';
  }

  document.addEventListener('click',function(ev){
    const cmd=ev.target&&ev.target.closest?ev.target.closest('.tab[data-tab="commandes"]'):null;
    if(cmd){
      ev.preventDefault();
      ev.stopPropagation();
      if(typeof ev.stopImmediatePropagation==='function') ev.stopImmediatePropagation();
      activateCommandes();
      return;
    }

    const other=ev.target&&ev.target.closest?ev.target.closest('.hdr .tab[data-tab]'):null;
    if(other) leaveCommandesIfNeeded(other);
  },true);

  const renderOriginal=typeof render==='function'?render:null;
  if(renderOriginal){
    render=function(){
      ensureUi();
      renderOriginal.apply(this,arguments);
      let isCommandes=false;
      try{isCommandes=(tab==='commandes');}catch(e){isCommandes=(location.hash==='#commandes');}
      const pane=document.getElementById('pane-commandes');
      if(isCommandes){
        renderCommandes();
        if(pane) pane.style.display='';
      }else if(pane){
        pane.style.display='none';
      }
    };
  }

  ensureUi();

  if(location.hash==='#commandes'){
    setTimeout(activateCommandes,0);
  }

  const obs=new MutationObserver(function(){ensureUi();});
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
