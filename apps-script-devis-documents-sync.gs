/* =========================================================
   YAYA — SYNCHRONISATION CENTRALE DES DEVIS PAR CHANTIER

   BUT
   - Les PDF restent dans Google Drive.
   - L'onglet physique DEVlS du classeur Yaya devient l'index commun
     à l'iPhone, au PC et à l'iPad.
   - Le front marche-cards-page.js migre automatiquement les anciennes
     références localStorage dès que ce patch est déployé.

   ONGLET PHYSIQUE EXISTANT : DEVlS / DEVIS
   En-têtes attendus exactement :
   ID | ID chantier | Nom chantier | N° devis | Date | Nom fichier | Lien Drive

   À APPLIQUER AU Code.gs DE PRODUCTION DU WEB APP YAYA.
========================================================= */


/* =========================
   BLOC A — APRÈS const TABS
   ========================= */

TABS.DEVIS = [
  "ID",
  "ID chantier",
  "Nom chantier",
  "N° devis",
  "Date",
  "Nom fichier",
  "Lien Drive"
];


/* =========================
   BLOC B — DANS doPost(e)
   Ajouter avant le bloc HEURES.
   =========================

    // DEVIS — INDEX CENTRAL
    } else if (
      a === "setDevisDocuments"
    ) {

      writeTab_(
        "DEVIS",
        Array.isArray(d) ? d : []
      );

      SpreadsheetApp.flush();

      payload = {
        enregistre: true,
        rubrique: "DEVIS",
        count: Array.isArray(d) ? d.length : 0
      };

    } else if (
      a === "upsertDevisDocument"
    ) {

      if (!d || !String(d["ID"] || "").trim()) {
        throw new Error(
          "Devis invalide : identifiant manquant"
        );
      }

      if (!String(d["ID chantier"] || "").trim()) {
        throw new Error(
          "Devis invalide : chantier manquant"
        );
      }

      if (!String(d["Lien Drive"] || "").trim()) {
        throw new Error(
          "Devis invalide : lien Drive manquant"
        );
      }

      replaceWhere_(
        "DEVIS",
        "ID",
        String(d["ID"]),
        [d]
      );

      SpreadsheetApp.flush();

      const devisRelu =
        readTab_("DEVIS").filter(function(item) {
          return (
            normKey_(item["ID"]) ===
            normKey_(d["ID"])
          );
        })[0];

      if (!devisRelu) {
        throw new Error(
          "Échec de contrôle : le devis n'est pas présent dans l'onglet DEVIS"
        );
      }

      payload = {
        id: String(d["ID"]),
        enregistre: true,
        rubrique: "DEVIS"
      };

    } else if (
      a === "deleteDevisDocument"
    ) {

      const devisId =
        String(d && (d.id || d["ID"]) || "").trim();

      if (!devisId) {
        throw new Error(
          "Suppression devis impossible : identifiant manquant"
        );
      }

      deleteOne_(
        "DEVIS",
        "ID",
        devisId
      );

      SpreadsheetApp.flush();

      const encorePresent =
        readTab_("DEVIS").some(function(item) {
          return (
            normKey_(item["ID"]) ===
            normKey_(devisId)
          );
        });

      if (encorePresent) {
        throw new Error(
          "Échec de contrôle : le devis est encore présent dans l'onglet DEVIS"
        );
      }

      payload = {
        id: devisId,
        supprime: true,
        rubrique: "DEVIS"
      };

   FIN DU BLOC B
*/


/* =========================
   BLOC C — CACHE DIFFÉRENTIEL
   =========================

   Dans yayaTabsAction_(action), ajouter :

    setDevisDocuments: ["DEVIS"],
    upsertDevisDocument: ["DEVIS"],
    deleteDevisDocument: ["DEVIS"],

   Si le doPost appelle déjà yayaTouchAction_(a) avant sa réponse,
   aucune autre modification n'est nécessaire.
*/


/* =========================
   DÉPLOIEMENT
   =========================

   Après modification du Code.gs :
   1. Enregistrer.
   2. Déployer > Gérer les déploiements.
   3. Modifier le déploiement Web App existant.
   4. Nouvelle version > Déployer.
   5. Conserver exactement la même URL /exec.

   IMPORTANT : ne pas créer un nouveau Web App avec une autre URL.
*/
