(function(){
'use strict';
const STYLE_ID='yaya-message-row-compact-fix';
function installStyle(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style'); s.id=STYLE_ID;
 s.textContent=`
 .message-ligne{display:grid!important;grid-template-columns:100px 110px minmax(0,1fr) 82px auto!important;align-items:center!important;gap:10px!important;height:46px!important;min-height:46px!important;max-height:46px!important;padding:5px 0!important;overflow:hidden!important}
 .message-ligne>*{min-width:0!important;max-height:36px!important;align-self:center!important}
 .message-ligne .message-categorie,.message-ligne .message-apercu{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.2!important}
 .message-ligne .message-apercu{display:block!important;font-size:12.5px!important}
 .message-ligne .message-date{white-space:nowrap!important;text-align:center!important}
 .message-ligne .message-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;white-space:nowrap!important;overflow:visible!important;max-height:none!important}
 @media(max-width:720px){.message-ligne{grid-template-columns:88px 90px minmax(150px,1fr) 72px auto!important;overflow-x:auto!important;overflow-y:hidden!important}}
 `;
 document.head.appendChild(s);
}
function cleanText(v){return String(v||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
function subjectFromValue(v){
 const raw=String(v||'');
 const m=raw.match(/(?:^|[\r\n>])\s*(?:Objet|Subject)\s*:\s*([^\r\n<>]{2,220})/i);
 if(m&&m[1])return cleanText(m[1]).slice(0,220);
 const t=cleanText(raw);
 if(!t)return '';
 if(t.length<=180&&!/^(bonjour|bonsoir|merci|cordialement|de\s*:|from\s*:|a\s*:|à\s*:|sent\s*:)/i.test(t))return t;
 return '';
}
function getId(row){
 const action=row.querySelector('[onclick*="voirMessageYaya"],[onclick*="editDocument"],[onclick*="delDocument"]');
 const oc=String(action&&action.getAttribute('onclick')||'');
 const m=oc.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/);
 return m?String(m[1]):'';
}
function objectForRow(row){
 try{
  const id=getId(row);
  const docs=(typeof S!=='undefined'&&Array.isArray(S.documents))?S.documents:[];
  const d=docs.find(x=>String(x.id)===id);
  if(d){
    const candidates=[d.subject,d.objet,d.titre];
    for(const c of candidates){const s=subjectFromValue(c);if(s)return s;}
    for(const c of [d.contenu,d.message,d.body,d.texte]){const s=subjectFromValue(c);if(s)return s;}
  }
 }catch(e){}
 const current=row.querySelector('.message-apercu');
 return subjectFromValue(current&&current.textContent)||'Objet non renseigné';
}
function compact(root){
 (root||document).querySelectorAll('.message-ligne').forEach(row=>{
   row.style.cssText='display:grid!important;grid-template-columns:100px 110px minmax(0,1fr) 82px auto!important;align-items:center!important;gap:10px!important;height:46px!important;min-height:46px!important;max-height:46px!important;padding:5px 0!important;overflow:hidden!important';
   const a=row.querySelector('.message-apercu');
   if(a){
     const wanted=objectForRow(row);
     if(a.textContent!==wanted)a.textContent=wanted;
     a.style.cssText='display:block!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.2!important;font-size:12.5px!important;max-height:30px!important';
   }
 });
}
function run(){installStyle();compact(document);}
run(); setTimeout(run,50); setTimeout(run,300); setTimeout(run,1000);
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body||document.documentElement,{childList:true,subtree:true});
})();
