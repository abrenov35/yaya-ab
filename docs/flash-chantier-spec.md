# Flash Chantier — spécification de prototype (non déployé)

Objectif : synthèse opérationnelle à l'ouverture d'une fiche chantier, sur iPhone et ordinateur, sans modifier les autres fonctions.

- Au plus trois informations courtes : alerte, action à vérifier, nouvelle.
- Chaque entrée comporte chantier_id, type, texte, source_email_id, date_source, date_maj, statut_validation et auteur.
- Afficher automatiquement uniquement si information nouvelle ou importante, une fois par version et par utilisateur ; bouton Flash permanent pour rouvrir.
- Ne jamais transformer un devis reçu en commande ou une proposition en instruction confirmée.
- Extraction Gmail : rapprochement fiable par nom/référence chantier, rejet des ambiguïtés, dédoublonnage par identifiant de message et fait métier.
- Consignes opérationnelles : validation par un collaborateur habilité avant publication ; faits confirmés identifiés comme tels.
- Afficher date et accès à la source selon les permissions ; ne pas exposer les mails privés à tous les employés.
- Si aucune information validée, pas de fenêtre automatique.
- Fenêtre stable, sans défilement horizontal, clavier mobile utilisable, fermeture accessible.
- Aucun marquage Gmail Traité/lu/archivé par ce processus.

Exemples à valider, non importés dans Yaya : Odalys report au 12/11 et refus d'un nouveau report ; Fiminski commande Point.P 1090061914 du 07/11 (livraison inconnue) ; Friteau-INEO second devis signalé non reçu ; Quéméneur devis PARTEDIS reçu.

Avant déploiement : confirmer que ce dépôt correspond à l'application Yaya 2 actuellement publiée ; créer et tester une implémentation isolée ; vérifier permissions, correspondance des chantiers et fonctionnement mobile ; obtenir accord de mise en production.
