/* =========================================================
   YAYA — IMPORT CHANTIERS DEPUIS L'EXTRANET AB RENOV 35

   IMPORTANT : Yaya possède déjà un doPost(e) utilisé par l'interface
   (setChantiers, setAchats, setDocuments, etc.).
   NE PAS remplacer ce doPost par un doPost minimal : cela casserait Yaya.

   Ce fichier ajoute la réception du payload direct Extranet :
   {
     "id": "C142",
     "nom": "Nom du chantier",
     "date_demarrage": "2026-10-01",
     "date_signature": "2026-09-15",
     "montant_ht": 15000.50
   }

   À faire dans le doPost(e) EXISTANT, juste après JSON.parse :

     var reponseExtranet = yayaHandleExtranetChantierPost_(body);
     if (reponseExtranet) return reponseExtranet;

   où "body" est l'objet issu de JSON.parse(e.postData.contents).
========================================================= */

function yayaHandleExtranetChantierPost_(body) {
  if (!body || typeof body !== 'object') return null;

  // Les requêtes natives Yaya contiennent action/data : on ne les intercepte pas.
  if (body.action) return null;

  var id = String(body.id || '').trim().toUpperCase();
  if (!/^C\d+$/.test(id)) return null;

  yayaUpsertChantierExtranet_(body);

  // Compatible avec le patch de cache différentiel si présent.
  try {
    if (typeof yayaTouchTabs_ === 'function') {
      yayaTouchTabs_(['chantiers']);
    } else if (typeof yayaTouchAction_ === 'function') {
      yayaTouchAction_('setChantiers');
    }
  } catch (e) {}

  return ContentService
    .createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

function yayaUpsertChantierExtranet_(data) {
  data = data || {};

  var id = String(data.id || '').trim().toUpperCase();
  var nom = String(data.nom || '').trim();
  var dateDemarrage = yayaDateIsoExtranet_(data.date_demarrage);
  var dateSignature = yayaDateIsoExtranet_(data.date_signature);
  var montantHt = Number(data.montant_ht);

  if (!/^C\d+$/.test(id)) {
    throw new Error('ID chantier Extranet invalide : ' + id);
  }
  if (!nom) {
    throw new Error('Nom chantier obligatoire');
  }
  if (!isFinite(montantHt)) {
    montantHt = 0;
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName('chantiers') || ss.getSheetByName('Chantiers');
    if (!sh) {
      throw new Error('Onglet chantiers introuvable');
    }

    var lastColumn = Math.max(sh.getLastColumn(), 1);
    var headers = sh.getRange(1, 1, 1, lastColumn).getValues()[0]
      .map(function(v) { return String(v || '').trim(); });

    // Colonnes nécessaires à la synchro Extranet -> Yaya.
    ['id', 'nom', 'montantDevisHT', 'montantMarcheHT', 'statut', 'dateDemarrage', 'dateSignature']
      .forEach(function(header) {
        if (headers.indexOf(header) === -1) {
          headers.push(header);
          sh.getRange(1, headers.length).setValue(header);
        }
      });

    var col = {};
    headers.forEach(function(h, i) {
      if (h) col[h] = i;
    });

    var lastRow = sh.getLastRow();
    var existingRow = 0;
    var existingValues = null;

    if (lastRow >= 2) {
      var ids = sh.getRange(2, col.id + 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0] || '').trim().toUpperCase() === id) {
          existingRow = i + 2;
          break;
        }
      }
    }

    if (existingRow) {
      existingValues = sh.getRange(existingRow, 1, 1, headers.length).getValues()[0];
    } else {
      existingValues = new Array(headers.length).fill('');
    }

    existingValues[col.id] = id;
    existingValues[col.nom] = nom;

    // À la création depuis l'Extranet, montant_ht devient le montant initial Yaya.
    // montantMarcheHT est également renseigné pour les vues/exports qui l'utilisent.
    existingValues[col.montantDevisHT] = montantHt;
    existingValues[col.montantMarcheHT] = montantHt;

    if (!existingValues[col.statut]) {
      existingValues[col.statut] = 'En cours';
    }

    existingValues[col.dateDemarrage] = dateDemarrage;
    existingValues[col.dateSignature] = dateSignature;

    if (existingRow) {
      sh.getRange(existingRow, 1, 1, headers.length).setValues([existingValues]);
    } else {
      sh.getRange(sh.getLastRow() + 1, 1, 1, headers.length).setValues([existingValues]);
    }

    return {
      ok: true,
      id: id,
      created: !existingRow
    };
  } finally {
    lock.releaseLock();
  }
}

function yayaDateIsoExtranet_(value) {
  var s = String(value || '').trim();
  if (!s) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error('Date Extranet invalide : ' + s);
  }
  return s;
}
