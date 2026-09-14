(function(){
'use strict';

const STYLE_ID='yaya-ab-commandes-direct-style';
const BLOCK_CLASS='yaya-ab-commandes-direct';
const REFRESH_ID='yayaRefreshChantierBtn';
const MANAGE_ID='yayaManageChantierCardBtn';
const CSS_URL='/yaya-ab/public/commandes-native/commandes-native-embed-line-v2.css?v=3';
const JS_URL='/yaya-ab/public/commandes-native/commandes-native-embed.js?v=1';
const ROW_MODAL_URL='/yaya-ab/public/commandes-native/commandes-native-row-modal.js?v=1';
const ACTIONS_URL='/yaya-ab/public/commandes-native/commandes-native-actions-v3.js?v=3';
const LINE_V4_URL='/yaya-ab/public/commandes-native/commandes-native-line-v4.js?v=4';
const EDIT_V5_URL='/yaya-ab/public/commandes-native/commandes-native-edit-modal-v5.js?v=6';
const CREATE_V6_URL='/yaya-ab/public/commandes-native/commandes-native-create-followup-v6.js?v=1';
let activeCard=null, activeBlock=null, scanTimer=0, assetsPromise=null;

function installBaseStyle(){
 let s=document.getElementById(STYLE_ID);
 if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
 s.textContent=`
 .${BLOCK_CLASS}{display:none!important;width:100%!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;min-height:0!important}
 #pane-chantiers .card[data-yaya-detail-section="commandes"] > .${BLOCK_CLASS}{display:block!important}
 #pane-chantiers .card > .yaya-detail-commandes-pane,
 #pane-chantiers .card > .yaya-detail-section-action-row[data-section="commandes"],
 #pane-chantiers .card > .yaya-detail-empty-pane[data-section="commandes"]{display:none!important}
 .${BLOCK_CLASS} .yaya-cmd-direct-wait{padding:10px 2px;color:#708095;font-size:12px;font-weight:700}
 #${REFRESH_ID}{height:34px!important;padding:0 14px!important;margin-right:8px!important;border:1px solid #b9dfc5!important;border-radius:8px!important;background:#e8f5ec!important;color:#287a46!important;font-size:13px!important;font-weight:600!important;box-shadow:0 1px 2px rgba(16,24,40,.05)!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important}
 #${REFRESH_ID}:hover{background:#dff1e5!important;border-color:#a8d6b6!important}`;
}

function ensureRowModalPatch(){
 if(window.__YAYA_CMD_ROW_MODAL_V1||document.querySelector('script[data-ycn-row-modal]'))return;
 const s=document.createElement('script');s.src=ROW_MODAL_URL;s.async=true;s.dataset.ycnRowModal='1';document.head.appendChild(s);
}
function ensureActionsPatch(){
 if(window.__YAYA_COMMANDES_NATIVE_ACTIONS_V3||document.querySelector('script[data-ycn-actions-v3]'))return;
 const s=document.createElement('script');s.src=ACTIONS_URL;s.async=true;s.dataset.ycnActionsV3='1';document.head.appendChild(s);
}
function ensureLineV4Patch(){
 if(window.__YAYA_COMMANDES_LINE_V4||document.querySelector('script[data-ycn-line-v4]'))return;
 const s=document.createElement('script');s.src=LINE_V4_URL;s.async=true;s.dataset.ycnLineV4='1';document.head.appendChild(s);
}
function ensureEditV5Patch(){
 if(window.__YAYA_COMMANDES_EDIT_MODAL_V5||document.querySelector('script[data-ycn-edit-v5]'))return;
 const s=document.createElement('script');s.src=EDIT_V5_URL;s.async=true;s.dataset.ycnEditV5='1';document.head.appendChild(s);
}
function ensureCreateV6Patch(){
 if(window.__YAYA_COMMANDES_CREATE_FOLLOWUP_V6||document.querySelector('script[data-ycn-create-v6]'))return;
 const s=document.createElement('script');s.src=CREATE_V6_URL;s.async=true;s.dataset.ycnCreateV6='1';document.head.appendChild(s);
}

function loadAssets(){
 if(window.YayaCommandesNativeEmbed){ensureRowModalPatch();ensureActionsPatch();ensureLineV4Patch();ensureEditV5Patch();ensureCreateV6Patch();return Promise.resolve(window.YayaCommandesNativeEmbed);}
 if(assetsPromise)return assetsPromise;
 assetsPromise=new Promise((resolve,reject)=>{
   if(!document.querySelector('link[data-ycn-embed-css]')){
     const l=document.createElement('link');l.rel='stylesheet';l.href=CSS_URL;l.dataset.ycnEmbedCss='1';document.head.appendChild(l);
   }
   const existing=document.querySelector('script[data-ycn-embed-js]');
   if(existing){
     const timer=setInterval(()=>{if(window.YayaCommandesNativeEmbed){clearInterval(timer);ensureRowModalPatch();ensureActionsPatch();ensureLineV4Patch();ensureEditV5Patch();ensureCreateV6Patch();resolve(window.YayaCommandesNativeEmbed);}},20);
     setTimeout(()=>{clearInterval(timer);if(!window.YayaCommandesNativeEmbed)reject(new Error('Module Commandes indisponible'));},5000);
     return;
   }
   const s=document.createElement('script');s.src=JS_URL;s.async=true;s.dataset.ycnEmbedJs='1';s.onload=()=>{if(window.YayaCommandesNativeEmbed){ensureRowModalPatch();ensureActionsPatch();ensureLineV4Patch();ensureEditV5Patch();ensureCreateV6Patch();resolve(window.YayaCommandesNativeEmbed);}else reject(new Error('Module Commandes invalide'));};s.onerror=()=>reject(new Error('Chargement Commandes impossible'));document.head.appendChild(s);
 });
 return assetsPromise;
}

function chantierOpen(){try{if(typeof focusChantier!=='undefined'&&focusChantier)return true}catch(_){}return !!document.querySelector('#pane-chantiers .card .yaya-detail-section-tabs');}
function commandesActive(card){if(!card||!card.isConnected)return false;if(String(card.dataset.yayaDetailSection||'')==='commandes')return true;const tab=card.querySelector(':scope > .yaya-detail-section-tabs [data-section="commandes"]');return !!(tab&&(tab.classList.contains('on')||tab.classList.contains('active')||tab.getAttribute('aria-selected')==='true'));}
function cardId(card){if(!card)return '';for(const el of card.querySelectorAll('[onclick]')){const raw=String(el.getAttribute('onclick')||''),m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);if(m&&m[1])return String(m[1]).trim();}try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier).trim()}catch(_){}return '';}
function chantierName(id,card){try{if(typeof S!=='undefined'&&Array.isArray(S.chantiers)){const c=S.chantiers.find(x=>String(x.id||'')===String(id||''));if(c&&c.nom)return String(c.nom).trim();}}catch(_){}for(const sel of [':scope > .top b',':scope > .top strong',':scope > div:first-child b',':scope > div:first-child strong']){const el=card?.querySelector(sel),txt=String(el?.textContent||'').trim();if(txt)return txt;}return '';}

