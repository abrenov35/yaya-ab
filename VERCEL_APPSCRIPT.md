# 🚀 Déployer sur Vercel + Google Apps Script

Guide complet pour mettre en ligne l'index et l'utiliser dans Google Sheets.

---

## 📱 PARTIE 1: Déployer l'Index sur Vercel

### Étape 1: Installer Vercel CLI (Optionnel)
Ou faire directement sur le site web (plus simple).

### Étape 2: Aller sur Vercel

1. Allez sur **https://vercel.com**
2. Cliquez **"Sign Up"** → **"Continue with GitHub"**
3. Connectez votre GitHub
4. Vous êtes connecté! ✅

### Étape 3: Déployer le Projet

1. Cliquez **"Add New Project"**
2. Sélectionnez le repo **`yaya-ab`**
3. Vercel détecte tout automatiquement
4. Cliquez **"Deploy"**
5. ⏳ Attendre 1-2 minutes
6. ✅ Vous avez une URL:
   ```
   https://yaya-ab.vercel.app
   ```

---

## 🎯 PARTIE 2: Utiliser Google Apps Script dans Sheets

### Étape 1: Créer une Google Sheet

1. Allez sur **https://sheets.google.com**
2. Cliquez **"+ Créer une feuille de calcul"**
3. Nommez-la: **YAYA**
4. Ouvrez-la

### Étape 2: Ajouter le Script

1. Menu: **Outils** → **Éditeur de script**
2. Supprimez le code par défaut
3. **Collez tout le code** du fichier `google-apps-script.gs`
4. Cliquez **"Enregistrer"** ☁️

### Étape 3: Configurer l'URL de l'API

Dans le script, trouvez cette ligne (tout en haut):

```javascript
const API_URL = "https://votre-app.up.railway.app";
const PROJECT_ID = "votre-project-id";
```

Remplacez par:
- `API_URL`: L'URL de votre app (ex: `https://yaya-ab.up.railway.app`)
- `PROJECT_ID`: L'ID du projet YAYA

Cliquez **"Enregistrer"**

### Étape 4: Autoriser le Script

1. Allez dans la Sheet
2. Cherchez le menu **"📊 YAYA"** en haut
3. Google vous demande l'autorisation
4. Cliquez **"Autoriser"**
5. ✅ Le menu apparaît!

---

## 🎮 Utiliser le Menu YAYA

### Menu Principal:
```
📊 YAYA
├─ 📈 Charger les projets
├─ 💰 Charger les marchés
├─ 💸 Charger les dépenses
├─ 📄 Charger les documents
├─ ➕ Ajouter un marché
├─ ➕ Ajouter une dépense
├─ 🔄 Synchroniser
└─ ...
```

### Exemples d'Utilisation:

**Charger les données:**
1. Cliquez **"📈 Charger les projets"**
2. Une feuille "Projets" s'ajoute avec les données
3. Répétez pour Marchés, Dépenses, Documents

**Ajouter un marché:**
1. Cliquez **"➕ Ajouter un marché"**
2. Remplissez le formulaire
3. Cliquez "Ajouter"
4. ✅ Ajouté dans la base de données ET dans la feuille

**Synchroniser tout:**
1. Cliquez **"🔄 Synchroniser"**
2. Toutes les données se chargent en 1 clique

---

## 📊 Résultat Final

Vous aurez dans Google Sheets:
- ✅ Feuille "Projets" (tous vos projets)
- ✅ Feuille "Marchés" (tous les marchés)
- ✅ Feuille "Dépenses" (toutes les dépenses)
- ✅ Feuille "Documents" (lien vers les documents)

Tout connecté à votre API YAYA! 🎉

---

## 🔗 Liens

**Index en ligne (Vercel):**
```
https://yaya-ab.vercel.app
```

**API (Railway/Votre serveur):**
```
https://votre-app.up.railway.app
```

**Google Sheet:**
```
https://docs.google.com/spreadsheets/...
```

---

## 🐛 Dépannage

### "Erreur de connexion à l'API"
- Vérifiez l'URL dans le script
- Vérifiez que l'app est bien en ligne
- Vérifiez que le PROJECT_ID est correct

### "Le menu n'apparaît pas"
- Rechargez la Sheet (F5)
- Cliquez sur "Outils → Éditeur de script"
- Cherchez des erreurs en rouge

### "Erreur d'autorisation"
- Google vous demande l'accès
- Cliquez "Autoriser" la première fois
- C'est normal et sûr

---

## 📝 Modifier le Script

Vous pouvez ajouter d'autres fonctions:

```javascript
// Exemple: Supprimer un marché
function deleteMarket(marketId) {
  const options = {
    method: 'delete',
    muteHttpExceptions: true
  };
  UrlFetchApp.fetch(`${API_URL}/api/market/${marketId}`, options);
}

// Appel depuis un bouton
google.script.run.deleteMarket('123-abc');
```

---

## 🎯 Résumé

| Étape | Action | Durée |
|-------|--------|-------|
| 1 | Vercel - Déployer | 2 min |
| 2 | Google Sheets - Créer | 1 min |
| 3 | Apps Script - Coller code | 2 min |
| 4 | Configurer l'URL | 1 min |
| 5 | Tester le menu | 1 min |

**TOTAL: ~7 minutes**

---

**C'est prêt! Utilisez YAYA depuis Sheets! 🎉**
