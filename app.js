// ŞİFRE KİLİDİ
const correctPin = localStorage.getItem('app_pin') || '1234';
let enteredPin = '';
const lockScreen = document.getElementById('lock-screen');
const pinDots = document.querySelectorAll('.pin-dots .dot');

function pressPin(val) {
    if (val === 'C') {
        enteredPin = '';
    } else if (val === 'OK') {
        if (enteredPin === correctPin) {
            lockScreen.classList.add('unlocked');
        } else {
            alert('Yanlış Şifre!');
            enteredPin = '';
        }
    } else {
        if (enteredPin.length < 4) enteredPin += val;
    }

    pinDots.forEach((dot, index) => {
        if (index < enteredPin.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
    });

    if (enteredPin.length === 4) {
        setTimeout(() => {
            if (enteredPin === correctPin) {
                lockScreen.classList.add('unlocked');
            } else {
                alert('Yanlış Şifre!');
                enteredPin = '';
                pinDots.forEach(d => d.classList.remove('filled'));
            }
        }, 150);
    }
}

// SEKME GEÇİŞLERİ
function switchTab(tabId) {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const headerTitle = document.getElementById('header-title');

    tabContents.forEach(t => t.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    targetTab.classList.add('active');

    if (tabId === 'tab-home') {
        document.getElementById('nav-home').classList.add('active');
        headerTitle.textContent = 'Ana Sayfa';
    } else if (tabId === 'tab-wallet') {
        document.getElementById('nav-wallet').classList.add('active');
        headerTitle.textContent = 'Cüzdan & Bütçe';
    } else if (tabId === 'tab-vault') {
        document.getElementById('nav-vault').classList.add('active');
        headerTitle.textContent = 'Kasa & Linkler';
    } else if (tabId === 'tab-ai') {
        document.getElementById('nav-ai').classList.add('active');
        headerTitle.textContent = 'AI Asistan';
    }
}

// CANLI SAAT VE TARİH
function updateClockAndDate() {
    const now = new Date();
    document.getElementById('live-clock').textContent = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('live-date').textContent = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
}
setInterval(updateClockAndDate, 1000);
updateClockAndDate();

// CÜZDAN MANTIĞI
const akbankBalanceEl = document.getElementById('akbank-balance');
const ziraatBalanceEl = document.getElementById('ziraat-balance');
const nakitBalanceEl = document.getElementById('nakit-balance');
const grandTotalEl = document.getElementById('grand-total');

const homeAkbankEl = document.getElementById('home-akbank');
const homeZiraatEl = document.getElementById('home-ziraat');
const homeNakitEl = document.getElementById('home-nakit');
const homeGrandTotalEl = document.getElementById('home-grand-total');

const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const accountSelect = document.getElementById('account-select');
const transactionList = document.getElementById('transaction-list');
const typeBtns = document.querySelectorAll('.type-btn');

const addTxBtn = document.getElementById('add-tx-btn');
const transactionModal = document.getElementById('transaction-modal');
const closeModalBtn = document.getElementById('close-modal');

let currentType = 'income';
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

addTxBtn.addEventListener('click', () => transactionModal.classList.add('open'));
closeModalBtn.addEventListener('click', () => transactionModal.classList.remove('open'));
transactionModal.addEventListener('click', (e) => { if (e.target === transactionModal) transactionModal.classList.remove('open'); });

typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
    });
});

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!descriptionInput.value || !amountInput.value) return;

    transactions.unshift({
        id: Date.now(),
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: currentType,
        account: accountSelect.value
    });

    saveAndAppUpdate();
    descriptionInput.value = '';
    amountInput.value = '';
    transactionModal.classList.remove('open');
});

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveAndAppUpdate();
}

function saveAndAppUpdate() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

