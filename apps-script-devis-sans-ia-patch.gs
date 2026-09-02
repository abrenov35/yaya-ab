/*
YAYA — CORRECTIF SERVEUR : JOINDRE UN DEVIS SANS OPENAI
À appliquer au serveur Apps Script Yaya (pas à Yaya Mail 2).
Ce fichier est un correctif partiel : ne pas remplacer tout Code.gs.

1. Ajouter la fonction archiverDevisSansIA_ ci-dessous au projet.
   Si elle existe déjà, remplacer cette seule fonction.

2. Dans doPost(e), remplacer la branche existante :

    } else if (a === "extraireDevis") {
      payload = extraireDevis_(d);

   par :

    } else if (a === "extraireDevis" || a === "archiverDevis") {
      payload = archiverDevisSansIA_(d);

   Si une branche archiverDevis existe déjà, la faire appeler cette
   même fonction. Conserver toutes les autres actions du serveur.

3. Enregistrer puis mettre à jour le déploiement WEB EXISTANT :
   Déployer > Gérer les déploiements > Modifier (crayon)
   > Version : Nouvelle version > Déployer. Conserver la même URL.

Le site appelle archiverDevis. Les anciens clients qui appellent
extraireDevis utilisent aussi l'archivage sans IA après cette modification.
Aucune clé OpenAI nécessaire. Aucun montant ni nom extrait du document.
La fonction réutilise archiverDrive_ déjà présente sur le serveur.
*/

function archiverDevisSansIA_(d) {
  d = d || {};
  if (d.probe === true) {
    return { supported: true, lienDrive: "", archiveErreur: "" };
  }
  if (typeof d.base64 !== "string" || !d.base64.trim()) {
    throw new Error("Le document est vide ou illisible.");
  }
  if (d.base64.length > Math.ceil(8 * 1024 * 1024 / 3) * 4) {
    throw new Error("Fichier trop lourd (8 Mo max).");
  }
  const arch = archiverDrive_({
    filename: String(d.filename || "devis.pdf"),
    mimeType: String(d.mimeType || "application/pdf"),
    base64: d.base64
  }, "Yaya - Devis");
  if (!arch || !arch.url) {
    throw new Error(arch && arch.err || "Le document n'a pas pu être archivé.");
  }
  return { supported: true, lienDrive: arch.url, archiveErreur: "" };
}
