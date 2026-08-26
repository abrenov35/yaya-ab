(function(){
  'use strict';

  const id='yaya-chantier-detail-visual-polish-v1';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    /* Fiche chantier ouverte : hiérarchie générale */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs){
      border:1px solid rgba(38,72,109,.10)!important;
      border-radius:14px!important;
      padding:16px 17px 18px!important;
      box-shadow:0 3px 14px rgba(22,45,73,.07)!important;
      background:#fff!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top{
      align-items:center!important;
      gap:9px!important;
      margin-bottom:12px!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top b{
      font-size:18px!important;
      line-height:1.15!important;
      letter-spacing:.005em!important;
      color:#152f50!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top .num{
      font-size:13px!important;
      color:#667b92!important;
      opacity:1!important;
    }

    /* KPI : plus de contraste sur les libellés et les valeurs */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
      gap:9px!important;
      margin-top:0!important;
      margin-bottom:13px!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat{
      min-height:76px!important;
      padding:11px 13px!important;
      border:1px solid #d9e1e9!important;
      border-radius:10px!important;
      background:#f8fafc!important;
      box-shadow:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat small{
      margin-bottom:4px!important;
      color:#66798d!important;
      opacity:1!important;
      font-size:10.5px!important;
      font-weight:650!important;
      letter-spacing:.07em!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat b{
      color:#173452!important;
      font-size:18px!important;
      font-weight:750!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat .sub{
      margin-top:3px!important;
      color:#6a7c8e!important;
      opacity:1!important;
      font-size:11px!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-pos{
      background:#eef7f1!important;
      border-color:#b9d8c2!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-pos b{
      color:#267642!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-neg{
      background:#fff5f4!important;
      border-color:#e5c4bf!important;
    }

    /* Actions : barre plus légère, boutons plus compacts */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar{
      gap:7px!important;
      margin:0 0 13px!important;
      padding:8px!important;
      border:1px solid #dce4ec!important;
      border-radius:10px!important;
      background:#f7f9fb!important;
      box-shadow:none!important;
      overflow-x:auto!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button{
      height:34px!important;
      min-height:34px!important;
      padding:0 12px!important;
      border-radius:7px!important;
      box-shadow:none!important;
      font-size:11.5px!important;
      font-weight:680!important;
      transition:background .12s ease,border-color .12s ease,color .12s ease!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btnp{
      background:#e8f0fa!important;
      border:1px solid #b9cde4!important;
      color:#214f7d!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-expense-btn,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button[onclick*="openDocumentModal"]{
      background:#fff!important;
      border:1px solid #d3dde7!important;
      color:#294b6e!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .yaya-edit-chantier-btn{
      margin-left:auto!important;
      background:#eef3f8!important;
      border:1px solid #c6d4e2!important;
      color:#2d557d!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-archive-btn{
      background:#fffaf5!important;
      border:1px solid #ead8c6!important;
      color:#8c6043!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-delete-btn,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button[onclick*="delChantier"]{
      background:#fff!important;
      border:1px solid #e6c4c1!important;
      color:#a64b43!important;
      font-weight:650!important;
    }

    /* Navigation interne : plus discrète que les actions */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{
      display:flex!important;
      justify-content:flex-start!important;
      align-items:center!important;
      gap:6px!important;
      margin:0 0 10px!important;
      padding:0!important;
      overflow-x:auto!important;
      scrollbar-width:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs::-webkit-scrollbar{
      display:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab{
      flex:0 1 205px!important;
      min-width:155px!important;
      min-height:34px!important;
      height:34px!important;
      padding:0 11px!important;
      border:1px solid #ccd8e5!important;
      border-radius:7px!important;
      background:#fff!important;
      color:#315779!important;
      gap:7px!important;
      font-size:11.5px!important;
      font-weight:700!important;
      box-shadow:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab small{
      color:#677d93!important;
      opacity:1!important;
      font-size:10.5px!important;
      font-weight:650!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.on{
      background:#e8f0fa!important;
      border-color:#9fb8d4!important;
      color:#173f68!important;
      box-shadow:inset 0 -3px 0 #315a8d!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.on small{
      color:#355d85!important;
      opacity:1!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-empty-pane{
      margin-top:2px!important;
      padding:17px 12px!important;
      border-color:#d7e0e8!important;
      background:#fafbfd!important;
      color:#708195!important;
    }

    @media(max-width:760px){
      #pane-chantiers .card:has(> .yaya-detail-section-tabs){
        padding:13px 12px 15px!important;
      }
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar{
        padding:7px!important;
        gap:6px!important;
      }
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button{
        flex:0 0 auto!important;
        min-width:max-content!important;
      }
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-edit-chantier-btn{
        margin-left:0!important;
      }
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab{
        flex:0 0 auto!important;
        min-width:122px!important;
        height:33px!important;
        min-height:33px!important;
        padding:0 9px!important;
      }
    }
  `;

  document.head.appendChild(style);
})();
