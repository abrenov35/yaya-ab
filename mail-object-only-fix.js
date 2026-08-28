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
    row.style.setProperty('grid-template-columns','100px minmax(0,1fr) 90px 42px','important');
    row.style.setProperty('height','46px','important');
    row.style.setProperty('min-height','46px','important');
    row.style.setProperty('max-height','46px','important');
  });
}
fix();
new MutationObserver(function(){requestAnimationFrame(fix);}).observe(document.documentElement,{childList:true,subtree:true});
})();