function ensureBlock(card){
 const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');if(!tabs)return null;
 let block=card.querySelector(':scope > .'+BLOCK_CLASS);
 if(!block){block=document.createElement('div');block.className='yaya-detail-section-node '+BLOCK_CLASS;block.dataset.section='commandes';tabs.insertAdjacentElement('afterend',block);}
 else if(tabs.nextElementSibling!==block)tabs.insertAdjacentElement('afterend',block);
 return block;
}

async function mountCard(card){
 if(!card||!card.isConnected||!commandesActive(card))return;
 const id=cardId(card),name=chantierName(id,card),block=ensureBlock(card);if(!block)return;
 if(!id&&!name){block.innerHTML='<div class="yaya-cmd-direct-wait">Chargement du chantier…</div>';return;}
 if(activeBlock&&activeBlock!==block){try{window.YayaCommandesNativeEmbed?.unmount(activeBlock);}catch(_){} }
 activeCard=card;activeBlock=block;
 if(!block.dataset.ycnReady)block.innerHTML='<div class="yaya-cmd-direct-wait">Chargement des commandes…</div>';
 try{
   const api=await loadAssets();
   if(!block.isConnected)return;
   if(block.dataset.ycnReady==='1')api.setChantier(id,name);else{block.dataset.ycnReady='1';api.mount(block,id,name);}
   ensureRowModalPatch();ensureActionsPatch();ensureLineV4Patch();ensureEditV5Patch();ensureCreateV6Patch();
 }catch(err){block.innerHTML='<div class="yaya-cmd-direct-wait">Commandes indisponibles : '+String(err?.message||err)+'</div>';}
}

