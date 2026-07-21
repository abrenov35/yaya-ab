let currentProjectId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadProject();
    setupDragAndDrop();
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
                <div class="item">
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
    alert('Édition de l\'élément ' + id);
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
                <div class="item">
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
    try {
        const response = await fetch(`/api/projects/${currentProjectId}/expenses`);
        const items = await response.json();
        const list = document.getElementById('expensesList');
        list.innerHTML = '';
        
        items.forEach(item => {
            const badge = item.type.toLowerCase();
            list.innerHTML += `
                <div class="item">
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
    alert('Édition de la dépense ' + id);
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
                <div class="item">
                    <div style="display: flex; gap: 12px; align-items: center; flex: 1;">
                        <span class="item-badge ${badge}">${doc.file_type}</span>
                        <div class="item-content">
                            <div class="item-name">${doc.original_name}</div>
                            <div class="item-desc">Ajouté le ${date} • ${size} MB</div>
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

async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
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
    
    // Réinitialiser l'input
    event.target.value = '';
}

function downloadDocument(path) {
    window.open(path, '_blank');
}

function editDocument(id) {
    alert('Édition du document ' + id);
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

// DRAG AND DROP
function setupDragAndDrop() {
    const uploadArea = document.querySelector('.upload-area');
    
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        const files = Array.from(e.dataTransfer.files);
        const fileInput = document.getElementById('fileInput');
        fileInput.files = e.dataTransfer.files;
        handleFileUpload({ target: fileInput });
    });
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
