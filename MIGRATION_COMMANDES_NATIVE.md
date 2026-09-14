# Migration AB Commandes vers Yaya — plan de travail

Branche de travail : `migration-commandes-native-v1`

## Objectif

Intégrer l'interface Commandes directement dans le dépôt `yaya-ab` afin de supprimer progressivement le passage par l'application AB Commandes séparée et son iframe/preview.

Le backend Apps Script et les données restent inchangés pendant la migration. Aucun changement de production ne doit être effectué avant validation.

## Règles de migration

1. Ne jamais modifier `main` pendant les essais.
2. Ne pas supprimer le dépôt `ab-commandes` : il reste la version de secours jusqu'à validation complète.
3. Copier d'abord le front-end Commandes dans Yaya dans un espace isolé.
4. Conserver les mêmes identifiants de commandes et de documents.
5. Ne déclencher aucune synchronisation automatique de page.
6. Les enregistrements peuvent partir en arrière-plan, mais l'écran de l'opérateur ne doit jamais être reconstruit pendant une saisie ou une modale.
7. Le bouton Actualiser reste l'action volontaire permettant de relire les données distantes.
8. Une fois le mode natif validé, seulement alors remplacer l'ancien iframe/preview dans Yaya.

## Architecture actuelle à remplacer progressivement

- Yaya charge aujourd'hui AB Commandes via des mécanismes d'intégration/preview.
- AB Commandes possède son propre front-end et son propre cache local.
- Cette séparation impose un second chargement de page, des échanges parent/enfant et des mécanismes de synchronisation qui augmentent la latence ressentie.

## Cible

Créer un module natif Yaya sous :

`public/commandes-native/`

Découpage cible :

- `commandes-native.html` : structure de la page Commandes.
- `commandes-native.css` : styles propres au module.
- `commandes-native.js` : logique d'affichage et d'édition.
- `commandes-api.js` : accès au backend Apps Script existant.
- `commandes-documents.js` : envoi et suivi des documents en arrière-plan.

## Etapes

### Etape 1 — branche de sécurité
Terminé : branche `migration-commandes-native-v1` créée à partir de Yaya actuel.

### Etape 2 — audit et gel de l'architecture
Terminé avec ce document. Aucun comportement de production modifié.

### Etape 3 — copie du front-end Commandes dans Yaya
Créer `public/commandes-native/` et y recopier les fonctions réellement utilisées, sans iframe et sans modifier le menu Yaya.

### Etape 4 — connexion au backend existant
Brancher le module natif sur le même Apps Script que l'application actuelle, en conservant les données et les identifiants.

### Etape 5 — test isolé
Tester lecture, ajout, modification, statut, documents, suppression et actualisation manuelle depuis une URL de test de la branche.

### Etape 6 — intégration dans le menu Yaya
Faire pointer le bouton Commande de Yaya vers le module natif uniquement après validation de l'étape 5.

### Etape 7 — suppression de l'ancien passage iframe/preview
Retirer les loaders et ponts devenus inutiles, sans supprimer le dépôt `ab-commandes` immédiatement.

### Etape 8 — validation finale
Après plusieurs jours stables, archiver l'ancien système comme secours.