function ensureRefreshButton(){
 const manage=document.getElementById(MANAGE_ID);if(!manage||!manage.parentNode)return;
 let btn=document.getElementById(REFRESH_ID);
 if(!btn){btn=document.createElement('button');btn.id=REFRESH_ID;btn.type='button';btn.innerHTML='↻&nbsp; Actualiser';btn.title='Actualiser les commandes de ce chantier';btn.onclick=async e=>{e?.preventDefault();e?.stopPropagation();if(btn.disabled)return;btn.disabled=true;const old=btn.innerHTML;btn.innerHTML='Actualisation…';try{await window.YayaCommandesNativeEmbed?.refresh();}finally{btn.disabled=false;btn.innerHTML=old;}};manage.parentNode.insertBefore(btn,manage);}
 else if(btn.nextSibling!==manage)manage.parentNode.insertBefore(btn,manage);
 btn.style.display=chantierOpen()?'inline-flex':'none';
}

function findActiveCard(){const c=document.querySelector('#pane-chantiers .card[data-yaya-detail-section="commandes"]');if(c)return c;const b=document.querySelector('#pane-chantiers .yaya-detail-section-tab[data-section="commandes"].on,#pane-chantiers .yaya-detail-section-tab[data-section="commandes"][aria-selected="true"]');return b?b.closest('.card'):null;}
function scan(){clearTimeout(scanTimer);scanTimer=setTimeout(()=>{ensureRefreshButton();const card=findActiveCard();if(card)mountCard(card);},35);}

installBaseStyle();ensureRowModalPatch();ensureActionsPatch();ensureLineV4Patch();ensureEditV5Patch();ensureCreateV6Patch();ensureRefreshButton();
document.addEventListener('click',e=>{const b=e.target?.closest?.('.yaya-detail-section-tab[data-section]');if(!b)return;const card=b.closest('.card');if(String(b.dataset.section||'')==='commandes'){setTimeout(()=>mountCard(card),0);setTimeout(()=>mountCard(card),80);}setTimeout(ensureRefreshButton,0);});
const pane=document.getElementById('pane-chantiers');if(pane)new MutationObserver(records=>{for(const r of records){const target=r.target?.nodeType===1?r.target:null;if(target?.closest?.('.'+BLOCK_CLASS))continue;if([...r.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('.card,.yaya-detail-section-tabs')||n.querySelector?.('.yaya-detail-section-tabs')))){scan();break;}}}).observe(pane,{childList:true,subtree:true});
window.addEventListener('hashchange',scan);window.addEventListener('focus',scan);window.addEventListener('yaya:data-refreshed',scan);setTimeout(scan,0);setTimeout(scan,300);setTimeout(ensureRefreshButton,700);
window.__YAYA_AB_COMMANDES_LINK_VERSION='6.8-create-followup-url-doc';
})();