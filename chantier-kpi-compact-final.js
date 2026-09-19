(function(){
'use strict';
if(window.__YAYA_KPI_COMPACT_FINAL_V1)return;
window.__YAYA_KPI_COMPACT_FINAL_V1=true;
const id='yaya-kpi-compact-final-v1';
if(document.getElementById(id))return;
const s=document.createElement('style');
s.id=id;
s.textContent=`
#pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
  gap:6px!important;
  margin-top:0!important;
  margin-bottom:8px!important;
}
#pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat{
  min-height:44px!important;
  height:44px!important;
  max-height:44px!important;
  padding:2px 8px!important;
  border-radius:8px!important;
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  justify-content:center!important;
  gap:6px!important;
  box-sizing:border-box!important;
  white-space:nowrap!important;
}
#pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat small{
  margin:0!important;
  font-size:8px!important;
  line-height:1!important;
  font-weight:700!important;
  width:auto!important;
  flex:0 0 auto!important;
}
#pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat b{
  font-size:13.5px!important;
  line-height:1!important;
  font-weight:800!important;
  width:auto!important;
  flex:0 0 auto!important;
}
#pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat .sub{
  margin:0!important;
  font-size:8px!important;
  line-height:1!important;
  width:auto!important;
  flex:0 0 auto!important;
}
@media(max-width:760px){
  #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    gap:5px!important;
  }
  #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat{
    min-height:42px!important;
    height:42px!important;
    max-height:42px!important;
    padding:3px 6px!important;
    gap:4px!important;
  }
  #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat small{font-size:8px!important}
  #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat b{font-size:13px!important}
  #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat .sub{font-size:8px!important}
}
`;
document.head.appendChild(s);
})();