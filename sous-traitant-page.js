(function(){
  'use strict';

  const TAB='sous-traitant';

  function escHtml(v){
    if(typeof window.esc==='function')return window.esc(v==null?'':String(v));
    return String(v==null?'':v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function euro(v){
    if(typeof window.eur==='function')return window.eur(Number(v)||0);
    return Math.round(Number(v)||0).toLocaleString('fr-FR');
  }
  function chantierName(id){
    try{
      if(typeof chantierById==='function'){
        const c=chantierById(id);return c?c.nom:'?';
      }
      const c=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))?S.chantiers.find(x=>String(x.id)===String(id)):null;
      return c?c.nom:'?';
    }catch(e){return '?';}
  }
  function isSousTraitant(a){
    const type=String(a&&a.typeDoc||'').toLowerCase();
    const st=String(a&&a.sousTraitant||'').trim();
    return type.includes('sous-trait')||!!st;
  }
  function parseSortDate(value){
    if(value==null||value==='')return 0;
    if(typeof value==='number'&&Number.isFinite(value))return value;
    const raw=String(value).trim();
    if(!raw)return 0;
    let m=raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if(m)return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();
    m=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if(m)return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();
    const d=new Date(raw);
    return Number.isNaN(d.getTime())?0:d.getTime();
  }
  function sortKey(a){
    const vals=[
      a&&a.dateDepot,a&&a.date_depot,a&&a.horodatageDepot,a&&a.horodatage_depot,
      a&&a.deposeLe,a&&a.depose_le,a&&a.uploadedAt,a&&a.uploaded_at,
      a&&a.createdAt,a&&a.created_at,a&&a.dateCreation,a&&a.date_creation,
      a&&a.horodatage,a&&a.timestamp,a&&a.date
    ];
    for(const v of vals){const t=parseSortDate(v);if(t)return t;}
    return 0;
  }

  function installStyle(){
    if(document.getElementById('yaya-st-page-style-v1'))return;
    const s=document.createElement('style');
    s.id='yaya-st-page-style-v1';
    s.textContent=`
      #pane-${TAB} .st-list{border:0;background:#fff;border-radius:0;box-shadow:none;overflow:hidden}
      #pane-${TAB} .st-row{display:grid;grid-template-columns:120px 140px 130px minmax(220px,1fr) 110px 42px;gap:16px;align-items:center;padding:12px 10px;border-top:1px solid #dce6ef;font-size:12.5px}
      #pane-${TAB} .st-row:first-child{border-top:0}
      #pane-${TAB} .st-type{display:inline-flex;align-items:center;justify-content:flex-start;height:auto;padding:0;border:0;border-radius:0;background:transparent;color:#102a46;font-size:10px;font-weight:800;text-align:left;text-transform:uppercase}
      #pane-${TAB} .st-four{font-weight:800;color:#0e2a49;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #pane-${TAB} .st-chantier{color:#0e2a49;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #pane-${TAB} .st-des{color:#536a82;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #pane-${TAB} .st-montant{font-weight:800;text-align:right;color:#071e39;white-space:nowrap}
      #pane-${TAB} .st-open{width:30px;height:30px;padding:0;border:1px solid #a9c8e8;border-radius:7px;background:#f3f8fd;color:#174d7d;box-shadow:0 1px 3px rgba(22,45,73,.14);font-size:15px;display:inline-flex;align-items:center;justify-content:center}
      #pane-${TAB} .st-empty{padding:24px 16px;background:#fff;border-radius:9px;box-shadow:0 1px 4px rgba(22,45,73,.10);font-size:13px;color:#66788a}
      @media(max-width:760px){
        #pane-${TAB} .st-row{grid-template-columns:90px 1fr 92px 36px;gap:8px;padding:10px 8px}
        #pane-${TAB} .st-chantier{grid-column:2/3}
        #pane-${TAB} .st-des{grid-column:1/4;order:9}
        #pane-${TAB} .st-montant{grid-column:3/4;grid-row:1}
        #pane-${TAB} .st-open{grid-column:4/5;grid-row:1}
      }
    `;
    document.head.appendChild(s);
  }

  function removeHeaderTabs(){
    document.querySelectorAll('.hdr .tabs .tab[data-tab="achats"], .hdr .tabs .tab[data-tab="sous-traitant"], .hdr .tabs .tab[data-tab="documents"], .hdr .tabs .tab[data-tab="mails"], .hdr .tabs .tab[data-tab="mail"]').forEach(b=>b.remove());
  }

  function ensureUi(){
    removeHeaderTabs();

    let pane=document.getElementById('pane-'+TAB);
    if(!pane){
      pane=document.createElement('div');pane.id='pane-'+TAB;pane.style.display='none';
      const achats=document.getElementById('pane-achats');
      if(achats&&achats.parentNode)achats.parentNode.insertBefore(pane,achats.nextSibling);
      else document.querySelector('.body')?.appendChild(pane);
    }
    return pane;
  }

  function renderSousTraitant(){
    const pane=ensureUi();if(!pane)return;
    const achats=(typeof S!=='undefined'&&S&&Array.isArray(S.achats))?S.achats:[];
    const data=achats.filter(isSousTraitant)
      .map((a,i)=>({a,i})).sort((x,y)=>(sortKey(y.a)-sortKey(x.a))||y.i-x.i).slice(0,10).map(x=>x.a);
    if(!data.length){pane.innerHTML='<div class="st-empty">Aucune facture de sous-traitant enregistrée.</div>';return;}
    let html='<div class="st-list">';
    data.forEach(a=>{
      const nom=String(a.sousTraitant||a.fournisseur||'Sous-traitant');
      const type=String(a.typeDoc||'Facture').replace(/facture\s*/i,'').trim()||'FACTURE';
      const lien=String(a.lien||'');
      const voir=lien.startsWith('http')?'<button class="st-open" title="Voir la pièce" onclick="voirPiece(\''+escHtml(lien)+'\')">👁️</button>':'';
      html+='<div class="st-row">'
        +'<span class="st-type">'+escHtml(type)+'</span>'
        +'<span class="st-four">'+escHtml(nom)+'</span>'
        +'<span class="st-chantier">'+escHtml(chantierName(a.chantierId))+'</span>'
        +'<span class="st-des">'+escHtml(a.designation||'')+'</span>'
        +'<span class="st-montant">'+euro(a.montantHT)+' € HT</span>'
        +'<span>'+voir+'</span>'
        +'</div>';
    });
    pane.innerHTML=html+'</div>';
  }

  function sync(){
    const pane=ensureUi();
    let active=false;try{active=String(tab)===TAB;}catch(e){active=String(location.hash||'').replace('#','')===TAB;}
    document.querySelectorAll('.hdr .tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===TAB&&active||b.dataset.tab!==TAB&&b.classList.contains('on')&&!active));
    if(pane)pane.style.display=active?'':'none';
    if(active)renderSousTraitant();
    removeHeaderTabs();
  }

  function install(){
    installStyle();ensureUi();
    const fn=window.render;
    if(typeof fn==='function'&&!fn.__yayaSousTraitantWrapped){
      const wrapped=function(){const r=fn.apply(this,arguments);sync();return r;};
      wrapped.__yayaSousTraitantWrapped=true;window.render=wrapped;
    }
    sync();
    const tabs=document.querySelector('.hdr .tabs');
    if(tabs&&!tabs.__yayaHiddenTabsObserver){
      const observer=new MutationObserver(removeHeaderTabs);
      observer.observe(tabs,{childList:true,subtree:false});
      tabs.__yayaHiddenTabsObserver=observer;
    }
  }

  setTimeout(install,0);
  setTimeout(install,180);

  if(!document.querySelector('script[data-yaya-hours-toolbar-loader]')){
    const h=document.createElement('script');
    h.src='heures-toolbar-move.js?v=hours-toolbar-1';
    h.async=false;
    h.setAttribute('data-yaya-hours-toolbar-loader','1');
    document.head.appendChild(h);
  }

  if(!document.querySelector('script[data-yaya-recent-first-all-loader]')){
    const r=document.createElement('script');
    r.src='recent-first-all.js?v=recent-first-all-2';
    r.async=false;
    r.setAttribute('data-yaya-recent-first-all-loader','1');
    document.head.appendChild(r);
  }

  if(!document.querySelector('script[data-yaya-sous-traitant-detail-recent-loader]')){
    const s=document.createElement('script');
    s.src='sous-traitant-detail-recent.js?v=st-detail-recent-1';
    s.async=false;
    s.setAttribute('data-yaya-sous-traitant-detail-recent-loader','1');
    document.head.appendChild(s);
  }
})();
