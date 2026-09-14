(function(){
'use strict';
if(window.__YAYA_CMD_ROW_MODAL_V1)return;
window.__YAYA_CMD_ROW_MODAL_V1=true;

const STYLE_ID='yaya-cmd-row-modal-style';

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
    .yaya-cmd-native-root .ycn-row-top{grid-template-columns:minmax(170px,1.35fr) minmax(120px,1fr) 80px 105px 125px 72px minmax(140px,1fr);gap:10px;cursor:pointer}
    .yaya-cmd-native-root .ycn-top-status,.yaya-cmd-native-root .ycn-top-docs,.yaya-cmd-native-root .ycn-top-note{font-size:11.5px;color:#4d5f74;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .yaya-cmd-native-root .ycn-top-status{font-weight:800;color:#263f5d}
    .yaya-cmd-native-root .ycn-top-docs{border:1px solid #cfd9e6;background:#fff;color:#1f5f9f;border-radius:7px;min-height:30px;padding:0 8px;font:inherit;font-size:11px;font-weight:850;cursor:pointer;white-space:nowrap}
    .yaya-cmd-native-root .ycn-top-note{color:#6f7f92}
    @media(max-width:900px){.yaya-cmd-native-root .ycn-row-top{grid-template-columns:minmax(160px,1.4fr) minmax(110px,1fr) 90px 110px 64px}.yaya-cmd-native-root .ycn-row-top .ycn-qte,.yaya-cmd-native-root .ycn-row-top .ycn-resp,.yaya-cmd-native-root .ycn-top-note{display:none}}
    @media(max-width:640px){.yaya-cmd-native-root .ycn-row-top{grid-template-columns:minmax(0,1fr) 96px 58px}.yaya-cmd-native-root .ycn-row-top .ycn-supplier,.yaya-cmd-native-root .ycn-row-top .ycn-qte,.yaya-cmd-native-root .ycn-row-top .ycn-resp,.yaya-cmd-native-root .ycn-top-note{display:none}}
  `;
  document.head.appendChild(s);
}

function textOf(row,label){
  const boxes=[...row.querySelectorAll('.ycn-row-detail .ycn-box')];
  const box=boxes.find(x=>String(x.querySelector('small')?.textContent||'').trim().toLowerCase()===label.toLowerCase());
  if(!box)return '';
  const sel=box.querySelector('select');
  if(sel)return String(sel.options?.[sel.selectedIndex]?.text||'').trim();
  return String(box.querySelector('strong,span')?.textContent||'').trim();
}

function enhanceRow(row){
  if(!row||row.dataset.ycnRowModal==='1')return;
  const top=row.querySelector('.ycn-row-top');
  const edit=row.querySelector('[data-ycn-edit]');
  const docs=row.querySelector('[data-ycn-doc]');
  if(!top||!edit)return;

  row.dataset.ycnRowModal='1';
  row.classList.remove('open');
  const toggle=row.querySelector('[data-ycn-toggle-row]');
  if(toggle)toggle.setAttribute('tabindex','-1');

  const status=document.createElement('span');
  status.className='ycn-top-status';
  status.textContent=textOf(row,'Statut')||'—';

  const docBtn=document.createElement('button');
  docBtn.type='button';
  docBtn.className='ycn-top-docs';
  docBtn.textContent='📎 '+(textOf(row,'Pièces jointes')||'0');
  docBtn.title='Documents';
  docBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();docs?.click();});

  const note=document.createElement('span');
  note.className='ycn-top-note';
  note.textContent=textOf(row,'Note')||'—';
  note.title=note.textContent;

  top.append(status,docBtn,note);
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
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;scan();});
}

injectStyle();
scan();
const observer=new MutationObserver(records=>{
  if(records.some(r=>[...r.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('.ycn-row,.ycn-groups,.yaya-cmd-native-root')||n.querySelector?.('.ycn-row')))))schedule();
});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('yaya:data-refreshed',schedule);
window.__YAYA_CMD_ROW_MODAL_VERSION='1.1-line-click-modal';

if(!document.querySelector('script[data-ycn-edit-modal-v5]')){
  const s=document.createElement('script');
  s.src='/yaya-ab/public/commandes-native/commandes-native-edit-modal-v5.js?v=5';
  s.async=true;
  s.dataset.ycnEditModalV5='1';
  document.head.appendChild(s);
}
})();