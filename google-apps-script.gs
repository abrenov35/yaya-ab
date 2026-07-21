// ============================================
// YAYA - Google Apps Script
// Intégration avec l'API YAYA
// ============================================

// CONFIGURATION - À MODIFIER
const API_URL = "https://votre-app.up.railway.app"; // URL de votre app déployée
const PROJECT_ID = "votre-project-id"; // ID du projet YAYA

// ============================================
// MENU PERSONNALISÉ
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 YAYA')
    .addItem('📈 Charger les projets', 'loadProjects')
    .addItem('💰 Charger les marchés', 'loadMarkets')
    .addItem('💸 Charger les dépenses', 'loadExpenses')
    .addItem('📄 Charger les documents', 'loadDocuments')
    .addItem('➕ Ajouter un marché', 'openAddMarketDialog')
    .addItem('➕ Ajouter une dépense', 'openAddExpenseDialog')
    .addSeparator()
    .addItem('🔄 Synchroniser', 'syncAll')
    .addToUi();
}

// ============================================
// CHARGER LES PROJETS
// ============================================

function loadProjects() {
  try {
    const response = UrlFetchApp.fetch(`${API_URL}/api/projects`);
    const projects = JSON.parse(response.getContentText());
    
    const sheet = getOrCreateSheet('Projets');
    sheet.clear();
    
    // En-têtes
    sheet.appendRow(['ID', 'Nom', 'Code', 'Statut', 'Marché HT', 'Achats', 'Marge']);
    
    // Données
    projects.forEach(project => {
      sheet.appendRow([
        project.id,
        project.name,
        project.code,
        project.status,
        project.market_value,
        project.purchases,
        project.margin
      ]);
    });
    
    SpreadsheetApp.getUi().alert('✅ ' + projects.length + ' projets chargés!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Erreur: ' + error.toString());
  }
}

// ============================================
// CHARGER LES MARCHÉS
// ============================================

function loadMarkets() {
  try {
    const response = UrlFetchApp.fetch(`${API_URL}/api/projects/${PROJECT_ID}/market`);
    const markets = JSON.parse(response.getContentText());
    
    const sheet = getOrCreateSheet('Marchés');
    sheet.clear();
    
    // En-têtes
    sheet.appendRow(['ID', 'Type', 'Nom', 'Montant (€)', 'Date']);
    
    // Données
    markets.forEach(market => {
      const date = new Date(market.created_at).toLocaleDateString('fr-FR');
      sheet.appendRow([
        market.id,
        market.type,
        market.name,
        market.value,
        date
      ]);
    });
    
    SpreadsheetApp.getUi().alert('✅ ' + markets.length + ' marchés chargés!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Erreur: ' + error.toString());
  }
}

// ============================================
// CHARGER LES DÉPENSES
// ============================================

function loadExpenses() {
  try {
    const response = UrlFetchApp.fetch(`${API_URL}/api/projects/${PROJECT_ID}/expenses`);
    const expenses = JSON.parse(response.getContentText());
    
    const sheet = getOrCreateSheet('Dépenses');
    sheet.clear();
    
    // En-têtes
    sheet.appendRow(['ID', 'Type', 'Nom', 'Montant (€)', 'Description', 'Date']);
    
    // Données
    expenses.forEach(expense => {
      const date = new Date(expense.created_at).toLocaleDateString('fr-FR');
      sheet.appendRow([
        expense.id,
        expense.type,
        expense.name,
        expense.value,
        expense.description || '',
        date
      ]);
    });
    
    SpreadsheetApp.getUi().alert('✅ ' + expenses.length + ' dépenses chargées!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Erreur: ' + error.toString());
  }
}

// ============================================
// CHARGER LES DOCUMENTS
// ============================================

function loadDocuments() {
  try {
    const response = UrlFetchApp.fetch(`${API_URL}/api/projects/${PROJECT_ID}/documents`);
    const documents = JSON.parse(response.getContentText());
    
    const sheet = getOrCreateSheet('Documents');
    sheet.clear();
    
    // En-têtes
    sheet.appendRow(['ID', 'Nom', 'Type', 'Taille (MB)', 'URL', 'Date']);
    
    // Données
    documents.forEach(doc => {
      const size = (doc.file_size / (1024 * 1024)).toFixed(2);
      const date = new Date(doc.created_at).toLocaleDateString('fr-FR');
      const url = `${API_URL}${doc.file_path}`;
      
      sheet.appendRow([
        doc.id,
        doc.original_name,
        doc.file_type,
        size,
        url,
        date
      ]);
    });
    
    SpreadsheetApp.getUi().alert('✅ ' + documents.length + ' documents chargés!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Erreur: ' + error.toString());
  }
}

