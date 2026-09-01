/*
  YAYA — PATCH SERVEUR COMMANDES DÉDIÉES

  À appliquer au Code.gs du Web App Yaya.
  Ne modifie ni achats, ni moteur HT, ni Dropbox/OneDrive.

  1) Après la déclaration existante de const TABS = {...}; ajouter le bloc A.
  2) Dans doPost(e), entre le bloc ACHATS et le bloc AVENANTS, ajouter le bloc B.

  L'onglet physique "commandes" existe déjà dans YAYA-AB avec ces 17 colonnes.
*/


/* =========================
   BLOC A — APRÈS const TABS
   ========================= */

TABS.commandes = [
  "id",
  "chantierId",
  "typeDoc",
  "fournisseur",
  "designation",
  "date",
  "montantHT",
  "lien",
  "dropboxId",
  "dropboxPath",
  "oneDriveId",
  "oneDriveWebUrl",
  "statutValidation",
  "origine",
  "gmailMessageId",
  "pieceNom",
  "pieceEmpreinte"
];


/* =========================
   BLOC B — DANS doPost(e)
   À insérer après addAchat et avant AVENANTS.
   =========================

    // COMMANDES
    } else if (
      a === "setCommandes"
    ) {

      writeTab_(
        "commandes",
        Array.isArray(d)
          ? d
          : []
      );

    } else if (
      a === "addCommande"
    ) {

      if (!d || !d.id) {
        throw new Error(
          "Commande invalide : identifiant manquant"
        );
      }

      if (!d.chantierId) {
        throw new Error(
          "Commande invalide : chantier manquant"
        );
      }

      const commande = {
        id: String(d.id),
        chantierId: String(d.chantierId),
        typeDoc: String(d.typeDoc || "Bon de commande"),
        fournisseur: String(d.fournisseur || ""),
        designation: String(d.designation || ""),
        date: String(d.date || ""),
        montantHT: Number(d.montantHT || 0),
        lien: String(d.lien || ""),
        dropboxId: String(d.dropboxId || ""),
        dropboxPath: String(d.dropboxPath || ""),
        oneDriveId: String(d.oneDriveId || ""),
        oneDriveWebUrl: String(d.oneDriveWebUrl || ""),
        statutValidation: String(d.statutValidation || "VALIDEE"),
        origine: String(d.origine || "GMAIL_ADDON"),
        gmailMessageId: String(d.gmailMessageId || ""),
        pieceNom: String(d.pieceNom || ""),
        pieceEmpreinte: String(d.pieceEmpreinte || "")
      };

      replaceWhere_(
        "commandes",
        "id",
        commande.id,
        [commande]
      );

      const commandeRelue =
        readTab_("commandes")
          .find(function(item) {
            return (
              normKey_(item.id) ===
              normKey_(commande.id)
            );
          });

      if (!commandeRelue) {
        throw new Error(
          "Échec de contrôle : la commande n'est pas présente dans YAYA"
        );
      }

      payload = {
        id: commande.id,
        enregistre: true,
        rubrique: "commandes",
        spreadsheetId:
          yayaSpreadsheet_().getId()
      };

   FIN DU BLOC B
   Le code existant doit ensuite continuer avec :

    // AVENANTS
    } else if (
      a === "setAvenants"
    ) {
      ...

*/


/*
  doGet(e) : AUCUNE MODIFICATION supplémentaire.

  Le serveur Yaya actuel fait déjà :

    const out = {};
    for (const name in TABS) {
      out[name] = readTab_(name);
    }

  Donc dès que TABS.commandes existe, la réponse GET contient automatiquement :

    data.commandes

  Le front Yaya utilise ensuite exclusivement S.commandes.
*/
