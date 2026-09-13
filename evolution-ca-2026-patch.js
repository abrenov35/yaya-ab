(function(){
  'use strict';
  const ID='__CA_SIGNE_2026__';
  const MOIS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août'];
  const SHADOW_KEY='YAYA_CA_2026_SHADOW_V1';
  const SHADOW_MS=120000;

  function normaliser(v){
    v=Array.isArray(v)?v:[];
    return Array.from({length:12},(_,i)=>v[i]===null||v[i]===''||v[i]===undefined?null:(Number(v[i])||0));
  }

  function lireShadow(){
    try{
      const raw=localStorage.getItem(SHADOW_KEY);
      if(!raw)return null;
      const x=JSON.parse(raw);
      if(!x||!Array.isArray(x.valeurs)||Number(x.expires||0)<=Date.now()){
        localStorage.removeItem(SHADOW_KEY);
        return null;
      }
      return normaliser(x.valeurs);
    }catch(e){return null;}
  }

  function ecrireShadow(valeurs){
    try{
      localStorage.setItem(SHADOW_KEY,JSON.stringify({
        valeurs:normaliser(valeurs),
        expires:Date.now()+SHADOW_MS
      }));
    }catch(e){}
  }

  function supprimerShadow(){
    try{localStorage.removeItem(SHADOW_KEY);}catch(e){}
  }

  function sauverCache(){
    try{
      if(typeof S!=='undefined'&&S&&typeof S==='object'){
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(S));
        if(window.__yayaCache&&typeof window.__yayaCache.write==='function'){
          window.__yayaCache.write(S,null);
        }
      }
    }catch(e){}
  }

  function lireBrut(){
    const shadow=lireShadow();
    if(shadow)return shadow;
    try{
      const doc=(S.documents||[]).find(d=>String(d.id)===ID);
      if(!doc)return Array(12).fill(null);
      return normaliser(JSON.parse(String(doc.sujet||'[]')));
    }catch(e){return Array(12).fill(null);}
  }

  function reappliquerShadow(){
    const valeurs=lireShadow();
    if(!valeurs)return false;
    try{
      if(!Array.isArray(S.documents))S.documents=[];
      let doc=S.documents.find(d=>String(d.id)===ID);
      if(!doc){
        doc={id:ID,chantierId:'',type:'Divers',titre:'Historique CA signé 2026',sujet:'',date:'2026-01-01',lien:''};
        S.documents.push(doc);
      }
      const sujet=JSON.stringify(valeurs);
      if(String(doc.sujet||'')!==sujet)doc.sujet=sujet;
      return true;
    }catch(e){return false;}
  }

  window.montantsCaManuel2026=function(){
    const v=lireBrut();
    for(let i=0;i<8;i++){
      if(v[i]===null)v[i]=0;
    }
    for(let i=8;i<12;i++)v[i]=null;
    return v;
  };

  window.openCaManuel2026=function(){
    const valeurs=lireBrut();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:430px"><h5>Historique CA signé 2026<button onclick="closeModal()" style="margin-left:8px;padding:6px 14px;border-radius:8px;border:1px solid #ddd;background:#fff">Fermer</button></h5>'
      +'<div class="note" style="margin:10px 0">Janvier à août 2026 sont saisis manuellement. Les chantiers signés sur cette période ne sont pas ajoutés automatiquement.</div>'
      +MOIS.map((m,i)=>'<div class="mrow" style="display:grid;grid-template-columns:105px 1fr;align-items:center"><label style="font-size:12px;font-weight:700">'+m+'</label><input class="mnum" id="ca2026_'+i+'" type="number" min="0" step="0.01" placeholder="Total HT €" value="'+(valeurs[i]===null?'':valeurs[i])+'"></div>').join('')
      +'<div class="mfoot"><button class="btnp go" onclick="saveCaManuel2026()">Enregistrer</button><button class="btn2" onclick="closeModal()">Annuler</button></div></div></div>';
  };

  window.saveCaManuel2026=async function(){
    const valeurs=[];
    for(let i=0;i<8;i++){
      const el=document.getElementById('ca2026_'+i);
      const brut=el?el.value.trim():'';
      if(brut===''){valeurs.push(null);continue;}
      const montant=Number(brut);
      if(!Number.isFinite(montant)||montant<0){toast('Montant incorrect',true);return;}
      valeurs.push(montant);
    }
    while(valeurs.length<12)valeurs.push(null);

    const avant=(S.documents||[]).map(d=>({...d}));
    if(!Array.isArray(S.documents))S.documents=[];
    let doc=S.documents.find(d=>String(d.id)===ID);
    if(!doc){
      doc={id:ID,chantierId:'',type:'Divers',titre:'Historique CA signé 2026',sujet:'',date:'2026-01-01',lien:''};
      S.documents.push(doc);
    }

    doc.sujet=JSON.stringify(valeurs);

    ecrireShadow(valeurs);
    sauverCache();

    closeModal();
    if(typeof renderEvolution==='function')renderEvolution();

    const ok=await apiPost('setDocuments',S.documents);
    if(ok){
      reappliquerShadow();
      sauverCache();
      if(typeof renderEvolution==='function')renderEvolution();
      toast('Historique 2026 enregistré ✓');
    }else{
      S.documents=avant;
      supprimerShadow();
      sauverCache();
      if(typeof renderEvolution==='function')renderEvolution();
    }
  };

  function rafraichir(){
    try{
      if(reappliquerShadow())sauverCache();
      if(typeof anneeEvolution!=='undefined'&&anneeEvolution===2026&&typeof renderEvolution==='function')renderEvolution();
    }catch(e){}
  }

  window.addEventListener('yaya:data-refreshed',rafraichir);
  setTimeout(rafraichir,400);
  setTimeout(rafraichir,1400);
})();

