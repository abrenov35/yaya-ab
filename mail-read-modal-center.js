(function(){
  'use strict';
  if(window.__yayaMailReadFullscreenV2)return;
  window.__yayaMailReadFullscreenV2=true;

  const STYLE_ID='yaya-mail-read-fullscreen-style-v2';
  const CENTER_CLASS='yaya-mail-read-fullscreen';

  function installStyle(){
    if(document.getElementById(STYLE_ID)) return;

    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .overlay.${CENTER_CLASS}{
        position:fixed!important;
        inset:0!important;
        align-items:flex-start!important;
        justify-content:stretch!important;
        padding:var(--yaya-mail-safe-top,72px) 0 0!important;
        box-sizing:border-box!important;
        overflow:hidden!important;
        background:#fff!important;
      }

      .overlay.${CENTER_CLASS} > .modal{
        width:100vw!important;
        max-width:none!important;
        height:calc(100dvh - var(--yaya-mail-safe-top,72px))!important;
        max-height:none!important;
        min-height:0!important;
        margin:0!important;
        padding:10px 14px 14px!important;
        border-radius:0!important;
        box-shadow:none!important;
        box-sizing:border-box!important;
        overflow-y:auto!important;
        overscroll-behavior:contain!important;
        background:#fff!important;
      }

      .overlay.${CENTER_CLASS} > .modal > h5{
        position:sticky!important;
        top:-10px!important;
        z-index:40!important;
        margin:0!important;
        padding:8px 0 10px!important;
        background:#fff!important;
      }

      .overlay.${CENTER_CLASS} > .modal > .yaya-read-actions,
      .overlay.${CENTER_CLASS} > .modal > .yaya-mail-read-actions,
      .overlay.${CENTER_CLASS} > .modal > .yaya-global-actions{
        position:sticky!important;
        top:38px!important;
        z-index:39!important;
        margin:0 0 12px!important;
        padding:7px 0 10px!important;
        background:#fff!important;
      }

      .overlay.${CENTER_CLASS} .yaya-mail-clickable-link{
        color:#0b57d0!important;
        text-decoration:underline!important;
        text-underline-offset:2px!important;
        overflow-wrap:anywhere!important;
        word-break:break-word!important;
        cursor:pointer!important;
      }

      @media(max-width:640px){
        .overlay.${CENTER_CLASS}{
          padding:var(--yaya-mail-safe-top,64px) 0 0!important;
        }
        .overlay.${CENTER_CLASS} > .modal{
          width:100vw!important;
          height:calc(100dvh - var(--yaya-mail-safe-top,64px))!important;
          padding:7px 8px 10px!important;
        }
        .overlay.${CENTER_CLASS} > .modal > h5{
          top:-7px!important;
          padding:6px 0 8px!important;
        }
        .overlay.${CENTER_CLASS} > .modal > .yaya-read-actions,
        .overlay.${CENTER_CLASS} > .modal > .yaya-mail-read-actions,
        .overlay.${CENTER_CLASS} > .modal > .yaya-global-actions{
          top:34px!important;
          padding:5px 0 8px!important;
        }
      }
`;
    document.head.appendChild(style);
  }

  function isMailReadModal(modal){
    if(!modal) return false;

    const txt=String(modal.textContent || '').replace(/\s+/g,' ').trim();

    if(modal.classList.contains('message-modal')||modal.classList.contains('yaya-mail-body-modal')) return true;
    if(modal.querySelector('.b-mail')) return true;
    if(/Objet non renseigné/i.test(txt)) return true;
    if(/Voir mail/i.test(txt)) return true;
    if(/Échange chantier|Echange chantier/i.test(txt)) return true;

    return false;
  }

  function safeTopPx(){
    let top=12;
    const hdr=document.querySelector('.hdr');
    if(hdr){
      const r=hdr.getBoundingClientRect();
      if(r.height>0 && r.bottom>0){
        top=Math.ceil(r.bottom)+18;
      }
    }
    return Math.max(12,Math.min(top,180));
  }

  function linkifyTextNode(node){
    if(!node || node.nodeType!==Node.TEXT_NODE) return;
    if(!node.nodeValue || !/(https?:\/\/|www\.)/i.test(node.nodeValue)) return;

    const parent=node.parentElement;
    if(!parent) return;
    if(parent.closest('a,button,script,style,textarea,input,select')) return;

    const text=node.nodeValue;
    const re=/(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
    let match;
    let last=0;
    let changed=false;
    const frag=document.createDocumentFragment();

    while((match=re.exec(text))){
      let visible=match[0];
      let trailing='';

      while(/[.,;:!?]$/.test(visible)){
        trailing=visible.slice(-1)+trailing;
        visible=visible.slice(0,-1);
      }

      if(!visible) continue;

      if(match.index>last){
        frag.appendChild(document.createTextNode(text.slice(last,match.index)));
      }

      const a=document.createElement('a');
      a.className='yaya-mail-clickable-link';
      a.href=/^www\./i.test(visible)?'https://'+visible:visible;
      a.target='_blank';
      a.rel='noopener noreferrer';
      a.textContent=visible;
      frag.appendChild(a);

      if(trailing){
        frag.appendChild(document.createTextNode(trailing));
      }

      last=match.index+match[0].length;
      changed=true;
    }

    if(!changed) return;

    if(last<text.length){
      frag.appendChild(document.createTextNode(text.slice(last)));
    }

    node.replaceWith(frag);
  }

  function makeLinksClickable(modal){
    if(!modal || !isMailReadModal(modal)) return;

    const walker=document.createTreeWalker(
      modal,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode:function(node){
          if(!node.nodeValue || !/(https?:\/\/|www\.)/i.test(node.nodeValue)){
            return NodeFilter.FILTER_REJECT;
          }
          const parent=node.parentElement;
          if(!parent || parent.closest('a,button,script,style,textarea,input,select')){
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes=[];
    let current;
    while((current=walker.nextNode())) nodes.push(current);
    nodes.forEach(linkifyTextNode);
  }

  function applyMailEnhancements(){
    document.querySelectorAll('.overlay').forEach(function(overlay){
      const modal=overlay.querySelector(':scope > .modal');
      if(!modal) return;

      if(isMailReadModal(modal)){
        const newlyOpened=!overlay.classList.contains(CENTER_CLASS);
        overlay.classList.add(CENTER_CLASS);
        modal.classList.add('yaya-mail-fullscreen-modal');
        overlay.style.setProperty('--yaya-mail-safe-top',safeTopPx()+'px');
        if(newlyOpened){
          modal.scrollTop=0;
          requestAnimationFrame(function(){modal.scrollTop=0;});
        }
        makeLinksClickable(modal);
      } else {
        overlay.classList.remove(CENTER_CLASS);
        modal.classList.remove('yaya-mail-fullscreen-modal');
        overlay.style.removeProperty('--yaya-mail-safe-top');
      }
    });
  }

  function install(){
    installStyle();
    applyMailEnhancements();

    const obs=new MutationObserver(function(){
      applyMailEnhancements();
    });

    obs.observe(document.documentElement,{
      childList:true,
      subtree:true
    });

    window.addEventListener('resize',applyMailEnhancements,{passive:true});

    setTimeout(applyMailEnhancements,50);
    setTimeout(applyMailEnhancements,200);
    setTimeout(applyMailEnhancements,600);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install);
  } else {
    install();
  }
})();
