# 📱 Déployer avec GitHub Pages

Utilisez directement GitHub pour servir votre index en ligne! C'est **gratuit** et **super simple**.

---

## ✅ ÉTAPE 1: Activer GitHub Pages

1. Allez sur: **https://github.com/abrenov35/yaya-ab/settings**
2. Menu gauche → **"Pages"**
3. **Source**: Sélectionnez **"Deploy from a branch"**
4. **Branch**: Sélectionnez **"main"**
5. **Folder**: Sélectionnez **"/public"**
6. Cliquez **"Save"**

---

## ⏳ ÉTAPE 2: Attendre le Déploiement

1. Allez sur votre repo: https://github.com/abrenov35/yaya-ab
2. Cliquez **"Settings"** → **"Pages"**
3. Attendez quelques secondes/minutes
4. Vous verrez un message vert:
   ```
   ✓ Your site is live at https://abrenov35.github.io/yaya-ab
   ```

---

## 🌐 RÉSULTAT: Votre Index en Ligne

Votre interface est maintenant accessible ici:

```
https://abrenov35.github.io/yaya-ab
```

**C'est gratuit et hébergé par GitHub!** 🎉

---

## 🔄 Mettre à Jour le Code

Chaque fois que vous modifiez et poussez:

```bash
git add .
git commit -m "Mes modifications"
git push origin main
```

GitHub Pages redéploie **automatiquement** en quelques secondes! ✨

---

## 📊 Utiliser avec Google Apps Script

Le code Google Apps Script fonctionne pareil:

1. Créez une Google Sheet: https://sheets.google.com
2. Menu: **Outils** → **Éditeur de script**
3. Collez **tout** le code de `google-apps-script.gs`
4. **Changez l'URL** (ligne 5):

```javascript
const API_URL = "https://abrenov35.github.io/yaya-ab";
const PROJECT_ID = "votre-project-id"; // À remplacer
```

5. Cliquez **"Enregistrer"** ☁️
6. Revenez à la Sheet
7. Cherchez le menu **"📊 YAYA"** en haut ✅

---

## 📞 Menu Google Sheets

Une fois configuré:

```
📊 YAYA
├─ 📈 Charger les projets
├─ 💰 Charger les marchés
├─ 💸 Charger les dépenses
├─ 📄 Charger les documents
├─ ➕ Ajouter un marché
├─ ➕ Ajouter une dépense
└─ 🔄 Synchroniser tout
```

---

## 🔗 Vos URLs

| Service | URL |
|---------|-----|
| **Index** | `https://abrenov35.github.io/yaya-ab` |
| **GitHub** | `https://github.com/abrenov35/yaya-ab` |
| **Google Sheet** | Votre propre sheet |

---

## ✅ Checklist

- [ ] Aller dans Settings → Pages
- [ ] Activer GitHub Pages (branche: main, folder: /public)
- [ ] Voir le message vert "Your site is live at"
- [ ] Accéder à: `https://abrenov35.github.io/yaya-ab`
- [ ] Créer Google Sheet
- [ ] Ajouter Apps Script avec le code
- [ ] Tester le menu "📊 YAYA"

---

**C'est en ligne! 🚀**
