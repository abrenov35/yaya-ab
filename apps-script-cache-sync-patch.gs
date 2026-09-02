/* =========================================================
   YAYA — CACHE / SYNCHRO DIFFERENTIELLE
   À ajouter au backend Apps Script YAYA-AB.

   OBJECTIF
   - ?mode=meta : renvoyer uniquement les versions des rubriques.
   - ?tabs=chantiers,documents : lire uniquement les rubriques demandées.
   - aucune relecture complète de toutes les feuilles pour un simple contrôle.

   IMPORTANT
   1) Remplacer le doGet(e) actuel par celui de ce fichier.
   2) Ajouter l'appel yayaTouchAction_(a) dans doPost(e), juste AVANT
      le return ContentService.createTextOutput(...) de succès.
   3) Redéployer une nouvelle version du Web App en gardant la même URL /exec.
========================================================= */

const YAYA_REV_GLOBAL_KEY_ = "YAYA_REV_GLOBAL";
const YAYA_REV_TAB_PREFIX_ = "YAYA_REV_TAB_";

function yayaJson_(objet) {
  return ContentService
    .createTextOutput(JSON.stringify(objet))
    .setMimeType(ContentService.MimeType.JSON);
}

function yayaMeta_() {
  const props = PropertiesService.getScriptProperties();
  const tabs = {};

  Object.keys(TABS).forEach(function(name) {
    tabs[name] = String(
      props.getProperty(YAYA_REV_TAB_PREFIX_ + name) || "0"
    );
  });

  return {
    global: String(
      props.getProperty(YAYA_REV_GLOBAL_KEY_) || "0"
    ),
    tabs: tabs
  };
}

function yayaTouchTabs_(noms) {
  noms = Array.isArray(noms) ? noms : [];
  if (!noms.length) return;

  const props = PropertiesService.getScriptProperties();
  const revision = String(Date.now());
  const valeurs = {};

  valeurs[YAYA_REV_GLOBAL_KEY_] = revision;

  noms.forEach(function(name) {
    if (TABS[name]) {
      valeurs[YAYA_REV_TAB_PREFIX_ + name] = revision;
    }
  });

  props.setProperties(valeurs, false);
}

function yayaTabsAction_(action) {
  const map = {
    addChantier: ["chantiers"],
    updateChantier: ["chantiers"],
    deleteChantier: ["chantiers"],
    setChantiers: ["chantiers"],

    setSalaries: ["salaries"],

    setAchats: ["achats"],
    addAchat: ["achats"],

    setCommandes: ["commandes"],
    addCommande: ["commandes"],

    setAvenants: ["avenants"],

    setDocuments: ["documents"],
    addDocument: ["documents"],

    setHeures: ["heures"],
    setSemaine: ["heures", "validations"]
  };

  return map[String(action || "")] || [];
}

function yayaTouchAction_(action) {
  yayaTouchTabs_(yayaTabsAction_(action));
}


// ═══════════════════════════════════════
// REMPLACE ENTIÈREMENT LE doGet(e) ACTUEL
// ═══════════════════════════════════════

function doGet(e) {

  const p =
    e && e.parameter
      ? e.parameter
      : {};

  if (p.diag) {
    return ContentService
      .createTextOutput("DIAGNOSTIC OK")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  // Contrôle ultra-léger : aucune lecture de feuille.
  if (String(p.mode || "") === "meta") {
    return yayaJson_({
      ok: true,
      meta: yayaMeta_()
    });
  }

  let noms = Object.keys(TABS);

  // Lecture sélective : uniquement les rubriques demandées.
  if (p.tabs) {
    const demandes = String(p.tabs)
      .split(",")
      .map(function(v) { return v.trim(); })
      .filter(Boolean);

    noms = demandes.filter(function(name) {
      return !!TABS[name];
    });
  }

  const out = {};

  noms.forEach(function(name) {
    out[name] = readTab_(name);
  });

  return yayaJson_({
    ok: true,
    data: out,
    meta: yayaMeta_()
  });
}


/* =========================================================
   AJOUT À FAIRE DANS doPost(e)

   Après le dernier bloc if/else qui traite l'action,
   et JUSTE AVANT le return de succès, ajouter :

      yayaTouchAction_(a);

   Exemple :

      } else {
        throw new Error("Action inconnue : " + a);
      }

      yayaTouchAction_(a);

      return ContentService
        .createTextOutput(
          JSON.stringify({
            ok: true,
            data: payload
          })
        )
        .setMimeType(ContentService.MimeType.JSON);

========================================================= */
