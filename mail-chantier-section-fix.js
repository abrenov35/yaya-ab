(function(){
  'use strict';
  const STYLE_ID='yaya-mail-chantier-section-fix-v4';

  function installStyle(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
    s.textContent=`
      #pane-chantiers .message-ligne{grid-template-columns:90px max-content minmax(0,1fr) 82px 104px!important;align-items:center!important;column-gap:12px!important;width:100%!important;height:44px!important;min-height:44px!important;max-height:44px!important;padding:5px 8px!important;overflow:hidden!important;box-sizing:border-box!important}
      #pane-chantiers .message-ligne>.b-mail{width:90px!important;height:26px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 8px!important;margin:0!important;border:1px solid #e6bfae!important;border-radius:7px!important;background:#fff!important;color:#8a3b12!important;font-size:10.5px!important;font-weight:800!important;white-space:nowrap!important}
      #pane-chantiers .message-ligne>.message-categorie{width:max-content!important;min-width:0!important;max-width:180px!important;height:28px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:0 10px!important;margin:0!important;border:0!important;border-radius:6px!important;background:#f4edf9!important;color:#5f397f!important;font-size:11.5px!important;font-weight:700!important;text-align:center!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;box-shadow:none!important}
      #pane-chantiers .message-ligne>.message-apercu{display:block!important;min-width:0!important;width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-chantiers .message-ligne>.message-date{display:flex!important;align-items:center!important;justify-content:center!important;height:28px!important;margin:0!important;color:#66758a!important;font-size:10px!important;white-space:nowrap!important}
      #pane-chantiers .message-ligne>.message-actions{display:grid!important;grid-template-columns:28px 28px 28px!important;gap:6px!important;align-items:center!important;justify-content:end!important;width:96px!important;min-width:96px!important;height:32px!important;margin:0!important;overflow:visible!important}
      #pane-chantiers .message-ligne>.message-actions button{width:28px!important;min-width:28px!important;max-width:28px!important;height:28px!important;min-height:28px!important;max-height:28px!important;padding:0!important;margin:0!important;border-radius:7px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;font-size:0!important;line-height:1!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-view{grid-column:1!important;border:1px solid #a9c8e8!important;background:#f3f8fd!important;color:#174d7d!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-edit{grid-column:2!important;border:1px solid #a8d5b5!important;background:#f2faf4!important;color:#26703b!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-delete{grid-column:3!important;border:1px solid #e6a7a7!important;background:#fff3f3!important;color:#c83c3c!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-view::before{content:'👁'!important;font-size:14px!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-edit::before{content:'✏️'!important;font-size:13px!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-delete::before{content:'❌'!important;font-size:12px!important}
    `;
  }

  function mailId(row){const raw=[...row.querySelectorAll('[onclick]')].map(x=>x.getAttribute('onclick')||'').join(' ');const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/);return m&&m[1]?String(m[1]):'';}
  function rebuildActions(row){
    const actions=row.querySelector('.message-actions');if(!actions)return;const id=mailId(row);if(!id)return;
    actions.innerHTML='';
    const make=(cls,title,code)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.title=title;b.setAttribute('aria-label',title);b.setAttribute('onclick',code);return b;};
    actions.append(
      make('btn2 message-view-btn yaya-mail-view','Voir le message','voirMessageYaya('+JSON.stringify(id)+')'),
      make('btn2 yaya-mail-edit','Modifier le mail','editDocument('+JSON.stringify(id)+')'),
      make('x yaya-mail-delete','Supprimer le mail','delDocument('+JSON.stringify(id)+')')
    );
  }
  function activeSection(card){return String(card&&card.dataset&&card.dataset.yayaDetailSection||'');}
  function normalize(){
    document.querySelectorAll('#pane-chantiers .message-ligne').forEach(row=>{
      const card=row.closest('.card');if(!card)return;
      row.classList.add('yaya-detail-section-node');row.dataset.section='documents';
      row.style.setProperty('display',activeSection(card)==='documents'?'grid':'none','important');
      rebuildActions(row);
      row.dataset.yayaMailActionsFixed='1';
    });
  }
  function schedule(){normalize();setTimeout(normalize,20);setTimeout(normalize,80);setTimeout(normalize,180);}
  function run(){installStyle();schedule();}
  run();setTimeout(run,300);setTimeout(run,1000);
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab'))setTimeout(schedule,0);},false);
  new MutationObserver(()=>requestAnimationFrame(schedule)).observe(document.body||document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-yaya-detail-section']});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