// ============================================
// AJOUTER UN MARCHÉ
// ============================================

function openAddMarketDialog() {
  const htmlOutput = HtmlService.createHtmlOutput(`
    <label>Type:</label>
    <select id="marketType">
      <option value="DEVIS">Devis</option>
      <option value="AVENANT">Avenant</option>
    </select><br><br>
    
    <label>Nom:</label>
    <input type="text" id="marketName" placeholder="Nom du marché"><br><br>
    
    <label>Montant (€):</label>
    <input type="number" id="marketValue" placeholder="0.00"><br><br>
    
    <button onclick="addMarket()">Ajouter</button>
    <button onclick="google.script.host.closeDialog()">Annuler</button>
    
    <script>
      function addMarket() {
        const type = document.getElementById('marketType').value;
        const name = document.getElementById('marketName').value;
        const value = document.getElementById('marketValue').value;
        
        if (!name || !value) {
          alert('Veuillez remplir tous les champs');
          return;
        }
        
        google.script.run.addMarket(type, name, value);
        google.script.host.closeDialog();
      }
    </script>
  `);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '➕ Ajouter un Marché');
}

function addMarket(type, name, value) {
  try {
    const payload = {
      type: type,
      name: name,
      value: parseFloat(value)
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(`${API_URL}/api/projects/${PROJECT_ID}/market`, options);
    SpreadsheetApp.getUi().alert('✅ Marché ajouté avec succès!');
    loadMarkets();
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Erreur: ' + error.toString());
  }
}

// ============================================
// AJOUTER UNE DÉPENSE
// ============================================

function openAddExpenseDialog() {
  const htmlOutput = HtmlService.createHtmlOutput(`
    <label>Type:</label>
    <select id="expenseType">
      <option value="BL">Bon de Livraison</option>
      <option value="FACTURE">Facture</option>
      <option value="AVOIR">Avoir</option>
    </select><br><br>
    
    <label>Nom:</label>
    <input type="text" id="expenseName" placeholder="Nom de la dépense"><br><br>
    
    <label>Montant (€):</label>
    <input type="number" id="expenseValue" placeholder="0.00"><br><br>
    
    <label>Description:</label>
    <textarea id="expenseDesc" rows="3" placeholder="Description..."></textarea><br><br>
    
    <button onclick="addExpense()">Ajouter</button>
    <button onclick="google.script.host.closeDialog()">Annuler</button>
    
    <script>
      function addExpense() {
        const type = document.getElementById('expenseType').value;
        const name = document.getElementById('expenseName').value;
        const value = document.getElementById('expenseValue').value;
        const desc = document.getElementById('expenseDesc').value;
        
        if (!name || !value) {
          alert('Veuillez remplir les champs requis');
          return;
        }
        
        google.script.run.addExpense(type, name, value, desc);
        google.script.host.closeDialog();
      }
    </script>
  `);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '➕ Ajouter une Dépense');
}

function addExpense(type, name, value, description) {
  try {
    const payload = {
      type: type,
      name: name,
      value: -parseFloat(value),
      description: description
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(`${API_URL}/api/projects/${PROJECT_ID}/expenses`, options);
    SpreadsheetApp.getUi().alert('✅ Dépense ajoutée avec succès!');
    loadExpenses();
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Erreur: ' + error.toString());
  }
}

// ============================================
// SYNCHRONISER TOUT
// ============================================

function syncAll() {
  loadProjects();
  loadMarkets();
  loadExpenses();
  loadDocuments();
  SpreadsheetApp.getUi().alert('✅ Synchronisation complète!');
}

// ============================================
// UTILITAIRES
// ============================================

function getOrCreateSheet(name) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  
  return sheet;
}

// Fonction pour obtenir les projets disponibles
function getProjects() {
  try {
    const response = UrlFetchApp.fetch(`${API_URL}/api/projects`);
    return JSON.parse(response.getContentText());
  } catch (error) {
    return [];
  }
}

// Fonction pour formater une date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}

// Fonction pour arrondir les montants
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}
