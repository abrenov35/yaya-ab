(function(){
  'use strict';

  const STYLE_ID='yaya-consumables-button-polish-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-stock-action-buttons{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:8px!important;
        width:auto!important;
        margin-left:auto!important;
        flex-wrap:nowrap!important;
      }

      #pane-chantiers .yaya-stock-action-buttons > .yaya-detail-section-action-button{
        margin:0!important;
        flex:0 0 auto!important;
        border-radius:9px!important;
        box-shadow:0 1px 2px rgba(22,45,73,.06)!important;
      }

      #pane-chantiers .yaya-stock-action-buttons > .yaya-stock-expense-button{
        order:2!important;
        min-width:88px!important;
        background:#f2f8f4!important;
        border-color:#bfdac6!important;
        color:#2f6b41!important;
      }

      #pane-chantiers .yaya-stock-action-buttons > .yaya-consumables-button{
        order:3!important;
        min-width:120px!important;
        height:34px!important;
        min-height:34px!important;
        padding:3px 11px!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        gap:1px!important;
        background:#f8fafc!important;
        border-color:#d4dde7!important;
        color:#45566a!important;
        line-height:1.05!important;
      }

      #pane-chantiers .yaya-stock-action-buttons > .yaya-consumables-button:hover{
        background:#f1f5f9!important;
        border-color:#bdc9d6!important;
        color:#26384d!important;
      }

      #pane-chantiers .yaya-consumables-button strong{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:4px!important;
        font-size:10.7px!important;
        line-height:1!important;
        white-space:nowrap!important;
      }

      #pane-chantiers .yaya-consumables-button .yaya-consumables-label{
        font-weight:700!important;
        color:#627184!important;
      }

      #pane-chantiers .yaya-consumables-button .yaya-consumables-amount{
        font-weight:850!important;
        color:#2d3f54!important;
      }

      #pane-chantiers .yaya-consumables-button small{
        margin-top:1px!important;
        font-size:8.9px!important;
        font-weight:650!important;
        line-height:1!important;
        color:#8a96a5!important;
        opacity:1!important;
        white-space:nowrap!important;
      }

      @media(max-width:640px){
        #pane-chantiers .yaya-stock-action-buttons{
          gap:6px!important;
          max-width:100%!important;
        }
        #pane-chantiers .yaya-stock-action-buttons > .yaya-detail-section-action-button{
          padding-left:8px!important;
          padding-right:8px!important;
        }
        #pane-chantiers .yaya-stock-action-buttons > .yaya-stock-expense-button{
          min-width:72px!important;
        }
        #pane-chantiers .yaya-stock-action-buttons > .yaya-consumables-button{
          min-width:104px!important;
          padding-left:7px!important;
          padding-right:7px!important;
        }
        #pane-chantiers .yaya-consumables-button strong{font-size:9.7px!important;gap:3px!important}
        #pane-chantiers .yaya-consumables-button small{font-size:8.4px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function formatButton(button){
    if(!button)return;
    const strong=button.querySelector('strong');
    if(strong&&!strong.querySelector('.yaya-consumables-label')){
      const raw=String(strong.textContent||'').trim();
      const amount=raw.replace(/^Consommables\s*:\s*/i,'').trim();
      strong.innerHTML='<span class="yaya-consumables-label">Consommables</span><span class="yaya-consumables-amount">'+amount+'</span>';
    }
  }

  function polishGroup(group){
    if(!group)return;
    const expense=[...group.children].find(function(el){
      return el.classList&&el.classList.contains('yaya-detail-section-action-button')&&!el.classList.contains('yaya-stock-expense-button')&&!el.classList.contains('yaya-consumables-button');
    });
    const stock=group.querySelector(':scope > .yaya-stock-expense-button');
    const consumables=group.querySelector(':scope > .yaya-consumables-button');

    const wanted=[expense,stock,consumables].filter(Boolean);
    const current=wanted.length?[...group.children].filter(function(el){return wanted.includes(el);}):[];
    const ordered=current.length===wanted.length&&current.every(function(el,index){return el===wanted[index];});

    if(!ordered){
      wanted.forEach(function(el){group.appendChild(el);});
    }
    if(consumables)formatButton(consumables);
  }

  function apply(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-stock-action-buttons').forEach(polishGroup);
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      apply();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
