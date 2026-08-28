(function(){
  'use strict';

  const STYLE_ID='yaya-doc-row-date-first-style';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-document-line{
        grid-template-columns:92px 150px minmax(0,1fr) auto!important;
        gap:10px!important;
        align-items:center!important;
      }
      .yaya-document-line > .yaya-doc-type-hidden{display:none!important}
      .yaya-document-line > .yaya-doc-date-first{
        grid-column:1!important;
        grid-row:1!important;
        font-size:12px!important;
        font-weight:700!important;
        color:#285f96!important;
        text-align:left!important;
        white-space:nowrap!important;
      }
      .yaya-document-line > .yaya-doc-subject-compact{
        grid-column:2!important;
        min-width:0!important;
        width:100%!important;
        max-width:150px!important;
        min-height:0!important;
        padding:4px 8px!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        line-height:1.2!important;
      }
      .yaya-document-line > .yaya-document-title{
        grid-column:3!important;
        min-width:0!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .yaya-document-line > .yaya-doc-actions-last{
        grid-column:4!important;
        justify-self:end!important;
      }
      @media(max-width:720px){
        .yaya-document-line{
          grid-template-columns:82px minmax(0,1fr) auto!important;
          gap:8px!important;
          overflow:visible!important;
        }
        .yaya-document-line > .yaya-doc-date-first{grid-column:1!important}
        .yaya-document-line > .yaya-doc-subject-compact{display:none!important}
        .yaya-document-line > .yaya-document-title{grid-column:2!important;min-width:0!important}
        .yaya-document-line > .yaya-doc-actions-last{grid-column:3!important}
      }
    `;
    document.head.appendChild(style);
  }

  function decorateLine(line){
    if(!line||line.dataset.yayaDateFirst==='1')return;
    const children=[...line.children];
    if(children.length<5)return;

    const type=children[0];
    const subject=children[1];
    const title=children[2];
    const date=children[3];
    const actions=children[4];

    type.classList.add('yaya-doc-type-hidden');
    subject.classList.add('yaya-doc-subject-compact');
    title.classList.add('yaya-document-title');
    date.classList.add('yaya-doc-date-first');
    actions.classList.add('yaya-doc-actions-last');

    line.insertBefore(date,line.firstChild);
    line.dataset.yayaDateFirst='1';
  }

  function decorate(){
    document.querySelectorAll('#pane-chantiers .yaya-document-line').forEach(decorateLine);
  }

  function install(){
    installStyle();
    decorate();
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,150);return;}
    new MutationObserver(decorate).observe(pane,{childList:true,subtree:true});
    window.addEventListener('yaya:data-refreshed',decorate);
  }

  install();
})();
