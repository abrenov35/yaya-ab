(function(){
  'use strict';

  if(window.__yayaVisualizationModalCenterV2)return;
  window.__yayaVisualizationModalCenterV2=true;

  const ROOT_ID='modalRoot';
  const STYLE_ID='yaya-visualization-modal-center-v2';
  let raf=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID} .overlay.yaya-view-overlay-centered{display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;overflow:auto!important;overscroll-behavior:contain!important;}
      #${ROOT_ID} .yaya-view-modal-centered{box-sizing:border-box!important;margin:auto!important;}
      #${ROOT_ID} .yaya-view-modal-centered > h5,#${ROOT_ID} .yaya-view-modal-centered .piece-preview-head{position:sticky!important;top:0!important;z-index:50!important;}
      #${ROOT_ID} .yaya-view-modal-centered > .yaya-mail-read-actions.yaya-read-actions-top,#${ROOT_ID} .yaya-view-modal-centered > .yaya-read-actions.yaya-read-actions-top{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:8px 0 14px!important;padding:0 0 12px!important;border-top:0!important;border-bottom:1px solid #dce4ee!important;background:#fff!important;}
      #${ROOT_ID} .yaya-view-modal-centered > .yaya-read-actions.yaya-read-actions-top .yaya-delete,#${ROOT_ID} .yaya-view-modal-centered > .yaya-mail-read-actions.yaya-read-actions-top .yaya-mail-read-delete{margin-right:auto!important;}
    `;
    document.head.appendChild(style);
  }

  function viewport(){const vv=window.visualViewport;return {width:Math.max(320,Math.round((vv&&vv.width)||window.innerWidth||document.documentElement.clientWidth||0)),height:Math.max(320,Math.round((vv&&vv.height)||window.innerHeight||document.documentElement.clientHeight||0))};}
  function safeTop(){let bottom=0;const seen=new Set();['.hdr','.toolbar','.topbar','header','[data-yaya-toolbar]'].forEach(selector=>{document.querySelectorAll(selector).forEach(el=>{if(!el||seen.has(el))return;seen.add(el);const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return;const r=el.getBoundingClientRect();if(r.width<=0||r.height<=0||r.bottom<=0||r.top>24)return;if(selector!=='.hdr'&&cs.position!=='fixed'&&cs.position!=='sticky')return;bottom=Math.max(bottom,Math.ceil(r.bottom));});});return Math.max(0,bottom);}
  function isVisualizationModal(modal){if(!modal)return false;if(modal.classList.contains('piece-preview-modal')||modal.classList.contains('yaya-mail-body-modal')||modal.classList.contains('yaya-document-read-modal')||modal.classList.contains('message-modal'))return true;if(modal.querySelector('.piece-preview-stage,.piece-pdf-pages,.piece-image-stage,.piece-drive-pages-stage'))return true;const hasViewer=!!modal.querySelector('iframe,embed,object,video,img');const hasEditor=!!modal.querySelector('input:not([type="hidden"]),textarea,select');if(hasViewer&&!hasEditor)return true;const title=String(modal.querySelector('h5,h4,h3')?.textContent||'').trim();return /^(aperçu|visualisation|lecture|pi[eè]ce jointe|document|[ée]change chantier)/i.test(title)&&!hasEditor;}
  function moveReadActionsTop(modal){if(!modal)return;const eligible=modal.classList.contains('message-modal')||modal.classList.contains('yaya-mail-body-modal')||modal.classList.contains('yaya-document-read-modal');if(!eligible)return;const head=modal.querySelector(':scope > h5');const bar=modal.querySelector(':scope > .yaya-mail-read-actions,:scope > .yaya-read-actions');if(!head||!bar)return;bar.classList.add('yaya-read-actions-top');if(bar.previousElementSibling!==head)head.insertAdjacentElement('afterend',bar);}
  function applyModal(modal){if(!isVisualizationModal(modal))return;const overlay=modal.closest('.overlay');if(!overlay)return;moveReadActionsTop(modal);const vp=viewport();const top=safeTop();const mobile=vp.width<=640;const gap=mobile?6:12;const side=mobile?5:12;const available=Math.max(260,vp.height-top-(gap*2));overlay.classList.add('yaya-view-overlay-centered');modal.classList.add('yaya-view-modal-centered');overlay.style.setProperty('align-items','center','important');overlay.style.setProperty('justify-content','center','important');overlay.style.setProperty('padding',(top+gap)+'px '+side+'px '+gap+'px','important');overlay.style.setProperty('box-sizing','border-box','important');overlay.style.setProperty('overflow','auto','important');modal.style.setProperty('margin','auto','important');modal.style.setProperty('max-height',available+'px','important');if(modal.classList.contains('piece-preview-modal')){const h=Math.max(260,available-(mobile?4:8));modal.style.setProperty('height',h+'px','important');modal.style.setProperty('max-height',h+'px','important');}else modal.style.setProperty('overflow-y','auto','important');}
  function apply(){const root=document.getElementById(ROOT_ID);if(!root)return;root.querySelectorAll('.overlay .modal').forEach(applyModal);}
  function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}
  function install(){installStyle();const root=document.getElementById(ROOT_ID);if(!root){setTimeout(install,120);return;}new MutationObserver(schedule).observe(root,{childList:true,subtree:true});window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});if(window.visualViewport)window.visualViewport.addEventListener('resize',schedule,{passive:true});schedule();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

(function(){
  'use strict';
  if(window.__yayaVisualizationDeleteLoaderV4)return;
  window.__yayaVisualizationDeleteLoaderV4=true;
  const s=document.createElement('script');
  s.src='visualization-delete-actions.js?v=viewdelete-4';
  s.async=false;
  s.onerror=()=>console.error('Yaya : chargement du bouton Supprimer des visualisations impossible');
  document.head.appendChild(s);
})();

(function(){
  'use strict';
  if(window.__yayaUnifiedModalMetadataLoaderV1)return;
  window.__yayaUnifiedModalMetadataLoaderV1=true;
  const s=document.createElement('script');
  s.src='modal-unified-metadata-actions.js?v=unifiedmeta-1';
  s.async=false;
  s.onerror=()=>console.error('Yaya : chargement des champs Titre / Description impossible');
  document.head.appendChild(s);
})();
