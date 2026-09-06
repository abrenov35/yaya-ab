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

    /*
      Protection contre une lecture réseau déjà lancée avant l'enregistrement.
      Sans cela, l'ancien snapshot pouvait être réappliqué juste après fermeture
      de la modale et donner l'impression que la modification s'annulait.
    */
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
