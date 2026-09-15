(function(){
  'use strict';
  if(window.__yayaDevisNoAmountUiV1)return;
  window.__yayaDevisNoAmountUiV1=true;

  const STYLE_ID='yaya-devis-no-amount-ui-v1';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Marché : le montant des devis n'est plus affiché ni éditable. */
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-cost{
        display:none!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row{
        grid-template-columns:minmax(0,1fr) 46px!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > strong{
        grid-column:1!important;
        cursor:pointer!important;
        border-radius:6px!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > strong:hover{
        opacity:.76!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-document-delete,
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-initial-devis-delete{
        grid-column:2!important;
      }

      /* Modale Modifier le devis : conserve uniquement libellé/description + actions. */
      .yaya-devis-fast-modal .yaya-devis-fast-field:has(#edMt),
      .yaya-devis-fast-modal .yaya-devis-fast-field:has(#eavMt){
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function bindRows(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row').forEach(function(row){
      const title=row.querySelector('strong');
      const edit=row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');
      if(!title||!edit||title.dataset.yayaDevisTitleEditBound==='1')return;
      title.dataset.yayaDevisTitleEditBound='1';
      title.setAttribute('role','button');
      title.setAttribute('tabindex','0');
      title.setAttribute('title','Modifier le libellé du devis');

      function open(event){
        if(event){event.preventDefault();event.stopPropagation();}
        const current=row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');
        if(current)current.click();
      }
      title.addEventListener('click',open);
      title.addEventListener('keydown',function(event){
        if(event.key==='Enter'||event.key===' ')open(event);
      });
    });
  }

  function apply(){ensureStyle();bindRows();}
  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;apply();});
  }

  apply();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
