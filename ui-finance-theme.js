(function(){
  'use strict';

  const STYLE_ID='yaya-ui-finance-theme-v1';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    :root{
      --navy:#003D7A!important;
      --navy-l:#003D7A!important;
      --gold:#F59E0B!important;
      --bg:#FFFFFF!important;
      --green:#10B981!important;
      --amber:#EF4444!important;
      --red:#EF4444!important;
      --yaya-primary:#003D7A;
      --yaya-primary-dark:#002651;
      --yaya-primary-light:#E8F2F9;
      --yaya-success:#10B981;
      --yaya-danger:#EF4444;
      --yaya-neutral-light:#F8F9FA;
      --yaya-neutral-dark:#374151;
      --yaya-border:#DDE3EA;
    }

    body{background:#fff!important;color:#374151!important;}
    .body{background:#fff!important;}
    .hdr{background:#003D7A!important;color:#fff!important;}
    .hdr .brand b{color:#fff!important;}
    .hdr .brand span{color:#E8F2F9!important;}
    .tab{border-color:rgba(255,255,255,.45)!important;color:#fff!important;}
    .tab.on{background:#fff!important;color:#003D7A!important;border-color:#fff!important;}

    /* Conteneurs et surfaces */
    .card,.modal,.gpanel,.stat{border-radius:8px!important;}
    .card{background:#fff!important;border-color:#E5E7EB!important;box-shadow:0 1px 4px rgba(0,61,122,.07)!important;}
    .gpanel{background:#F8F9FA!important;border-color:#E5E7EB!important;}
    .note,.hint,.des,.sub{color:#6B7280!important;}

    /* Boutons globaux */
    .btnp{background:#003D7A!important;color:#fff!important;border:1px solid #003D7A!important;border-radius:7px!important;padding:10px 16px!important;box-shadow:none!important;}
    .btnp:hover{background:#002651!important;border-color:#002651!important;}
    .btnp.go{background:#003D7A!important;color:#fff!important;border-color:#003D7A!important;}
    .btn2{background:transparent!important;color:#003D7A!important;border:1px solid #003D7A!important;border-radius:7px!important;box-shadow:none!important;}
    .btn2:hover{background:#E8F2F9!important;}
    button[disabled]{opacity:.55!important;cursor:not-allowed!important;}

    /* Fiche chantier ouverte */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs){
      border:1px solid #E5E7EB!important;
      border-radius:8px!important;
      padding:16px!important;
      box-shadow:0 2px 8px rgba(0,61,122,.07)!important;
      background:#fff!important;
      color:#374151!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top{
      margin-bottom:16px!important;
      gap:8px!important;
      align-items:center!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top b{
      color:#003D7A!important;
      font-size:20px!important;
      line-height:1.2!important;
      font-weight:800!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top .num{
      color:#003D7A!important;
      opacity:1!important;
      font-size:14px!important;
      font-weight:650!important;
    }

    /* KPIs */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
      gap:10px!important;
      margin:0 0 16px!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat{
      min-height:82px!important;
      padding:12px 14px!important;
      background:#fff!important;
      border:1px solid #DDE3EA!important;
      border-radius:8px!important;
      box-shadow:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat small{
      color:#003D7A!important;
      opacity:1!important;
      font-size:11px!important;
      font-weight:700!important;
      text-transform:uppercase!important;
      letter-spacing:.06em!important;
      margin-bottom:5px!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat b{
      color:#003D7A!important;
      font-size:24px!important;
      font-weight:800!important;
      line-height:1.05!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-pos{
      background:#ECFDF5!important;
      border-color:#A7F3D0!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-pos small,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-pos b{
      color:#047857!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-neg{
      background:#FEF2F2!important;
      border-color:#FECACA!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-neg small,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat.marge-neg b{
      color:#B91C1C!important;
    }

    /* Ligne d'actions */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar{
      display:flex!important;
      gap:8px!important;
      align-items:center!important;
      margin:0 0 16px!important;
      padding:0!important;
      background:transparent!important;
      border:none!important;
      border-radius:0!important;
      box-shadow:none!important;
      overflow-x:auto!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button{
      min-height:38px!important;
      height:38px!important;
      padding:10px 16px!important;
      border-radius:7px!important;
      font-size:12px!important;
      font-weight:700!important;
      white-space:nowrap!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btnp{
      background:#003D7A!important;
      color:#fff!important;
      border:1px solid #003D7A!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btnp:hover{
      background:#002651!important;
      border-color:#002651!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btn2,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .yaya-edit-chantier-btn,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-archive-btn,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button[onclick*="openDocumentModal"]{
      background:transparent!important;
      color:#003D7A!important;
      border:1px solid #003D7A!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btn2:hover,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .yaya-edit-chantier-btn:hover,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-archive-btn:hover{
      background:#E8F2F9!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-delete-btn,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button[onclick*="delChantier"]{
      background:transparent!important;
      color:#EF4444!important;
      border:1px solid #EF4444!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-delete-btn:hover,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button[onclick*="delChantier"]:hover{
      background:#FEE2E2!important;
    }

    /* Onglets fiche : vrais tabs, sans gros aplats */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{
      display:flex!important;
      gap:22px!important;
      align-items:flex-end!important;
      margin:0 0 16px!important;
      padding:0 2px!important;
      border-bottom:1px solid #E5E7EB!important;
      overflow-x:auto!important;
      scrollbar-width:none!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs::-webkit-scrollbar{display:none!important;}
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab{
      position:relative!important;
      flex:0 0 auto!important;
      min-width:0!important;
      height:42px!important;
      min-height:42px!important;
      padding:0 2px 10px!important;
      border:none!important;
      border-radius:0!important;
      background:transparent!important;
      color:#9CA3AF!important;
      font-size:13px!important;
      font-weight:600!important;
      box-shadow:none!important;
      gap:7px!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.on{
      color:#003D7A!important;
      font-weight:800!important;
      background:transparent!important;
      box-shadow:inset 0 -4px 0 #003D7A!important;
    }
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab small{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      min-width:20px!important;
      height:20px!important;
      padding:0 6px!important;
      border-radius:10px!important;
      background:#EF4444!important;
      color:#fff!important;
      opacity:1!important;
      font-size:11px!important;
      font-weight:800!important;
    }

    /* Anciens bandeaux internes neutralisés */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .seclabel,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .section-header{
      background:#F8F9FA!important;
      color:#003D7A!important;
      border-top:1px solid #E5E7EB!important;
      border-bottom:1px solid #E5E7EB!important;
    }

    /* Lignes dépenses / documents */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .achligne,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .ligD,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .ligM,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .ligR{
      color:#374151!important;
      border-top-color:#E5E7EB!important;
      min-height:42px!important;
    }

    /* Tags fournisseurs */
    .yaya-supplier-tag{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      min-height:24px!important;
      padding:4px 8px!important;
      border-radius:4px!important;
      border:none!important;
      font-size:11px!important;
      font-weight:700!important;
      line-height:1!important;
      white-space:nowrap!important;
      box-shadow:none!important;
    }
    .yaya-supplier-bl{background:#A7F3D0!important;color:#064E3B!important;}
    .yaya-supplier-pointp{background:#BAE6FD!important;color:#003D7A!important;}
    .yaya-supplier-cedeo{background:#FED7AA!important;color:#7C2D12!important;}
    .yaya-supplier-avoir{background:#D1D5DB!important;color:#374151!important;}

    /* Compatibilité badges existants */
    .b-bl{background:#A7F3D0!important;color:#064E3B!important;border:none!important;}
    .b-avoir{background:#D1D5DB!important;color:#374151!important;border:none!important;}

    /* Montants */
    .yaya-amount-negative{color:#EF4444!important;font-weight:800!important;font-size:14px!important;}
    .yaya-amount-positive{color:#059669!important;font-weight:800!important;font-size:14px!important;}

    /* VOIR */
    button.yaya-view-btn,
    #pane-chantiers button:not(.yaya-detail-section-tab)[onclick*="voirPiece"],
    #pane-chantiers button:not(.yaya-detail-section-tab)[onclick*="voirMessageYaya"]{
      background:#FEF3C7!important;
      color:#92400E!important;
      border:1px solid #F59E0B!important;
      border-radius:7px!important;
      padding:4px 12px!important;
      font-weight:700!important;
      box-shadow:none!important;
    }

    /* Inputs */
    .inp,.msel,.mnum,input,select,textarea{
      border-color:#C7D0DA!important;
      color:#374151!important;
    }
    .inp:focus,.msel:focus,.mnum:focus,input:focus,select:focus,textarea:focus{
      outline:2px solid #BAE6FD!important;
      outline-offset:1px!important;
      border-color:#003D7A!important;
    }

    /* Tables */
    table{box-shadow:0 1px 4px rgba(0,61,122,.07)!important;}
    th{background:#003D7A!important;color:#fff!important;}
    tr:nth-child(even) td{background:#F8F9FA!important;}

    @media(max-width:760px){
      #pane-chantiers .card:has(> .yaya-detail-section-tabs){padding:13px 12px!important;}
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat b{font-size:20px!important;}
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button{padding:8px 12px!important;}
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{gap:16px!important;}
    }
  `;
  document.head.appendChild(style);

  function normalize(txt){
    return String(txt||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
  }

  function supplierClass(text){
    const t=normalize(text).replace(/\./g,'');
    if(t==='BL')return 'yaya-supplier-bl';
    if(t.includes('POINT P')||t.includes('POINTP'))return 'yaya-supplier-pointp';
    if(t.includes('CEDEO'))return 'yaya-supplier-cedeo';
    if(t==='AVOIR'||t.includes(' AVOIR'))return 'yaya-supplier-avoir';
    return '';
  }

  function decorate(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.achligne,.ligD,.ligM,.ligR').forEach(row=>{
      const candidates=row.querySelectorAll('b,.badge,span,strong');
      candidates.forEach(el=>{
        const cls=supplierClass(el.textContent);
        if(cls){
          el.classList.add('yaya-supplier-tag',cls);
        }
      });

      const textNodes=row.querySelectorAll('strong,.charge-montant,.montant,.amount');
      textNodes.forEach(el=>{
        const txt=String(el.textContent||'').replace(/\s/g,'');
        el.classList.remove('yaya-amount-negative','yaya-amount-positive');
        if(/^[-−]/.test(txt))el.classList.add('yaya-amount-negative');
        else if(/^\+/.test(txt)||/AVOIR/i.test(row.textContent||''))el.classList.add('yaya-amount-positive');
      });
    });

    pane.querySelectorAll('button').forEach(btn=>{
      if(normalize(btn.textContent)==='VOIR')btn.classList.add('yaya-view-btn');
    });
  }

  let raf=0;
  function schedule(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(decorate);
  }
  decorate();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
