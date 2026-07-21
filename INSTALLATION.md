# Guide d'Installation - YAYA

Suivi pas à pas pour installer et lancer l'application YAYA.

## 🖥️ Installation Locale

### Étape 1: Préparer votre ordinateur

Téléchargez et installez Node.js (v16 ou plus récent):
👉 https://nodejs.org/

Vérifiez l'installation en ouvrant le Terminal/Invite de commandes:
```bash
node --version
npm --version
```

### Étape 2: Télécharger les fichiers

1. Téléchargez le projet PAVAGEAU
2. Décompressez le dossier sur votre ordinateur
3. Ouvrez un Terminal/Invite de commandes dans ce dossier

**Windows:** Clic droit → "Ouvrir Terminal Windows ici"  
**Mac/Linux:** Clic droit → "Terminal ici" (ou Applications → Utilitaires → Terminal)

### Étape 3: Installer les dépendances

Dans le Terminal, tapez:
```bash
npm install
```

Attendez que tous les paquets se téléchargent (2-3 minutes).

### Étape 4: Démarrer le serveur

```bash
npm start
```

Vous devriez voir:
```
✅ Serveur démarré sur http://localhost:3000
📱 Ouvrez le navigateur et accédez à http://localhost:3000
```

### Étape 5: Ouvrir l'application

Ouvrez votre navigateur (Chrome, Firefox, Safari, Edge):
```
http://localhost:3000
```

✅ L'application est prête !

---

## 🐳 Installation avec Docker (Optionnel)

Si vous avez Docker installé:

```bash
docker-compose up
```

Puis ouvrez: `http://localhost:3000`

Pour arrêter: `Ctrl+C` puis `docker-compose down`

---

## 🌐 Déploiement en Ligne

### Option 1: Railway (Recommandé) - 5 minutes

1. Allez sur https://railway.app
2. Cliquez "Login with GitHub" (créez un compte GitHub si besoin)
3. Cliquez "New Project"
4. Sélectionnez "Deploy from GitHub"
5. Connectez votre dépôt GitHub (ou importez le projet)
6. Railway configure tout automatiquement
7. Cliquez "Deploy"
8. L'app est en ligne ! Vous avez une URL publique

### Option 2: Heroku - 5 minutes

1. Allez sur https://www.heroku.com
2. Créez un compte (gratuit)
3. Installez Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
4. Dans Terminal:
```bash
heroku login
heroku create mon-app-pavageau
git push heroku main
```
5. Votre app est en ligne !

### Option 3: Render - 5 minutes

1. Allez sur https://render.com
2. Connectez votre GitHub
3. Cliquez "New +"
4. Sélectionnez "Web Service"
5. Configurez:
   - Build command: `npm install`
   - Start command: `npm start`
6. Déployer
7. Votre app a une URL publique

---

## 📂 Structure des Fichiers

Après installation, vous aurez:

```
yaya/
├── node_modules/          ← Dépendances (créé par npm)
├── public/                ← Fichiers du site web
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── uploads/               ← Dossier des fichiers uploadés
│   └── documents/
├── server.js              ← Le serveur (cœur de l'app)
├── package.json           ← Configuration des dépendances
├── Dockerfile             ← Pour Docker
├── docker-compose.yml     ← Pour Docker
├── README.md              ← Documentation
└── INSTALLATION.md        ← Ce fichier
```

---

## 🚨 Problèmes Courants

### Le serveur ne démarre pas

**Erreur: "Port 3000 already in use"**

Le port 3000 est déjà utilisé. Solutions:

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

Ou modifier le port dans `server.js`:
```javascript
const PORT = 8080; // Au lieu de 3000
```

### "npm: command not found"

Node.js n'est pas installé. Téléchargez-le:
👉 https://nodejs.org/

### Les fichiers ne s'uploadent pas

Vérifiez que le dossier `uploads` existe:
```bash
mkdir -p uploads/documents
```

### "Cannot find module 'express'"

Les dépendances ne sont pas installées:
```bash
npm install
```

### Le navigateur montre "Cannot GET /"

Vérifiez que vous accédez à: `http://localhost:3000`
(pas `localhost:3000` ou `0.0.0.0:3000`)

---

## 🔧 Configuration Avancée

### Changer le port par défaut

Fichier `server.js`, trouvez:
```javascript
const PORT = process.env.PORT || 3000;
```

Remplacez `3000` par le port souhaité (ex: `8080`, `5000`)

### Activer la persistance des données

Par défaut, les données sont supprimées au redémarrage.

Dans `server.js`, remplacez:
```javascript
const db = new sqlite3.Database(':memory:');
```

Par:
```javascript
const db = new sqlite3.Database('database.db');
```

Ajoutez `database.db` à `.gitignore`

### Augmenter la limite d'upload

Dans `server.js`:
```javascript
limits: { fileSize: 100 * 1024 * 1024 } // 100MB au lieu de 50MB
```

---

## ✅ Checklist Démarrage

- [ ] Node.js installé (`node --version` fonctionne)
- [ ] Fichiers décompressés
- [ ] Terminal ouvert dans le dossier
- [ ] `npm install` a tourné sans erreur
- [ ] `npm start` a lancé le serveur
- [ ] Navigateur accède à `http://localhost:3000`
- [ ] L'interface s'affiche
- [ ] Vous pouvez uploader des documents

---

## 📞 Besoin d'Aide ?

Si quelque chose ne fonctionne pas:

1. Vérifiez les messages d'erreur dans le Terminal
2. Redémarrez le serveur (`Ctrl+C` puis `npm start`)
3. Videz le cache du navigateur (`Ctrl+Shift+Delete`)
4. Consultez le README.md pour plus de détails

---

**Bon développement ! 🚀**
