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
function compact(root){
 (root||document).querySelectorAll('.message-ligne').forEach(row=>{
   row.style.cssText='display:grid!important;grid-template-columns:100px 110px minmax(0,1fr) 82px auto!important;align-items:center!important;gap:10px!important;height:46px!important;min-height:46px!important;max-height:46px!important;padding:5px 0!important;overflow:hidden!important';
   const a=row.querySelector('.message-apercu');
   if(a){a.style.cssText='display:block!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.2!important;font-size:12.5px!important;max-height:30px!important';}
 });
}
function run(){installStyle();compact(document);}
run(); setTimeout(run,50); setTimeout(run,300); setTimeout(run,1000);
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body||document.documentElement,{childList:true,subtree:true});
})();
