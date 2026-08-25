(function(){
  'use strict';
  const ID='__CA_SIGNE_2026__';
  const MOIS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet'];

  function lireBrut(){
    try{
      const doc=(S.documents||[]).find(d=>String(d.id)===ID);
      if(!doc)return Array(12).fill(null);
      const v=JSON.parse(String(doc.sujet||'[]'));
      return Array.from({length:12},(_,i)=>v[i]===null||v[i]===''||v[i]===undefined?null:(Number(v[i])||0));
    }catch(e){return Array(12).fill(null);}
  }

  window.montantsCaManuel2026=function(){
    const v=lireBrut();
    for(let i=0;i<7;i++){
      if(v[i]===null)v[i]=0;
    }
    for(let i=7;i<12;i++)v[i]=null;
    return v;
  };

  window.openCaManuel2026=function(){
    const valeurs=lireBrut();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:430px"><h5>Historique CA signé 2026<button onclick="closeModal()" style="margin-left:8px;padding:6px 14px;border-radius:8px;border:1px solid #ddd;background:#fff">Fermer</button></h5>'
      +'<div class="note" style="margin:10px 0">Janvier à juillet 2026 sont saisis manuellement. Les chantiers signés sur cette période ne sont pas ajoutés automatiquement.</div>'
      +MOIS.map((m,i)=>'<div class="mrow" style="display:grid;grid-template-columns:105px 1fr;align-items:center"><label style="font-size:12px;font-weight:700">'+m+'</label><input class="mnum" id="ca2026_'+i+'" type="number" min="0" step="0.01" placeholder="Total HT €" value="'+(valeurs[i]===null?'':valeurs[i])+'"></div>').join('')
      +'<div class="mfoot"><button class="btnp go" onclick="saveCaManuel2026()">Enregistrer</button><button class="btn2" onclick="closeModal()">Annuler</button></div></div></div>';
  };

  window.saveCaManuel2026=async function(){
    const valeurs=[];
    for(let i=0;i<7;i++){
      const el=document.getElementById('ca2026_'+i);
      const brut=el?el.value.trim():'';
      if(brut===''){valeurs.push(null);continue;}
      const montant=Number(brut);
      if(!Number.isFinite(montant)||montant<0){toast('Montant incorrect',true);return;}
      valeurs.push(montant);
    }
    while(valeurs.length<12)valeurs.push(null);
    const avant=(S.documents||[]).map(d=>({...d}));
    let doc=S.documents.find(d=>String(d.id)===ID);
    if(!doc){
      doc={id:ID,chantierId:'',type:'Divers',titre:'Historique CA signé 2026',sujet:'',date:'2026-01-01',lien:''};
      S.documents.push(doc);
    }
    doc.sujet=JSON.stringify(valeurs);
    closeModal();
    if(typeof renderEvolution==='function')renderEvolution();
    if(await apiPost('setDocuments',S.documents))toast('Historique 2026 enregistré ✓');
    else{
      S.documents=avant;
      if(typeof renderEvolution==='function')renderEvolution();
    }
  };

  function rafraichir(){
    try{
      if(typeof anneeEvolution!=='undefined'&&anneeEvolution===2026&&typeof renderEvolution==='function')renderEvolution();
    }catch(e){}
  }
  setTimeout(rafraichir,400);
  setTimeout(rafraichir,1400);
})();
