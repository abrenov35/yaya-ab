/* =========================================================
   YAYA BACKEND : PROXY SÉCURISÉ D'APERÇU ONEDRIVE

   À ajouter comme NOUVEAU fichier dans le projet Apps Script
   backend Yaya (celui qui contient doPost et getDriveFile_).

   Dans doPost(e), ajouter UNE branche :

     } else if (a === 'getOneDriveFile') {
       payload = getOneDriveFile_(d);

   Propriétés de script à ajouter dans le BACKEND YAYA :
     YM2_PREVIEW_WORKER_URL     = URL /exec de « YAYA – TRANSFERT »
     YM2_PREVIEW_WORKER_SECRET  = même YM2_WORKER_SECRET que le worker

   Ne jamais mettre ces deux valeurs dans le front GitHub.
========================================================= */

function yayaPreviewSigner_(body, secret) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(body, secret)
  );
}

function yayaPreviewWorkerResponse_(url, payload) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(String(url || ''))) {
    throw new Error('URL du service OneDrive invalide.');
  }

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true,
    followRedirects: false
  });

  var code = response.getResponseCode();
  if (code >= 300 && code < 400) {
    var headers = response.getAllHeaders ? response.getAllHeaders() : {};
    var keys = Object.keys(headers).filter(function(k) {
      return String(k).toLowerCase() === 'location';
    });
    var location = keys.length === 1 ? headers[keys[0]] : '';
    if (Array.isArray(location)) location = location.length === 1 ? location[0] : '';

    if (
      [301, 302, 303, 307, 308].indexOf(code) === -1 ||
      typeof location !== 'string' ||
      !/^https:\/\/script\.googleusercontent\.com\/macros\/echo\?[^\s#]+$/.test(location)
    ) {
      throw new Error('Redirection du service OneDrive non reconnue.');
    }

    // Lecture de la réponse ContentService uniquement : jamais de second POST.
    response = UrlFetchApp.fetch(location, {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: false
    });
    code = response.getResponseCode();
  }

  if (code < 200 || code >= 300) {
    throw new Error('Service OneDrive indisponible (HTTP ' + code + ').');
  }

  var text = response.getContentText();
  var json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('Réponse OneDrive illisible.');
  }

  if (!json || json.ok !== true) {
    throw new Error((json && json.error) || 'Lecture OneDrive refusée.');
  }

  return json.data || {};
}

function yayaPreviewWorkerCall_(action, data) {
  var props = PropertiesService.getScriptProperties();
  var url = String(props.getProperty('YM2_PREVIEW_WORKER_URL') || '').trim();
  var secret = String(props.getProperty('YM2_PREVIEW_WORKER_SECRET') || '').trim();

  if (!url || secret.length < 32) {
    throw new Error('Lecture OneDrive non configurée dans le backend Yaya.');
  }

  var body = JSON.stringify({
    action: action,
    data: data || {},
    timestamp: Date.now()
  });

  var envelope = JSON.stringify({
    body: body,
    signature: yayaPreviewSigner_(body, secret)
  });

  return yayaPreviewWorkerResponse_(url, envelope);
}

function yayaOneDriveItemId_(data) {
  data = data || {};

  var direct = String(data.itemId || '').trim();
  if (direct && /^[A-Za-z0-9!._~-]{3,220}$/.test(direct)) return direct;

  var raw = String(data.url || '').trim();
  if (!raw) throw new Error('Lien OneDrive absent.');

  var id = '';
  try {
    var match = raw.match(/[?&](?:id|resid)=([^&#]+)/i);
    if (match && match[1]) id = decodeURIComponent(match[1]);
  } catch (e) {}

  if (!id || !/^[A-Za-z0-9!._~-]{3,220}$/.test(id)) {
    throw new Error('Identifiant OneDrive introuvable dans le lien.');
  }

  return id;
}

function getOneDriveFile_(data) {
  var itemId = yayaOneDriveItemId_(data);
  return yayaPreviewWorkerCall_('previewOneDrive', { itemId: itemId });
}
