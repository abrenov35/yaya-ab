/* =========================================================
   YAYA — TRANSFERT : APERÇU ONEDRIVE SÉCURISÉ

   À ajouter comme NOUVEAU fichier dans le projet Apps Script
   autonome « YAYA – TRANSFERT ».

   Puis, dans ym2WorkerDispatch_(action, data), ajouter UNE ligne
   au début du dispatch (après ping, avant les opérations de file) :

     if (action === 'previewOneDrive') return ym2PreviewOneDrive_(data);

   Enfin : enregistrer + redéployer la version existante du Web App.

   Ce code est LECTURE SEULE : aucun fichier OneDrive n'est modifié,
   déplacé, remplacé ou supprimé.
========================================================= */

function ym2PreviewOneDrive_(data) {
  data = data || {};

  var itemId = String(data.itemId || '').trim();
  if (!itemId || !/^[A-Za-z0-9!._~-]{3,220}$/.test(itemId)) {
    throw new Error('Identifiant OneDrive invalide.');
  }

  var config = ym2OneDriveConfig_();
  if (!config || !config.resolvedDriveId) {
    throw new Error('Liaison privée OneDrive absente du service.');
  }

  // Le DriveItem est lu directement depuis Microsoft Graph avec la connexion
  // privée déjà utilisée par ce worker.
  var item = ym2OdGraph_(
    '/drives/' + encodeURIComponent(config.resolvedDriveId) +
    '/items/' + encodeURIComponent(itemId)
  );

  if (!item || !item.id || !item.file) {
    throw new Error('La pièce OneDrive est introuvable ou n’est pas un fichier.');
  }

  var name = String(item.name || 'piece-jointe').trim() || 'piece-jointe';
  var size = Number(item.size || 0);
  var maxBytes = 10 * 1024 * 1024;

  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('La pièce OneDrive est vide.');
  }
  if (size > maxBytes) {
    throw new Error('Aperçu OneDrive limité aux pièces de 10 Mo.');
  }

  var mime = String(item.file.mimeType || '').toLowerCase();
  var previewable =
    mime === 'application/pdf' ||
    mime.indexOf('image/') === 0 ||
    /\.(pdf|png|jpe?g|webp|gif)$/i.test(name);

  if (!previewable) {
    throw new Error('Ce format OneDrive n’est pas prévisualisable dans Yaya.');
  }

  // IMPORTANT : cette URL temporaire n'est PAS fournie par le navigateur.
  // Elle vient directement de la réponse authentifiée de Microsoft Graph.
  // Aucun Bearer token n'est envoyé à cette URL : elle est déjà préautorisée.
  var privateUrl = String(item['@microsoft.graph.downloadUrl'] || '').trim();
  if (!/^https:\/\/[^\s]+$/i.test(privateUrl)) {
    throw new Error('Adresse temporaire OneDrive invalide.');
  }

  // L’URL reste strictement côté serveur : elle n’est jamais renvoyée au
  // navigateur, enregistrée dans Yaya ou écrite dans les journaux.
  var response = UrlFetchApp.fetch(privateUrl, {
    method: 'get',
    muteHttpExceptions: true,
    followRedirects: true
  });

  var code = response.getResponseCode();
  if (code !== 200) {
    throw new Error('Lecture de la pièce OneDrive impossible (HTTP ' + code + ').');
  }

  var blob = response.getBlob();
  var bytes = blob.getBytes();

  if (!bytes || !bytes.length) {
    throw new Error('La pièce OneDrive téléchargée est vide.');
  }
  if (bytes.length > maxBytes) {
    throw new Error('Aperçu OneDrive limité aux pièces de 10 Mo.');
  }

  var responseMime = String(blob.getContentType() || mime || 'application/octet-stream');

  return {
    filename: name,
    mimeType: responseMime,
    size: bytes.length,
    base64: Utilities.base64Encode(bytes)
  };
}
