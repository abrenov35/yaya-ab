/* =========================================================
   YAYA — CORRECTIF BACKEND dateSignature
   2026-09-12

   Objectif :
   - lire la colonne J dateSignature depuis YAYA-AB ;
   - conserver la date existante si un ancien navigateur renvoie un chantier
     sans propriété dateSignature ;
   - ne toucher à aucune autre donnée métier.

   À intégrer dans le Code.gs du Web App YAYA puis redéployer avec la même URL /exec.
========================================================= */

function yayaEnsureChantiersSchema_() {
  if (typeof TABS === 'undefined' || !TABS || !Array.isArray(TABS.chantiers)) {
    throw new Error('Schéma TABS.chantiers introuvable');
  }

  const expected = [
    'id',
    'nom',
    'numero',
    'montantDevisHT',
    'statut',
    'notes',
    'montantMarcheHT',
    'modeSuivi',
    'dateDemarrage',
    'dateSignature'
  ];

  // Le Sheet YAYA-AB utilise ces 10 colonnes A:J dans cet ordre.
  // On remplace uniquement le schéma en mémoire utilisé par readTab_/writeTab_.
  TABS.chantiers = expected.slice();
}


// REMPLACE la fonction readTab_ actuelle.
function readTab_(name) {
  if (name === 'chantiers') {
    yayaEnsureChantiersSchema_();
  }

  const sh =
    yayaSpreadsheet_()
      .getSheetByName(name);

  if (!sh || sh.getLastRow() < 2) {
    return [];
  }

  const cols = TABS[name];

  const rows =
    sh.getRange(
      2,
      1,
      sh.getLastRow() - 1,
      cols.length
    ).getValues();

  return rows.map(function(r) {
    const o = {};

    cols.forEach(function(c, i) {
      o[c] = r[i];
    });

    return o;
  });
}


// REMPLACE la fonction writeTab_ actuelle.
function writeTab_(name, objects) {
  if (name === 'chantiers') {
    yayaEnsureChantiersSchema_();
  }

  const sh =
    yayaSpreadsheet_()
      .getSheetByName(name);

  if (!sh) {
    throw new Error('Onglet Yaya introuvable : ' + name);
  }

  const cols = TABS[name];

  if (sh.getLastRow() > 1) {
    sh.getRange(
      2,
      1,
      sh.getLastRow() - 1,
      cols.length
    ).clearContent();
  }

  if (objects && objects.length) {
    const rows =
      objects.map(function(o) {
        return cols.map(function(c) {
          return o[c] !== undefined && o[c] !== null
            ? o[c]
            : '';
        });
      });

    sh.getRange(
      2,
      1,
      rows.length,
      cols.length
    ).setValues(rows);
  }
}


// REMPLACE la fonction setChantiersSafe_ actuelle.
function setChantiersSafe_(objects) {
  const current =
    readTab_('chantiers');

  const incoming =
    Array.isArray(objects)
      ? objects
      : [];

  if (
    current.length >= 5 &&
    incoming.length < current.length * 0.7
  ) {
    throw new Error(
      'SECURITE YAYA : sauvegarde des chantiers bloquée. ' +
      'La base contient ' +
      current.length +
      ' chantier(s), mais seulement ' +
      incoming.length +
      ' ont été reçus.'
    );
  }

  const currentById = {};

  current.forEach(function(c) {
    currentById[String(c.id || '')] = c;
  });

  const safeIncoming =
    incoming.map(function(c) {
      const copie = Object.assign({}, c);
      const ancien = currentById[String(copie.id || '')];

      // Compatibilité anciens navigateurs : absence du champ = conservation.
      // Une valeur explicitement envoyée, y compris '', reste volontaire.
      if (
        ancien &&
        !Object.prototype.hasOwnProperty.call(copie, 'dateSignature')
      ) {
        copie.dateSignature = ancien.dateSignature || '';
      }

      return copie;
    });

  writeTab_(
    'chantiers',
    safeIncoming
  );
}


// Diagnostic facultatif à lancer depuis l'éditeur Apps Script avant redéploiement.
function yayaDiagnosticDateSignature_() {
  yayaEnsureChantiersSchema_();

  const lignes = readTab_('chantiers');
  const avecSignature = lignes.filter(function(c) {
    return String(c.dateSignature || '').trim() !== '';
  });

  Logger.log(JSON.stringify({
    totalChantiers: lignes.length,
    avecDateSignature: avecSignature.length,
    exemples: avecSignature.slice(0, 10).map(function(c) {
      return {
        id: c.id,
        nom: c.nom,
        dateSignature: c.dateSignature
      };
    })
  }, null, 2));
}
