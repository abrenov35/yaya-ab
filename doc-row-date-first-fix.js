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
        font-size:10px!important;
        font-weight:400!important;
        color:#7b8794!important;
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

  function cleanSubject(value){
    const t=String(value||'').replace(/\s+/g,' ').trim();
    if(!t)return '';
    if(t.length>180)return '';
    if(/\b(Bonjour|Bonsoir|Cordialement|Bien à vous|Merci|a écrit|From\s*:|De\s*:|Envoyé\s*:|Sent\s*:|Téléphone|www\.)\b/i.test(t)&&t.length>90)return '';
    return t.replace(/^objet\s*:\s*/i,'');
  }

  function documentForLine(line){
    const action=[...line.querySelectorAll('[onclick]')].find(el=>/editDocument|delDocument|voirMessageYaya/i.test(String(el.getAttribute('onclick')||'')));
    const raw=String(action&&action.getAttribute('onclick')||'');
    const m=raw.match(/(?:editDocument|delDocument|voirMessageYaya)\(['\"]([^'\"]+)/);
    if(!m)return null;
    try{
      if(typeof S!=='undefined'&&Array.isArray(S.documents))return S.documents.find(d=>String(d.id)===String(m[1]))||null;
    }catch(e){}
    return null;
  }

  function mailSubject(d){
    if(!d)return 'Objet non renseigné';
    const vals=[d.subject,d.objetMail,d.mailSubject,d.emailSubject,d.objet,d.intitule];
    for(const v of vals){
      const s=cleanSubject(v);
      if(s)return s;
    }
    return 'Objet non renseigné';
  }

  function decorateLine(line){
    if(!line)return;
    const already=line.dataset.yayaDateFirst==='1';
    let children=[...line.children];
    if(children.length<5)return;

    let type,subject,title,date,actions;
    if(already){
      date=line.querySelector('.yaya-doc-date-first');
      subject=line.querySelector('.yaya-doc-subject-compact');
      title=line.querySelector('.yaya-document-title');
      actions=line.querySelector('.yaya-doc-actions-last');
      type=line.querySelector('.yaya-doc-type-hidden');
    }else{
      type=children[0];
      subject=children[1];
      title=children[2];
      date=children[3];
      actions=children[4];
      type.classList.add('yaya-doc-type-hidden');
      subject.classList.add('yaya-doc-subject-compact');
      title.classList.add('yaya-document-title');
      date.classList.add('yaya-doc-date-first');
      actions.classList.add('yaya-doc-actions-last');
      line.insertBefore(date,line.firstChild);
      line.dataset.yayaDateFirst='1';
    }

    const d=documentForLine(line);
    const isMail=(d&&String(d.type||'').toUpperCase()==='MAIL') || /\bMAIL\b/i.test(String(type&&type.textContent||''));
    if(isMail&&title){
      title.textContent=mailSubject(d);
      title.title=title.textContent;
    }
  }

  function decorate(){
    document.querySelectorAll('#pane-chantiers .yaya-document-line').forEach(decorateLine);
  }

  function install(){
    installStyle();
    decorate();
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,150);return;}
    new MutationObserver(()=>requestAnimationFrame(decorate)).observe(pane,{childList:true,subtree:true});
    window.addEventListener('yaya:data-refreshed',decorate);
  }

  install();
})();
