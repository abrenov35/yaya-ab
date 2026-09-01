/* =========================================================
   YAYA — DEVIS SANS ANALYSE IA

   À ajouter au projet Apps Script backend Yaya.
   Puis, dans doPost(e), ajouter la branche archiverDevis indiquée
   ci-dessous AVANT les branches extraireDevis / extraireAchat.
========================================================= */

function archiverDevisSansIA_(d) {
  d = d || {};

  // Permet au front de vérifier que ce backend est bien déployé
  // sans créer de fichier.
  if (d.probe) {
    return {
      supported: true,
      lienDrive: "",
      archiveErreur: ""
    };
  }

  const arch = archiverDrive_(
    d,
    "Yaya - Devis"
  );

  return {
    supported: true,
    lienDrive: arch.url || "",
    archiveErreur: arch.err || ""
  };
}

/*
Dans doPost(e), ajouter exactement cette branche :

    } else if (
      a === "archiverDevis"
    ) {

      payload =
        archiverDevisSansIA_(d);

Puis conserver les branches existantes :

    } else if (
      a === "extraireDevis"
    ) {
      ...

Important : le front Yaya n'utilisera plus extraireDevis pour les devis
quand archiverDevis est disponible. Le fichier est uniquement archivé
sur Drive ; aucune requête OpenAI / GPT n'est effectuée et aucun montant,
client ou numéro n'est modifié automatiquement.
*/
