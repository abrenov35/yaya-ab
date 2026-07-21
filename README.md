# YAYA - Gestionnaire de Projets

Application web complète pour gérer vos projets YAYA avec gestion des marchés, dépenses, documents et heures.

## 🎯 Fonctionnalités

✅ **Gestion de Projets**
- Création et suivi de projets
- Suivi des statuts (En cours, Terminé, En attente)
- Calcul automatique des marges

✅ **Marché**
- Devis et avenants
- Suivi des montants

✅ **Dépenses**
- Bons de livraison, avoirs, factures
- Calcul des coûts d'achat

✅ **Documents**
- Upload de PDF, images et plans
- Glisser-déposer les fichiers
- Gestion complète (voir, modifier, supprimer)

✅ **Statistiques**
- Suivi en temps réel des montants
- Calcul automatique de la marge

## 📋 Prérequis

- Node.js 16+ 
- npm ou yarn
- Espace disque pour les uploads (50MB par fichier max)

## 🚀 Installation

### 1. Extraire les fichiers
Décompressez le projet dans un dossier de votre choix.

### 2. Installer les dépendances
```bash
npm install
```

### 3. Démarrer le serveur
```bash
npm start
```

Ou en mode développement (avec rechargement automatique):
```bash
npm run dev
```

### 4. Ouvrir l'application
Ouvrez votre navigateur et allez à:
```
http://localhost:3000
```

## 📁 Structure du Projet

```
pavageau-project-manager/
├── server.js              # Serveur Express + API
├── package.json           # Dépendances Node.js
├── public/
│   ├── index.html        # Page HTML principale
│   ├── styles.css        # Feuille de styles
│   └── app.js            # Logique JavaScript
├── uploads/
│   └── documents/        # Dossier des uploads
└── README.md            # Ce fichier
```

## 🔌 API Endpoints

### Projets
- `GET /api/projects` - Lister tous les projets
- `GET /api/projects/:id` - Obtenir un projet
- `POST /api/projects` - Créer un projet
- `PATCH /api/projects/:id` - Modifier un projet

### Marché
- `GET /api/projects/:projectId/market` - Lister les éléments de marché
- `POST /api/projects/:projectId/market` - Ajouter un élément
- `DELETE /api/market/:id` - Supprimer un élément

### Dépenses
- `GET /api/projects/:projectId/expenses` - Lister les dépenses
- `POST /api/projects/:projectId/expenses` - Ajouter une dépense
- `DELETE /api/expenses/:id` - Supprimer une dépense

### Documents
- `GET /api/projects/:projectId/documents` - Lister les documents
- `POST /api/projects/:projectId/documents` - Upload un document
- `DELETE /api/documents/:id` - Supprimer un document

## 🌐 Déploiement en Ligne

### Sur Heroku (Gratuit)

1. **Installer Heroku CLI**
   https://devcenter.heroku.com/articles/heroku-cli

2. **Créer une application Heroku**
   ```bash
   heroku login
   heroku create mon-app-pavageau
   ```

3. **Ajouter un Procfile**
   Créez un fichier `Procfile` à la racine:
   ```
   web: npm start
   ```

4. **Déployer**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

### Sur Railway (Recommandé)

1. Allez sur https://railway.app
2. Connectez-vous avec GitHub
3. Créez un nouveau projet
4. Connectez votre dépôt GitHub
5. Railway détecte automatiquement Node.js et déploie

### Sur Render

1. Allez sur https://render.com
2. Cliquez "New +"
3. Sélectionnez "Web Service"
4. Connectez votre GitHub
5. Configurez:
   - Build command: `npm install`
   - Start command: `npm start`
6. Déployer

## 💾 Base de Données

L'application utilise SQLite en mémoire par défaut. Pour la persistance des données:

1. Remplacez dans `server.js`:
   ```javascript
   const db = new sqlite3.Database(':memory:');
   ```
   Par:
   ```javascript
   const db = new sqlite3.Database('database.db');
   ```

2. Ajoutez `database.db` à votre `.gitignore`

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur:
- Ordinateurs de bureau
- Tablettes
- Téléphones mobiles

## 🔒 Sécurité

- Limite d'upload: 50MB par fichier
- Validation côté serveur des uploads
- Protection CORS
- Les fichiers sont stockés en dehors du répertoire web

## ⚙️ Configuration

### Modifier le port
Modifiez le port dans `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Changer 3000
```

### Augmenter la limite d'upload
Dans `server.js`, modifiez:
```javascript
limits: { fileSize: 50 * 1024 * 1024 } // 50MB
```

## 🐛 Dépannage

### "Port 3000 déjà utilisé"
```bash
# Chercher le processus
lsof -i :3000
# Terminer le processus (remplacer PID)
kill -9 PID
```

### "Module introuvable"
```bash
npm install
```

### Les uploads ne fonctionnent pas
Vérifiez que le dossier `uploads` existe et est accessible en écriture.

## 📞 Support

Pour toute question ou problème, consultez la documentation Express:
https://expressjs.com

## 📄 Licence

Créé pour PAVAGEAU. Libre d'utilisation.

---

**Version:** 1.0.0  
**Dernière mise à jour:** Juillet 2026
