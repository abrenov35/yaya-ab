(function(){
  'use strict';

  const id='yaya-chantier-tabs-soft-theme-v5';
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

    /* Les trois actions de gauche ont exactement le même style. */
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openAvenant"],
    #pane-chantiers .chantier-fin-toolbar > .chantier-expense-btn,
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openDocumentModal"],
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btnp.btnp{
      background:#fff!important;
      color:#003D7A!important;
      border:1px solid #003D7A!important;
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
      background:#E8F2F9!important;
      border-color:#003D7A!important;
      color:#003D7A!important;
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
})();
