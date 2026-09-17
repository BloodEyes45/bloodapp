// DOM Elementleri
const akbankBalanceEl = document.getElementById('akbank-balance');
const ziraatBalanceEl = document.getElementById('ziraat-balance');
const nakitBalanceEl = document.getElementById('nakit-balance');
const grandTotalEl = document.getElementById('grand-total');

const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const accountSelect = document.getElementById('account-select');
const transactionList = document.getElementById('transaction-list');
const typeBtns = document.querySelectorAll('.type-btn');

// Modal Kontrolleri
const addTxBtn = document.getElementById('add-tx-btn');
const transactionModal = document.getElementById('transaction-modal');
const closeModalBtn = document.getElementById('close-modal');

// Menü Kontrolleri
const menuBtn = document.getElementById('menu-btn');
const closeMenuBtn = document.getElementById('close-menu');
const sideMenu = document.getElementById('side-menu');
const menuOverlay = document.getElementById('menu-overlay');

let currentType = 'income';

// İşlem Verileri (localStorage)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Menü Aç/Kapat
menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('open');
});

function closeMenu() {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
}

closeMenuBtn.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

// Modal Aç/Kapat
addTxBtn.addEventListener('click', () => {
    transactionModal.classList.add('open');
});

function closeModal() {
    transactionModal.classList.remove('open');
}

closeModalBtn.addEventListener('click', closeModal);
transactionModal.addEventListener('click', (e) => {
    if (e.target === transactionModal) closeModal();
});

// Gelir / Gider Seçimi
typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
    });
});

// İşlem Ekleme
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if(!descriptionInput.value || !amountInput.value) return;

    const newTransaction = {
        id: Date.now(),
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: currentType,
        account: accountSelect.value
    };

    transactions.unshift(newTransaction);
    saveAndAppUpdate();
    
    descriptionInput.value = '';
    amountInput.value = '';
    closeModal();
});

// İşlem Silme
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveAndAppUpdate();
}

// Kaydet ve Güncelle
function saveAndAppUpdate() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

// Arayüzü Güncelleme (Bakiyeleri Hesaplama)
function updateUI() {
    transactionList.innerHTML = '';

    let akbankTotal = 0;
    let ziraatTotal = 0;
    let nakitTotal = 0;

    if (transactions.length === 0) {
        transactionList.innerHTML = '<li style="text-align:center; color: var(--text-muted); font-size: 0.8rem; padding: 15px;">Henüz işlem yapılmadı.</li>';
    }

    transactions.forEach(t => {
        // Hesap bazlı bakiye hesaplama
        let netAmount = t.type === 'income' ? t.amount : -t.amount;
        
        if (t.account === 'Akbank') akbankTotal += netAmount;
        else if (t.account === 'Ziraat') ziraatTotal += netAmount;
        else if (t.account === 'Nakit') nakitTotal += netAmount;

        const li = document.createElement('li');
        li.classList.add('transaction-item', t.type);
        
        const dateStr = new Date(t.id).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

        li.innerHTML = `
            <div class="t-info">
                <strong>${t.description}</strong>
                <span>${dateStr}</span>
            </div>
            <div class="t-right">
                <span class="t-acc-tag">${t.account}</span>
                <span class="t-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('tr-TR', {minimumFractionDigits: 2})} TL</span>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        transactionList.appendChild(li);
    });

    const grandTotal = akbankTotal + ziraatTotal + nakitTotal;

    // Ekrana Yazdırma
    akbankBalanceEl.textContent = akbankTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
    ziraatBalanceEl.textContent = ziraatTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
    nakitBalanceEl.textContent = nakitTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
    grandTotalEl.textContent = grandTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
}

// İlk Çalıştırma
updateUI();
