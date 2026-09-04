(function(){
  'use strict';

  const STYLE_ID='yaya-achat-create-actions-fix-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-achat-create-actions-fixed{
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        justify-content:center!important;
        gap:12px!important;
        flex-wrap:nowrap!important;
        margin-top:14px!important;
      }
      .yaya-achat-create-actions-fixed > button{
        height:44px!important;
        min-height:44px!important;
        margin:0!important;
        margin-left:0!important;
        margin-right:0!important;
        white-space:nowrap!important;
      }
      .yaya-achat-create-actions-fixed .yaya-achat-import-btn{
        order:1!important;
        background:#249457!important;
        border:1px solid #249457!important;
        color:#fff!important;
        opacity:1!important;
        filter:none!important;
        padding:0 22px!important;
        font-weight:700!important;
      }
      .yaya-achat-create-actions-fixed .yaya-achat-save-btn{
        order:2!important;
      }
      .yaya-achat-create-actions-fixed .yaya-achat-close-btn{
        order:3!important;
      }
      .yaya-achat-create-actions-fixed .yaya-achat-import-btn:hover{
        background:#1f7f4b!important;
        border-color:#1f7f4b!important;
        color:#fff!important;
      }
    `;
    document.head.appendChild(style);
  }

  function patch(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const type=root.querySelector('#acType');
    if(!type)return;

    const modal=type.closest('.modal');
    if(!modal)return;

    const title=String(modal.querySelector('h5')&&modal.querySelector('h5').textContent||'').trim();
    if(/^Modifier\s+/i.test(title))return;

    const buttons=[...modal.querySelectorAll('button')];

    const paste=buttons.find(function(button){
      return /Coller une capture/i.test(String(button.textContent||''));
    });
    if(paste)paste.remove();

    const upload=[...modal.querySelectorAll('button')].find(function(button){
      const txt=String(button.textContent||'');
      const onclick=String(button.getAttribute('onclick')||'');
      return /Déposer un BL|facture.*PDF|facture.*photo|Importer/i.test(txt) || /achatFile/.test(onclick);
    });

    const save=[...modal.querySelectorAll('button')].find(function(button){
      const txt=String(button.textContent||'').trim();
      const onclick=String(button.getAttribute('onclick')||'');
      return /^Enregistrer$/i.test(txt) || /addAchat/.test(onclick);
    });

    const close=[...modal.querySelectorAll('button')].find(function(button){
      return /^Fermer$/i.test(String(button.textContent||'').trim());
    });

    if(!upload||!save||!close)return;

    upload.textContent='Importer';
    upload.classList.add('yaya-achat-import-btn');
    save.classList.add('yaya-achat-save-btn');
    close.classList.add('yaya-achat-close-btn');

    let footer=modal.querySelector('.yaya-achat-create-actions-fixed');
    if(!footer){
      footer=document.createElement('div');
      footer.className='mfoot yaya-achat-create-actions-fixed';
      modal.appendChild(footer);
    }

    footer.style.setProperty('display','flex','important');
    footer.style.setProperty('flex-direction','row','important');
    footer.style.setProperty('justify-content','center','important');
    footer.style.setProperty('gap','12px','important');

    [upload,save,close].forEach(function(button,index){
      if(button.parentElement!==footer)footer.appendChild(button);
      button.style.setProperty('order',String(index+1),'important');
      button.style.setProperty('margin','0','important');
      button.style.setProperty('margin-left','0','important');
      button.style.setProperty('margin-right','0','important');
    });

    [...modal.children].forEach(function(child){
      if(child===footer)return;
      if(child.matches&&child.matches('.mfoot') && !child.querySelector('button') && !String(child.textContent||'').trim()){
        child.style.display='none';
      }
    });
  }

  function install(){
    installStyle();
    patch();

    const root=document.getElementById('modalRoot');
    if(!root)return;

    let raf=0;
    const observer=new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        patch();
      });
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