function updateUI() {
    transactionList.innerHTML = '';
    let akbankTotal = 0, ziraatTotal = 0, nakitTotal = 0;

    if (transactions.length === 0) {
        transactionList.innerHTML = '<li style="text-align:center; color: var(--text-muted); font-size: 0.8rem; padding: 15px;">Henüz işlem yapılmadı.</li>';
    }

    transactions.forEach(t => {
        let netAmount = t.type === 'income' ? t.amount : -t.amount;
        if (t.account === 'Akbank') akbankTotal += netAmount;
        else if (t.account === 'Ziraat') ziraatTotal += netAmount;
        else if (t.account === 'Nakit') nakitTotal += netAmount;

        const li = document.createElement('li');
        li.classList.add('transaction-item', t.type);
        li.innerHTML = `
            <div class="t-info">
                <strong>${t.description}</strong>
                <span>${new Date(t.id).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
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

    akbankBalanceEl.textContent = akbankTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
    ziraatBalanceEl.textContent = ziraatTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
    nakitBalanceEl.textContent = nakitTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
    grandTotalEl.textContent = grandTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';

    homeAkbankEl.textContent = akbankTotal.toLocaleString('tr-TR') + ' TL';
    homeZiraatEl.textContent = ziraatTotal.toLocaleString('tr-TR') + ' TL';
    homeNakitEl.textContent = nakitTotal.toLocaleString('tr-TR') + ' TL';
    homeGrandTotalEl.textContent = grandTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + ' TL';
}

// KASA MANTIĞI (IBAN & LİNKLER)
const vaultTitle = document.getElementById('vault-title');
const vaultContent = document.getElementById('vault-content');
const addVaultBtn = document.getElementById('add-vault-btn');
const vaultList = document.getElementById('vault-list');
let vaultItems = JSON.parse(localStorage.getItem('vault_items')) || [];

addVaultBtn.addEventListener('click', () => {
    if (!vaultTitle.value || !vaultContent.value) return;
    vaultItems.unshift({ id: Date.now(), title: vaultTitle.value, content: vaultContent.value });
    localStorage.setItem('vault_items', JSON.stringify(vaultItems));
    vaultTitle.value = '';
    vaultContent.value = '';
    renderVault();
});

function deleteVaultItem(id) {
    vaultItems = vaultItems.filter(v => v.id !== id);
    localStorage.setItem('vault_items', JSON.stringify(vaultItems));
    renderVault();
}

function renderVault() {
    vaultList.innerHTML = '';
    if (vaultItems.length === 0) {
        vaultList.innerHTML = '<li style="text-align:center; color: var(--text-muted); font-size: 0.8rem;">Kayıt bulunmuyor.</li>';
        return;
    }
    vaultItems.forEach(v => {
        const li = document.createElement('li');
        li.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 12px; border-radius: 10px;";
        li.innerHTML = `
            <div>
                <strong style="font-size:0.85rem; display:block;">${v.title}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted); word-break:break-all;">${v.content}</span>
            </div>
            <button onclick="deleteVaultItem(${v.id})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
        `;
        vaultList.appendChild(li);
    });
}

// AI ASİSTAN MANTIĞI
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const chatMessages = document.getElementById('chat-messages');

sendChatBtn.addEventListener('click', handleUserMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserMessage(); });

function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatInput.value = '';

    // Basit ve akıllı asistan yanıt simülasyonu / bağlam okuma
    setTimeout(() => {
        let reply = "Bunu not aldım Semih, harika gidiyorsun!";
        const lower = text.toLowerCase();
        
        if (lower.includes('bütçe') || lower.includes('para') || lower.includes('ne kadar')) {
            const total = homeGrandTotalEl.textContent;
            reply = `Toplam varlığın şu an ${total}. Akbank, Ziraat ve Nakit hesaplarını cüzdan sekmesinden detaylı takip edebilirsin.`;
        } else if (lower.includes('merhaba') || lower.includes('selam')) {
            reply = "Selam Semih! Sana nasıl yardımcı olabilirim?";
        }

        appendMessage(reply, 'ai');
    }, 600);
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('chat-msg', sender);
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

updateUI();
renderVault();
