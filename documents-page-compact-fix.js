(function(){
  'use strict';
  const STYLE_ID='yaya-documents-page-compact-fix';
  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      #pane-documents .card{overflow:hidden!important}
      #pane-documents .achligne.ligR{display:grid!important;grid-template-columns:160px 150px minmax(0,1fr) 90px 44px!important;gap:10px!important;align-items:center!important;width:100%!important;height:50px!important;min-height:50px!important;max-height:50px!important;padding:6px 0!important;overflow:hidden!important;box-sizing:border-box!important}
      #pane-documents .achligne.ligR>*{min-width:0!important;max-width:100%!important;max-height:38px!important;overflow:hidden!important;box-sizing:border-box!important}
      #pane-documents .achligne.ligR .badge{display:block!important;width:100%!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-documents .achligne.ligR .des{display:block!important;width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.2!important;font-size:11.5px!important}
      #pane-documents .achligne.ligR>span:last-child{display:flex!important;justify-content:center!important;align-items:center!important;overflow:visible!important;max-height:none!important}
      @media(max-width:760px){#pane-documents{overflow-x:auto!important}#pane-documents .card{min-width:720px!important}}
    `;
  }
  function docByRow(row){const id=String(row.dataset.id||'');try{if(typeof S!=='undefined'&&S&&Array.isArray(S.documents))return S.documents.find(d=>String(d.id)===id)||null;}catch(e){}return null;}
  function clean(v){return String(v||'').replace(/\s+/g,' ').trim();}
  function formatDate(v){const s=String(v||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s.split('-').reverse().join('/'):(s||'—');}
  function typeOf(d){if(!d)return 'Document';for(const v of [d.typeDocument,d.typeDoc,d.documentType,d.categorie,d.nature,d.type]){const t=clean(v);if(t&&!/^DOCUMENT$/i.test(t))return t;}const src=clean([d.titre,d.sujet,d.intitule].filter(Boolean).join(' | '));if(/\bfiche\s+chantier\b/i.test(src))return 'Fiche chantier';if(/\bcompte\s+rendu\s+chantier\b/i.test(src))return 'Compte rendu chantier';if(/\bpv\s+(?:de\s+)?r[eé]ception\b/i.test(src))return 'PV de réception';return clean(d.type)||'Document';}
  function chantierOf(d){try{if(d&&typeof chantierById==='function'){const c=chantierById(d.chantierId);if(c)return clean(c.nom);}}catch(e){}return clean(d&&d.chantier)||'?';}
  function objetOf(d){if(!d)return '';return clean(d.sujet||d.titre||d.intitule||d.nomFichier||d.fichier||'');}
  function compact(){
    [...document.querySelectorAll('#pane-documents .card .achligne.ligR')].forEach((row,index)=>{
      row.style.display=index<10?'grid':'none';
      const d=docByRow(row);let cells=[...row.children];if(cells.length<5)return;
      const action=cells[cells.length-1];
      const first=cells[0];first.textContent=typeOf(d);first.title=first.textContent;
      while(row.children.length>1)row.removeChild(row.children[1]);
      const chantier=document.createElement('span');chantier.className='badge b-bl';chantier.textContent=chantierOf(d);chantier.title=chantier.textContent;
      const objet=document.createElement('small');objet.className='des';objet.textContent=objetOf(d);objet.title=objet.textContent;
      const date=document.createElement('small');date.textContent=formatDate(d&&d.date);date.style.textAlign='center';
      row.append(chantier,objet,date,action);
    });
  }
  function run(){installStyle();compact();}
  run();setTimeout(run,50);setTimeout(run,250);setTimeout(run,1000);
  const root=document.getElementById('pane-documents')||document.body||document.documentElement;
  new MutationObserver(()=>requestAnimationFrame(compact)).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',compact);
})();
