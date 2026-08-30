(function(){
  'use strict';
  const STYLE_ID='yaya-mail-chantier-section-fix-v10';

  function installStyle(){
    ['yaya-mail-chantier-section-fix-v4','yaya-mail-chantier-section-fix-v5','yaya-mail-chantier-section-fix-v6','yaya-mail-chantier-section-fix-v7','yaya-mail-chantier-section-fix-v8','yaya-mail-chantier-section-fix-v9'].forEach(id=>{const old=document.getElementById(id);if(old)old.remove();});
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
    s.textContent=`
      #pane-chantiers .message-ligne{grid-template-columns:90px max-content minmax(0,1fr) 82px 112px!important;align-items:center!important;column-gap:10px!important;width:100%!important;height:44px!important;min-height:44px!important;max-height:44px!important;padding:5px 8px!important;overflow:visible!important;box-sizing:border-box!important}
      #pane-chantiers .message-ligne>.b-mail{width:90px!important;height:26px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 8px!important;margin:0!important;border:1px solid #e6bfae!important;border-radius:7px!important;background:#fff!important;color:#8a3b12!important;font-size:10.5px!important;font-weight:800!important;white-space:nowrap!important}
      #pane-chantiers .message-ligne>.message-categorie{display:inline-flex!important;width:max-content!important;min-width:0!important;max-width:180px!important;justify-self:start!important;align-self:center!important;height:26px!important;align-items:center!important;justify-content:flex-start!important;padding:0 8px!important;margin:0!important;border:0!important;border-radius:6px!important;background:#f4edf9!important;color:#5f397f!important;font-size:11.5px!important;font-weight:700!important;text-align:left!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;box-shadow:none!important}
      #pane-chantiers .message-ligne>.message-apercu{display:block!important;min-width:0!important;width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-chantiers .message-ligne>.message-date{display:flex!important;align-items:center!important;justify-content:center!important;height:28px!important;margin:0!important;color:#66758a!important;font-size:10px!important;white-space:nowrap!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .message-ligne>.message-actions{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:6px!important;align-items:center!important;justify-content:flex-start!important;width:112px!important;min-width:112px!important;height:32px!important;margin:0!important;overflow:visible!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .message-ligne>.message-actions>button{position:static!important;visibility:visible!important;opacity:1!important;grid-column:auto!important;grid-row:auto!important;flex:0 0 28px!important;width:28px!important;min-width:28px!important;max-width:28px!important;height:28px!important;min-height:28px!important;max-height:28px!important;padding:0!important;margin:0!important;border-radius:7px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;transform:none!important;font-size:0!important;line-height:1!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-view{border:1px solid #a9c8e8!important;background:#f3f8fd!important;color:#174d7d!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-edit{border:1px solid #a8d5b5!important;background:#f2faf4!important;color:#26703b!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-delete{border:1px solid #e6a7a7!important;background:#fff3f3!important;color:#c83c3c!important}
      #pane-chantiers#pane-chantiers .message-ligne>.message-actions>button.btn2.message-view-btn.yaya-mail-view::before{content:'👁️'!important;font-size:14px!important;line-height:1!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-edit::before{content:'✏️'!important;font-size:13px!important}
      #pane-chantiers .message-ligne>.message-actions .yaya-mail-delete::before{content:'❌'!important;font-size:12px!important}
    `;
  }

  function mailId(row){const raw=[...row.querySelectorAll('[onclick]')].map(x=>x.getAttribute('onclick')||'').join(' ');const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/);return m&&m[1]?String(m[1]):'';}
  function mailData(id){try{return typeof S!=='undefined'&&S&&Array.isArray(S.documents)?S.documents.find(d=>String(d.id)===String(id)):null;}catch(e){return null;}}
  function rebuildActions(row,id){const actions=row.querySelector('.message-actions');if(!actions||!id)return;if(row.dataset.yayaMailActionsFixed==='1'&&actions.children.length===3)return;actions.innerHTML='';const make=(cls,title,code)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.title=title;b.setAttribute('aria-label',title);b.setAttribute('onclick',code);return b;};actions.append(make('btn2 message-view-btn yaya-mail-view','Voir le message','voirMessageYaya('+JSON.stringify(id)+')'),make('btn2 yaya-mail-edit','Modifier le mail','editDocument('+JSON.stringify(id)+')'),make('x yaya-mail-delete','Supprimer le mail','delDocument('+JSON.stringify(id)+')'));}
  function activeSection(card){return String(card&&card.dataset&&card.dataset.yayaDetailSection||'');}
  function normalize(){
    document.querySelectorAll('#pane-chantiers .message-ligne').forEach(row=>{
      const card=row.closest('.card');if(!card)return;
      row.classList.add('yaya-detail-section-node');row.dataset.section='documents';
      row.style.setProperty('display',activeSection(card)==='documents'?'grid':'none','important');
      row.style.setProperty('overflow','visible','important');
      const id=mailId(row);const d=mailData(id);const apercu=row.querySelector('.message-apercu');
      if(apercu&&d&&String(d.titre||'').trim()){apercu.textContent=String(d.titre).trim();apercu.title=apercu.textContent;}
      rebuildActions(row,id);row.dataset.yayaMailActionsFixed='1';
    });
  }
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;normalize();});}
  function run(){installStyle();schedule();}
  run();setTimeout(run,300);setTimeout(run,1000);
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab'))setTimeout(schedule,0);},false);
  new MutationObserver(()=>requestAnimationFrame(schedule)).observe(document.body||document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-yaya-detail-section']});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
