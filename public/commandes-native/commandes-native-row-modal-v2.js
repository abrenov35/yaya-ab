(function(){
'use strict';
if(window.__YAYA_CMD_ROW_MODAL_V2)return;
window.__YAYA_CMD_ROW_MODAL_V2=true;

const STYLE_ID='yaya-cmd-row-modal-v2-style';
const PREVIEW_ID='yayaCmdPreviewModalV2';

function injectStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    .yaya-cmd-native-root .ycn-row{cursor:pointer}
    .yaya-cmd-native-root .ycn-row:hover{background:#f8fbfe;border-color:#b9c9da}
    .yaya-cmd-native-root .ycn-row-detail,
    .yaya-cmd-native-root .ycn-row.open .ycn-row-detail{display:none!important}
    .yaya-cmd-native-root .ycn-row-toggle{display:none!important}
    .yaya-cmd-native-root .ycn-row-top{
      display:grid!important;
      grid-template-columns:minmax(220px,1.7fr) minmax(180px,1.25fr) minmax(170px,.8fr) auto auto!important;
      gap:10px!important;
      align-items:center!important;
      padding:8px 12px!important;
      cursor:pointer
    }
    .yaya-cmd-native-root .ycn-row-summary{display:contents!important}
    .yaya-cmd-native-root .ycn-row-summary .ycn-qte,
    .yaya-cmd-native-root .ycn-row-summary .ycn-resp{display:none!important}
    .yaya-cmd-native-root .ycn-row-summary strong,
    .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .yaya-cmd-native-root .ycn-line-status{width:100%;min-width:0;height:34px;border:1px solid #cfd9e6;border-radius:8px;background:#fff;color:#203c5a;padding:0 9px;font:inherit;font-size:11.5px;font-weight:800;cursor:pointer}
    .yaya-cmd-native-root .ycn-line-docs,
    .yaya-cmd-native-root .ycn-line-url{height:34px;border:1px solid #cfd9e6;background:#fff;color:#1f5f9f;border-radius:8px;padding:0 11px;font:inherit;font-size:11px;font-weight:850;cursor:pointer;white-space:nowrap}
    .yaya-cmd-native-root .ycn-line-docs.has{background:#edf7ff;border-color:#bfdcf7}
    .yaya-cmd-native-root .ycn-line-url{color:#335a7d}
    .yaya-cmd-native-root .ycn-line-url:disabled{opacity:.38;cursor:default}

    #${PREVIEW_ID}{position:fixed;inset:0;z-index:32000;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(12,27,47,.58)}
    #${PREVIEW_ID} .ycp-card{width:min(1120px,calc(100vw - 24px));height:min(88vh,820px);display:grid;grid-template-rows:auto auto minmax(0,1fr);background:#fff;border-radius:14px;box-shadow:0 28px 90px rgba(8,25,46,.34);overflow:hidden}
    #${PREVIEW_ID} .ycp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid #dfe6ee;color:#162d49}
    #${PREVIEW_ID} .ycp-head strong{font-size:15px}
    #${PREVIEW_ID} .ycp-close{border:1px solid #cfd9e6;border-radius:8px;background:#fff;color:#334155;min-height:34px;padding:0 12px;font-weight:800;cursor:pointer}
    #${PREVIEW_ID} .ycp-tabs{display:flex;gap:7px;align-items:center;overflow-x:auto;padding:9px 12px;border-bottom:1px solid #e6ebf1;background:#f8fafc}
    #${PREVIEW_ID} .ycp-doc{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto}
    #${PREVIEW_ID} .ycp-view,#${PREVIEW_ID} .ycp-del{min-height:32px;border-radius:7px;font:inherit;font-size:11px;font-weight:800;cursor:pointer}
    #${PREVIEW_ID} .ycp-view{border:1px solid #c8d8e8;background:#fff;color:#205f9d;padding:0 10px}
    #${PREVIEW_ID} .ycp-view.on{background:#eaf4ff;border-color:#9fc8ef}
    #${PREVIEW_ID} .ycp-del{width:32px;border:1px solid #efc3c3;background:#fff5f5;color:#b42318}
    #${PREVIEW_ID} .ycp-stage{min-height:0;background:#eef2f6;position:relative}
    #${PREVIEW_ID} iframe{display:block;width:100%;height:100%;border:0;background:#fff}
    #${PREVIEW_ID} .ycp-empty{height:100%;display:flex;align-items:center;justify-content:center;color:#708095;font-size:13px;font-weight:700}
    @media(max-width:850px){
      .yaya-cmd-native-root .ycn-row-top{grid-template-columns:minmax(160px,1.4fr) minmax(130px,1fr) minmax(140px,.9fr) auto auto!important}
    }
    @media(max-width:640px){
      .yaya-cmd-native-root .ycn-row-top{grid-template-columns:minmax(0,1fr) minmax(125px,.9fr) auto!important}
      .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:none!important}
      .yaya-cmd-native-root .ycn-line-url{display:none!important}
      #${PREVIEW_ID}{padding:4px}
      #${PREVIEW_ID} .ycp-card{width:calc(100vw - 8px);height:calc(100dvh - 8px);border-radius:9px}
    }
  `;
  document.head.appendChild(s);
}

function detailSelect(row){return row.querySelector('.ycn-row-detail [data-ycn-status]');}
function detailDocsButton(row){return row.querySelector('.ycn-row-detail [data-ycn-doc]');}
function docCount(row){
  const box=[...row.querySelectorAll('.ycn-row-detail .ycn-box')].find(x=>/pi[eè]ces jointes/i.test(String(x.querySelector('small')?.textContent||'')));
  const n=Number(String(box?.querySelector('strong,span')?.textContent||'0').replace(/\D+/g,''));
  return Number.isFinite(n)?n:0;
}
function iframeUrl(url){
  url=String(url||'').trim();
  if(!url)return '';
  const d=url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if(d)return 'https://drive.google.com/file/d/'+encodeURIComponent(d[1])+'/preview';
  try{
    const u=new URL(url);
    if(/dropbox\.com$/i.test(u.hostname)||/\.dropbox\.com$/i.test(u.hostname)){u.searchParams.delete('dl');u.searchParams.set('raw','1');return u.toString();}
  }catch(_){ }
  return url;
}

function openDefaultDocs(row){
  const btn=detailDocsButton(row);
  if(!btn)return {modal:null,items:[]};
  btn.click();
  const modal=document.getElementById('ycnDocModal');
  if(!modal)return {modal:null,items:[]};
  modal.style.setProperty('visibility','hidden','important');
  modal.style.setProperty('pointer-events','none','important');
  const items=[...modal.querySelectorAll('#ycnDocList .ycn-doc-item')].map((el,i)=>{
    const links=[...el.querySelectorAll('a[href]')];
    const url=String(links[0]?.href||'').trim();
    const name=String(links[0]?.textContent||('Pièce '+(i+1))).trim();
    const del=el.querySelector('[data-ycn-doc-del]');
    return {el,url,name,del};
  }).filter(x=>x.url);
  return {modal,items};
}
function closeDefaultDocs(modal){
  if(!modal)return;
  modal.style.removeProperty('visibility');
  modal.style.removeProperty('pointer-events');
  const close=modal.querySelector('[data-ycn-close="doc"]');
  if(close)close.click();else modal.classList.remove('show');
}

function closePreview(){
  const old=document.getElementById(PREVIEW_ID);
  if(!old)return;
  const defaultModal=old.__defaultModal;
  old.remove();
  closeDefaultDocs(defaultModal);
}
function renderPreview(row,initialIndex=0){
  closePreview();
  const data=openDefaultDocs(row);
  const items=data.items;
  const overlay=document.createElement('div');
  overlay.id=PREVIEW_ID;
  overlay.__defaultModal=data.modal;
  overlay.innerHTML=`<div class="ycp-card" role="dialog" aria-modal="true"><div class="ycp-head"><strong>Pièces de la commande</strong><button type="button" class="ycp-close">Fermer</button></div><div class="ycp-tabs"></div><div class="ycp-stage"></div></div>`;
  const tabs=overlay.querySelector('.ycp-tabs');
  const stage=overlay.querySelector('.ycp-stage');
  let active=Math.max(0,Math.min(initialIndex,Math.max(0,items.length-1)));

  function show(i){
    active=i;
    tabs.querySelectorAll('.ycp-view').forEach((b,j)=>b.classList.toggle('on',j===i));
    const item=items[i];
    stage.replaceChildren();
    if(!item){const e=document.createElement('div');e.className='ycp-empty';e.textContent='Aucune pièce jointe.';stage.appendChild(e);return;}
    const f=document.createElement('iframe');
    f.src=iframeUrl(item.url);
    f.title=item.name||('Pièce '+(i+1));
    f.loading='eager';
    stage.appendChild(f);
  }

  if(items.length){
    items.forEach((item,i)=>{
      const wrap=document.createElement('span');wrap.className='ycp-doc';
      const view=document.createElement('button');view.type='button';view.className='ycp-view';view.textContent='Pièce '+(i+1);view.title=item.name;view.onclick=()=>show(i);
      const del=document.createElement('button');del.type='button';del.className='ycp-del';del.textContent='×';del.title='Supprimer cette pièce';
      del.onclick=e=>{
        e.preventDefault();e.stopPropagation();
        if(!item.del)return;
        item.del.click();
        setTimeout(()=>{closePreview();},80);
      };
      wrap.append(view,del);tabs.appendChild(wrap);
    });
  }else{
    tabs.innerHTML='<span style="font-size:12px;color:#718096">Aucune pièce</span>';
  }
  overlay.querySelector('.ycp-close').onclick=closePreview;
  overlay.addEventListener('click',e=>{if(e.target===overlay)closePreview();});
  document.body.appendChild(overlay);
  show(active);
}

function firstUrl(row){
  const data=openDefaultDocs(row);
  const url=data.items[0]?.url||'';
  closeDefaultDocs(data.modal);
  return url;
}

function enhanceRow(row){
  if(!row||row.dataset.ycnRowModalV2==='1')return;
  const top=row.querySelector('.ycn-row-top');
  const edit=row.querySelector('[data-ycn-edit]');
  const hiddenStatus=detailSelect(row);
  if(!top||!edit||!hiddenStatus)return;

  row.dataset.ycnRowModalV2='1';
  row.classList.remove('open');
  const oldExtras=top.querySelectorAll('.ycn-top-status,.ycn-top-docs,.ycn-top-note,.ycn-line-status,.ycn-line-docs,.ycn-line-url');
  oldExtras.forEach(x=>x.remove());

  const status=hiddenStatus.cloneNode(true);
  status.removeAttribute('data-ycn-status');
  status.className='ycn-line-status';
  status.value=hiddenStatus.value;
  status.addEventListener('click',e=>e.stopPropagation());
  status.addEventListener('change',e=>{
    e.stopPropagation();
    hiddenStatus.value=status.value;
    hiddenStatus.dispatchEvent(new Event('change',{bubbles:true}));
  });

  const count=docCount(row);
  const docs=document.createElement('button');
  docs.type='button';docs.className='ycn-line-docs'+(count?' has':'');docs.textContent='Pièces '+count;docs.title='Visualiser les pièces';
  docs.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();renderPreview(row,0);});

  const urlBtn=document.createElement('button');
  urlBtn.type='button';urlBtn.className='ycn-line-url';urlBtn.textContent='URL ↗';urlBtn.title='Ouvrir le lien dans un nouvel onglet';
  urlBtn.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    const url=firstUrl(row);
    if(url)window.open(url,'_blank','noopener');
  });
  if(!count)urlBtn.disabled=true;

  top.append(status,docs,urlBtn);
  top.addEventListener('click',e=>{
    if(e.target.closest('button,select,a,input,textarea,label'))return;
    e.preventDefault();e.stopPropagation();
    edit.click();
  });
}

function scan(){
  injectStyle();
  document.querySelectorAll('.yaya-cmd-native-root .ycn-row').forEach(enhanceRow);
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;scan();});}
injectStyle();scan();
const observer=new MutationObserver(records=>{
  if(records.some(r=>[...r.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('.ycn-row,.ycn-groups,.yaya-cmd-native-root')||n.querySelector?.('.ycn-row')))))schedule();
});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('yaya:data-refreshed',schedule);
window.__YAYA_CMD_ROW_MODAL_VERSION='2.0-line-status-preview-url';
})();