/* Une seule date de signature est utilisée pour le CA : la correction Yaya
   [[YAYA_SIG:AAAA-MM]] est prioritaire sur l'ancienne date venue de l'Extranet. */
(function(){
  'use strict';
  if(window.__yayaEvolutionSignaturePriorityV2)return;

  function install(){
    if(typeof window.renderEvolution!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.renderEvolution.__yayaEvolutionSignaturePriorityV2)return;

    const original=window.renderEvolution;

    function signatureCanonique(c){
      const marker=String(c&&c.notes||'').match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);
      if(marker&&marker[1])return marker[1];
      const direct=String(c&&c.dateSignature||'').trim().match(/^(\d{4}-\d{2})/);
      return direct&&direct[1]?direct[1]:'';
    }

    const wrapped=function(){
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers)){
        return original.apply(this,arguments);
      }

      let year=null;
      try{year=typeof anneeEvolution!=='undefined'?Number(anneeEvolution):null;}catch(e){}

      const all=S.chantiers;
      let calcul=all.map(function(c){
        const copie=Object.assign({},c);
        const sig=signatureCanonique(copie);
        if(sig)copie.dateSignature=sig;
        return copie;
      });

      if(year===2026){
        calcul=calcul.filter(function(c){
          const sig=signatureCanonique(c);
          const m=sig.match(/^(\d{4})-/);
          return !m||Number(m[1])>=2026;
        });
      }

      S.chantiers=calcul;
      try{
        return original.apply(this,arguments);
      }finally{
        S.chantiers=all;
      }
    };

    wrapped.__yayaEvolutionSignaturePriorityV2=true;
    window.renderEvolution=wrapped;
    window.__yayaEvolutionSignaturePriorityV2=true;
  }

  install();
})();

