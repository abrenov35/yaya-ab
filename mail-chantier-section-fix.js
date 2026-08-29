(function(){
  'use strict';
  const STYLE_ID='yaya-mail-chantier-section-fix-v2';

  function installStyle(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
    s.textContent=`
      #pane-chantiers .message-ligne{
        grid-template-columns:100px minmax(0,1fr) 90px 104px!important;
        align-items:center!important;
        gap:10px!important;
        height:46px!important;
        min-height:46px!important;
        max-height:46px!important;
        padding:5px 0!important;
        overflow:hidden!important;
      }
      #pane-chantiers .message-ligne .message-actions{
        display:grid!important;
        grid-template-columns:28px 28px 28px!important;
        gap:6px!important;
        align-items:center!important;
        justify-content:end!important;
        width:96px!important;
        min-width:96px!important;
        overflow:visible!important;
      }
      #pane-chantiers .message-ligne .message-actions button{
        width:28px!important;min-width:28px!important;max-width:28px!important;
        height:28px!important;min-height:28px!important;max-height:28px!important;
        padding:0!important;margin:0!important;border-radius:7px!important;
        display:inline-flex!important;align-items:center!important;justify-content:center!important;
        font-size:0!important;line-height:1!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;
      }
      #pane-chantiers .message-ligne .message-actions .yaya-mail-view{border:1px solid #a9c8e8!important;background:#f3f8fd!important;color:#174d7d!important}
      #pane-chantiers .message-ligne .message-actions .yaya-mail-edit{border:1px solid #a8d5b5!important;background:#f2faf4!important;color:#26703b!important}
      #pane-chantiers .message-ligne .message-actions .yaya-mail-delete{border:1px solid #e6a7a7!important;background:#fff3f3!important;color:#c83c3c!important}
      #pane-chantiers .message-ligne .message-actions .yaya-mail-view::before{content:'👁'!important;font-size:15px!important}
      #pane-chantiers .message-ligne .message-actions .yaya-mail-edit::before{content:'✏️'!important;font-size:14px!important}
      #pane-chantiers .message-ligne .message-actions .yaya-mail-delete::before{content:'❌'!important;font-size:13px!important}
    `;
  }

  function mailId(row){
    const raw=[...row.querySelectorAll('[onclick]')].map(x=>x.getAttribute('onclick')||'').join(' ');
    const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/);
    return m&&m[1]?String(m[1]):'';
  }

  function rebuildActions(row){
    const actions=row.querySelector('.message-actions');
    if(!actions)return;
    const id=mailId(row);
    if(!id)return;
    actions.innerHTML='';

    const view=document.createElement('button');
    view.type='button';view.className='yaya-mail-view';view.title='Voir le message';view.setAttribute('aria-label','Voir le message');
    view.onclick=function(e){e.preventDefault();e.stopPropagation();if(typeof voirMessageYaya==='function')voirMessageYaya(id);};

    const edit=document.createElement('button');
    edit.type='button';edit.className='yaya-mail-edit';edit.title='Modifier le mail';edit.setAttribute('aria-label','Modifier le mail');
    edit.onclick=function(e){e.preventDefault();e.stopPropagation();if(typeof editDocument==='function')editDocument(id);};

    const del=document.createElement('button');
    del.type='button';del.className='yaya-mail-delete';del.title='Supprimer le mail';del.setAttribute('aria-label','Supprimer le mail');
    del.onclick=function(e){e.preventDefault();e.stopPropagation();if(typeof delDocument==='function')delDocument(id);};

    actions.append(view,edit,del);
  }

  function normalize(){
    document.querySelectorAll('#pane-chantiers .message-ligne').forEach(row=>{
      const card=row.closest('.card');
      if(!card)return;
      row.classList.add('yaya-detail-section-node');
      row.dataset.section='documents';
      const visible=card.dataset.yayaDetailSection==='documents';
      row.style.setProperty('display',visible?'grid':'none','important');
      if(!row.dataset.yayaMailActionsFixed){
        rebuildActions(row);
        row.dataset.yayaMailActionsFixed='1';
      }
    });
  }

  function run(){installStyle();normalize();}
  run();setTimeout(run,50);setTimeout(run,250);setTimeout(run,1000);
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab'))setTimeout(normalize,0);},true);
  new MutationObserver(()=>requestAnimationFrame(normalize)).observe(document.body||document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-yaya-detail-section']});
  window.addEventListener('yaya:data-refreshed',normalize);
})();
