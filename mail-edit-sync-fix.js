(function(){
  'use strict';

  if(typeof appliquerModificationDocument!=='function')return;

  window.appliquerModificationDocument=async function(id){
    const d=S.documents.find(x=>String(x.id)===String(id));
    if(!d)return;

    const avant={...d};
    const ancienType=String(d.type||'');
    const etaitLieAuMail=typeof documentIssuMailYaya==='function'&&documentIssuMailYaya(d);
    const contenuComplet=typeof contenuMailYaya==='function'?contenuMailYaya(d):String(d.contenuMail||'');

    const chantierEl=document.getElementById('edDocCh');
    const typeEl=document.getElementById('edDocType');
    const titreEl=document.getElementById('edDocTitre');
    const sujetEl=document.getElementById('edDocSujet');
    if(!chantierEl||!typeEl||!titreEl||!sujetEl)return;

    d.chantierId=chantierEl.value;
    d.type=typeEl.value;
    d.titre=titreEl.value.trim();
    d.sujet=sujetEl.value.trim();

    const resteOuVientDuMail=
      String(d.type||'').toUpperCase()==='MAIL'
      || ancienType.toUpperCase()==='MAIL'
      || etaitLieAuMail;

    if(resteOuVientDuMail){
      d.nomMail=d.sujet;
      d.objetMail=d.titre;
    }

    if(String(d.type||'').toUpperCase()!=='MAIL'&&(ancienType.toUpperCase()==='MAIL'||etaitLieAuMail)){
      d.origineMail='MAIL';
      d.contenuMail=contenuComplet;
    }

    closeModal();
    render();

    if(await apiPost('setDocuments',S.documents)){
      toast('Document modifié ✓');
    }else{
      Object.keys(d).forEach(k=>delete d[k]);
      Object.assign(d,avant);
      render();
      toast('La modification du document a échoué',true);
    }
  };
})();
