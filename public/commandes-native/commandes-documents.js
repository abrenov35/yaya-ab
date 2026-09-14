(()=>{
  'use strict';

  const VERSION='0.1-background-documents';
  const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
  const MAX_BYTES=8*1024*1024;
  const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
  const ID_STORE='YAYA_COMMANDES_NATIVE_DOC_IDS_V1';
  const jobs=new Map();
  let currentOrderId='';

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const uid=()=>globalThis.crypto?.randomUUID?.()||(Date.now()+'-'+Math.random().toString(36).slice(2));
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function readState(){
    for(const key of CACHE_KEYS){
      try{
        const raw=localStorage.getItem(key);if(!raw)continue;
        const data=JSON.parse(raw);
        if(Array.isArray(data?.orders))return {key,data};
      }catch(_){ }
    }
    return {key:'AB_COMMANDES_LOCAL_STATE_V1',data:{savedAt:Date.now(),orders:[],documents:[]}};
  }

  function writeDocuments(nextDocs){
    for(const key of CACHE_KEYS){
      try{
        const raw=localStorage.getItem(key);
        const data=raw?JSON.parse(raw):{};
        if(!Array.isArray(data?.orders))continue;
        data.documents=Array.isArray(nextDocs)?nextDocs:[];
        data.savedAt=Date.now();
        localStorage.setItem(key,JSON.stringify(data));
      }catch(_){ }
    }
  }

  function orders(){return readState().data.orders||[];}
  function documents(){const a=readState().data.documents;return Array.isArray(a)?a:[];}
  function orderById(id){return orders().find(o=>String(o?.id||'')===String(id||''))||null;}
  function docsFor(id){return documents().filter(d=>String(d?.commande_id||'')===String(id||''));}

  function injectStyle(){
    if(document.getElementById('yaya-cmd-native-doc-style'))return;
    const s=document.createElement('style');
    s.id='yaya-cmd-native-doc-style';
    s.textContent=`
      .cmd-row>div:last-child{display:flex;gap:6px;align-items:center;justify-content:flex-end}
      .cmd-doc-btn{border:1px solid #cfd9e6;background:#fff;color:#1f5f9f;border-radius:8px;height:34px;min-width:44px;padding:0 9px;cursor:pointer;font-weight:850;white-space:nowrap}
      .cmd-doc-btn.has{background:#edf6ff;border-color:#b9d8f4}
      #cmdDocModal{position:fixed;inset:0;z-index:500;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(12,27,47,.56);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
      #cmdDocModal.show{display:flex}
      #cmdDocModal .cmd-doc-card{width:min(560px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:15px;box-shadow:0 26px 80px rgba(8,25,46,.3);padding:18px}
      #cmdDocModal .cmd-doc-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}
      #cmdDocModal .cmd-doc-head h3{margin:0;font-size:19px;color:#14213d}
      #cmdDocModal .cmd-doc-sub{margin-top:4px;color:#718096;font-size:11px;font-weight:700}
      #cmdDocModal .cmd-doc-close{border:0;background:#f3f5f8;color:#32445f;width:34px;height:34px;border-radius:8px;font-size:21px;cursor:pointer}
      #cmdDocFile{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}
      #cmdDocDrop{display:flex;align-items:center;justify-content:center;min-height:90px;padding:14px;border:2px dashed #b7c6d8;border-radius:11px;background:#f8fafc;text-align:center;cursor:pointer}
      #cmdDocDrop:hover,#cmdDocDrop.drag{border-color:#5c87bd;background:#f0f6fd}
      #cmdDocDrop strong{display:block;color:#173a60;font-size:13px;margin-bottom:4px}
      #cmdDocDrop span{display:block;color:#718096;font-size:10px}
      #cmdDocMeta{display:none;margin-top:8px;padding:8px 10px;border:1px solid #d7e0ea;border-radius:8px;background:#f6f8fb;color:#33445f;font-size:11px;font-weight:700}
      #cmdDocActions{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}
      #cmdDocSend{border:0;border-radius:8px;background:#173a60;color:#fff;min-height:36px;padding:0 13px;font-size:11px;font-weight:850;cursor:pointer}
      #cmdDocSend:disabled{opacity:.48;cursor:not-allowed}
      #cmdDocCancel{border:1px solid #cfd8e4;border-radius:8px;background:#fff;color:#29425f;min-height:36px;padding:0 13px;font-size:11px;font-weight:850;cursor:pointer}
      #cmdDocList{display:grid;gap:7px;margin-top:14px;padding-top:12px;border-top:1px solid #e5eaf1}
      .cmd-doc-item{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px;align-items:center;border:1px solid #e5eaf1;border-radius:9px;padding:8px 9px}
      .cmd-doc-item a{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1f5cc6;font-size:12px;font-weight:800;text-decoration:none}
      .cmd-doc-item button,.cmd-doc-item .cmd-doc-view{border:1px solid #d8e0ea;background:#fff;color:#24405f;border-radius:7px;min-height:30px;padding:0 8px;font-size:10px;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
      .cmd-doc-item .cmd-doc-delete{color:#b52d44;border-color:#f0ccd4}
      #cmdDocBgToast{position:fixed;right:18px;bottom:18px;z-index:650;display:none;max-width:min(430px,calc(100vw - 36px));padding:11px 14px;border-radius:10px;background:#173a60;color:#fff;box-shadow:0 12px 32px rgba(9,28,50,.24);font-size:12px;font-weight:850;pointer-events:none}
      #cmdDocBgToast.show{display:block}#cmdDocBgToast.ok{background:#177245}#cmdDocBgToast.err{background:#a82f43}
      @media(max-width:760px){.cmd-row>div:last-child{justify-content:flex-start}.cmd-doc-item{grid-template-columns:minmax(0,1fr) auto}.cmd-doc-item .cmd-doc-delete{grid-column:2}}
    `;
    document.head.appendChild(s);
  }

  function toast(text,kind=''){
    injectStyle();
    let el=document.getElementById('cmdDocBgToast');
    if(!el){el=document.createElement('div');el.id='cmdDocBgToast';document.body.appendChild(el);}
    el.textContent=text||'';el.className='show'+(kind?' '+kind:'');
    clearTimeout(el.__timer);el.__timer=setTimeout(()=>{el.className='';},kind==='err'?6500:4200);
  }

  function ensureModal(){
    injectStyle();
    let modal=document.getElementById('cmdDocModal');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='cmdDocModal';modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="cmd-doc-card" role="dialog" aria-modal="true" aria-labelledby="cmdDocTitle">
      <div class="cmd-doc-head"><div><h3 id="cmdDocTitle">Documents</h3><div id="cmdDocSub" class="cmd-doc-sub"></div></div><button id="cmdDocClose" class="cmd-doc-close" type="button">×</button></div>
      <input id="cmdDocFile" type="file">
      <label id="cmdDocDrop" for="cmdDocFile" tabindex="0"><div><strong>Choisir un fichier</strong><span>PDF, image, Word, Excel ou autre · 8 Mo maximum</span></div></label>
      <div id="cmdDocMeta"></div>
      <div id="cmdDocActions"><button id="cmdDocCancel" type="button">Fermer</button><button id="cmdDocSend" type="button" disabled>Envoyer en arrière-plan</button></div>
      <div id="cmdDocList"></div>
    </div>`;
    document.body.appendChild(modal);
    const input=document.getElementById('cmdDocFile');
    const drop=document.getElementById('cmdDocDrop');
    input.addEventListener('change',()=>selectFile(input.files?.[0]||null));
    drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}});
    ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('drag');}));
    ['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('drag');}));
    drop.addEventListener('drop',e=>{const f=e.dataTransfer?.files?.[0]||null;if(!f)return;try{const dt=new DataTransfer();dt.items.add(f);input.files=dt.files;}catch(_){}selectFile(f);});
    document.getElementById('cmdDocSend').addEventListener('click',startUpload);
    document.getElementById('cmdDocCancel').addEventListener('click',closeModal);
    document.getElementById('cmdDocClose').addEventListener('click',closeModal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
    return modal;
  }

  function humanSize(bytes){const n=Number(bytes||0);if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' Ko';return (n/(1024*1024)).toFixed(1).replace('.0','')+' Mo';}
  function selectFile(file){
    const meta=document.getElementById('cmdDocMeta'),send=document.getElementById('cmdDocSend');
    if(meta){meta.style.display='none';meta.textContent='';}
    if(!file){if(send)send.disabled=true;return;}
    if(file.size>MAX_BYTES){toast('Fichier trop volumineux : 8 Mo maximum.','err');if(send)send.disabled=true;return;}
    if(meta){meta.style.display='block';meta.textContent='📎 '+String(file.name||'fichier')+' · '+humanSize(file.size);}
    if(send)send.disabled=false;
  }

  function renderDocList(){
    const box=document.getElementById('cmdDocList');if(!box)return;
    const list=docsFor(currentOrderId);
    box.innerHTML=list.length?list.map(d=>`<div class="cmd-doc-item"><a href="${esc(d.url_pdf||'#')}" target="_blank" rel="noopener">📄 ${esc(d.nom_fichier||d.type||'Fichier')}</a><a class="cmd-doc-view" href="${esc(d.url_pdf||'#')}" target="_blank" rel="noopener">Voir</a><button class="cmd-doc-delete" type="button" data-doc-delete="${esc(d.id||'')}">×</button></div>`).join(''):'<div style="font-size:12px;color:#7a879c;padding:6px 0">Aucun document lié à cette commande.</div>';
    box.querySelectorAll('[data-doc-delete]').forEach(btn=>btn.addEventListener('click',()=>deleteDocument(btn.dataset.docDelete)));
  }

  function openModal(orderId){
    const order=orderById(orderId);if(!order)return;
    currentOrderId=String(order.id||'');
    const modal=ensureModal();
    document.getElementById('cmdDocSub').textContent=[order.chantier,order.produit].filter(Boolean).join(' · ');
    const input=document.getElementById('cmdDocFile');if(input)input.value='';selectFile(null);renderDocList();
    modal.classList.add('show');modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){const m=document.getElementById('cmdDocModal');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');}currentOrderId='';}

  function fileType(file){
    const n=String(file?.name||'').toLowerCase(),m=String(file?.type||'').toLowerCase();
    if(m==='application/pdf'||n.endsWith('.pdf'))return 'PDF';
    if(m.startsWith('image/')||/\.(jpg|jpeg|png|gif|webp|heic|heif|bmp|tif|tiff)$/i.test(n))return 'Image';
    if(/\.(doc|docx|odt|rtf)$/i.test(n)||m.includes('word'))return 'Word';
    if(/\.(xls|xlsx|xlsm|csv|ods)$/i.test(n)||m.includes('excel')||m.includes('spreadsheet')||m.includes('csv'))return 'Excel';
    return 'Fichier';
  }
  function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const s=String(r.result||'');resolve(s.includes(',')?s.split(',').pop():s);};r.onerror=()=>reject(new Error('Lecture du fichier impossible.'));r.readAsDataURL(file);});}
  function yieldUi(){return new Promise(resolve=>{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>resolve(),{timeout:180});else setTimeout(resolve,0);});}

  function stableId(order,file){
    const key=[String(order.id||''),String(file.name||''),String(file.size||0),String(file.lastModified||0)].join('|');
    let all={};try{all=JSON.parse(sessionStorage.getItem(ID_STORE)||'{}')||{};}catch(_){}
    if(all[key])return {key,id:String(all[key])};
    const id=uid();all[key]=id;try{sessionStorage.setItem(ID_STORE,JSON.stringify(all));}catch(_){}
    return {key,id:String(id)};
  }

  function targetedJsonp(id){return new Promise((resolve,reject)=>{
    const cb='__yayaCmdDoc_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;
    const clean=()=>{if(done)return;done=true;try{delete window[cb];}catch(_){window[cb]=undefined;}s.remove();};
    const timer=setTimeout(()=>{clean();reject(new Error('Confirmation trop longue.'));},4500);
    window[cb]=data=>{clearTimeout(timer);clean();resolve(data);};
    s.onerror=()=>{clearTimeout(timer);clean();reject(new Error('Vérification impossible.'));};
    s.src=GAS+'?action=document&id='+encodeURIComponent(id)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
    document.head.appendChild(s);
  });}
  async function findDoc(id){try{const r=await targetedJsonp(id);return r?.ok&&r.document&&String(r.document.id||'')===String(id)?r.document:null;}catch(_){return null;}}
  async function waitDoc(id){for(let i=0;i<6;i++){if(i)await wait(650);const d=await findDoc(id);if(d)return d;}return null;}

  function updateCount(orderId){
    document.querySelectorAll('[data-doc-order-id="'+CSS.escape(String(orderId))+'"]').forEach(btn=>{
      const n=docsFor(orderId).length;btn.textContent='📎'+(n?' '+n:'');btn.classList.toggle('has',n>0);
    });
  }

  async function runUpload(job){
    try{
      await yieldUi();
      let found=await findDoc(job.id);
      if(!found){
        const base64=await fileToBase64(job.file);
        await yieldUi();
        const payload={action:'document_upload',id:job.id,commande_id:job.orderId,chantier:job.chantier,type:fileType(job.file),file_name:job.fileName,nom_fichier:job.fileName,mime_type:String(job.file.type||'application/octet-stream'),file_base64:base64,source:'Google Drive'};
        await fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload)});
        found=await waitDoc(job.id);
      }
      if(!found)throw new Error('Envoi non confirmé.');
      const next=documents();const i=next.findIndex(d=>String(d.id||'')===String(found.id||''));if(i>=0)next[i]=found;else next.push(found);writeDocuments(next);
      updateCount(job.orderId);
      toast('Document enregistré : '+job.fileName,'ok');
    }catch(err){
      console.error('Yaya Commandes native · document arrière-plan',err);
      toast('Échec document : '+job.fileName+' · '+(err?.message||'réessayer'),'err');
    }finally{jobs.delete(job.key);}
  }

  function startUpload(){
    const order=orderById(currentOrderId),input=document.getElementById('cmdDocFile'),file=input?.files?.[0]||null;
    if(!order){toast('Commande introuvable.','err');return;}
    if(!file){toast('Choisis un fichier.','err');return;}
    if(file.size>MAX_BYTES){toast('Fichier trop volumineux : 8 Mo maximum.','err');return;}
    const stable=stableId(order,file);
    if(jobs.has(stable.key)){toast('Ce fichier est déjà en cours d’envoi.');closeModal();return;}
    const job={key:stable.key,id:stable.id,orderId:String(order.id||''),chantier:String(order.chantier||''),file,fileName:String(file.name||'fichier')};
    jobs.set(job.key,job);
    closeModal();
    toast('Envoi en arrière-plan : '+job.fileName);
    setTimeout(()=>runUpload(job),0);
  }

  function deleteDocument(id){
    if(!id||!confirm('Supprimer ce document ?'))return;
    const before=documents();const doc=before.find(d=>String(d.id||'')===String(id));
    const next=before.filter(d=>String(d.id||'')!==String(id));writeDocuments(next);
    if(doc)updateCount(doc.commande_id);
    renderDocList();
    toast('Suppression enregistrée localement — envoi en arrière-plan');
    const body=new URLSearchParams({action:'document_delete',id:String(id)});
    fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body})
      .then(()=>toast('Document supprimé','ok'))
      .catch(err=>{console.warn('Yaya Commandes native · suppression document',err);toast('Suppression distante à contrôler avec Actualiser','err');});
  }

  function enhanceRows(){
    document.querySelectorAll('.cmd-row[data-id]').forEach(row=>{
      const id=String(row.dataset.id||'');if(!id)return;
      let btn=row.querySelector('[data-doc-order-id]');
      if(!btn){
        const last=row.lastElementChild;if(!last)return;
        btn=document.createElement('button');btn.type='button';btn.className='cmd-doc-btn';btn.dataset.docOrderId=id;btn.title='Documents';
        last.insertBefore(btn,last.firstChild);
        btn.addEventListener('click',()=>openModal(id));
      }
      const n=docsFor(id).length;btn.textContent='📎'+(n?' '+n:'');btn.classList.toggle('has',n>0);
    });
  }

  injectStyle();ensureModal();enhanceRows();
  const list=document.getElementById('cmdList');
  if(list)new MutationObserver(()=>enhanceRows()).observe(list,{childList:true,subtree:true});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('cmdDocModal')?.classList.contains('show'))closeModal();});
  window.__YAYA_COMMANDES_NATIVE_DOCUMENTS_VERSION=VERSION;
})();
