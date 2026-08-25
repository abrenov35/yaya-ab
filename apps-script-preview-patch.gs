/*
 YAYA — APERÇU DRIVE EN BASE64
 À ajouter au projet Apps Script Yaya de production.

 1) Ajouter les fonctions ci-dessous dans un fichier .gs.
 2) Dans doPost(e), ajouter AVANT le dernier `else { Action inconnue }` :

    } else if (a === "getDriveFile") {
      payload = getDriveFileForPreview_(d);

 Le front GitHub `piece-preview-api-patch.js` utilise cette action.
*/

function extraireDriveIdApercu_(valeur) {
  var s = String(valeur || "").trim();
  if (!s) return "";

  if (/^[A-Za-z0-9_-]{20,}$/.test(s)) return s;

  var m = s.match(/\/file\/d\/([^\/?#]+)/i);
  if (m && m[1]) return m[1];

  m = s.match(/[?&]id=([^&#]+)/i);
  if (m && m[1]) return decodeURIComponent(m[1]);

  return "";
}

function getDriveFileForPreview_(d) {
  d = d || {};

  var id = extraireDriveIdApercu_(d.id || d.url || "");
  if (!id) {
    throw new Error("ID Google Drive introuvable");
  }

  var fichier = DriveApp.getFileById(id);
  var taille = Number(fichier.getSize()) || 0;
  var MAX_APERCU_OCTETS = 12 * 1024 * 1024;

  if (taille > MAX_APERCU_OCTETS) {
    throw new Error("Fichier trop lourd pour l’aperçu direct (12 Mo max)");
  }

  var blob = fichier.getBlob();
  var octets = blob.getBytes();

  if (octets.length > MAX_APERCU_OCTETS) {
    throw new Error("Fichier trop lourd pour l’aperçu direct (12 Mo max)");
  }

  var mime = String(blob.getContentType() || fichier.getMimeType() || "application/octet-stream");

  return {
    id: id,
    filename: fichier.getName(),
    mimeType: mime,
    size: octets.length,
    base64: Utilities.base64Encode(octets)
  };
}
