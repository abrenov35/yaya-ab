(function(){
  'use strict';

  const FRAME_ID='yayaFicheInterFrame';
  const HOST_ID='yayaFicheInterHost';
  const STYLE_ID='yaya-fiche-inter-inline-style';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${HOST_ID}{
        display:none;
        width:100%;
        height:calc(100vh - 58px);
        min-height:560px;
        margin:0;
        padding:0;
        background:#f4f6fa;
        overflow:hidden;
      }
      #${HOST_ID}.on{display:block;}
      #${FRAME_ID}{
        display:block;
        width:100%;
        height:100%;
        border:0;
        margin:0;
        padding:0;
        background:#f4f6fa;
      }
      body.yaya-fiche-inter-open{padding-bottom:0!important;overflow:hidden!important;}
      body.yaya-fiche-inter-open > .body{display:none!important;}
      .fiche-inter-tab.yaya-inline-on{
        background:var(--gold)!important;
        color:var(--navy)!important;
        border-color:var(--gold)!important;
      }
      @media(max-width:700px){
        #${HOST_ID}{height:calc(100vh - 70px);min-height:480px;}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureHost(){
    let host=document.getElementById(HOST_ID);
    if(host)return host;
    const hdr=document.querySelector('.hdr');
    if(!hdr)return null;
    host=document.createElement('div');
    host.id=HOST_ID;
    hdr.insertAdjacentElement('afterend',host);
    return host;
  }

  function closeInline(){
    const host=document.getElementById(HOST_ID);
    if(host)host.classList.remove('on');
    document.body.classList.remove('yaya-fiche-inter-open');
    const link=document.querySelector('.fiche-inter-tab');
    if(link)link.classList.remove('yaya-inline-on');
  }

  function openInline(link){
    const host=ensureHost();
    if(!host)return;
    let frame=document.getElementById(FRAME_ID);
    if(!frame){
      frame=document.createElement('iframe');
      frame.id=FRAME_ID;
      frame.title='Fiche inter';
      frame.src=link.getAttribute('href')||'https://abrenov35.github.io/docs-chantier-ab/';
      frame.setAttribute('loading','eager');
      host.appendChild(frame);
    }
    host.classList.add('on');
    document.body.classList.add('yaya-fiche-inter-open');
    link.classList.add('yaya-inline-on');
    window.scrollTo({top:0,behavior:'instant'});
  }

  function install(){
    ensureStyle();
    const link=document.querySelector('.fiche-inter-tab');
    if(!link){setTimeout(install,120);return;}
    ensureHost();

    if(link.dataset.yayaInlineFiche!=='1'){
      link.dataset.yayaInlineFiche='1';
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.addEventListener('click',function(e){
        e.preventDefault();
        openInline(this);
      });
    }

    document.querySelectorAll('.hdr .tab').forEach(btn=>{
      if(btn.dataset.yayaCloseFiche==='1')return;
      btn.dataset.yayaCloseFiche='1';
      btn.addEventListener('click',closeInline,true);
    });
  }

  window.closeFicheInterInline=closeInline;
  install();
})();
