(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-row-clickable-v1';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #pane-chantiers .card:has(.top button[onclick*="toggleChantier"]){cursor:pointer}
    #pane-chantiers .card:has(.top button[onclick*="toggleChantier"]):hover{
      box-shadow:0 3px 10px rgba(22,45,73,.16)!important;
    }
  `;
  document.head.appendChild(style);

  function chantierIdDepuisCard(card){
    const btn=card&&card.querySelector('.top button[onclick*="toggleChantier"]');
    if(!btn)return '';
    const raw=btn.getAttribute('onclick')||'';
    const m=raw.match(/toggleChantier\(['\"]([^'\"]+)['\"]\)/);
    return m&&m[1]?String(m[1]):'';
  }

  document.addEventListener('click',function(e){
    const card=e.target&&e.target.closest?e.target.closest('#pane-chantiers .card'):null;
    if(!card)return;

    // Conserver le fonctionnement normal des contrôles présents dans la ligne.
    if(e.target.closest('button,a,input,select,textarea,label,[onclick],.editable'))return;

    const voir=Array.from(card.querySelectorAll('.top button[onclick*="toggleChantier"]'))
      .find(function(btn){return (btn.textContent||'').trim().toLowerCase()==='voir';});
    if(!voir)return; // Ne rend cliquable que la ligne repliée de la liste.

    const id=chantierIdDepuisCard(card);
    if(!id||typeof window.toggleChantier!=='function')return;

    e.preventDefault();
    window.toggleChantier(id);
  },false);
})();