/* V46 — page Évolution en deux écrans : graphique puis chiffres + tableau. */
(function(){
  'use strict';
  if(window.__yayaEvolutionSnapV46Boot)return;
  window.__yayaEvolutionSnapV46Boot=true;

  const STYLE_ID='yaya-evolution-snap-v46';
  let wheelLock=false;
  let resizeTimer=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      @media (min-width:761px){
        #pane-evolution.evo-snap-ready{
          height:var(--evo-snap-height,680px)!important;
          max-height:var(--evo-snap-height,680px)!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
          overscroll-behavior-y:contain;
          scroll-snap-type:y mandatory;
          scroll-behavior:smooth;
          scrollbar-gutter:stable;
        }
        #pane-evolution.evo-snap-ready .evo2-shell{display:block!important;min-height:0!important}
        #pane-evolution.evo-snap-ready .evo2-screen{
          height:var(--evo-snap-height,680px)!important;
          min-height:var(--evo-snap-height,680px)!important;
          max-height:var(--evo-snap-height,680px)!important;
          box-sizing:border-box;
          scroll-snap-align:start;
          scroll-snap-stop:always;
          padding:2px 2px 8px;
          display:grid;
          gap:12px;
          overflow:hidden;
        }
        #pane-evolution.evo-snap-ready .evo2-screen-chart{grid-template-rows:auto minmax(0,1fr)}
        #pane-evolution.evo-snap-ready .evo2-screen-data{grid-template-rows:auto minmax(0,1fr)}
        #pane-evolution.evo-snap-ready .evo2-screen-chart>.evo2-card,
        #pane-evolution.evo-snap-ready .evo2-screen-data>.evo2-card{
          min-height:0!important;
          height:100%!important;
          display:flex!important;
          flex-direction:column!important;
        }
        #pane-evolution.evo-snap-ready .evo2-screen-chart .evo2-chart-scroll{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow-x:auto!important;
          overflow-y:hidden!important;
        }
        #pane-evolution.evo-snap-ready .evo2-screen-chart .evo2-chart{
          height:100%!important;
          min-height:360px!important;
        }
        #pane-evolution.evo-snap-ready .evo2-screen-chart .evo2-card-head,
        #pane-evolution.evo-snap-ready .evo2-screen-chart .evo2-legend{flex:0 0 auto}
        #pane-evolution.evo-snap-ready .evo2-screen-data .evo2-table-head{flex:0 0 auto}
        #pane-evolution.evo-snap-ready .evo2-screen-data .evo2-table-wrap{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow:auto!important;
        }
      }
      @media (max-width:760px){
        #pane-evolution .evo2-screen{display:contents!important}
      }
    `;
    document.head.appendChild(style);
  }

  function viewportHeight(){
    try{return Math.round((window.visualViewport&&window.visualViewport.height)||window.innerHeight||720);}catch(e){return window.innerHeight||720;}
  }

  function sizePane(pane){
    if(!pane||window.innerWidth<=760)return;
    const rect=pane.getBoundingClientRect();
    const top=Math.max(0,Math.round(rect.top));
    const height=Math.max(540,viewportHeight()-top-8);
    pane.style.setProperty('--evo-snap-height',height+'px');
  }

  function arrange(){
    installStyle();
    const pane=document.getElementById('pane-evolution');
    const shell=pane&&pane.querySelector('.evo2-shell');
    if(!pane||!shell)return false;

    sizePane(pane);
    pane.classList.add('evo-snap-ready');

    if(!shell.querySelector(':scope > .evo2-screen')){
      const toolbar=shell.querySelector(':scope > .evo2-toolbar');
      const kpis=shell.querySelector(':scope > .evo2-kpis');
      const cards=Array.from(shell.querySelectorAll(':scope > .evo2-card'));
      const chart=cards.find(function(card){return !!card.querySelector('.evo2-card-title');});
      const table=cards.find(function(card){return !!card.querySelector('.evo2-table-head');});
      if(!toolbar||!kpis||!chart||!table)return false;

      const screen1=document.createElement('section');
      screen1.className='evo2-screen evo2-screen-chart';
      screen1.dataset.evoScreen='1';
      const screen2=document.createElement('section');
      screen2.className='evo2-screen evo2-screen-data';
      screen2.dataset.evoScreen='2';

      screen1.append(toolbar,chart);
      screen2.append(kpis,table);
      shell.append(screen1,screen2);
    }

    if(!pane.dataset.evoSnapWheel){
      pane.dataset.evoSnapWheel='1';
      pane.addEventListener('wheel',function(e){
        if(window.innerWidth<=760||Math.abs(e.deltaY)<8||wheelLock)return;
        const h=parseFloat(getComputedStyle(pane).getPropertyValue('--evo-snap-height'))||pane.clientHeight||1;
        const current=Math.round(pane.scrollTop/h);
        const dir=e.deltaY>0?1:-1;
        const target=Math.max(0,Math.min(1,current+dir));
        if(target===current)return;
        e.preventDefault();
        wheelLock=true;
        pane.scrollTo({top:target*h,behavior:'smooth'});
        setTimeout(function(){wheelLock=false;},520);
      },{passive:false});
    }

    return true;
  }

  function install(){
    if(!window.__yayaEvolutionDashboardV2Installed||typeof window.renderEvolution!=='function'){
      setTimeout(install,120);
      return;
    }

    if(!window.renderEvolution.__yayaSnapV46){
      const original=window.renderEvolution;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        requestAnimationFrame(arrange);
        setTimeout(arrange,80);
        return result;
      };
      wrapped.__yayaSnapV46=true;
      window.renderEvolution=wrapped;
    }

    arrange();
    setTimeout(arrange,160);
  }

  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(function(){
      const pane=document.getElementById('pane-evolution');
      if(pane)sizePane(pane);
    },100);
  },{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener('resize',function(){
    const pane=document.getElementById('pane-evolution');
    if(pane)sizePane(pane);
  },{passive:true});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
