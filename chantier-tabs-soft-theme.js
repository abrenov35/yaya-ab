(function(){
  'use strict';

  const id='yaya-chantier-tabs-soft-theme-v6';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{
      display:flex!important;
      align-items:center!important;
      gap:8px!important;
      margin:0 0 16px!important;
      padding:0!important;
      border-bottom:none!important;
      overflow-x:auto!important;
      scrollbar-width:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs::-webkit-scrollbar{
      display:none!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:8px!important;
      flex:0 0 auto!important;
      min-width:132px!important;
      height:38px!important;
      min-height:38px!important;
      padding:0 13px!important;
      border:1px solid #E1E7ED!important;
      border-radius:8px!important;
      background:#FAFBFC!important;
      color:#6B7280!important;
      font-size:12.5px!important;
      font-weight:650!important;
      box-shadow:none!important;
      transition:background .12s ease,border-color .12s ease,color .12s ease!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab:hover{
      background:#F4F7F9!important;
      border-color:#D4DEE7!important;
      color:#4B5F72!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.on{
      background:#EEF4F8!important;
      border-color:#C5D4E0!important;
      color:#31516D!important;
      font-weight:750!important;
      box-shadow:inset 0 -2px 0 #8EA9BF!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab small{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      min-width:22px!important;
      height:20px!important;
      padding:0 7px!important;
      border-radius:10px!important;
      background:#EEF1F4!important;
      color:#66717D!important;
      font-size:10.5px!important;
      font-weight:700!important;
      line-height:1!important;
      opacity:1!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.on small{
      background:#DDE8F0!important;
      color:#42627D!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="marche"]{
      background:#eef8f1!important;border-color:#acd5b8!important;color:#286b3e!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="marche"] small{background:#dcefe2!important;color:#286b3e!important}
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="marche"].on{background:#dff2e5!important;border-color:#65a878!important;box-shadow:inset 0 -2px 0 #65a878!important}

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="depenses"]{
      background:#fff0f3!important;border-color:#edb9c4!important;color:#96384c!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="depenses"] small{background:#f8dce3!important;color:#96384c!important}
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="depenses"].on{background:#f9dfe6!important;border-color:#d6788c!important;box-shadow:inset 0 -2px 0 #d6788c!important}

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="charges"]{
      background:#fff5e8!important;border-color:#edc58f!important;color:#935a08!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="charges"] small{background:#fde6c5!important;color:#935a08!important}
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="charges"].on{background:#fde8cb!important;border-color:#d6963d!important;box-shadow:inset 0 -2px 0 #d6963d!important}

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="documents"]{
      background:#eef6ff!important;border-color:#acc9eb!important;color:#285f96!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="documents"] small{background:#dcecff!important;color:#285f96!important}
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="documents"].on{background:#deedff!important;border-color:#6e9fd6!important;box-shadow:inset 0 -2px 0 #6e9fd6!important}

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="mail"]{
      background:#f5ebe4!important;border-color:#d6b59f!important;color:#7a4d35!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="mail"] small{
      background:#ead8cd!important;color:#7a4d35!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="mail"].on{
      background:#ead3c4!important;border-color:#b27e5e!important;color:#68402d!important;box-shadow:inset 0 -2px 0 #b27e5e!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="mail"].on small{
      background:#ddc0ae!important;color:#68402d!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.yaya-commande-tab-contrast{
      background:#e2e8f0!important;
      border-color:#94a3b8!important;
      color:#334155!important;
      font-weight:700!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.yaya-commande-tab-contrast small,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.yaya-commande-tab-contrast > span{
      background:#cbd5e1!important;
      color:#1e293b!important;
    }

    /* Actions chantier : palette neutre bleu-gris cohérente avec Yaya. */
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openAvenant"],
    #pane-chantiers .chantier-fin-toolbar > .chantier-expense-btn,
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openDocumentModal"],
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btnp.btnp{
      background:#F7F9FC!important;
      color:#24436B!important;
      border:1px solid #C7D4E3!important;
      border-radius:7px!important;
      box-shadow:none!important;
      min-height:38px!important;
      height:38px!important;
      padding:0 15px!important;
      font-size:12px!important;
      font-weight:700!important;
    }
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openAvenant"]:hover,
    #pane-chantiers .chantier-fin-toolbar > .chantier-expense-btn:hover,
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openDocumentModal"]:hover,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btnp.btnp:hover{
      background:#E8F0FA!important;
      border-color:#AFC2D5!important;
      color:#24436B!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .yaya-edit-chantier-btn{
      background:#EEF3F8!important;
      border-color:#BFCFDE!important;
      color:#24436B!important;
      box-shadow:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .yaya-edit-chantier-btn:hover{
      background:#E3ECF5!important;
      border-color:#A9BED2!important;
      color:#1D3B60!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-archive-btn{
      background:#F7F5F2!important;
      border-color:#D8D3CC!important;
      color:#6B625A!important;
      box-shadow:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-archive-btn:hover{
      background:#EEEAE5!important;
      border-color:#C9C1B8!important;
      color:#5B534C!important;
    }

    @media(max-width:760px){
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{
        gap:6px!important;
      }
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab{
        min-width:112px!important;
        height:36px!important;
        min-height:36px!important;
        padding:0 10px!important;
        font-size:11.5px!important;
      }
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab small{
        height:18px!important;
        min-width:20px!important;
        padding:0 6px!important;
        font-size:10px!important;
      }
    }
  `;

  document.head.appendChild(style);

  function patchCommandeTab(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-section-tab').forEach(function(button){
      if(/^Commande\b/i.test(String(button.innerText||'').trim())){
        button.classList.add('yaya-commande-tab-contrast');
      }
    });
  }

  patchCommandeTab();
  let raf=0;
  const observer=new MutationObserver(function(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      patchCommandeTab();
    });
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
