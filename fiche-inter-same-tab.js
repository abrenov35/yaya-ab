(function(){
  'use strict';

  const FRAME_ID='yayaFicheInterFrame';
  const HOST_ID='yayaFicheInterHost';
  const STYLE_ID='yaya-fiche-inter-inline-style';
  const INNER_STYLE_ID='yaya-fiche-inter-embedded-polish';

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

  function polishEmbeddedFrame(frame){
    try{
      const doc=frame.contentDocument;
      if(!doc||!doc.head)return;
      let style=doc.getElementById(INNER_STYLE_ID);
      if(style)return;
      style=doc.createElement('style');
      style.id=INNER_STYLE_ID;
      style.textContent=`
        .header{
          background:#ffffff!important;
          min-height:56px!important;
          padding:0 18px!important;
          border-bottom:1px solid #dce3ef!important;
          box-shadow:0 2px 10px rgba(36,63,143,.05)!important;
        }
        .header-top{
          min-height:56px!important;
          max-width:1100px!important;
          gap:18px!important;
        }
        .brand{color:#243f8f!important;}
        .logo-text{
          color:#243f8f!important;
          font-size:12px!important;
          letter-spacing:.15px!important;
        }
        .logo-text::after{
          height:20px!important;
          background:#d6deea!important;
          margin:0 9px!important;
        }
        .logo-sub{
          color:#8a6a11!important;
          font-size:9px!important;
          letter-spacing:.5px!important;
        }
        .toolbar-actions{gap:7px!important;}
        .toolbar-btn,
        .type-select{
          height:36px!important;
          border:1px solid #c8d3e1!important;
          border-radius:8px!important;
          background:#ffffff!important;
          color:#294766!important;
          box-shadow:none!important;
          font-size:10.5px!important;
          font-weight:700!important;
        }
        .toolbar-btn{padding:0 14px!important;}
        .toolbar-btn:hover,
        .type-select:hover{
          background:#f5f8fc!important;
          border-color:#aebfd2!important;
        }
        .toolbar-btn.active{
          background:#edf3fa!important;
          color:#24436b!important;
          border-color:#b8c9dd!important;
        }
        .toolbar-btn.active::after{
          height:2px!important;
          left:10px!important;
          right:10px!important;
          bottom:-1px!important;
          background:#d5a51f!important;
          border-radius:2px!important;
        }
        .type-select{
          width:150px!important;
          padding:0 28px 0 12px!important;
          outline:none!important;
        }
        .type-select option{background:#fff!important;color:#172b43!important;}
        .main{padding-top:20px!important;}
        @media(max-width:620px){
          .header{min-height:46px!important;padding:0 8px!important;}
          .header-top{min-height:46px!important;gap:6px!important;}
          .toolbar-btn,.type-select{height:31px!important;font-size:9px!important;}
          .toolbar-btn{padding:0 8px!important;}
          .type-select{width:112px!important;}
          .logo-text{font-size:10px!important;}
        }
      `;
      doc.head.appendChild(style);
    }catch(e){
      console.warn('Style Fiche inter intégré non appliqué',e);
    }
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
      frame.addEventListener('load',()=>polishEmbeddedFrame(frame));
      host.appendChild(frame);
    }else{
      polishEmbeddedFrame(frame);
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
