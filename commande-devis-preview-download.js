(function(){
  'use strict';
  if(window.__yayaCommandeDevisPreviewDownloadV3)return;
  window.__yayaCommandeDevisPreviewDownloadV3=true;

  const STYLE_ID='yaya-commande-devis-preview-download-v3';
  const OBS_FLAG='__yayaCommandeDevisPreviewDownloadObservedV3';
  const FRAME_FLAG='__yayaCommandeDevisPreviewDownloadFrameV3';
  const TITLE_RE=/^(?:visualisation\s+des\s+pi[eè]ces|pi[eè]ces\s+de\s+la\s+commande|devis\s+du\s+chantier)$/i;

  function txt(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function label(el){return txt((el&&el.textContent||'')+' '+(el&&el.getAttribute&&el.getAttribute('aria-label')||''));}
  function isClose(el){return /^(?:fermer|×|✕)(?:\s|$)/i.test(label(el))||/fermer/i.test(String(el&&el.getAttribute&&el.getAttribute('aria-label')||''));}

  function installStyle(doc){
    if(!doc||doc.getElementById(STYLE_ID))return;
    const s=doc.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .yaya-preview-download-top{
        flex:0 0 auto!important;min-height:36px!important;height:36px!important;padding:0 14px!important;margin:0!important;
        border:1px solid #249457!important;border-radius:8px!important;background:#249457!important;color:#fff!important;
        font:800 12.5px/1 system-ui,-apple-system,Segoe UI,sans-serif!important;display:inline-flex!important;align-items:center!important;
        justify-content:center!important;white-space:nowrap!important;cursor:pointer!important;box-sizing:border-box!important
      }
      .yaya-preview-download-top:disabled{display:none!important}
      #yayaCmdPreviewModalV2 .ycp-head,#yayaDevisViewer .ydd-head,.yaya-download-target-head{
        display:flex!important;align-items:center!important;gap:8px!important
      }
      #yayaCmdPreviewModalV2 .ycp-head>strong:first-child,#yayaDevisViewer .ydd-head>:first-child,.yaya-download-target-head>:first-child{
        margin-right:auto!important;min-width:0!important
      }
      @media(max-width:640px){.yaya-preview-download-top{min-height:34px!important;height:34px!important;padding:0 10px!important;font-size:11px!important}}
    `;
    (doc.head||doc.documentElement).appendChild(s);
  }

  function driveId(url){
    const s=String(url||'');
    let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);if(m&&m[1])return m[1];
    m=s.match(/[?&]id=([^&#]+)/i);return m&&m[1]?decodeURIComponent(m[1]):'';
  }
  function isClearImage(url){return /\.(?:jpe?g|png|webp|gif|bmp|svg|heic|heif|tiff?)(?:[?#]|$)/i.test(String(url||''));}
  function toDownloadUrl(url){
    url=txt(url);if(!url)return '';
    if(/^blob:/i.test(url))return url;
    const id=driveId(url);
    if(id)return 'https://drive.usercontent.google.com/download?id='+encodeURIComponent(id)+'&export=download&confirm=t';
    try{
      const u=new URL(url);
      if(/(?:^|\.)dropbox\.com$/i.test(u.hostname)){u.searchParams.delete('raw');u.searchParams.set('dl','1');return u.toString();}
      if(/(?:1drv\.ms|onedrive\.live\.com|sharepoint\.com)$/i.test(u.hostname)){u.searchParams.set('download','1');return u.toString();}
    }catch(e){}
    return url;
  }
  function visible(el){
    if(!el)return false;
    try{const cs=el.ownerDocument.defaultView.getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)!==0;}catch(e){return true;}
  }

  function sourceFrom(container){
    if(!container)return '';
    const lower=container.querySelector('.ydd-download[href],a[data-download][href],a[download][href]');
    if(lower&&visible(lower))return txt(lower.href||lower.getAttribute('href'));
    const tagged=[container.dataset&&container.dataset.yayaDownloadUrl,container.dataset&&container.dataset.url,container.dataset&&container.dataset.lien].map(txt).find(Boolean);
    if(tagged)return tagged;
    const viewers=[...container.querySelectorAll('iframe[src],embed[src],object[data]')].filter(visible);
    for(const el of viewers){const u=txt(el.getAttribute('src')||el.getAttribute('data')||el.src||'');if(u&&u!=='about:blank')return u;}
    const active=container.querySelector('.active,.selected,.on,[aria-selected="true"]');
    if(active){
      for(const a of ['data-url','data-lien','data-src','data-file-url','data-piece-url','href']){
        const u=txt(active.getAttribute&&active.getAttribute(a));if(/^https?:|^blob:/i.test(u))return u;
      }
      const raw=txt(active.getAttribute&&active.getAttribute('onclick'));
      const m=raw.match(/(?:voirPiece|window\.open)\s*\(\s*['\"]([^'\"]+)/i)||raw.match(/['\"](https?:\/\/[^'\"]+)/i);
      if(m&&m[1])return m[1];
    }
    for(const a of [...container.querySelectorAll('a[href]')].filter(visible)){
      const u=txt(a.href||a.getAttribute('href'));if(/^https?:|^blob:/i.test(u))return u;
    }
    return '';
  }

  function titleElement(container){
    if(!container)return null;
    if(container.id==='yayaCmdPreviewModalV2')return container.querySelector('.ycp-head strong');
    if(container.id==='yayaDevisViewer')return container.querySelector('.ydd-head strong,.ydd-head h2,.ydd-head h3,.ydd-head h4,.ydd-head h5');
    return [...container.querySelectorAll('h2,h3,h4,h5,strong')].find(el=>TITLE_RE.test(txt(el.textContent)))||null;
  }
  function titleOf(container){const el=titleElement(container);return txt(el&&el.textContent);}
  function isTarget(container){
    if(!container)return false;
    // Le visualiseur unifié gère lui-même son bouton Télécharger.
    // Ne pas le retirer de la fenêtre photo (ni de ses autres onglets).
    if(container.id==='yayaUnifiedV4Viewer'||container.closest('#yayaUnifiedV4Viewer'))return false;
    return container.id==='yayaCmdPreviewModalV2'||container.id==='yayaDevisViewer'||TITLE_RE.test(titleOf(container));
  }

  function headFor(container){
    if(!container)return null;
    if(container.id==='yayaCmdPreviewModalV2')return container.querySelector('.ycp-head');
    if(container.id==='yayaDevisViewer')return container.querySelector('.ydd-head');
    const title=titleElement(container);if(!title)return null;
    if([...title.querySelectorAll(':scope > button,:scope > a')].some(isClose))return title;
    let node=title.parentElement;
    while(node){
      if([...node.querySelectorAll(':scope > button,:scope > a')].some(isClose))return node;
      if(node===container)break;
      node=node.parentElement;
    }
    return title.closest('.head,.header,[class*="head"],[class*="header"]')||title.parentElement||title;
  }

  function addButton(container){
    if(!isTarget(container))return;
    const head=headFor(container);if(!head)return;
    head.classList.add('yaya-download-target-head');

    let source=sourceFrom(container);
    if(!source&&container.id==='yayaDevisViewer')source=txt(window.__yayaLastPieceUrl||'');
    const ok=!!source&&!isClearImage(source);

    let btn=head.querySelector('.yaya-preview-download-top');
    if(!btn){
      btn=head.ownerDocument.createElement('button');
      btn.type='button';btn.className='yaya-preview-download-top';btn.textContent='Télécharger';
      btn.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        const u=txt(btn.dataset.url);if(!u)return;
        const d=head.ownerDocument,a=d.createElement('a');
        a.href=u;a.target='_blank';a.rel='noopener';a.download='';(d.body||d.documentElement).appendChild(a);a.click();a.remove();
      });
    }
    [...head.querySelectorAll('button,a')].forEach(function(el){
      if(el!==btn&&/^t[eé]l[eé]charger$/i.test(txt(el.textContent)))el.remove();
    });
    if(!ok){btn.disabled=true;btn.dataset.url='';return;}
    btn.disabled=false;btn.dataset.url=toDownloadUrl(source);

    const actions=head.querySelector(':scope > .ydd-actions');
    if(actions){
      if(btn.parentElement!==actions)actions.appendChild(btn);
      const close=[...actions.querySelectorAll('button,a')].find(isClose)||null;
      if(close&&btn.nextElementSibling!==close)actions.insertBefore(btn,close);
      else if(!close&&actions.lastElementChild!==btn)actions.appendChild(btn);
      return;
    }
    const close=[...head.querySelectorAll('button,a')].find(isClose)||null;
    if(btn.parentElement!==head){if(close)head.insertBefore(btn,close);else head.appendChild(btn);}
    else if(close&&btn.nextElementSibling!==close)head.insertBefore(btn,close);
  }

  function candidates(doc){
    const out=[];
    ['#yayaCmdPreviewModalV2','#yayaDevisViewer','#modalRoot .modal','[role="dialog"]'].forEach(sel=>{
      doc.querySelectorAll(sel).forEach(el=>{if(!out.includes(el)&&isTarget(el))out.push(el);});
    });
    return out;
  }
  function applyDoc(doc){
    if(!doc)return;installStyle(doc);candidates(doc).forEach(addButton);doc.querySelectorAll('iframe').forEach(watchFrame);
  }
  function watchDoc(doc){
    if(!doc||doc[OBS_FLAG])return;doc[OBS_FLAG]=true;applyDoc(doc);
    let raf=0;
    const schedule=function(){if(raf)return;raf=doc.defaultView.requestAnimationFrame(function(){raf=0;applyDoc(doc);});};
    new MutationObserver(schedule).observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','class','aria-selected','data-url','data-lien']});
    doc.addEventListener('click',function(){setTimeout(schedule,0);setTimeout(schedule,80);},true);
  }
  function watchFrame(frame){
    if(!frame||frame[FRAME_FLAG])return;frame[FRAME_FLAG]=true;
    const bind=function(){try{const d=frame.contentDocument;if(d&&d.documentElement)watchDoc(d);}catch(e){}};
    frame.addEventListener('load',bind,{passive:true});bind();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){watchDoc(document);},{once:true});
  else watchDoc(document);
})();
