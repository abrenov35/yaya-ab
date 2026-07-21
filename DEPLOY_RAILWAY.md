# 🚂 Déployer YAYA sur Railway

Guide complet et détaillé pour mettre votre app en ligne en 5 minutes.

---

## 📋 Prérequis

- ✅ Un compte GitHub (vous l'avez)
- ✅ Le repo `yaya-ab` poussé (c'est fait)
- ✅ Un compte Railway (gratuit)

---

## 🎯 Les 3 Étapes

### **ÉTAPE 1️⃣: Créer un Compte Railway**

1. Allez sur **https://railway.app**

2. Cliquez sur **"Login"** en haut à droite

3. Sélectionnez **"Continue with GitHub"**

4. Autorisez Railway à accéder à votre GitHub

5. ✅ Vous êtes connecté!

**Durée: 2 minutes**

---

### **ÉTAPE 2️⃣: Créer un Projet**

1. Une fois connecté, cliquez **"New Project"** ou **"Create"**

2. Sélectionnez **"Deploy from GitHub"**

3. Railway va vous demander d'autoriser l'accès à vos repos

4. Cliquez **"Install & Authorize"**

5. Cherchez le repo **`yaya-ab`** dans la liste

6. Cliquez dessus pour le sélectionner

7. ✅ Railway commence à configurer

**Durée: 2 minutes**

---

### **ÉTAPE 3️⃣: Attendre le Déploiement**

Railway va automatiquement:

✅ Détecter que c'est une app **Node.js**  
✅ Installer les dépendances (`npm install`)  
✅ Configurer l'environnement  
✅ Lancer le serveur (`npm start`)  
✅ Vous donner une **URL publique**

**Vous verrez une page qui montre:**
```
✓ Build successful
✓ Deploy successful
✓ Live at: https://yaya-ab.up.railway.app
```

**Durée: ~2 minutes**

---

## 🌐 Votre App Est En Ligne!

Une fois le déploiement terminé, vous recevrez une URL:

```
https://yaya-ab-production.up.railway.app
```

(L'URL exacte peut varier légèrement)

---

## 📱 Accéder à Votre App

1. Cliquez sur le lien que Railway vous donne
2. Vous verrez l'interface YAYA
3. **C'est EN LIGNE!** 🎉

---

## 🔧 Déboguer (Si Erreur)

Si le déploiement échoue:

1. Allez sur **Railway Dashboard**
2. Cliquez sur votre projet
3. Allez dans **"Logs"** ou **"Deployments"**
4. Lisez les erreurs
5. Contactez le support Railway si besoin

**Erreur courante:** `Port not found`
- Solution: Railway ajoute automatiquement le PORT en variable

---

## 📊 Dashboard Railway

Une fois déployé, vous pouvez dans Railway:

✅ Voir les **logs** en temps réel  
✅ Voir les **statistiques** (CPU, RAM)  
✅ **Redémarrer** l'app  
✅ Voir les **logs de build**  
✅ **Configurer des variables** d'environnement  

---

## 💡 Prochaines Étapes (Optionnel)

### Mettre un Domaine Personnalisé
1. Railway Dashboard → Votre app
2. "Settings" → "Custom Domain"
3. Entrez: `yaya.votredomaine.com`
4. Configurez les DNS (instructions Railway)

### Auto-Deploy depuis GitHub
✅ C'est déjà activé par défaut!
- Chaque fois que vous pushez sur GitHub → Auto-déploiement
- Pas besoin de faire manuellement

### Variables d'Environnement
1. Railway Dashboard → Votre app
2. "Variables" 
3. Ajoutez si besoin (NODE_ENV, etc.)

---

## 🎉 C'est Fait!

Votre app YAYA est maintenant:

✅ **En ligne** sur une URL publique  
✅ **Auto-mise à jour** depuis GitHub  
✅ **Gratuite** (Railway offre $5/mois)  
✅ **Accessible 24/7**  

---

## 📞 Support

- **Railway Support:** https://railway.app/support
- **Documentation:** https://docs.railway.app
- **Community:** https://discord.gg/railway

---

**Bon déploiement! 🚀**

Vous pouvez partager votre URL avec le monde:
```
https://yaya-ab.up.railway.app
```
