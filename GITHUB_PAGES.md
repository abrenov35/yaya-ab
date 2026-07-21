# 📱 Déployer avec GitHub Pages

Utilisez directement GitHub pour servir votre index en ligne! C'est **gratuit** et **automatique**.

---

## ✅ ÉTAPE 1: Activer GitHub Pages

1. Allez sur: **https://github.com/abrenov35/yaya-ab/settings**
2. Menu gauche → **"Pages"**
3. **Source**: Sélectionnez **"Deploy from a branch"**
4. **Branch**: Sélectionnez **"gh-pages"**
5. Cliquez **"Save"**

---

## ✅ ÉTAPE 2: Pousser les Modifications

J'ai ajouté un workflow GitHub Actions qui déploie automatiquement!

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

---

## ⏳ ÉTAPE 3: Attendre le Déploiement

1. Allez sur votre repo
2. Cliquez **"Actions"** en haut
3. Vous verrez un job "Deploy to GitHub Pages"
4. ⏳ Attendre ~2 minutes
5. ✅ Status: **"✓ passed"**

---

## 🌐 RÉSULTAT: Votre Index en Ligne

Votre interface est maintenant accessible ici:

```
https://abrenov35.github.io/yaya-ab
```

**C'est gratuit et hébergé par GitHub!** 🎉

---

## 🔄 Auto-Déploiement

Chaque fois que vous modifiez le code:

```bash
git push origin main
```

GitHub Pages redéploie **automatiquement** en 2-3 minutes! ✨

---

## 📊 Utiliser avec Google Apps Script

Le code Google Apps Script fonctionne pareil:

1. Créez une Google Sheet
2. Outils → Éditeur de script
3. Collez le code `google-apps-script.gs`
4. **Changez l'URL** (ligne 5-6):

```javascript
const API_URL = "https://abrenov35.github.io/yaya-ab";
const PROJECT_ID = "votre-project-id";
```

5. Enregistrez et testez le menu "📊 YAYA"

---

## 🔗 Accès

| Service | URL |
|---------|-----|
| **Index** | `https://abrenov35.github.io/yaya-ab` |
| **Google Sheet** | Votre sheet personnelle |
| **API** | Votre serveur (Railway, etc) |
| **GitHub Repo** | `https://github.com/abrenov35/yaya-ab` |

---

## ✅ Checklist

- [ ] Aller dans Settings → Pages
- [ ] Activer GitHub Pages (branche gh-pages)
- [ ] Pousser le code: `git push origin main`
- [ ] Attendre le déploiement (onglet Actions)
- [ ] Accéder à: `https://abrenov35.github.io/yaya-ab`
- [ ] Créer Google Sheet + ajouter Apps Script
- [ ] Tester le menu "📊 YAYA"

---

**C'est en ligne! 🚀**
