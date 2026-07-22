let currentProjectId = null;
let editingItemId = null;
let editingItemType = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadProject();
});

// GESTION DES PROJETS
async function loadProject() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        if (projects.length > 0) {
            currentProjectId = projects[0].id;
            displayProject(projects[0]);
            loadMarketItems();
            loadExpenses();
            loadAchats();
            loadDocuments();
        }
    } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
    }
}

function displayProject(project) {
    document.getElementById('projectCode').textContent = project.code;
    document.getElementById('marketValue').textContent = formatMoney(project.market_value);
    document.getElementById('purchasesValue').textContent = formatMoney(project.purchases);
    document.getElementById('laborValue').textContent = formatMoney(project.labor);
    document.getElementById('marginValue').textContent = formatMoney(project.margin);
    
    const marginPercent = project.market_value > 0 
        ? Math.round((project.margin / project.market_value) * 100) 
        : 0;
    document.getElementById('marginPercent').textContent = marginPercent + '%';
    
    document.getElementById('statusSelect').value = project.status;
}

async function deleteProject() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    try {
        // À implémenter selon votre logique
        alert('Projet supprimé');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function closeProject() {
    alert('Projet fermé');
}

async function archiveProject() {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce projet ?')) return;
    try {
        await fetch(`/api/projects/${currentProjectId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Archivé' })
        });
        alert('Projet archivé');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// GESTION DES ONGLETS
function switchTab(event, tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Retirer la classe active de tous les tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Afficher l'onglet actif
    const tabContent = document.getElementById(tabName + '-tab');
    if (tabContent) {
        tabContent.style.display = 'block';
    }
    event.target.classList.add('active');
}

// GESTION DES ÉLÉMENTS DE MARCHÉ
async function loadMarketItems() {
    try {
        const response = await fetch(`/api/projects/${currentProjectId}/market`);
        const items = await response.json();
        const list = document.getElementById('marketList');
        list.innerHTML = '';
        
        items.forEach(item => {
            const badge = item.type === 'DEVIS' ? 'devis' : 'avenant';
            list.innerHTML += `
                <div class="item" data-market-id="${item.id}">
                    <div style="display: flex; gap: 12px; align-items: center; flex: 1;">
                        <span class="item-badge ${badge}">${item.type}</span>
                        <div class="item-content">
                            <div class="item-name">${item.name}</div>
                        </div>
                    </div>
                    <div class="item-value">
                        <strong>${formatMoney(item.value)}</strong>
                    </div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="viewMarketItem('${item.id}')">👁️</button>
                        <button class="action-btn" onclick="editMarketItem('${item.id}')">✎</button>
                        <button class="action-btn danger" onclick="deleteMarketItem('${item.id}')">✕</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function openMarketModal(mode) {
    document.getElementById('marketModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function saveMarketItem(event) {
    event.preventDefault();
    
    const type = document.getElementById('marketType').value;
    const name = document.getElementById('marketName').value;
    const value = parseFloat(document.getElementById('marketValue').value);
    
    try {
        await fetch(`/api/projects/${currentProjectId}/market`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, name, value })
        });
        
        closeModal('marketModal');
        loadMarketItems();
        document.getElementById('marketType').value = 'DEVIS';
        document.getElementById('marketName').value = '';
        document.getElementById('marketValue').value = '';
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function viewMarketItem(id) {
    alert('Affichage de l\'élément ' + id);
}

function editMarketItem(id) {
    // Récupérer l'élément actuel pour afficher son nom
    const item = document.querySelector(`[data-market-id="${id}"]`);
    if (!item) return;
    
    const currentName = item.querySelector('.item-name').textContent;
    document.getElementById('editedName').value = currentName;
    
    editingItemId = id;
    editingItemType = 'market';
    document.getElementById('editNameModal').style.display = 'flex';
}

async function deleteMarketItem(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
        await fetch(`/api/market/${id}`, { method: 'DELETE' });
        loadMarketItems();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// GESTION DES ACHATS
async function loadAchats() {
    try {
        const response = await fetch(`/api/projects/${currentProjectId}/expenses`);
        const items = await response.json();
        const list = document.getElementById('achatsList');
        list.innerHTML = '';
        
        items.forEach(item => {
            const badge = item.type.toLowerCase();
            list.innerHTML += `
                <div class="item" data-expense-id="${item.id}">
                    <div style="display: flex; gap: 12px; align-items: center; flex: 1;">
                        <span class="item-badge ${badge}">${item.type}</span>
                        <div class="item-content">
                            <div class="item-name">${item.name}</div>
                            ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
                        </div>
                    </div>
                    <div class="item-value">
                        <strong style="${item.value < 0 ? 'color: #A32D2D;' : ''}">${formatMoney(item.value)}</strong>
                    </div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="viewExpense('${item.id}')">👁️</button>
                        <button class="action-btn" onclick="editExpense('${item.id}')">✎</button>
                        <button class="action-btn danger" onclick="deleteExpense('${item.id}')">✕</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function loadExpenses() {
    try {
        const response = await fetch(`/api/projects/${currentProjectId}/expenses`);
        const items = await response.json();
        const list = document.getElementById('expensesList');
        list.innerHTML = '';
        
        items.forEach(item => {
            const badge = item.type.toLowerCase();
            list.innerHTML += `
                <div class="item" data-expense-id="${item.id}">
                    <div style="display: flex; gap: 12px; align-items: center; flex: 1;">
                        <span class="item-badge ${badge}">${item.type}</span>
                        <div class="item-content">
                            <div class="item-name">${item.name}</div>
                            ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
                        </div>
                    </div>
                    <div class="item-value">
                        <strong style="${item.value < 0 ? 'color: #A32D2D;' : ''}">${formatMoney(item.value)}</strong>
                    </div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="viewExpense('${item.id}')">👁️</button>
                        <button class="action-btn" onclick="editExpense('${item.id}')">✎</button>
                        <button class="action-btn danger" onclick="deleteExpense('${item.id}')">✕</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function openExpenseModal(mode) {
    document.getElementById('expenseModal').style.display = 'flex';
}

async function saveExpense(event) {
    event.preventDefault();
    
    const type = document.getElementById('expenseType').value;
    const name = document.getElementById('expenseName').value;
    const value = -parseFloat(document.getElementById('expenseValue').value);
    const description = document.getElementById('expenseDesc').value;
    
    try {
        await fetch(`/api/projects/${currentProjectId}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, name, value, description })
        });
        
        closeModal('expenseModal');
        loadExpenses();
        document.getElementById('expenseType').value = 'BL';
        document.getElementById('expenseName').value = '';
        document.getElementById('expenseValue').value = '';
        document.getElementById('expenseDesc').value = '';
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function viewExpense(id) {
    alert('Affichage de la dépense ' + id);
}

function editExpense(id) {
    // Récupérer l'élément actuel pour afficher son nom
    const item = document.querySelector(`[data-expense-id="${id}"]`);
    if (!item) return;
    
    const currentName = item.querySelector('.item-name').textContent;
    document.getElementById('editedName').value = currentName;
    
    editingItemId = id;
    editingItemType = 'expense';
    document.getElementById('editNameModal').style.display = 'flex';
}

async function deleteExpense(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;
    
    try {
        await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        loadExpenses();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// ÉDITION DE NOM
async function saveEditedName(event) {
    event.preventDefault();
    
    if (!editingItemId || !editingItemType) return;
    
    const newName = document.getElementById('editedName').value.trim();
    if (!newName) {
        alert('Le nom ne peut pas être vide');
        return;
    }
    
    const itemType = editingItemType; // Garder le type avant de le réinitialiser
    
    try {
        let endpoint = '';
        if (itemType === 'market') {
            endpoint = `/api/market/${editingItemId}`;
        } else if (itemType === 'expense') {
            endpoint = `/api/expenses/${editingItemId}`;
        } else if (itemType === 'document') {
            endpoint = `/api/documents/${editingItemId}`;
        }
        
        await fetch(endpoint, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        
        closeModal('editNameModal');
        
        // Recharger la liste appropriée
        if (itemType === 'market') {
            loadMarketItems();
        } else if (itemType === 'expense') {
            loadExpenses();
            loadAchats();
        } else if (itemType === 'document') {
            loadDocuments();
        }
        
        editingItemId = null;
        editingItemType = null;
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la modification');
    }
}

// GESTION DES DOCUMENTS
async function loadDocuments() {
    try {
        const response = await fetch(`/api/projects/${currentProjectId}/documents`);
        const documents = await response.json();
        const list = document.getElementById('documentsList');
        list.innerHTML = '';
        
        documents.forEach(doc => {
            const badge = doc.file_type === 'PDF' ? 'doc-pdf' : 'doc-photo';
            const date = new Date(doc.created_at).toLocaleDateString('fr-FR');
            const size = (doc.file_size / (1024 * 1024)).toFixed(1);
            
            list.innerHTML += `
                <div class="item" data-document-id="${doc.id}">
                    <div style="display: flex; gap: 12px; align-items: center; flex: 1;">
                        <span class="item-badge ${badge}">${doc.file_type}</span>
                        <div class="item-content">
                            <div class="item-name">${doc.original_name}</div>
                            <div class="item-desc">${date} • ${size} MB</div>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="downloadDocument('${doc.file_path}')">👁️</button>
                        <button class="action-btn" onclick="editDocument('${doc.id}')">✎</button>
                        <button class="action-btn danger" onclick="deleteDocument('${doc.id}')">✕</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function handleDocumentUpload(event) {
    const files = Array.from(event.target.files);
    const chantier = document.getElementById('documentChantier').value;
    const type = document.getElementById('documentType').value;
    const fournisseur = document.getElementById('documentFournisseur').value;
    const montant = document.getElementById('documentMontant').value;
    
    if (!chantier || chantier === 'Choisir un chantier') {
        alert('Veuillez choisir un chantier');
        return;
    }
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chantier', chantier);
        formData.append('type', type);
        formData.append('fournisseur', fournisseur);
        formData.append('montant', montant);
        
        try {
            const response = await fetch(`/api/projects/${currentProjectId}/documents`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                loadDocuments();
            }
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
        }
    }
    
    // Réinitialiser le formulaire
    event.target.value = '';
    document.getElementById('documentChantier').value = 'Choisir un chantier';
    document.getElementById('documentType').value = 'BL';
    document.getElementById('documentFournisseur').value = '';
    document.getElementById('documentMontant').value = '';
}

function saveDocument() {
    const fileInput = document.getElementById('fileInputDoc');
    if (fileInput.files.length === 0) {
        alert('Veuillez sélectionner un document');
        return;
    }
    handleDocumentUpload({ target: fileInput });
}

function downloadDocument(path) {
    window.open(path, '_blank');
}

function editDocument(id) {
    // Récupérer l'élément actuel pour afficher son nom
    const item = document.querySelector(`[data-document-id="${id}"]`);
    if (!item) return;
    
    const currentName = item.querySelector('.item-name').textContent;
    document.getElementById('editedName').value = currentName;
    
    editingItemId = id;
    editingItemType = 'document';
    document.getElementById('editNameModal').style.display = 'flex';
}

async function deleteDocument(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    try {
        await fetch(`/api/documents/${id}`, { method: 'DELETE' });
        loadDocuments();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// UTILITAIRES
function formatMoney(value) {
    if (!value) value = 0;
    return value.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        style: 'currency',
        currency: 'EUR'
    });
}

// Mettre à jour les stats lors de changements
async function updateStats() {
    if (!currentProjectId) return;
    
    try {
        const response = await fetch(`/api/projects/${currentProjectId}`);
        const project = await response.json();
        displayProject(project);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Écouter les changements de statut
document.addEventListener('change', async (e) => {
    if (e.target.id === 'statusSelect') {
        try {
            await fetch(`/api/projects/${currentProjectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: e.target.value })
            });
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
});
