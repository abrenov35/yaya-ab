(function(){
  'use strict';

  if(window.__yayaFinanceVisibleDeleteFixV5)return;
  window.__yayaFinanceVisibleDeleteFixV5=true;

  const STYLE_ID='yaya-finance-row-actions-v5';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-charge-delete{display:none!important}
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost{
        cursor:pointer!important;
        text-decoration:underline dotted!important;
        text-underline-offset:3px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function removeRowDeleteButtons(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-charge-delete').forEach(function(btn){
      btn.remove();
    });
  }

  function directText(el){
    if(!el)return '';
    const txt=[...el.childNodes]
      .filter(function(n){return n.nodeType===Node.TEXT_NODE;})
      .map(function(n){return String(n.textContent||'').trim();})
      .filter(Boolean)
      .join(' ')
      .trim();
    return txt||String(el.textContent||'').trim();
  }

  function openMainOeuvreDetail(row){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const name=directText(row.querySelector('strong'))||'Main-d’œuvre';
    const hours=String(row.querySelector('.yaya-detail-charge-hours')?.textContent||'').trim();
    const cost=String(row.querySelector('.yaya-detail-charge-cost')?.textContent||'').trim();
    const date=String(row.querySelector('.yaya-history-date')?.textContent||'').trim();

    root.innerHTML=''
      +'<div class="overlay">'
      +'<div class="modal" style="max-width:460px">'
      +'<h5>Détail de la charge <button type="button" onclick="closeModal()" aria-label="Fermer">Fermer</button></h5>'
      +'<div style="display:grid;gap:10px;margin-top:14px">'
      +'<div><small style="display:block;opacity:.65;margin-bottom:3px">SALARIÉ</small><b>'+name.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</b></div>'
      +'<div><small style="display:block;opacity:.65;margin-bottom:3px">HEURES</small><b>'+hours.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</b></div>'
      +(date?'<div><small style="display:block;opacity:.65;margin-bottom:3px">PÉRIODE</small><b>'+date.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</b></div>':'')
      +'<div><small style="display:block;opacity:.65;margin-bottom:3px">CHARGE VALORISÉE</small><b>'+cost.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</b></div>'
      +'<div style="font-size:12px;color:#64748b;margin-top:4px">Cette charge est calculée à partir des heures saisies. Elle se modifie depuis le module Heures.</div>'
      +'</div>'
      +'<div class="mfoot" style="justify-content:flex-end"><button type="button" class="btnp" onclick="closeModal()">Fermer</button></div>'
      +'</div></div>';
  }

  function openChargeAmount(row){
    if(!row)return;
    const ref=row.querySelector('[data-achat-id]');
    const id=String(ref&&ref.dataset&&ref.dataset.achatId||'').trim();

    if(id&&typeof window.editAchat==='function'){
      window.editAchat(id);
      return;
    }

    openMainOeuvreDetail(row);
  }

  function handleChargeAmount(event){
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost')
      :null;
    if(!amount)return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    openChargeAmount(amount.closest('.yaya-detail-charge-row'));
  }

  function apply(){
    ensureStyle();
    removeRowDeleteButtons();
  }

  window.addEventListener('pointerdown',handleChargeAmount,true);
  apply();

  const root=document.getElementById('pane-chantiers')||document.body;
  let raf=0;
  new MutationObserver(function(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      apply();
    });
  }).observe(root,{childList:true,subtree:true});
})();
