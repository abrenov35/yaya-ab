(function(){
'use strict';
if(window.__yayaDevisDocsV3)return;window.__yayaDevisDocsV3=true;window.__yayaDevisDocsV2=true;
const KEY='YAYA_DEVIS_DOCUMENTS_V1';
let centralDocs=[];
let centralState='unknown';
let centralPromise=null;

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();}
function localLoad(){try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.map(normalizeDoc).filter(Boolean):[];}catch(e){return [];}}
function localSave(a){try{localStorage.setItem(KEY,JSON.stringify((Array.isArray(a)?a:[]).map(normalizeDoc).filter(Boolean)));}catch(e){}}
function normalizeDoc(d){if(!d||typeof d!=='object')return null;const id=String(d.id||d.ID||'').trim();const chantierId=String(d.chantierId||d['ID chantier']||'').trim();const url=String(d.url||d['Lien Drive']||'').trim();if(!id&&!chantierId&&!url)return null;return {id:id||('dv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)),chantierId:chantierId,nomChantier:String(d.nomChantier||d['Nom chantier']||'').trim(),numero:Number(d.numero||d['N° devis']||0)||0,date:String(d.date||d.Date||'').trim(),nomFichier:String(d.nomFichier||d['Nom fichier']||'').trim(),url:url};}
function chantierName(cid){try{const c=(S.chantiers||[]).find(x=>String(x.id)===String(cid));return c?String(c.nom||'').trim():'';}catch(e){return '';}}
function enrichDoc(d){const x=normalizeDoc(d);if(!x)return null;if(!x.nomChantier)x.nomChantier=chantierName(x.chantierId);if(!x.nomFichier)x.nomFichier='Devis '+(x.numero||'');if(!x.date)x.date=new Date().toISOString().slice(0,10);return x;}
function toServerRow(d){const x=enrichDoc(d);return {'ID':x.id,'ID chantier':x.chantierId,'Nom chantier':x.nomChantier,'N° devis':x.numero,'Date':x.date,'Nom fichier':x.nomFichier,'Lien Drive':x.url};}
function docsNow(){return centralState==='ready'?centralDocs:localLoad();}
function docsFor(cid){return docsNow().filter(d=>String(d.chantierId)===String(cid)).sort((a,b)=>(Number(a.numero)||0)-(Number(b.numero)||0));}
function nextNo(cid){const a=docsFor(cid);return a.length?Math.max(...a.map(x=>Number(x.numero)||0))+1:1;}
function closeViewer(){const x=document.getElementById('yayaDevisViewer');if(x)x.remove();}
function closeAdd(){const x=document.getElementById('yayaDevisAdd');if(x)x.remove();}
function toastSafe(m,e){try{if(typeof toast==='function')toast(m,!!e);}catch(_){} }
function apiEndpoint(){try{return typeof API!=='undefined'&&API?String(API).trim():'';}catch(e){return '';}}

function driveIdFromUrl(u){
  const s=String(u||'').trim();
  let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if(m)return m[1];
  m=s.match(/[?&]id=([^&#]+)/i);
  return m?decodeURIComponent(m[1]):'';
}
function viewerUrl(u){
  const raw=String(u||'').trim();
  const id=driveIdFromUrl(raw);
  if(id)return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
  try{
    const x=new URL(raw);
    if(/(?:^|\.)dropbox\.com$/i.test(x.hostname)){
      x.searchParams.delete('dl');
      x.searchParams.set('raw','1');
      return x.toString();
    }
  }catch(e){}
  return raw;
}
function directDownloadUrl(u){
  const raw=String(u||'').trim();
  const id=driveIdFromUrl(raw);
  if(id)return 'https://drive.usercontent.google.com/download?id='+encodeURIComponent(id)+'&export=download&confirm=t';
  try{
    const x=new URL(raw);
    if(/(?:^|\.)dropbox\.com$/i.test(x.hostname)){
      x.searchParams.delete('raw');
      x.searchParams.set('dl','1');
      return x.toString();
    }
    if(/(?:1drv\.ms|onedrive\.live\.com|sharepoint\.com)$/i.test(x.hostname)){
      x.searchParams.set('download','1');
      return x.toString();
    }
  }catch(e){}
  return raw;
}
function compositeKey(d){const x=enrichDoc(d);return [String(x.chantierId),String(x.numero),String(x.url)].join('|');}

async function postYaya(action,payload){const api=apiEndpoint();if(!api)throw new Error('API Yaya indisponible');let r;try{r=await fetch(api,{method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,data:payload})});}catch(e){throw new Error('Connexion au serveur impossible : '+String(e&&e.message||e));}if(!r.ok)throw new Error('Erreur serveur '+r.status);const text=await r.text();let j;try{j=JSON.parse(text);}catch(e){throw new Error('Réponse Yaya invalide');}if(!j||j.ok!==true){const err=new Error(String(j&&j.error||'Action Yaya impossible'));err.yayaAction=action;throw err;}return j;}

async function fetchCentral(){
  const api=apiEndpoint();
  if(!api){centralState='unsupported';return false;}
  const sep=api.includes('?')?'&':'?';
  let r,j;
  try{
    r=await fetch(api+sep+'tabs=DEVIS&_yaya_devis='+Date.now(),{method:'GET',cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    j=await r.json();
  }catch(e){centralState='unsupported';return false;}
  if(!j||j.ok!==true||!j.data||!Object.prototype.hasOwnProperty.call(j.data,'DEVIS')){centralState='unsupported';return false;}
  centralDocs=(Array.isArray(j.data.DEVIS)?j.data.DEVIS:[]).map(normalizeDoc).filter(Boolean);
  centralState='ready';
  return true;
}

async function upsertCentral(doc){const x=enrichDoc(doc);await postYaya('upsertDevisDocument',toServerRow(x));const idx=centralDocs.findIndex(d=>String(d.id)===String(x.id));if(idx>=0)centralDocs[idx]=x;else centralDocs.push(x);localSave(centralDocs);return x;}
async function deleteCentral(id){await postYaya('deleteDevisDocument',{id:String(id)});centralDocs=centralDocs.filter(d=>String(d.id)!==String(id));localSave(centralDocs);}

async function migrateLocal(){
  if(centralState!=='ready')return;
  const local=localLoad();
  if(!local.length){localSave(centralDocs);return;}
  const byId=new Set(centralDocs.map(d=>String(d.id)));
  const byComposite=new Set(centralDocs.map(compositeKey));
  for(const raw of local){
    const d=enrichDoc(raw);
    if(byId.has(String(d.id))||byComposite.has(compositeKey(d)))continue;
    try{
      await upsertCentral(d);
      byId.add(String(d.id));
      byComposite.add(compositeKey(d));
    }catch(e){console.warn('Migration devis locale non effectuée :',e);return;}
  }
  await fetchCentral();
  if(centralState==='ready')localSave(centralDocs);
}

async function ensureCentral(){
  if(centralState==='ready')return true;
  if(centralState==='unsupported')return false;
  if(centralPromise)return centralPromise;
  centralPromise=(async()=>{const ok=await fetchCentral();if(ok)await migrateLocal();return centralState==='ready';})().finally(()=>{centralPromise=null;});
  return centralPromise;
}

function css(){if(document.getElementById('yaya-devis-docs-css'))return;const s=document.createElement('style');s.id='yaya-devis-docs-css';s.textContent=`
#pane-chantiers .yaya-detail-section-tab[data-section="marche"]{display:none!important}#pane-chantiers [data-yaya-devis-docs="1"]{cursor:pointer!important}
.ydd-ov{position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:18px}.ydd-modal{width:min(520px,calc(100vw - 28px));background:#fff;border-radius:13px;overflow:hidden;color:#162d49;box-shadow:0 20px 65px rgba(15,23,42,.28)}.ydd-modal.docs{width:90vw;max-width:90vw;height:90vh;display:flex;flex-direction:column}.ydd-head{display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:1px solid #e5eaf0}.ydd-title{font-size:18px;font-weight:850}.ydd-actions{display:flex;gap:9px;margin-left:auto}.ydd-btn{min-height:38px;padding:0 14px;border-radius:8px;border:1px solid #c8d4e0;background:#fff;color:#173b60;font-size:12.5px;font-weight:800}.ydd-btn.primary{background:#003d7a;border-color:#003d7a;color:#fff}.ydd-empty{padding:34px 22px;text-align:center;color:#66758a;font-size:13px}.ydd-empty strong{display:block;margin-bottom:7px;color:#243b58;font-size:15px}.ydd-tabs{display:flex;gap:5px;padding:10px 12px 0;overflow-x:auto;background:#f7f9fb;border-bottom:1px solid #dfe6ee}.ydd-tab{display:flex;align-items:center;gap:8px;min-height:38px;padding:0 9px 0 13px;border:1px solid #d5dee8;border-bottom:0;border-radius:8px 8px 0 0;background:#edf1f5;color:#4b5f72;font-size:12px;font-weight:750;white-space:nowrap}.ydd-tab.on{background:#fff;color:#003d7a}.ydd-del{border:0;background:transparent;color:#8a98a8;font-size:17px}.ydd-view{flex:1;min-height:0;background:#eef1f4}.ydd-frame{width:100%;height:100%;border:0;background:#fff}.ydd-add{width:min(480px,calc(100vw - 28px));padding:20px;background:#fff;border-radius:13px}.ydd-file{display:none}.ydd-state{text-align:center;margin:14px 0;font-size:13px}.ydd-add-actions{display:flex;justify-content:center;gap:10px;margin-top:18px}.ydd-add-actions button{height:42px;padding:0 20px}.ydd-import{background:#249457!important;color:#fff!important;border:1px solid #249457!important}@media(max-width:700px){.ydd-ov{padding:6px}.ydd-modal.docs{width:calc(100vw - 12px);max-width:none;height:calc(100dvh - 12px)}.ydd-head{padding:10px;flex-wrap:wrap}.ydd-actions{width:100%;margin-left:0}.ydd-btn{flex:1}.ydd-tabs{padding-left:6px;padding-right:6px}}
`;document.head.appendChild(s);}

function showDoc(cid,i){
  const a=docsFor(cid);if(!a.length)return renderViewer(cid);
  i=Math.max(0,Math.min(Number(i)||0,a.length-1));
  document.querySelectorAll('#yayaDevisViewer .ydd-tab').forEach((b,n)=>b.classList.toggle('on',n===i));
  const current=a[i],raw=String(current&&current.url||'');
  const viewer=viewerUrl(raw);
  const root=document.getElementById('yayaDevisViewer');
  if(root){
    root.dataset.yayaDownloadUrl=raw;
    const dl=root.querySelector('[data-download-current]');
    if(dl)dl.style.display=raw?'inline-flex':'none';
  }
  window.__yayaLastPieceUrl=raw;
  const v=root&&root.querySelector('.ydd-view');
  if(v)v.innerHTML='<iframe class="ydd-frame" title="Visualisation du devis" src="'+esc(viewer)+'" loading="eager"></iframe>';
}
async function removeDoc(cid,id){if(!confirm('Supprimer ce devis de Yaya ?\n\nLe fichier original est conservé.'))return;try{if(centralState==='ready')await deleteCentral(id);else localSave(localLoad().filter(d=>String(d.id)!==String(id)));renderViewer(cid);}catch(e){toastSafe('Suppression impossible : '+String(e&&e.message||e),true);}}
function renderViewer(cid){
  closeViewer();
  const a=docsFor(cid),o=document.createElement('div');
  o.id='yayaDevisViewer';o.className='ydd-ov';
  if(!a.length){
    o.innerHTML='<div class="ydd-modal"><div class="ydd-head"><div class="ydd-title">Devis du chantier</div><div class="ydd-actions"><button class="ydd-btn primary" data-add>Ajouter un devis</button><button class="ydd-btn" data-close>Fermer</button></div></div><div class="ydd-empty"><strong>Aucun devis enregistré</strong>Ajoutez le premier devis pour ce chantier.</div></div>';
  }else{
    o.innerHTML='<div class="ydd-modal docs"><div class="ydd-head"><div class="ydd-title">Devis du chantier</div><div class="ydd-actions"><button class="ydd-btn primary" data-add>＋ Ajouter un devis</button><button class="ydd-btn" data-close>Fermer</button></div></div><div class="ydd-tabs">'+a.map((d,i)=>'<button class="ydd-tab'+(i?'':' on')+'" data-i="'+i+'">Devis '+d.numero+' <span class="ydd-del" data-del="'+esc(d.id)+'">×</span></button>').join('')+'</div><div class="ydd-view"></div></div>';
  }
  document.body.appendChild(o);
  o.onclick=e=>{
    if(e.target===o||e.target.closest('[data-close]'))return closeViewer();
    const dl=e.target.closest('[data-download-current]');
    if(dl){
      e.preventDefault();e.stopPropagation();
      const u=directDownloadUrl(o.dataset.yayaDownloadUrl||'');
      if(u){
        const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';a.download='';document.body.appendChild(a);a.click();a.remove();
      }
      return;
    }
    if(e.target.closest('[data-add]')){closeViewer();return openAdd(cid);}
    const del=e.target.closest('[data-del]');if(del){e.stopPropagation();return removeDoc(cid,del.dataset.del);}
    const t=e.target.closest('[data-i]');if(t)showDoc(cid,t.dataset.i);
  };
  if(a.length)showDoc(cid,0);
}
async function openViewer(cid){await ensureCentral();renderViewer(cid);}

async function postUpload(action,payload){return postYaya(action,payload);}
function archiveUnsupported(err){const m=String(err&&err.message||'');return err&&err.yayaAction==='archiverDevis'&&/action.*(?:inconnue|introuvable|non g[eé]r[eé]e|non support[eé]e)|archiverDevis/i.test(m);}
async function archiveQuote(payload){try{return await postUpload('archiverDevis',payload);}catch(err){if(!archiveUnsupported(err))throw err;return postUpload('extraireDevis',payload);}}
function fileBase64(file){
  return new Promise((resolve,reject)=>{
    const rd=new FileReader();
    rd.onerror=()=>reject(new Error('Lecture du fichier impossible'));
    rd.onload=()=>{
      const b64=String(rd.result||'').split(',')[1]||'';
      if(!b64){reject(new Error('Document vide ou illisible'));return;}
      resolve(b64);
    };
    rd.readAsDataURL(file);
  });
}

async function importQuoteBackground(cid,n,file){
  const filename=String(file&&file.name||('Devis '+n+'.pdf'));
  const docId='dv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);

  try{
    const b64=await fileBase64(file);
    const payload={filename:filename,mimeType:String(file&&file.type||'application/pdf'),base64:b64};
    const j=await archiveQuote(payload);
    const d=j.data||{};
    const url=String(d.lienDrive||d.lien||'').trim();
    if(!url)throw new Error(String(d.archiveErreur||'Lien du fichier absent'));

    const doc=enrichDoc({
      id:docId,
      chantierId:String(cid),
      nomChantier:chantierName(cid),
      numero:n,
      date:new Date().toISOString().slice(0,10),
      nomFichier:filename,
      url:url
    });

    // Sécurisation locale immédiate dès que Drive a renvoyé le lien.
    const local=localLoad();
    if(!local.some(x=>String(x.id)===String(doc.id)))local.push(doc);
    localSave(local);

    try{
      const centralReady=centralState==='ready'||await ensureCentral();
      if(centralReady)await upsertCentral(doc);
    }catch(syncErr){
      console.warn('Yaya devis — synchronisation centrale différée :',syncErr);
      toastSafe('Devis '+n+' archivé — synchronisation Yaya à reprendre',true);
      return;
    }

    try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['DEVIS'],source:'devis-background-import'}}));}catch(_){}
    toastSafe('Devis '+n+' enregistré ✓');
  }catch(e){
    console.error('Yaya devis — import en arrière-plan :',e);
    toastSafe('Import du devis '+n+' impossible : '+String(e&&e.message||e),true);
  }
}

function openAdd(cid){
  closeAdd();
  const n=nextNo(cid),o=document.createElement('div');
  o.id='yayaDevisAdd';o.className='ydd-ov';
  o.innerHTML='<div class="ydd-add"><div class="ydd-title" style="text-align:center">Ajouter le devis '+n+'</div><div class="ydd-state">Importer le PDF ou la photo du devis.</div><input class="ydd-file" type="file" accept="application/pdf,image/*"><div class="ydd-add-actions"><button class="ydd-btn ydd-import" data-import>Importer</button><button class="ydd-btn" data-cancel>Fermer</button></div></div>';
  document.body.appendChild(o);

  const input=o.querySelector('input');
  o.querySelector('[data-import]').onclick=()=>input.click();

  input.onchange=()=>{
    const file=input.files&&input.files[0];
    input.value='';
    if(!file)return;
    if(file.size>8*1024*1024){
      toastSafe('Fichier trop lourd (8 Mo max)',true);
      return;
    }

    // Le File reste référencé par la tâche JS même après destruction de la modale.
    // On libère donc immédiatement l'opérateur.
    closeAdd();
    toastSafe('Import du devis '+n+' lancé — vous pouvez continuer');
    setTimeout(()=>{importQuoteBackground(cid,n,file);},0);
  };

  o.querySelector('[data-cancel]').onclick=closeAdd;
  o.onclick=e=>{if(e.target===o)closeAdd();};
}

function cardId(card){if(!card)return '';if(card.dataset.id)return String(card.dataset.id);if(card.dataset.chantierId)return String(card.dataset.chantierId);for(const el of card.querySelectorAll('[data-id],[data-chantier-id],[onclick]')){if(el.dataset.chantierId)return String(el.dataset.chantierId);const raw=String(el.getAttribute('onclick')||''),m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);if(m)return m[1];}const title=String(card.querySelector('.top b')&&card.querySelector('.top b').textContent||'').trim();try{const c=(S.chantiers||[]).find(x=>norm(x.nom)===norm(title));return c?String(c.id):'';}catch(e){return '';}}
function marketTarget(card){if(!card)return null;const label=[...card.querySelectorAll('small')].find(sm=>{const x=norm(sm.textContent);return x==='MARCHE'||x==='MARCHE HT';});if(!label)return null;let target=label.parentElement;if(!target)return null;while(target.parentElement&&target.parentElement!==card){const parent=target.parentElement;if(parent.querySelectorAll('small').length!==1)break;target=parent;}return target;}
function decorate(){const p=document.getElementById('pane-chantiers');if(!p)return;p.querySelectorAll('.card').forEach(card=>{card.querySelectorAll('[data-yaya-devis-docs="1"]').forEach(el=>{delete el.dataset.yayaDevisDocs;delete el.dataset.yayaChantierId;if(el.getAttribute('role')==='button')el.removeAttribute('role');if(el.getAttribute('tabindex')==='0')el.removeAttribute('tabindex');});const cid=cardId(card),m=marketTarget(card);if(!cid||!m)return;m.dataset.yayaDevisDocs='1';m.dataset.yayaChantierId=cid;m.setAttribute('role','button');m.setAttribute('tabindex','0');});}

css();const pane=document.getElementById('pane-chantiers');if(pane&&!pane.dataset.yayaDevisDocsDelegated){pane.dataset.yayaDevisDocsDelegated='1';pane.addEventListener('click',e=>{const t=e.target.closest('[data-yaya-devis-docs="1"]');if(!t)return;e.preventDefault();e.stopPropagation();openViewer(t.dataset.yayaChantierId||cardId(t.closest('.card')));},true);pane.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest('[data-yaya-devis-docs="1"]');if(!t)return;e.preventDefault();openViewer(t.dataset.yayaChantierId||cardId(t.closest('.card')));},true);}decorate();ensureCentral().catch(()=>{});let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;decorate();});}).observe(pane,{childList:true,subtree:true});window.yayaOpenDevisDocuments=openViewer;
})();
