(function(){
  'use strict';
  const STYLE_ID='yaya-documents-page-compact-fix';
  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      #pane-documents .card{overflow:hidden!important;padding:0 16px!important}
      #pane-documents .achligne.ligR{display:grid!important;grid-template-columns:170px 170px minmax(300px,1fr) 100px 42px!important;column-gap:16px!important;align-items:center!important;width:100%!important;height:54px!important;min-height:54px!important;max-height:54px!important;padding:6px 4px!important;overflow:hidden!important;box-sizing:border-box!important;border-bottom:1px solid #d9e2ec!important}
      #pane-documents .achligne.ligR>*{min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin:0!important}
      #pane-documents .achligne.ligR>span:first-child{height:34px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 10px!important;border:1px solid #c9d8e8!important;border-radius:8px!important;background:#fff!important;font-weight:700!important;font-size:11px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-documents .achligne.ligR>span:nth-child(2){display:flex!important;align-items:center!important;height:34px!important;padding:0!important;background:transparent!important;border:0!important;font-weight:700!important;font-size:12px!important;color:#071b38!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-documents .achligne.ligR .des{display:flex!important;align-items:center!important;height:34px!important;width:100%!important;font-size:11.5px!important;color:#7a8798!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.25!important}
      #pane-documents .achligne.ligR>small:nth-child(4){display:flex!important;align-items:center!important;justify-content:center!important;height:34px!important;font-size:10.5px!important;font-weight:600!important;color:#52657a!important;white-space:nowrap!important}
      #pane-documents .achligne.ligR>span:last-child{height:34px!important;display:flex!important;justify-content:center!important;align-items:center!important;overflow:visible!important;max-height:none!important}
      #pane-documents .achligne.ligR>span:last-child button{width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;margin:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
      @media(max-width:760px){#pane-documents{overflow-x:auto!important}#pane-documents .card{min-width:820px!important}}
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
      const chantier=document.createElement('span');chantier.textContent=chantierOf(d);chantier.title=chantier.textContent;
      const objet=document.createElement('small');objet.className='des';objet.textContent=objetOf(d);objet.title=objet.textContent;
      const date=document.createElement('small');date.textContent=formatDate(d&&d.date);date.title=date.textContent;
      row.append(chantier,objet,date,action);
    });
  }
  function run(){installStyle();compact();}
  run();setTimeout(run,50);setTimeout(run,250);setTimeout(run,1000);
  const root=document.getElementById('pane-documents')||document.body||document.documentElement;
  new MutationObserver(()=>requestAnimationFrame(compact)).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',compact);
})();
