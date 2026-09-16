(function(){
'use strict';
if(window.__yayaMarcheCardsV3)return;window.__yayaMarcheCardsV3=true;
const css=document.createElement('style');css.textContent=`
#pane-chantiers .yaya-detail-section-tab[data-section="marche"]{display:none!important}
#pane-chantiers .yaya-marche-cards{padding:14px 16px 12px}
#pane-chantiers .yaya-marche-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:stretch}
#pane-chantiers .yaya-marche-card{position:relative;border:1px solid #dce5ee;border-radius:13px;background:#fff;padding:18px;box-shadow:0 4px 14px rgba(15,42,76,.06);min-height:245px;display:flex;flex-direction:column}
#pane-chantiers .yaya-marche-card:first-child{border-color:#bdebd5;background:linear-gradient(135deg,#f7fffb 0%,#fff 72%)}
#pane-chantiers .yaya-marche-card-top{display:flex;gap:16px;align-items:center;min-height:92px}
#pane-chantiers .yaya-marche-pdf{width:62px;height:78px;border-radius:9px;background:linear-gradient(145deg,#fff7f7,#ffe8e8);color:#e02020;display:flex;align-items:flex-end;justify-content:center;padding-bottom:9px;font-size:13px;font-weight:950;border:1px solid #ffd3d3;flex:0 0 auto;box-shadow:0 3px 8px rgba(210,30,30,.08)}
#pane-chantiers .yaya-marche-card-copy{min-width:0}
#pane-chantiers .yaya-marche-card-name{font-size:17px;font-weight:900;color:#102a4c;line-height:1.2;cursor:pointer;overflow-wrap:anywhere}
#pane-chantiers .yaya-marche-card-desc{font-size:13px;color:#60738c;margin-top:7px;line-height:1.45;overflow-wrap:anywhere}
#pane-chantiers .yaya-marche-meta{margin-top:17px;padding-top:14px;border-top:1px solid #edf1f5;font-size:12px;color:#73839a;min-height:31px}
#pane-chantiers .yaya-marche-actions{display:grid;grid-template-columns:1fr 48px;gap:9px;margin-top:auto;padding-top:16px}
#pane-chantiers .yaya-marche-btn{height:42px;border:1px solid #d3deea;background:#fff;border-radius:9px;font-size:13px;font-weight:850;cursor:pointer;color:#17365d;display:flex;align-items:center;justify-content:center;transition:.15s ease}
#pane-chantiers .yaya-marche-btn:hover{transform:translateY(-1px);box-shadow:0 3px 8px rgba(15,42,76,.10)}
#pane-chantiers .yaya-marche-btn.view{background:linear-gradient(135deg,#1265c5,#07529a);color:#fff;border-color:#07529a}
#pane-chantiers .yaya-marche-more{font-size:22px;letter-spacing:1px;color:#23456b;padding-bottom:7px}
#pane-chantiers .yaya-detail-markets-pane>.yaya-detail-market-row{display:none!important}
#pane-chantiers .yaya-detail-markets-pane>.yaya-marche-cards{display:block!important}
@media(max-width:1000px){#pane-chantiers .yaya-marche-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){#pane-chantiers .yaya-marche-cards{padding:8px 5px}#pane-chantiers .yaya-marche-grid{grid-template-columns:1fr;gap:10px}#pane-chantiers .yaya-marche-card{min-height:205px;padding:15px}#pane-chantiers .yaya-marche-pdf{width:52px;height:66px}#pane-chantiers .yaya-marche-card-name{font-size:16px}}
`;
document.head.appendChild(css);
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function build(){
 const pane=document.querySelector('#pane-chantiers .yaya-detail-markets-pane');if(!pane)return;
 const old=pane.querySelector(':scope > .yaya-marche-cards');if(old)old.remove();
 const rows=[...pane.querySelectorAll(':scope > .yaya-detail-market-row')];
 const docs=rows.map(row=>{const edit=row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');if(!edit)return null;const name=(row.querySelector('strong')||{}).textContent||'Devis';const desc=(row.querySelector('.yaya-detail-document-desc,.muted,.small')||{}).textContent||'';const view=row.querySelector('.yaya-detail-document-view,.yaya-detail-document-link,[data-yaya-view]');const del=row.querySelector('.yaya-detail-document-delete,.yaya-initial-devis-delete');return{edit,name:name.trim(),desc:desc.trim(),view,del};}).filter(Boolean);
 const box=document.createElement('section');box.className='yaya-marche-cards';box.innerHTML='<div class="yaya-marche-grid"></div>';const grid=box.firstElementChild;
 if(!docs.length)grid.innerHTML='<div style="padding:28px;border:1px dashed #cbd5e1;border-radius:12px;color:#64748b;text-align:center;background:#fff">Aucun devis enregistré</div>';
 docs.forEach((d,i)=>{const card=document.createElement('article');card.className='yaya-marche-card';card.innerHTML=`<div class="yaya-marche-card-top"><div class="yaya-marche-pdf">PDF</div><div class="yaya-marche-card-copy"><div class="yaya-marche-card-name">${esc(d.name||('Devis '+(i+1)))}</div>${d.desc?`<div class="yaya-marche-card-desc">${esc(d.desc)}</div>`:''}</div></div><div class="yaya-marche-meta">${i===0?'Devis principal':'Document du marché'}</div><div class="yaya-marche-actions"><button class="yaya-marche-btn view">Ouvrir</button><button class="yaya-marche-btn yaya-marche-more" title="Modifier">•••</button></div>`;
 const open=()=>{if(d.view)d.view.click();else if(d.edit)d.edit.click();};card.querySelector('.view').onclick=open;card.querySelector('.yaya-marche-card-name').onclick=open;card.querySelector('.yaya-marche-more').onclick=()=>d.edit&&d.edit.click();grid.appendChild(card);});pane.prepend(box);
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;build();});}
const obs=new MutationObserver(ms=>{if(ms.every(m=>m.target.closest&&m.target.closest('.yaya-marche-cards')))return;schedule();});obs.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('yaya:data-refreshed',schedule);setTimeout(schedule,0);
})();