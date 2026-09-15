(function(){
'use strict';
if(window.__yayaMarcheCardsV2)return;window.__yayaMarcheCardsV2=true;
const css=document.createElement('style');css.textContent=`
#pane-chantiers .yaya-marche-cards{padding:12px 14px 10px}
#pane-chantiers .yaya-marche-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:stretch}
#pane-chantiers .yaya-marche-card{border:1px solid #dce5ee;border-radius:12px;background:#fff;padding:16px;box-shadow:0 3px 12px rgba(15,42,76,.055);min-height:145px;display:flex;flex-direction:column;gap:12px}
#pane-chantiers .yaya-marche-card-top{display:flex;gap:13px;align-items:flex-start;min-height:66px}
#pane-chantiers .yaya-marche-pdf{width:46px;height:54px;border-radius:8px;background:#fff3f3;color:#d92d20;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;border:1px solid #ffd7d4;flex:0 0 auto}
#pane-chantiers .yaya-marche-card-copy{min-width:0;padding-top:2px}
#pane-chantiers .yaya-marche-card-name{font-size:15px;font-weight:850;color:#102a4c;line-height:1.25;cursor:pointer;overflow-wrap:anywhere}
#pane-chantiers .yaya-marche-card-desc{font-size:12.5px;color:#64748b;margin-top:5px;line-height:1.4;overflow-wrap:anywhere}
#pane-chantiers .yaya-marche-actions{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:8px;margin-top:auto;padding-top:12px;border-top:1px solid #edf1f5}
#pane-chantiers .yaya-marche-btn{height:36px;border:1px solid #cbd5e1;background:#fff;border-radius:7px;padding:0 10px;font-size:12px;font-weight:800;cursor:pointer;color:#17365d;display:flex;align-items:center;justify-content:center;white-space:nowrap;transition:.15s ease}
#pane-chantiers .yaya-marche-btn:hover{transform:translateY(-1px);box-shadow:0 2px 6px rgba(15,42,76,.10)}
#pane-chantiers .yaya-marche-btn.view{background:#07529a;color:#fff;border-color:#07529a}
#pane-chantiers .yaya-marche-btn.delete{color:#c81e1e;border-color:#fecaca;background:#fffafa}
#pane-chantiers .yaya-detail-markets-pane>.yaya-detail-market-row{display:none!important}
#pane-chantiers .yaya-detail-markets-pane>.yaya-marche-cards{display:block!important}
@media(max-width:650px){#pane-chantiers .yaya-marche-grid{grid-template-columns:1fr;gap:10px}#pane-chantiers .yaya-marche-card{min-height:135px;padding:13px}#pane-chantiers .yaya-marche-actions{grid-template-columns:1fr 1fr 1fr;gap:6px}#pane-chantiers .yaya-marche-btn{font-size:11px;padding:0 5px}}
`;
document.head.appendChild(css);
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function build(){
 const pane=document.querySelector('#pane-chantiers .yaya-detail-markets-pane');if(!pane)return;
 let box=pane.querySelector(':scope > .yaya-marche-cards');if(box)box.remove();
 const rows=[...pane.querySelectorAll(':scope > .yaya-detail-market-row')];
 const docs=rows.map(row=>{const edit=row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');if(!edit)return null;const name=(row.querySelector('strong')||{}).textContent||'Devis';const desc=(row.querySelector('.yaya-detail-document-desc,.muted,.small')||{}).textContent||'';const view=row.querySelector('.yaya-detail-document-view,.yaya-detail-document-link,[data-yaya-view]');const del=row.querySelector('.yaya-detail-document-delete,.yaya-initial-devis-delete');return{edit,name:name.trim(),desc:desc.trim(),view,del};}).filter(Boolean);
 box=document.createElement('section');box.className='yaya-marche-cards';box.innerHTML='<div class="yaya-marche-grid"></div>';
 const grid=box.querySelector('.yaya-marche-grid');
 if(!docs.length){grid.innerHTML='<div style="padding:22px;border:1px dashed #cbd5e1;border-radius:10px;color:#64748b;text-align:center;background:#fff">Aucun devis enregistré</div>';}
 docs.forEach((d,i)=>{const card=document.createElement('article');card.className='yaya-marche-card';card.innerHTML=`<div class="yaya-marche-card-top"><div class="yaya-marche-pdf">PDF</div><div class="yaya-marche-card-copy"><div class="yaya-marche-card-name">${esc(d.name||('Devis '+(i+1)))}</div>${d.desc?`<div class="yaya-marche-card-desc">${esc(d.desc)}</div>`:''}</div></div><div class="yaya-marche-actions"><button class="yaya-marche-btn view">Voir le devis</button><button class="yaya-marche-btn edit">Modifier</button><button class="yaya-marche-btn delete">Supprimer</button></div>`;
 const open=()=>{if(d.view)d.view.click();else if(d.edit)d.edit.click();};card.querySelector('.view').onclick=open;card.querySelector('.yaya-marche-card-name').onclick=open;card.querySelector('.edit').onclick=()=>d.edit&&d.edit.click();card.querySelector('.delete').onclick=()=>d.del&&d.del.click();grid.appendChild(card);});
 pane.prepend(box);
}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;build();});}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(schedule,50),true);window.addEventListener('yaya:data-refreshed',schedule);schedule();
})();