(function(){
  'use strict';

  const LINK_ID='yayaPlanningToolbarLink';
  const AB_DOCS_ID='yayaAbDocsToolbarLink';
  const AB_DOCS_VIEW_ID='yayaAbDocsInlineView';
  const STYLE_ID='yaya-planning-toolbar-link-style';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #yayaVersion{display:none!important}
      .planning-external-tab,
      .ab-docs-external-tab{
        position:relative!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:7px!important;
        min-width:140px!important;
        height:42px!important;
        padding:0 16px!important;
        border:1px solid #7d91c7!important;
        border-radius:7px!important;
        background:#294796!important;
        color:#fff!important;
        box-shadow:none!important;
        font-size:13px!important;
        font-weight:700!important;
        line-height:1!important;
        white-space:nowrap!important;
        font-family:inherit!important;
        cursor:pointer!important;
        text-decoration:none!important;
      }
      .ab-docs-external-tab{min-width:112px!important}
      .planning-external-tab:hover,
      .ab-docs-external-tab:hover{background:#3453a2!important}
      .ab-docs-external-tab.is-open{
        background:#C9A227!important;
        border-color:#C9A227!important;
        color:#162D49!important;
      }
      #${AB_DOCS_VIEW_ID}{
        position:fixed!important;
        left:0!important;
        right:0!important;
        bottom:0!important;
        z-index:9000!important;
        background:#fff!important;
        overflow:hidden!important;
      }
      #${AB_DOCS_VIEW_ID}[hidden]{display:none!important}
      #${AB_DOCS_VIEW_ID} iframe{
        display:block!important;
        width:100%!important;
        height:100%!important;
        border:0!important;
        background:#fff!important;
      }
      @media(max-width:1050px){
        .planning-external-tab,
        .ab-docs-external-tab{min-width:auto!important;padding:0 13px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePlanningLink(){
    let link=document.getElementById(LINK_ID);
    if(link)return link;

    const fiche=document.querySelector('.fiche-inter-tab');
    if(!fiche)return null;

    link=document.createElement('a');
    link.id=LINK_ID;
    link.className='planning-external-tab';
    link.href='https://abrenov35.github.io/planning-ab/';
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.textContent='Planning';
    link.setAttribute('aria-label','Ouvrir le planning dans un nouvel onglet');

    fiche.insertAdjacentElement('afterend',link);
    return link;
  }

  function ensureAbDocsView(){
    let view=document.getElementById(AB_DOCS_VIEW_ID);
    if(view)return view;

    view=document.createElement('section');
    view.id=AB_DOCS_VIEW_ID;
    view.hidden=true;
    view.setAttribute('aria-label','AB Docs');

    const frame=document.createElement('iframe');
    frame.title='AB Docs';
    frame.loading='eager';
    frame.src='https://abrenov35.github.io/ab-db/';
    view.appendChild(frame);

    document.body.appendChild(view);
    return view;
  }

  function resizeAbDocsView(){
    const view=document.getElementById(AB_DOCS_VIEW_ID);
    if(!view || view.hidden)return;
    const hdr=document.querySelector('.hdr');
    const top=hdr?Math.max(0,Math.round(hdr.getBoundingClientRect().bottom)):0;
    view.style.setProperty('top',top+'px','important');
  }

  function closeAbDocs(){
    const view=document.getElementById(AB_DOCS_VIEW_ID);
    const btn=document.getElementById(AB_DOCS_ID);
    if(view)view.hidden=true;
    if(btn){
      btn.classList.remove('is-open');
      btn.setAttribute('aria-pressed','false');
    }
  }

  function openAbDocs(){
    const view=ensureAbDocsView();
    const btn=document.getElementById(AB_DOCS_ID);
    view.hidden=false;
    if(btn){
      btn.classList.add('is-open');
      btn.setAttribute('aria-pressed','true');
    }
    resizeAbDocsView();
  }

  function toggleAbDocs(){
    const view=ensureAbDocsView();
    if(view.hidden)openAbDocs();
    else closeAbDocs();
  }

  function ensureAbDocsLink(planning){
    if(!planning)return null;

    let link=document.getElementById(AB_DOCS_ID);
    if(!link){
      link=document.createElement('button');
      link.id=AB_DOCS_ID;
      link.type='button';
      link.className='ab-docs-external-tab';
      link.textContent='AB Docs';
      link.setAttribute('aria-label','Ouvrir AB Docs sous la barre Yaya');
      link.setAttribute('aria-pressed','false');
      link.addEventListener('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        toggleAbDocs();
      });
    }

    const createBtn=document.getElementById('yayaCreateChantierBtn');
    const anchor=createBtn&&createBtn.parentElement===planning.parentElement
      ?createBtn
      :planning;

    if(link.parentElement!==anchor.parentElement || link.previousElementSibling!==anchor){
      anchor.insertAdjacentElement('afterend',link);
    }

    return link;
  }

  function installToolbarCloseBehavior(){
    const hdr=document.querySelector('.hdr');
    if(!hdr){setTimeout(installToolbarCloseBehavior,120);return;}
    if(hdr.dataset.yayaAbDocsCloseBound==='1')return;
    hdr.dataset.yayaAbDocsCloseBound='1';
    hdr.addEventListener('click',function(event){
      const action=event.target&&event.target.closest?event.target.closest('button,a'):null;
      if(!action || action.id===AB_DOCS_ID)return;
      closeAbDocs();
    },true);
  }

  function install(){
    ensureStyle();
    const planning=ensurePlanningLink();
    if(!planning){setTimeout(install,120);return;}
    ensureAbDocsLink(planning);
    ensureAbDocsView();
    installToolbarCloseBehavior();
  }

  function keepToolbarLinksInPlace(){
    if(!document.body){
      setTimeout(keepToolbarLinksInPlace,100);
      return;
    }
    let timer=0;
    const observer=new MutationObserver(function(){
      clearTimeout(timer);
      timer=setTimeout(function(){
        const planning=ensurePlanningLink();
        if(planning)ensureAbDocsLink(planning);
        resizeAbDocsView();
      },0);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function removeReloadButton(){
    document.querySelectorAll('button').forEach(function(button){
      const label=String(button.textContent||'')
        .replace(/[↻⟳⟲]/g,'')
        .replace(/\s+/g,' ')
        .trim()
        .toLowerCase();
      if(label==='recharger')button.remove();
    });
  }

  function installReloadButtonRemoval(){
    removeReloadButton();
    if(!document.body){
      setTimeout(installReloadButtonRemoval,100);
      return;
    }
    const observer=new MutationObserver(removeReloadButton);
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function centerEditModals(){
    const candidates=document.querySelectorAll('.overlay,.yaya-commande-edit-overlay');
    candidates.forEach(function(overlay){
      const modal=overlay.querySelector('.modal,[role="dialog"]');
      if(!modal)return;

      const title=modal.querySelector('h1,h2,h3,h4,h5,h6');
      const text=String(title?title.textContent:'').replace(/\s+/g,' ').trim();
      if(!/^Modifier\b/i.test(text))return;

      overlay.style.setProperty('position','fixed','important');
      overlay.style.setProperty('inset','0','important');
      overlay.style.setProperty('display','flex','important');
      overlay.style.setProperty('align-items','center','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('padding','16px','important');
      overlay.style.setProperty('overflow','auto','important');
      overlay.style.setProperty('z-index','30000','important');

      modal.style.setProperty('position','relative','important');
      modal.style.setProperty('top','auto','important');
      modal.style.setProperty('right','auto','important');
      modal.style.setProperty('bottom','auto','important');
      modal.style.setProperty('left','auto','important');
      modal.style.setProperty('transform','none','important');
      modal.style.setProperty('margin','auto','important');
      modal.style.setProperty('max-height','calc(100vh - 32px)','important');
      modal.style.setProperty('overflow','auto','important');
    });
  }

  function installEditModalCentering(){
    centerEditModals();
    if(!document.body){
      setTimeout(installEditModalCentering,100);
      return;
    }
    const observer=new MutationObserver(centerEditModals);
    observer.observe(document.body,{childList:true,subtree:true});
  }

  window.addEventListener('resize',resizeAbDocsView,{passive:true});
  window.addEventListener('orientationchange',function(){setTimeout(resizeAbDocsView,120);},{passive:true});

  install();
  keepToolbarLinksInPlace();
  installReloadButtonRemoval();
  installEditModalCentering();
})();
