(function(){
  'use strict';

  function isAvoirContext(node){
    let el=node&&node.parentElement;
    for(let i=0;el&&i<6;i++,el=el.parentElement){
      const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/\bAVOIR\b/i.test(txt) && txt.length<700)return true;
    }
    return false;
  }

  function isExpenseContext(node){
    const el=node&&node.parentElement;
    return !!(el&&el.closest&&el.closest('.yaya-detail-expense-row'));
  }

  function fixTextNode(node){
    if(!node||node.nodeType!==3)return;
    const v=String(node.nodeValue||'');

    // Dépense saisie avec un montant HT négatif :
    // Yaya ajoute déjà le signe de la dépense, ce qui produisait "--11 €".
    // On conserve la valeur négative pour les calculs et on corrige uniquement l'affichage.
    if(isExpenseContext(node) && /-\s*-\s*\d[\d\s.,]*\s*€/.test(v)){
      node.nodeValue=v.replace(/-\s*-\s*(\d[\d\s.,]*\s*€)/g,'$1');
      return;
    }

    if(!/-\s*\d[\d\s.,]*\s*€/.test(v))return;
    if(!isAvoirContext(node))return;
    node.nodeValue=v.replace(/-\s*(\d[\d\s.,]*\s*€)/g,'+ $1');
  }

  function scan(root){
    const start=root&&root.nodeType?root:document.body;
    if(!start)return;
    if(start.nodeType===3){fixTextNode(start);return;}
    const walker=document.createTreeWalker(start,NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode()))fixTextNode(n);
  }

  function boot(){
    scan(document.body);
    new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        m.addedNodes&&m.addedNodes.forEach(scan);
        if(m.type==='characterData')fixTextNode(m.target);
      });
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
