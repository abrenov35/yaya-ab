(function(){
'use strict';
const STYLE_ID='yaya-message-row-compact-fix';
function installStyle(){
 let s=document.getElementById(STYLE_ID);
 if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
 s.textContent=`
 .message-ligne{grid-template-columns:100px 110px minmax(0,1fr) 82px auto!important;align-items:center!important;gap:10px!important;height:46px!important;min-height:46px!important;max-height:46px!important;padding:5px 0!important;overflow:hidden!important}
 .message-ligne>*{min-width:0!important;max-height:36px!important;align-self:center!important}
 .message-ligne .message-categorie,.message-ligne .message-apercu{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.2!important}
 .message-ligne .message-apercu{font-size:12.5px!important}
 .message-ligne .message-date{white-space:nowrap!important;text-align:center!important}
 @media(max-width:720px){.message-ligne{grid-template-columns:88px 90px minmax(150px,1fr) 72px auto!important;overflow-x:auto!important;overflow-y:hidden!important}}
 `;
}
function looksLikeBody(v){const t=String(v||'').replace(/\s+/g,' ').trim();if(!t)return true;if(t.length>180)return true;if(/\b(Bonjour|Bonsoir|Cordialement|Merci|Bien à vous|a écrit|De\s*:|From\s*:|Envoyé\s*:|Sent\s*:|Téléphone|www\.)\b/i.test(t)&&t.length>90)return true;return false;}
function subjectFor(d){for(const v of [d&&d.subject,d&&d.objet,d&&d.mailSubject,d&&d.emailSubject,d&&d.intitule]){const t=String(v||'').replace(/\s+/g,' ').trim();if(t&&!looksLikeBody(t))return t.replace(/^objet\s*:\s*/i,'');}return 'Objet non renseigné';}
function compact(root){
 (root||document).querySelectorAll('.message-ligne').forEach(row=>{
   row.style.setProperty('grid-template-columns','100px 110px minmax(0,1fr) 82px auto','important');
   row.style.setProperty('align-items','center','important');
   row.style.setProperty('gap','10px','important');
   row.style.setProperty('height','46px','important');
   row.style.setProperty('min-height','46px','important');
   row.style.setProperty('max-height','46px','important');
   row.style.setProperty('padding','5px 0','important');
   row.style.setProperty('overflow','hidden','important');
   const a=row.querySelector('.message-apercu');
   if(a){
     let d=null;const action=row.querySelector('[onclick*="voirMessageYaya"]');const raw=String(action&&action.getAttribute('onclick')||'');const m=raw.match(/voirMessageYaya\(['\"]([^'\"]+)/);
     try{if(m&&typeof S!=='undefined'&&Array.isArray(S.documents))d=S.documents.find(x=>String(x.id)===String(m[1]))||null;}catch(e){}
     a.textContent=subjectFor(d);
   }
 });
}
function run(){installStyle();compact(document);}
run();setTimeout(run,50);setTimeout(run,300);setTimeout(run,1000);
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body||document.documentElement,{childList:true,subtree:true});
})();
