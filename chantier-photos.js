(function(){
'use strict';
if(window.__YAYA_PHOTOS_V13)return;window.__YAYA_PHOTOS_V13=true;
var DEF='Titre à définir',TYPE='PHOTO',MAX=8*1024*1024,STYLE='yaya-photos-v13';
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase()}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function iso(v){var m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[1]+'-'+m[2]+'-'+m[3]:''}
function fr(v){var s=iso(v);if(!s)return 'Date à définir';var p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0]}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function docs(){try{return Array.isArray(S.documents)?S.documents:[]}catch(e){return[]}}
function isPhoto(d){return d&&norm(d.type)===TYPE}
function rows(cid){return docs().filter(function(d){return isPhoto(d)&&String(d.chantierId||'')===String(cid||'')}).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))})}
function isImageFile(file){var t=String(file&&file.type||'').toLowerCase(),n=String(file&&file.name||'');return t.indexOf('image/')===0||/\.(?:jpe?g|png|heic|heif|webp)$/i.test(n)}
function toastS(m,e){try{toast(m,!!e)}catch(x){}}
function id(){try{if(typeof uid==='function')return String(uid())}catch(e){}return 'photo-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)}
function cardId(card){if(!card)return'';var ns=card.querySelectorAll('[onclick]');for(var i=0;i<ns.length;i++){var m=String(ns[i].getAttribute('onclick')||'').match(/(?:toggleChantier|openDocumentModal|openAchat|openAvenant|delChantier)\(['"]([^'"]+)/);if(m)return m[1]}try{return String(focusChantier||'')}catch(e){return''}}
function root(){return document.getElementById('modalRoot')}
function close(){try{closeModal();return}catch(e){}var r=root();if(r)r.innerHTML=''}
function driveId(u){var s=String(u||''),m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);if(m)return m[1];m=s.match(/[?&]id=([^&#]+)/i);return m?decodeURIComponent(m[1]):''}
function preview(u){var x=driveId(u);return x?'https://drive.google.com/file/d/'+encodeURIComponent(x)+'/preview':String(u||'')}
function thumb(u,w){var x=driveId(u),z=Math.max(200,Number(w)||500);return x?'https://drive.google.com/thumbnail?id='+encodeURIComponent(x)+'&sz=w'+z:String(u||'')}
function download(u){var x=driveId(u);return x?'https://drive.google.com/uc?export=download&id='+encodeURIComponent(x):String(u||'')}

function apiUrl(){
  try{if(typeof API!=='undefined'&&API)return String(API)}catch(e){}
  return 'https://script.google.com/macros/s/AKfycbxXBpXjWXEF-7p6vvOE3blSBc8_5e62AtQb2stHjnrGE025cOxQGy-zAguYmN2u9O4K/exec';
}
var photoFileCache=new Map(),heicConverterPromise=null;
function base64Blob(base64,mime){
  var raw=atob(String(base64||'')),bytes=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  return new Blob([bytes],{type:mime||'image/jpeg'});
}
function isHeic(value,name){
  return /image\/hei[cf]/i.test(String(value&&value.type||value||''))||/\.(?:heic|heif)$/i.test(String(name||value&&value.name||''));
}
function ensureHeicConverter(){
  if(typeof window.heic2any==='function')return Promise.resolve(window.heic2any);
  if(heicConverterPromise)return heicConverterPromise;
  heicConverterPromise=new Promise(function(resolve,reject){
    var s=document.createElement('script'),done=false;
    var timer=setTimeout(function(){if(done)return;done=true;reject(new Error('Conversion HEIC indisponible'))},15000);
    s.src='https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
    s.async=true;
    s.onload=function(){if(done)return;done=true;clearTimeout(timer);typeof window.heic2any==='function'?resolve(window.heic2any):reject(new Error('Convertisseur HEIC invalide'))};
    s.onerror=function(){if(done)return;done=true;clearTimeout(timer);reject(new Error('Chargement du convertisseur HEIC impossible'))};
    document.head.appendChild(s);
  }).catch(function(e){heicConverterPromise=null;throw e});
  return heicConverterPromise;
}
async function convertHeicBlob(blob){
  var converter=await ensureHeicConverter();
  var out=await converter({blob:blob,toType:'image/jpeg',quality:.88});
  if(Array.isArray(out))out=out[0];
  if(!(out instanceof Blob))throw new Error('Conversion HEIC impossible');
  return out;
}
async function fetchPhotoFile(url){
  var key=String(url||'').trim();
  if(!key)throw new Error('Lien photo manquant');
  if(photoFileCache.has(key))return photoFileCache.get(key);
  var promise=(async function(){
    var api=apiUrl(),fid=driveId(key),ctrl=typeof AbortController!=='undefined'?new AbortController():null;
    if(!api||!fid)throw new Error('Lecture photo indisponible');
    var timer=ctrl?setTimeout(function(){try{ctrl.abort()}catch(e){}},20000):0;
    try{
      var opts={method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'getDriveFile',data:{url:key,id:fid}})};
      if(ctrl)opts.signal=ctrl.signal;
      var r=await fetch(api,opts);
      if(!r.ok)throw new Error('Lecture photo HTTP '+r.status);
      var j=await r.json();
      if(!j||j.ok!==true)throw new Error(j&&j.error?j.error:'Lecture photo impossible');
      var d=j.data||{};
      if(!d.base64)throw new Error('Photo vide');
      var mime=String(d.mimeType||'image/jpeg'),filename=String(d.filename||'photo');
      var blob=base64Blob(d.base64,mime);
      if(isHeic(blob,filename)){blob=await convertHeicBlob(blob);mime='image/jpeg';filename=filename.replace(/\.(?:heic|heif)$/i,'')+'.jpg'}
      return {url:URL.createObjectURL(blob),filename:filename,mimeType:mime};
    }catch(e){
      if(e&&e.name==='AbortError')throw new Error('Lecture photo trop longue');
      throw e;
    }finally{if(timer)clearTimeout(timer)}
  })();
  photoFileCache.set(key,promise);
  try{return await promise}catch(e){photoFileCache.delete(key);throw e}
}
window.yayaPhotoThumbFallback=async function(img){
  if(!img||img.dataset.yayaFallback==='1')return;
  img.dataset.yayaFallback='1';
  var tile=img.closest('.yaya-pic');
  try{
    var f=await fetchPhotoFile(img.dataset.photoLink||'');
    img.onload=function(){if(tile){tile.classList.add('loaded');tile.classList.remove('fallback')}};
    img.onerror=function(){img.style.display='none';if(tile){tile.classList.add('fallback');tile.classList.remove('loaded')}};
    img.src=f.url;
  }catch(e){
    img.style.display='none';
    if(tile){tile.classList.add('fallback');tile.classList.remove('loaded')}
  }
};
function hydratePhotoThumbs(pane){
  if(!pane)return;
  pane.querySelectorAll('.yaya-photo-thumb').forEach(function(img){
    var tile=img.closest('.yaya-pic');
    img.onload=function(){if(tile){tile.classList.add('loaded');tile.classList.remove('fallback')}};
    img.onerror=function(){window.yayaPhotoThumbFallback&&window.yayaPhotoThumbFallback(img)};
    if(img.complete&&img.naturalWidth>0){img.onload();return}
    setTimeout(function(){if(!img.isConnected)return;if(!img.complete||!img.naturalWidth)window.yayaPhotoThumbFallback&&window.yayaPhotoThumbFallback(img)},2200);
  });
}
function style(){if(document.getElementById(STYLE))return;var s=document.createElement('style');s.id=STYLE;s.textContent=
'#pane-chantiers .yaya-detail-section-tab[data-section="photos"]{background:#f2f7f3!important;border-color:#b8d6c0!important;color:#356b45!important}'+
'#pane-chantiers .yaya-detail-section-tab[data-section="photos"].on{background:#e1f0e5!important;border-color:#78ae87!important;color:#2f633e!important}'+
'#pane-chantiers .card[data-yaya-detail-section="photos"]>.yaya-detail-section-action-row[data-section="photos"]{display:flex!important}'+
'#pane-chantiers .yaya-detail-section-action-row[data-section="photos"]{background:#f3f8f4!important;border-left:4px solid #78ae87!important}'+
'#pane-chantiers .yaya-detail-section-action-row[data-section="photos"]>.yaya-detail-section-action-button{display:none!important}'+
'#pane-chantiers .yaya-photo-action-buttons{display:flex!important;gap:8px!important;align-items:center!important;flex-wrap:wrap!important;margin-left:auto!important}'+
'#pane-chantiers .yaya-photo-action-buttons button{min-height:36px!important;height:36px!important;padding:0 13px!important;border-radius:8px!important;font-size:11.5px!important;font-weight:850!important;white-space:nowrap!important;box-shadow:none!important}'+
'#pane-chantiers .yaya-photo-action-buttons .yaya-photo-camera-action{background:#173f69!important;border:1px solid #173f69!important;color:#fff!important}'+
'#pane-chantiers .yaya-photo-action-buttons .yaya-photo-camera-action:hover{background:#0f3154!important;border-color:#0f3154!important}'+
'#pane-chantiers .yaya-photo-action-buttons .yaya-photo-import-action{background:#fff!important;border:1px solid #7f98b3!important;color:#173f69!important}'+
'#pane-chantiers .yaya-photo-action-buttons .yaya-photo-import-action:hover{background:#eef4fa!important;border-color:#5f7f9f!important}'+
'@media(max-width:560px){#pane-chantiers .yaya-detail-section-action-row[data-section="photos"]{align-items:stretch!important}#pane-chantiers .yaya-photo-action-buttons{width:100%!important;margin-left:0!important;display:grid!important;grid-template-columns:1fr!important;gap:7px!important}#pane-chantiers .yaya-photo-action-buttons button{width:100%!important;justify-content:center!important}}'+
'#pane-chantiers .yaya-detail-photos-pane{display:none!important;margin:0 0 8px!important}#pane-chantiers .card[data-yaya-detail-section="photos"]>.yaya-detail-photos-pane[data-empty="0"]{display:block!important}'+
'.yaya-pg{margin:0 0 9px;border:1px solid #e0e7ee;border-radius:9px;overflow:hidden}.yaya-ph{display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;padding:7px 9px;background:#f7f9fb}.yaya-pd{font-size:11px;font-weight:800}.yaya-pt{font-size:11px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.yaya-pe{width:28px;height:28px;padding:0}.yaya-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;padding:7px}.yaya-pic{aspect-ratio:4/3;padding:0;border:1px solid #d8e1ea;border-radius:7px;overflow:hidden;background:#eef2f5}.yaya-pic img{width:100%;height:100%;object-fit:cover}.yaya-pic.fallback:after{content:\"📷\";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;color:#6b7d90}.yaya-photo-view-img{display:block;width:100%;height:min(70vh,760px);object-fit:contain;background:#eef1f4;border:1px solid #d9e1e8;border-radius:8px}'+
'#modalRoot .yaya-photo-overlay{align-items:center!important;justify-content:center!important;padding:12px!important;box-sizing:border-box!important}'+
'#modalRoot .yaya-photo-overlay>.modal{margin:auto!important;max-height:calc(100vh - 24px)!important;overflow:auto!important;box-sizing:border-box!important}'+
'#modalRoot .yaya-pa{width:min(680px,calc(100vw - 24px))!important}.yaya-pactions{display:flex;gap:8px;margin:12px 0;flex-wrap:wrap}.yaya-pactions button{flex:1 1 180px;min-height:42px}.yaya-pq{display:grid;gap:7px;max-height:42vh;overflow:auto}.yaya-pqr{display:grid;grid-template-columns:54px 1fr 145px;gap:8px;align-items:center;padding:6px;border:1px solid #dfe6ed;border-radius:7px}.yaya-pqr img{width:54px;height:44px;object-fit:cover;border-radius:5px}.yaya-pqr input{height:34px}.yaya-pframe{width:100%;height:70vh;border:1px solid #d9e1e8;border-radius:8px}.yaya-pfoot{display:flex;gap:8px;margin-top:10px}.yaya-pfoot .del{margin-right:auto}'+
'@media(max-width:760px){.yaya-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;padding:5px}.yaya-pqr{grid-template-columns:50px 1fr}.yaya-pqr input{grid-column:1/-1}.yaya-pframe{height:64vh}.yaya-pfoot{flex-wrap:wrap}.yaya-pfoot button{flex:1 1 95px}.yaya-pfoot .del{margin-right:0}}'+
'.yaya-pic-wrap{position:relative;min-width:0}.yaya-pic{position:relative;width:100%;display:flex;align-items:center;justify-content:center}.yaya-photo-placeholder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;color:#6b7d90;background:#eef2f5}.yaya-pic img{position:relative;z-index:1;opacity:0;transition:opacity .15s ease}.yaya-pic.loaded img{opacity:1}.yaya-pic.loaded .yaya-photo-placeholder{display:none}.yaya-pic.fallback .yaya-photo-placeholder{display:flex}.yaya-photo-delete{position:absolute;z-index:4;top:4px;right:4px;width:28px;height:28px;padding:0;border:1px solid rgba(255,255,255,.92);border-radius:8px;background:rgba(174,31,31,.94);color:#fff;font-size:17px;font-weight:900;line-height:1;box-shadow:0 2px 7px rgba(0,0,0,.22)}.yaya-photo-delete:disabled{opacity:.55}.yaya-photo-view-stage{position:relative;min-height:260px;background:#eef1f4;border:1px solid #d9e1e8;border-radius:8px;overflow:hidden}.yaya-photo-view-error{padding:24px;text-align:center;color:#6b7280;font-size:13px;font-weight:700}'+
'@media(max-width:560px){.yaya-photo-delete{width:30px;height:30px;top:3px;right:3px}}';document.head.appendChild(s)}
function groupTitle(list){for(var i=0;i<list.length;i++){var t=String(list[i].titre||'').trim();if(t&&norm(t)!==norm(DEF)&&norm(t)!=='PHOTO')return t}return DEF}
function ensurePane(card,tabs,list){
  var cid=cardId(card),pane=card.querySelector(':scope>.yaya-detail-photos-pane');
  if(!pane){pane=document.createElement('div');pane.className='yaya-detail-section-node yaya-detail-photos-pane';pane.dataset.section='photos';tabs.insertAdjacentElement('afterend',pane)}
  list=Array.isArray(list)?list:rows(cid);
  pane.dataset.empty=list.length?'0':'1';
  if(!list.length){pane.innerHTML='';return pane}
  var groups={};
  list.forEach(function(p){var d=iso(p.date)||'';(groups[d]||(groups[d]=[])).push(p)});
  pane.innerHTML=Object.keys(groups).sort().reverse().map(function(d){
    var a=groups[d],t=groupTitle(a);
    return '<section class="yaya-pg"><div class="yaya-ph"><b class="yaya-pd">'+esc(fr(d))+'</b><span class="yaya-pt">'+esc(t)+'</span><button class="yaya-pe" data-date="'+esc(d)+'">✏️</button></div><div class="yaya-grid">'+a.map(function(p){
      var image=p.lien?'<span class="yaya-photo-placeholder" aria-hidden="true">📷</span><img class="yaya-photo-thumb" src="'+esc(thumb(p.lien,500))+'" data-photo-link="'+esc(p.lien)+'" alt="Photo" loading="eager" decoding="async">':'<span class="yaya-photo-placeholder" aria-hidden="true">📷</span>';
      return '<div class="yaya-pic-wrap"><button type="button" class="yaya-pic" data-id="'+esc(p.id)+'" aria-label="Ouvrir la photo">'+image+'</button><button type="button" class="yaya-photo-delete" data-photo-delete-id="'+esc(p.id)+'" title="Supprimer cette photo" aria-label="Supprimer cette photo">×</button></div>';
    }).join('')+'</div></section>';
  }).join('');
  hydratePhotoThumbs(pane);
  return pane
}
window.yayaEnsurePhotosPane=ensurePane;window.yayaPhotosForChantier=rows;
function refresh(){style();document.querySelectorAll('#pane-chantiers .card:has(>.yaya-detail-section-tabs)').forEach(function(card){var tabs=card.querySelector(':scope>.yaya-detail-section-tabs');if(!tabs)return;var cid=cardId(card),a=rows(cid);ensurePane(card,tabs,a);var sm=tabs.querySelector('[data-section="photos"] small');if(sm){sm.textContent=String(a.length);sm.style.display='inline-flex'}var row=card.querySelector(':scope>.yaya-detail-section-action-row[data-section="photos"]');if(row){var box=row.querySelector('.yaya-photo-action-buttons');if(!box){box=document.createElement('span');box.className='yaya-photo-action-buttons';box.innerHTML='<button type="button" class="btnp yaya-photo-camera-action">📷 Prendre une photo</button><button type="button" class="btn2 yaya-photo-import-action">🖼 Importer des photos</button>';row.appendChild(box);box.querySelector('.yaya-photo-camera-action').onclick=function(e){e.preventDefault();e.stopPropagation();pickPhotos(cid,'camera')};box.querySelector('.yaya-photo-import-action').onclick=function(e){e.preventDefault();e.stopPropagation();pickPhotos(cid,'import')}}}})}
function readAscii(v,p,n){var o='';for(var i=0;i<n;i++){var c=v.getUint8(p+i);if(!c)break;o+=String.fromCharCode(c)}return o}
function parseExifDateText(raw){var m=String(raw||'').trim().match(/^(\d{4}):(\d{2}):(\d{2})/);return m?iso(m[1]+'-'+m[2]+'-'+m[3]):''}
async function exifDate(file){
    if(!file||!/(?:jpe?g)$/i.test(String(file.name||''))&&!/^image\/jpeg$/i.test(String(file.type||'')))return '';
    let buffer;
    try{buffer=await file.slice(0,512*1024).arrayBuffer();}catch(e){return '';}
    const view=new DataView(buffer);
    if(view.byteLength<4||view.getUint16(0,false)!==0xFFD8)return '';
    let offset=2;
    while(offset+4<view.byteLength){
      if(view.getUint8(offset)!==0xFF){offset++;continue;}
      const marker=view.getUint8(offset+1);
      if(marker===0xDA||marker===0xD9)break;
      const len=view.getUint16(offset+2,false);
      if(len<2||offset+2+len>view.byteLength)break;
      if(marker===0xE1){
        const data=offset+4;
        if(data+6<view.byteLength&&readAscii(view,data,6)==='Exif'){
          const tiff=data+6;
          if(tiff+8>=view.byteLength)return '';
          const endian=view.getUint16(tiff,false);
          const little=endian===0x4949;
          if(!little&&endian!==0x4D4D)return '';
          const u16=function(pos){return view.getUint16(pos,little);};
          const u32=function(pos){return view.getUint32(pos,little);};
          function readValue(entry){
            const type=u16(entry+2),count=u32(entry+4);
            if(type!==2||!count)return '';
            const ptr=count<=4?entry+8:tiff+u32(entry+8);
            if(ptr<0||ptr+count>view.byteLength)return '';
            return readAscii(view,ptr,count);
          }
          function scanIfd(ifdOffset,wantExif){
            const pos=tiff+ifdOffset;
            if(pos<0||pos+2>view.byteLength)return {date:'',exif:0};
            const n=u16(pos);let date='',exif=0;
            for(let i=0;i<n;i++){
              const entry=pos+2+i*12;if(entry+12>view.byteLength)break;
              const tag=u16(entry);
              if(tag===0x8769)exif=u32(entry+8);
              if(tag===0x0132||tag===0x9003||tag===0x9004){
                const parsed=parseExifDateText(readValue(entry));
                if(parsed){date=parsed;if(tag===0x9003)break;}
              }
            }
            return {date:date,exif:exif};
          }
          const ifd0=u32(tiff+4);
          const first=scanIfd(ifd0,false);
          if(first.exif){
            const second=scanIfd(first.exif,true);
            if(second.date)return second.date;
          }
          if(first.date)return first.date;
        }
      }
      offset+=2+len;
    }
    return '';
  }
function base64(file){return new Promise(function(ok,no){var r=new FileReader();r.onerror=no;r.onload=function(){ok(String(r.result||'').split(',')[1]||'')};r.readAsDataURL(file)})}
async function resize(file){
  var heic=isHeic(file,file&&file.name);
  if(heic){
    try{
      var converted=await convertHeicBlob(file);
      file=new File([converted],String(file.name||'photo').replace(/\.(?:heic|heif)$/i,'')+'.jpg',{type:'image/jpeg',lastModified:file.lastModified||Date.now()});
    }catch(e){
      throw new Error('Cette photo iPhone HEIC ne peut pas être convertie. Réessayez après quelques secondes.');
    }
  }
  if(file.size<=MAX)return file;
  var u=URL.createObjectURL(file);
  try{
    var img=await new Promise(function(ok,no){var i=new Image();i.onload=function(){ok(i)};i.onerror=no;i.src=u});
    var r=Math.min(1,1800/Math.max(img.width,img.height)),c=document.createElement('canvas');
    c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    var blob=await new Promise(function(ok){c.toBlob(ok,'image/jpeg',.84)});
    return blob?new File([blob],String(file.name||'photo').replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg',lastModified:file.lastModified||Date.now()}):file;
  }catch(e){return file}finally{URL.revokeObjectURL(u)}
}
async function archive(file){
  var api='';try{api=String(API||'')}catch(e){}
  if(!api)throw new Error('API Yaya indisponible');
  file=await resize(file);
  if(file.size>MAX)throw new Error('Photo trop lourde');
  var b=await base64(file);
  var ctrl=typeof AbortController!=='undefined'?new AbortController():null;
  var timer=ctrl?setTimeout(function(){try{ctrl.abort()}catch(e){}},60000):0;
  try{
    var opts={method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'archiverDevis',data:{filename:file.name,mimeType:file.type||'image/jpeg',base64:b}})};
    if(ctrl)opts.signal=ctrl.signal;
    var r=await fetch(api,opts);
    var j=await r.json();
    if(!j.ok)throw new Error(j.error||'Import impossible');
    var x=j.data||{},link=String(x.lienDrive||x.lien||'');
    if(!link)throw new Error(x.archiveErreur||'Photo non archivée');
    return link;
  }catch(e){
    if(e&&e.name==='AbortError')throw new Error('Import trop long — vérifiez la connexion');
    throw e;
  }finally{
    if(timer)clearTimeout(timer);
  }
}
function pickPhotos(cid,mode){
  cid=String(cid||'');
  var input=document.createElement('input');
  input.type='file';
  input.accept='image/*';
  if(mode==='camera')input.setAttribute('capture','environment');
  else input.multiple=true;
  input.style.position='fixed';
  input.style.left='-9999px';
  input.style.opacity='0';
  document.body.appendChild(input);

  function cleanupPicker(){
    if(input&&input.parentNode)input.parentNode.removeChild(input);
  }

  input.onchange=async function(){
    var files=Array.from(input.files||[]);
    cleanupPicker();
    if(!files.length)return;
    await openPhotoReview(cid,files,mode);
  };

  // Sur iPhone, le retour de la photothèque peut rendre le focus avant l'événement change.
  // Ne pas supprimer l'input sur focus : on attend change ou cancel.
  input.addEventListener('cancel',cleanupPicker,{once:true});

  input.click();
}

async function openPhotoReview(cid,files,mode){
  var r=root();
  if(!r)return;

  var q=[],urls=[];
  for(var f of Array.from(files||[])){
    if(!isImageFile(f))continue;
    var exif=mode==='camera'?'':await exifDate(f);
    var d=mode==='camera'?today():(exif||today());
    var u=URL.createObjectURL(f);
    urls.push(u);
    q.push({f:f,d:d,u:u,exif:!!exif});
  }

  if(!q.length){
    toastS('Aucune photo sélectionnée',true);
    return;
  }

  r.innerHTML='<div class="overlay yaya-photo-overlay"><div class="modal yaya-pa">'
    +'<h5>Photos sélectionnées<button class="cl">Fermer</button></h5>'
    +'<div class="note">Vérifiez la date puis cliquez sur Enregistrer.</div>'
    +'<div class="yaya-pq"></div>'
    +'<div class="msg note" style="min-height:20px;margin-top:8px"></div>'
    +'<div class="mfoot"><button class="btn2 cl">Annuler</button><button class="btnp go sv">Enregistrer les photos</button></div>'
    +'</div></div>';

  var m=r.querySelector('.yaya-pa');
  var qe=m.querySelector('.yaya-pq');
  var sv=m.querySelector('.sv');
  var msg=m.querySelector('.msg');

  function closeReview(){
    urls.forEach(function(u){
      try{URL.revokeObjectURL(u)}catch(e){}
    });
    close();
  }

  function draw(){
    qe.innerHTML=q.map(function(x,i){
      return '<div class="yaya-pqr">'
        +'<img src="'+esc(x.u)+'">'
        +'<div><b>'+esc(x.f.name)+'</b><div class="note">'+(x.exif?'Date de la photo':'Date proposée')+'</div></div>'
        +'<input type="date" data-i="'+i+'" value="'+esc(x.d)+'">'
        +'</div>';
    }).join('');
    sv.disabled=!q.length||q.some(function(x){return !iso(x.d)});
  }

  draw();

  m.querySelectorAll('.cl').forEach(function(b){
    b.onclick=closeReview;
  });

  qe.oninput=function(e){
    if(!e.target.matches('input[type=date]'))return;
    q[Number(e.target.dataset.i)].d=iso(e.target.value);
    draw();
  };

  sv.onclick=async function(){
    if(sv.disabled)return;

    sv.disabled=true;
    sv.textContent='Enregistrement lancé…';
    msg.innerHTML='<strong style="color:#173f69">Enregistrement lancé…</strong>';

    var batch=q.slice();

    // Le message reste brièvement visible, puis la modale se ferme.
    setTimeout(closeReview,650);

    var made=[],errors=0;
    for(var i=0;i<batch.length;i++){
      try{
        var link=await archive(batch[i].f);
        var d=iso(batch[i].d);
        var same=rows(cid).filter(function(p){return iso(p.date)===d});
        made.push({
          id:id(),
          chantierId:cid,
          type:'Photo',
          titre:groupTitle(same),
          sujet:batch[i].f.name||'Photo chantier',
          date:d,
          lien:link
        });
      }catch(e){
        errors++;
      }
    }

    if(!made.length){
      toastS('Enregistrement des photos impossible',true);
      return;
    }

    var before=docs().slice();
    S.documents=made.concat(before);

    var ok=false;
    try{ok=await apiPost('setDocuments',S.documents)}catch(e){}

    if(!ok){
      S.documents=before;
      toastS('Enregistrement des photos impossible',true);
      return;
    }

    try{render()}catch(e){}

    setTimeout(function(){
      refresh();
      document.querySelectorAll('[data-section="photos"]').forEach(function(b){
        if(cardId(b.closest('.card'))===cid)b.click();
      });
    },80);

    toastS(
      made.length+' photo(s) enregistrée(s) ✓'+(errors?' — '+errors+' erreur(s)':''),
      !!errors
    );
  };
}

window.openPhotosForChantier=function(cid){pickPhotos(cid,'import')};
window.yayaOpenPhotoCamera=function(cid){pickPhotos(cid,'camera')};
window.yayaOpenPhotoImport=function(cid){pickPhotos(cid,'import')};
function find(idv){return docs().find(function(d){return isPhoto(d)&&String(d.id)===String(idv)})}
async function deletePhoto(p,button,closeAfter){
  if(!p||!confirm('Supprimer cette photo ?'))return;
  if(button)button.disabled=true;
  var before=docs().slice(),next=before.filter(function(d){return String(d.id)!==String(p.id)});
  S.documents=next;
  var ok=false;
  try{ok=await apiPost('setDocuments',next)}catch(e){}
  if(!ok){S.documents=before;if(button)button.disabled=false;toastS('Suppression impossible',true);return}
  if(closeAfter)close();
  try{render()}catch(e){}
  setTimeout(refresh,60);
  toastS('Photo supprimée ✓');
}
async function openPic(p){
  if(!p)return;
  var r=root(),direct=thumb(p.lien,1600);
  r.innerHTML='<div class="overlay yaya-photo-overlay"><div class="modal"><h5>'+esc(fr(p.date))+' — '+esc(p.titre||DEF)+'<button class="cl">Fermer</button></h5><div class="yaya-photo-view-stage"><span class="yaya-photo-placeholder">📷</span>'+(direct?'<img class="yaya-photo-view-img" src="'+esc(direct)+'" alt="Photo chantier">':'')+'</div><div class="yaya-pfoot"><button class="btn2 del">Supprimer</button><button class="btn2 dl">Télécharger</button><button class="btnp cl">Fermer</button></div></div></div>';
  r.querySelectorAll('.cl').forEach(function(b){b.onclick=close});
  var stage=r.querySelector('.yaya-photo-view-stage'),view=stage&&stage.querySelector('img'),del=r.querySelector('.del'),dl=r.querySelector('.dl'),file=null;
  if(del)del.onclick=function(){deletePhoto(p,del,true)};
  if(dl)dl.onclick=function(){var a=document.createElement('a');a.href=file?file.url:download(p.lien);if(file)a.download=file.filename||'photo';else{a.target='_blank';a.rel='noopener'}a.click()};
  if(view)view.onerror=function(){view.remove();if(stage)stage.innerHTML='<div class="yaya-photo-view-error">Aperçu en cours de récupération…</div>'};
  try{
    file=await fetchPhotoFile(p.lien);
    if(!stage||!stage.isConnected)return;
    stage.innerHTML='<img class="yaya-photo-view-img" src="'+esc(file.url)+'" alt="Photo chantier">';
    var reliable=stage.querySelector('img');
    reliable.onerror=function(){stage.innerHTML='<div class="yaya-photo-view-error">Cette photo ne peut pas être affichée, mais elle reste téléchargeable.</div>'};
  }catch(e){
    if(stage&&stage.isConnected&&!stage.querySelector('img'))stage.innerHTML='<div class="yaya-photo-view-error">Cette photo ne peut pas être affichée, mais elle reste téléchargeable.</div>';
  }
}
function editTitle(cid,d,current){var r=root();r.innerHTML='<div class="overlay yaya-photo-overlay"><div class="modal"><h5>Titre du '+esc(fr(d))+'<button class="cl">Fermer</button></h5><div class="mrow"><input class="msel ti" maxlength="80" value="'+esc(current||DEF)+'"></div><div class="mfoot"><button class="btn2 cl">Annuler</button><button class="btnp go sv">Enregistrer</button></div></div></div>';r.querySelectorAll('.cl').forEach(function(b){b.onclick=close});r.querySelector('.sv').onclick=async function(){var v=String(r.querySelector('.ti').value||'').trim()||DEF,a=rows(cid).filter(function(p){return iso(p.date)===iso(d)}),old=a.map(function(p){return[p,p.titre]});a.forEach(function(p){p.titre=v});var ok=false;try{ok=await apiPost('setDocuments',S.documents)}catch(e){}if(!ok){old.forEach(function(x){x[0].titre=x[1]});return}close();refresh();toastS('Titre enregistré ✓')}}
document.addEventListener('click',function(e){
  var remove=e.target.closest&&e.target.closest('.yaya-photo-delete[data-photo-delete-id]');
  if(remove){e.preventDefault();e.stopPropagation();deletePhoto(find(remove.dataset.photoDeleteId),remove,false);return}
  var p=e.target.closest&&e.target.closest('.yaya-pic[data-id]');
  if(p){e.preventDefault();e.stopPropagation();openPic(find(p.dataset.id));return}
  var ed=e.target.closest&&e.target.closest('.yaya-pe[data-date]');
  if(ed){e.preventDefault();e.stopPropagation();var c=ed.closest('.card'),cid=cardId(c),d=ed.dataset.date;editTitle(cid,d,groupTitle(rows(cid).filter(function(p){return iso(p.date)===d})))}
},true);
style();refresh();var raf=0,pane=document.getElementById('pane-chantiers');if(pane)new MutationObserver(function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;refresh()})}).observe(pane,{childList:true,subtree:true});window.addEventListener('yaya:data-refreshed',refresh);
})();