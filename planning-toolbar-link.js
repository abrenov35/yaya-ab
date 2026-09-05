(function(){
  'use strict';

  const LINK_ID='yayaPlanningToolbarLink';
  const AB_DOCS_ID='yayaAbDocsToolbarLink';
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
      .yaya-signature-selects{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        gap:8px!important;
        width:100%!important;
      }
      .yaya-signature-selects .inp{
        width:100%!important;
        min-width:0!important;
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

  function ensureAbDocsLink(planning){
    if(!planning)return null;

    let link=document.getElementById(AB_DOCS_ID);
    if(!link){
      link=document.createElement('a');
      link.id=AB_DOCS_ID;
      link.className='ab-docs-external-tab';
      link.href='https://abrenov35.github.io/ab-db/';
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.textContent='AB Docs';
      link.setAttribute('aria-label','Ouvrir AB Docs dans un nouvel onglet');
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

  function install(){
    ensureStyle();
    const planning=ensurePlanningLink();
    if(!planning){setTimeout(install,120);return;}
    ensureAbDocsLink(planning);
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

  const SIGNATURE_MONTHS=[
    ['01','Janvier'],['02','Février'],['03','Mars'],['04','Avril'],
    ['05','Mai'],['06','Juin'],['07','Juillet'],['08','Août'],
    ['09','Septembre'],['10','Octobre'],['11','Novembre'],['12','Décembre']
  ];

  function enhanceCreateSignature(){
    const input=document.getElementById('chSignature');
    if(!input||input.dataset.yayaSignatureSelects==='1')return;

    const label=input.closest('label')||input.parentElement;
    if(!label)return;

    input.dataset.yayaSignatureSelects='1';
    const match=String(input.value||'').match(/^(\d{4})-(\d{2})$/);
    const currentYear=new Date().getFullYear();

    input.style.setProperty('display','none','important');
    input.setAttribute('tabindex','-1');

    const help=label.querySelector('span');
    if(help)help.textContent='choisir le mois et l’année';

    const wrap=document.createElement('div');
    wrap.className='yaya-signature-selects';

    const month=document.createElement('select');
    month.id='chSignatureMonth';
    month.className='inp';
    month.setAttribute('aria-label','Mois de signature');
    month.appendChild(new Option('Mois',''));
    SIGNATURE_MONTHS.forEach(function(item){
      month.appendChild(new Option(item[1],item[0]));
    });

    const year=document.createElement('select');
    year.id='chSignatureYear';
    year.className='inp';
    year.setAttribute('aria-label','Année de signature');
    year.appendChild(new Option('Année',''));

    const years=[];
    for(let y=currentYear-2;y<=currentYear+5;y++)years.push(y);
    if(match&&match[1]&&!years.includes(Number(match[1])))years.push(Number(match[1]));
    years.sort(function(a,b){return a-b;});
    years.forEach(function(y){
      year.appendChild(new Option(String(y),String(y)));
    });

    month.value=match?match[2]:'';
    year.value=match?match[1]:String(currentYear);

    function sync(){
      input.value=month.value&&year.value?year.value+'-'+month.value:'';
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }

    month.addEventListener('change',sync);
    year.addEventListener('change',sync);

    try{input.focus=function(){month.focus();};}catch(e){}

    input.insertAdjacentElement('afterend',wrap);
    wrap.appendChild(month);
    wrap.appendChild(year);
  }

  function centerEditModals(){
    enhanceCreateSignature();
    const candidates=document.querySelectorAll('.overlay,.yaya-commande-edit-overlay');
    candidates.forEach(function(overlay){
      const modal=overlay.querySelector('.modal,[role="dialog"]');
      if(!modal)return;

      const title=modal.querySelector('h1,h2,h3,h4,h5,h6');
      const text=String(title?title.textContent:'').replace(/\s+/g,' ').trim();
      const isEdit=/^Modifier\b/i.test(text);
      const isCreate=!!modal.querySelector('#chCreateBtn');
      if(!isEdit&&!isCreate)return;

      overlay.style.setProperty('position','fixed','important');
      overlay.style.setProperty('right','0','important');
      overlay.style.setProperty('bottom','0','important');
      overlay.style.setProperty('left','0','important');
      overlay.style.setProperty('display','flex','important');
      overlay.style.setProperty('align-items','center','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('overflow','auto','important');
      overlay.style.setProperty('z-index','30000','important');

      if(isCreate){
        overlay.style.setProperty('top','54px','important');
        overlay.style.setProperty('padding','12px','important');
      }else{
        overlay.style.setProperty('top','0','important');
        overlay.style.setProperty('padding','16px','important');
      }

      modal.style.setProperty('position','relative','important');
      modal.style.setProperty('top','auto','important');
      modal.style.setProperty('right','auto','important');
      modal.style.setProperty('bottom','auto','important');
      modal.style.setProperty('left','auto','important');
      modal.style.setProperty('transform','none','important');
      modal.style.setProperty('margin','auto','important');
      modal.style.setProperty('max-height',isCreate?'calc(100vh - 78px)':'calc(100vh - 32px)','important');
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

  install();
  keepToolbarLinksInPlace();
  installReloadButtonRemoval();
  installEditModalCentering();
})();

(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-landscape-toolbar-fix]'))return;
  const script=document.createElement('script');
  script.src='landscape-toolbar-phone-fix.js?v=landscape-1';
  script.async=false;
  script.setAttribute('data-yaya-landscape-toolbar-fix','1');
  document.head.appendChild(script);
})();

(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-auto-planning-create]'))return;
  const script=document.createElement('script');
  script.src='chantier-auto-planning-create.js?v=autoplanning-3';
  script.async=false;
  script.setAttribute('data-yaya-auto-planning-create','1');
  document.head.appendChild(script);
})();
