(function(){
'use strict';
if(window.__yayaMarcheCardsV1)return;window.__yayaMarcheCardsV1=true;
const css=document.createElement('style');css.textContent=`
#pane-chantiers .yaya-marche-cards{padding:14px 16px 8px}
#pane-chantiers .yaya-marche-title{font-size:20px;font-weight:900;color:#102a4c;margin:0 0 3px}
#pane-chantiers .yaya-marche-sub{font-size:13px;color:#64748b;margin-bottom:14px}
#pane-chantiers .yaya-marche-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:14px}
#pane-chantiers .yaya-marche-card{border:1px solid #dbe4ee;border-radius:12px;background:#fff;padding:15px;box-shadow:0 3px 12px rgba(15,42,76,.06);min-height:125px;display:flex;flex-direction:column;gap:9px}
#pane-chantiers .yaya-marche-card-top{display:flex;gap:12px;align-items:flex-start}
#pane-chantiers .yaya-marche-pdf{width:42px;height:48px;border-radius:7px;background:#fff1f1;color:#d92d20;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;border:1px solid #ffd5d2;flex:0 0 auto}
#pane-chantiers .yaya-marche-card-name{font-size:15px;font-weight:850;color:#102a4c;line-height:1.2;cursor:pointer}
#pane-chantiers .yaya-marche-card-desc{font-size:12px;color:#64748b;margin-top:4px;line-height:1.35}
#pane-chantiers .yaya-marche-actions{display:flex;gap:7px;margin-top:auto;flex-wrap:wrap}
#pane-chantiers .yaya-marche-btn{border:1px solid #cbd5e1;background:#fff;border-radius:7px;padding:7px 11px;font-size:12px;font-weight:800;cursor:pointer;color:#17365d}
#pane-chantiers .yaya-marche-btn.view{background:#07529a;color:#fff;border-color:#07529a}
#pane-chantiers .yaya-marche-btn.delete{color:#c81e1e;border-color:#fecaca;background:#fff7f7}
#pane-chantiers .yaya-detail-markets-pane>.yaya-detail-market-row{display:none!important}
#pane-chantiers .yaya-detail-markets-pane>.yaya-marche-cards{display:block!important}
@media(max-width:650px){#pane-chantiers .yaya-marche-grid{grid-template-columns:1fr}#pane-chantiers .yaya-marche-actions .yaya-marche-btn{flex:1}}
`;
document.head.appendChild(css);
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function build(){
 const pane=document.querySelector('#pane-chantiers .yaya-detail-markets-pane');if(!pane)return;
 let box=pane.querySelector(':scope > .yaya-marche-cards');if(box)box.remove();
 const rows=[...pane.querySelectorAll(':scope > .yaya-detail-market-row')];
 const docs=rows.map(row=>{const edit=row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');if(!edit)return null;const name=(row.querySelector('strong')||{}).textContent||'Devis';const desc=(row.querySelector('.yaya-detail-document-desc,.muted,.small')||{}).textContent||'';const view=row.querySelector('.yaya-detail-document-view,.yaya-detail-document-link,[data-yaya-view]');const del=row.querySelector('.yaya-detail-document-delete,.yaya-initial-devis-delete');return{row,edit,name:name.trim(),desc:desc.trim(),view,del};}).filter(Boolean);
 box=document.createElement('section');box.className='yaya-marche-cards';
 box.innerHTML='<div class="yaya-marche-title">Devis du marché</div><div class="yaya-marche-sub">Tous les devis liés à ce chantier. Cliquez sur un devis pour le consulter.</div><div class="yaya-marche-grid"></div>';
 const grid=box.querySelector('.yaya-marche-grid');
 if(!docs.length){grid.innerHTML='<div style="padding:22px;border:1px dashed #cbd5e1;border-radius:10px;color:#64748b;text-align:center">Aucun devis enregistré</div>';}
 docs.forEach((d,i)=>{const card=document.createElement('article');card.className='yaya-marche-card';card.innerHTML=`<div class="yaya-marche-card-top"><div class="yaya-marche-pdf">PDF</div><div><div class="yaya-marche-card-name">${esc(d.name||('Devis '+(i+1)))}</div>${d.desc?`<div class="yaya-marche-card-desc">${esc(d.desc)}</div>`:''}</div></div><div class="yaya-marche-actions"><button class="yaya-marche-btn view">Voir le devis</button><button class="yaya-marche-btn edit">Modifier</button><button class="yaya-marche-btn delete">Supprimer</button></div>`;
 const open=()=>{if(d.view)d.view.click();else if(d.edit)d.edit.click();};card.querySelector('.view').onclick=open;card.querySelector('.yaya-marche-card-name').onclick=open;card.querySelector('.edit').onclick=()=>d.edit&&d.edit.click();card.querySelector('.delete').onclick=()=>d.del&&d.del.click();grid.appendChild(card);});
 pane.prepend(box);
}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;build();});}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(schedule,50),true);window.addEventListener('yaya:data-refreshed',schedule);schedule();
})();