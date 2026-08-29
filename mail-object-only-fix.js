(function(){
'use strict';
function fix(){
  document.querySelectorAll('.message-ligne').forEach(function(row){
    var subject=row.querySelector('.message-categorie');
    var body=row.querySelector('.message-apercu');
    if(body){body.remove();}
    if(subject){
      subject.style.maxWidth='none';
      subject.style.width='auto';
      subject.style.whiteSpace='nowrap';
      subject.style.overflow='hidden';
      subject.style.textOverflow='ellipsis';
    }
    row.style.setProperty('grid-template-columns','100px minmax(0,1fr) 90px minmax(126px,auto)','important');
    row.style.setProperty('height','46px','important');
    row.style.setProperty('min-height','46px','important');
    row.style.setProperty('max-height','46px','important');
    row.style.setProperty('align-items','center','important');
    row.style.setProperty('overflow','hidden','important');
    var actions=row.lastElementChild;
    if(actions){
      actions.style.setProperty('display','flex','important');
      actions.style.setProperty('flex-direction','row','important');
      actions.style.setProperty('align-items','center','important');
      actions.style.setProperty('justify-content','flex-end','important');
      actions.style.setProperty('gap','4px','important');
      actions.style.setProperty('white-space','nowrap','important');
      actions.style.setProperty('min-width','126px','important');
      actions.style.setProperty('height','42px','important');
      actions.style.setProperty('overflow','hidden','important');
    }
  });
}
fix();
new MutationObserver(function(){requestAnimationFrame(fix);}).observe(document.documentElement,{childList:true,subtree:true});
})();
