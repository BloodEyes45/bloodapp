// DOM Elementleri
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const transactionList = document.getElementById('transaction-list');
const typeBtns = document.querySelectorAll('.type-btn');

// Menü Elementleri
const menuBtn = document.getElementById('menu-btn');
const closeMenuBtn = document.getElementById('close-menu');
const sideMenu = document.getElementById('side-menu');
const menuOverlay = document.getElementById('menu-overlay');

let currentType = 'income';

// İşlem Verileri (localStorage'dan çekilir)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Menü Kontrolleri
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

// Gelir / Gider Seçim Butonları
typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
    });
});

// Yeni İşlem Ekleme
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if(!descriptionInput.value || !amountInput.value) return;

    const newTransaction = {
        id: Date.now(),
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: currentType
    };

    transactions.unshift(newTransaction);
    saveAndAppUpdate();
    
    descriptionInput.value = '';
    amountInput.value = '';
});

// İşlem Silme
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveAndAppUpdate();
}

// Verileri Kaydet ve Arayüzü Güncelle
function saveAndAppUpdate() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

// Arayüzü Güncelleme Fonksiyonu
function updateUI() {
    transactionList.innerHTML = '';

    let income = 0;
    let expense = 0;

    if (transactions.length === 0) {
        transactionList.innerHTML = '<li style="text-align:center; color: var(--text-muted); font-size: 0.85rem; padding: 10px;">Henüz işlem eklenmedi.</li>';
    }

    transactions.forEach(t => {
        if (t.type === 'income') {
            income += t.amount;
        } else {
            expense += t.amount;
        }

        const li = document.createElement('li');
        li.classList.add('transaction-item', t.type);
        
        const dateStr = new Date(t.id).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

        li.innerHTML = `
            <div class="t-info">
                <strong>${t.description}</strong>
                <span>${dateStr}</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span class="t-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('tr-TR', {minimumFractionDigits: 2})} TL</span>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        transactionList.appendChild(li);
    });

    const balance = income - expense;
    totalBalanceEl.textContent = balance.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
    totalIncomeEl.textContent = income.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
    totalExpenseEl.textContent = expense.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
}

// İlk açılışta arayüzü doldur
updateUI();
