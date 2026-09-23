(function(){
'use strict';
if(window.__YAYA_UNIFIED_V4_VIEWER__)return;
window.__YAYA_UNIFIED_V4_VIEWER__=true;

const MODAL_ID='yayaUnifiedV4Viewer';
const STYLE_ID='yaya-unified-v4-viewer-style';
let currentItems=[],currentIndex=0;

function text(v){return String(v==null?'':v).trim();}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function docs(){try{return typeof S!=='undefined'&&S&&Array.isArray(S.documents)?S.documents:[];}catch(e){return[];}}
function docById(id){id=text(id);return docs().find(d=>text(d&&d.id)===id)||null;}
function driveId(url){
  const s=text(url);let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if(m&&m[1])return m[1];
  m=s.match(/[?&]id=([^&#]+)/i);return m&&m[1]?decodeURIComponent(m[1]):'';
}
function directDownloadUrl(url){
  url=text(url);if(!url)return '';
  const id=driveId(url);
  if(id)return 'https://drive.usercontent.google.com/download?id='+encodeURIComponent(id)+'&export=download&confirm=t';
  try{
    const u=new URL(url,location.href);
    if(/(?:^|\.)dropbox\.com$/i.test(u.hostname)){u.searchParams.delete('raw');u.searchParams.set('dl','1');}
    return u.toString();
  }catch(e){return url;}
}
function mailBody(d){
  const raw=d&&(d.contenuMail||d.corpsMail||d.bodyMail||d.mailBody||d.body||d.contenu||d.message||d.titre)||'';
  if(!raw)return '';
  const holder=document.createElement('div');holder.innerHTML=String(raw);
  return text(holder.textContent||holder.innerText||raw);
}
function mailSubject(d){return text(d&&(d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet||d.sujet))||'Mail';}
function mailSender(d){return text(d&&(d.nomMail||d.expediteur||d.from||d.sender||d.sujet))||'Expéditeur non renseigné';}
function fileName(d,index){return text(d&&(d.pieceNom||d.nomFichier||d.filename||d.fileName||d.sujet||d.titre))||('Pièce '+(index+1));}
function fileUrl(d){return text(d&&(d.lienPieceJointe||d.pieceJointeUrl||d.attachmentUrl||d.fichierUrl||d.fileUrl||d.oneDriveWebUrl||d.dropboxUrl||d.lien));}

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;
  s.textContent=`
    #${MODAL_ID}{
      position:fixed;inset:0;z-index:60000;display:none;align-items:center;justify-content:center;
      padding:12px;background:rgba(12,27,47,.58);box-sizing:border-box;
    }
    #${MODAL_ID}.show{display:flex}
    #${MODAL_ID} .v4-card{
      width:min(1120px,calc(100vw - 24px));height:min(88dvh,820px);
      display:grid;grid-template-rows:auto minmax(0,1fr);background:#fff;border-radius:14px;
      box-shadow:0 28px 90px rgba(8,25,46,.34);overflow:hidden;
    }
    #${MODAL_ID} .v4-head{
      display:grid;
      grid-template-columns:auto minmax(120px,1fr) auto;
      grid-template-areas:"tabs filename actions";
      align-items:center;
      gap:12px;
      padding:9px 12px;
      border-bottom:1px solid #dfe6ee;
      color:#162d49;background:#fff;
      min-height:58px;
      box-sizing:border-box;
    }
    #${MODAL_ID} .v4-tabs{
      grid-area:tabs;
      display:flex;gap:6px;align-items:center;min-width:0;
      overflow-x:auto;padding:2px 1px;scrollbar-width:none;
    }
    #${MODAL_ID} .v4-tabs::-webkit-scrollbar{display:none}
    #${MODAL_ID} .v4-filename{
      grid-area:filename;
      min-width:0;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      text-align:center;
      font-size:13px;
      font-weight:850;
      color:#162d49;
    }
    #${MODAL_ID} .v4-tab{
      min-height:32px;border:1px solid #c8d8e8;border-radius:7px;background:#fff;color:#205f9d;
      padding:0 11px;font:inherit;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;
    }
    #${MODAL_ID} .v4-tab.on{background:#eaf4ff;border-color:#90bce6}
    #${MODAL_ID} .v4-head-actions{
      grid-area:actions;display:flex;align-items:center;justify-content:flex-end;
      gap:7px;min-width:0;white-space:nowrap
    }
    #${MODAL_ID} .v4-edit,#${MODAL_ID} .v4-download,#${MODAL_ID} .v4-delete,#${MODAL_ID} .v4-close{
      border:1px solid #9fc0df;background:#eef6ff;color:#245d91;border-radius:8px;
      min-height:34px;padding:0 13px;font:inherit;font-size:12px;font-weight:850;cursor:pointer;white-space:nowrap;
    }
    #${MODAL_ID} .v4-download{border-color:#b9dfc5;background:#eef9f1;color:#17653a}
    #${MODAL_ID} .v4-delete{border-color:#efc3c3;background:#fff5f5;color:#b42318}
    #${MODAL_ID} .v4-close{border-color:#cfd9e6;background:#fff;color:#334155}
    #${MODAL_ID} .v4-stage{min-height:0;overflow:hidden;background:#eef2f6}
    #${MODAL_ID} iframe{display:block;width:100%;height:100%;border:0;background:#fff}
    #${MODAL_ID} .v4-image{display:block;width:100%;height:100%;object-fit:contain;background:#fff}
    #${MODAL_ID} .v4-mail{height:100%;overflow:auto;background:#fff;padding:18px 22px;box-sizing:border-box;color:#21364f}
    #${MODAL_ID} .v4-mail-head{position:sticky;top:-18px;z-index:2;margin:-18px -22px 16px;padding:15px 22px 12px;border-bottom:1px solid #e3e9f0;background:#fff}
    #${MODAL_ID} .v4-mail-head strong{display:block;font-size:16px;line-height:1.35;color:#142c48}
    #${MODAL_ID} .v4-mail-meta{display:flex;align-items:center;gap:12px;margin-top:6px;color:#6b7b8d;font-size:11.5px;font-weight:650}
    #${MODAL_ID} .v4-mail-body{white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.55;color:#243b55}
    #${MODAL_ID} .v4-empty{height:100%;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;text-align:center;color:#708095;font-size:13px;font-weight:700}
    @media(max-width:760px){
      #${MODAL_ID}{padding:4px}
      #${MODAL_ID} .v4-card{width:calc(100vw - 8px);height:calc(100dvh - 8px);border-radius:8px}
      #${MODAL_ID} .v4-head{
        grid-template-columns:auto minmax(70px,1fr) auto;
        grid-template-areas:"tabs filename actions";
        gap:5px;
        padding:6px 7px;
        min-height:48px;
      }
      #${MODAL_ID} .v4-tab{
        min-height:30px!important;
        padding:0 8px!important;
        font-size:10px!important;
      }
      #${MODAL_ID} .v4-filename{
        font-size:10.5px!important;
      }
      #${MODAL_ID} .v4-head-actions{
        gap:4px!important;
        overflow:visible!important;
        max-width:none!important;
      }
      #${MODAL_ID} .v4-edit,
      #${MODAL_ID} .v4-download,
      #${MODAL_ID} .v4-delete,
      #${MODAL_ID} .v4-close{
        min-height:30px!important;
        padding:0 7px!important;
        font-size:9.5px!important;
        border-radius:7px!important;
      }
    }
  `;
  document.head.appendChild(s);
}

function ensureModal(){
  installStyle();
  let m=document.getElementById(MODAL_ID);
  if(m)return m;
  m=document.createElement('div');m.id=MODAL_ID;m.setAttribute('aria-hidden','true');
  m.innerHTML='<div class="v4-card" role="dialog" aria-modal="true"><div class="v4-head"><div class="v4-tabs"></div><div class="v4-filename"></div><div class="v4-head-actions"><button type="button" class="v4-edit">Modifier</button><button type="button" class="v4-download">Télécharger</button><button type="button" class="v4-delete">Supprimer</button><button type="button" class="v4-close">Fermer</button></div></div><div class="v4-stage"></div></div>';
  document.body.appendChild(m);
  m.querySelector('.v4-close').onclick=close;
  m.onclick=e=>{if(e.target===m)close();};
  return m;
}
function close(){
  const m=document.getElementById(MODAL_ID);
  if(m){
    m.classList.remove('show');m.setAttribute('aria-hidden','true');
    const f=m.querySelector('iframe');if(f)f.src='about:blank';
    const stage=m.querySelector('.v4-stage');if(stage)stage.replaceChildren();
  }
  currentItems=[];currentIndex=0;
}
function showItems(items,index){
  currentItems=Array.isArray(items)?items.filter(Boolean):[];
  currentIndex=Math.max(0,Math.min(Number(index)||0,Math.max(0,currentItems.length-1)));
  const m=ensureModal();render();m.classList.add('show');m.setAttribute('aria-hidden','false');
}
function render(){
  const m=ensureModal(),tabs=m.querySelector('.v4-tabs'),stage=m.querySelector('.v4-stage'),filename=m.querySelector('.v4-filename');
  const dl=m.querySelector('.v4-download'),edit=m.querySelector('.v4-edit'),del=m.querySelector('.v4-delete');
  tabs.replaceChildren();stage.replaceChildren();
  if(!currentItems.length){stage.innerHTML='<div class="v4-empty">Aucun élément à visualiser.</div>';return;}
  currentItems.forEach((item,i)=>{
    const b=document.createElement('button');b.type='button';b.className='v4-tab'+(i===currentIndex?' on':'');
    b.textContent=item.tab||('Pièce '+(i+1));b.title=item.title||b.textContent;b.onclick=()=>{currentIndex=i;render();};tabs.appendChild(b);
  });
  const item=currentItems[currentIndex];
  if(filename){
    filename.textContent=item.title||'';
    filename.title=item.title||'';
  }
  dl.style.display=item.kind==='mail'?'none':'inline-flex';
  edit.style.display=item.canEdit===false?'none':'inline-flex';
  del.style.display=item.canDelete===false?'none':'inline-flex';

  dl.onclick=e=>{e.preventDefault();e.stopPropagation();const url=directDownloadUrl(item.url);if(!url)return;const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.download='';document.body.appendChild(a);a.click();a.remove();};
  edit.onclick=e=>{e.preventDefault();e.stopPropagation();close();if(typeof item.onEdit==='function')setTimeout(item.onEdit,0);};
  del.onclick=e=>{e.preventDefault();e.stopPropagation();close();if(typeof item.onDelete==='function')setTimeout(item.onDelete,0);};

  if(item.kind==='mail'){
    const box=document.createElement('div');box.className='v4-mail';
    const head=document.createElement('div');head.className='v4-mail-head';
    const subj=document.createElement('strong');subj.textContent=item.title||'Mail';
    const meta=document.createElement('div');meta.className='v4-mail-meta';
    const from=document.createElement('span');from.textContent=item.sender||'Expéditeur non renseigné';meta.appendChild(from);
    if(item.date){const dt=document.createElement('span');dt.textContent=item.date;meta.appendChild(dt);}
    head.append(subj,meta);
    const body=document.createElement('div');body.className='v4-mail-body';body.textContent=item.body||'Contenu du mail indisponible.';
    box.append(head,body);stage.appendChild(box);return;
  }

  if(item.kind==='photo'){
    const img=document.createElement('img');img.className='v4-image';img.alt=item.title||'Photo';
    const id=driveId(item.url);
    img.src=id?'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w2200':item.url;
    img.onerror=function(){
      if(id){
        const iframe=document.createElement('iframe');iframe.src='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';iframe.title=item.title||'Photo';stage.replaceChildren(iframe);
      }
    };
    stage.appendChild(img);return;
  }

  if(!item.url){stage.innerHTML='<div class="v4-empty">Lien de cette pièce introuvable.</div>';return;}
  const id=driveId(item.url);
  const iframe=document.createElement('iframe');
  iframe.src=id?'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview':item.url;
  iframe.title=item.title||'Pièce jointe';iframe.loading='eager';iframe.referrerPolicy='no-referrer-when-downgrade';
  stage.appendChild(iframe);
}

function mailItems(id){
  const mail=docById(id);if(!mail)return [];
  const items=[{
    kind:'mail',id:text(mail.id),tab:'📧 Mail',title:mailSubject(mail),sender:mailSender(mail),date:text(mail.date),body:mailBody(mail),
    onEdit:()=>{if(typeof window.__yayaEditMailSubject==='function')window.__yayaEditMailSubject(text(mail.id));},
    onDelete:()=>{try{if(typeof window.delDocument==='function')window.delDocument(text(mail.id));else if(typeof delDocument==='function')delDocument(text(mail.id));}catch(e){}}
  }];
  const pjs=docs().filter(d=>String(d&&d.type||'').toUpperCase()==='MAIL_PJ'&&text(d.sujet)===text(mail.id));
  pjs.forEach((d,i)=>items.push({
    kind:'file',id:text(d.id),tab:'📎 Pièce '+(i+1),title:fileName(d,i),url:fileUrl(d),
    onEdit:()=>{try{if(typeof window.editDocument==='function')window.editDocument(text(d.id));else if(typeof editDocument==='function')editDocument(text(d.id));}catch(e){}},
    onDelete:()=>{try{if(typeof window.delDocument==='function')window.delDocument(text(d.id));else if(typeof delDocument==='function')delDocument(text(d.id));}catch(e){}}
  }));
  return items;
}
function openMail(id){const items=mailItems(id);if(!items.length)return false;showItems(items,0);return true;}
function openMailAttachment(id){
  const d=docById(id);if(!d)return false;
  const parent=text(d.sujet),items=mailItems(parent);
  if(!items.length)return false;
  const index=Math.max(1,items.findIndex(x=>text(x.id)===text(id)));
  showItems(items,index);return true;
}
function openDocument(id,url){
  const d=docById(id),u=text(url)||fileUrl(d);
  const item={kind:'file',id:text(id),tab:'📎 Pièce 1',title:fileName(d,0),url:u,
    onEdit:()=>{try{if(typeof window.editDocument==='function')window.editDocument(text(id));else if(typeof editDocument==='function')editDocument(text(id));}catch(e){}},
    onDelete:()=>{try{if(typeof window.delDocument==='function')window.delDocument(text(id));else if(typeof delDocument==='function')delDocument(text(id));}catch(e){}}
  };
  showItems([item],0);return true;
}
function openPhoto(id){
  const p=docById(id);if(!p)return false;
  const list=docs().filter(d=>String(d&&d.type||'').toUpperCase()==='PHOTO'&&text(d.chantierId)===text(p.chantierId)&&text(d.date)===text(p.date))
    .sort((a,b)=>text(b.id).localeCompare(text(a.id)));
  const items=(list.length?list:[p]).map((d,i)=>({
    kind:'photo',id:text(d.id),tab:'📷 Photo '+(i+1),title:(text(d.date)?text(d.date)+' — ':'')+(text(d.titre)||'Photo'),url:fileUrl(d),
    canEdit:typeof window.__yayaPhotoEditById==='function',
    onEdit:()=>{if(typeof window.__yayaPhotoEditById==='function')window.__yayaPhotoEditById(text(d.id));},
    onDelete:()=>{if(typeof window.__yayaPhotoDeleteById==='function')window.__yayaPhotoDeleteById(text(d.id));}
  }));
  const index=Math.max(0,items.findIndex(x=>text(x.id)===text(id)));
  showItems(items,index);return true;
}

window.yayaUnifiedV4Viewer={openMail,openMailAttachment,openDocument,openPhoto,close};
installStyle();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById(MODAL_ID)?.classList.contains('show'))close();});
})();