/*
YAYA — CORRECTIF SERVEUR : JOINDRE UN DEVIS SANS IA
À appliquer au serveur Apps Script Yaya (pas à Yaya Mail 2).
Ce fichier est un correctif partiel : ne pas remplacer tout Code.gs.

OBJECTIF
Le front Yaya appelle l'action "archiverDevis" pour joindre un PDF / une image
sans lancer d'analyse IA. Le serveur actuel ne connaît pas encore cette action,
d'où le message : "Action inconnue : archiverDevis".

CORRECTION MINIMALE ET SÛRE
1. Ajouter la fonction archiverDevisSansIA_ ci-dessous au projet Apps Script Yaya.
   Si elle existe déjà, remplacer uniquement cette fonction.

2. Dans doPost(e), conserver la branche existante "extraireDevis" telle quelle
   et ajouter JUSTE AVANT elle :

    } else if (a === "archiverDevis") {
      payload = archiverDevisSansIA_(d);

   Ne pas remplacer les autres actions du serveur.

3. Enregistrer puis mettre à jour le déploiement WEB EXISTANT :
   Déployer > Gérer les déploiements > Modifier (crayon)
   > Version : Nouvelle version > Déployer.
   Conserver exactement la même URL /exec.

Le site continuera donc d'utiliser son URL actuelle.
Aucune clé OpenAI / Gemini n'est nécessaire pour cette action.
Le fichier est seulement archivé dans le dossier Drive "Yaya - Devis".
*/

function archiverDevisSansIA_(d) {
  d = d || {};

  // Permet un test de capacité sans créer de fichier.
  if (d.probe === true) {
    return {
      supported: true,
      lienDrive: "",
      archiveErreur: ""
    };
  }

  const base64 = String(d.base64 || "")
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/\s+/g, "");

  if (!base64) {
    throw new Error("Le document est vide ou illisible.");
  }

  // Limite cohérente avec le front Yaya : 8 Mo max.
  if (base64.length > Math.ceil(8 * 1024 * 1024 / 3) * 4) {
    throw new Error("Fichier trop lourd (8 Mo max).");
  }

  const arch = archiverDrive_(
    {
      filename: String(d.filename || "devis.pdf"),
      mimeType: String(d.mimeType || "application/pdf"),
      base64: base64
    },
    "Yaya - Devis"
  );

  if (!arch || !arch.url) {
    throw new Error(
      arch && arch.err
        ? arch.err
        : "Le document n'a pas pu être archivé."
    );
  }

  return {
    supported: true,
    lienDrive: arch.url,
    archiveErreur: ""
  };
}
