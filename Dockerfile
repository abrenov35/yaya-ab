FROM node:18-alpine

WORKDIR /app

# Copier les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code
COPY . .

# Créer le dossier des uploads
RUN mkdir -p uploads/documents

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
