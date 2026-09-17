// ŞİFRE KİLİDİ (0604)
const correctPin = '0604';
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
        drawExpenseChart();
    } else if (tabId === 'tab-vault') {
        document.getElementById('nav-vault').classList.add('active');
        headerTitle.textContent = 'Güvenli Kasa';
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

// CÜZDAN & KATEGORİ MANTIĞI
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
const categorySelect = document.getElementById('category-select');
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
        account: accountSelect.value,
        category: categorySelect.value
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
    drawExpenseChart();
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
                <span>${t.category} • ${new Date(t.id).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
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

// KATEGORİ BAZLI GİDER GRAFİĞİ (HTML5 Canvas Pasta Grafik)
function drawExpenseChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sadece giderleri kategorilerine göre topla
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    let totalExpense = 0;

    expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
        totalExpense += e.amount;
    });

    const legendEl = document.getElementById('chart-legend');
    legendEl.innerHTML = '';

    if (totalExpense === 0) {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(100, 100, 70, 0, 2 * Math.PI);
        ctx.fill();
        legendEl.innerHTML = '<span style="color:var(--text-muted)">Henüz gider verisi yok.</span>';
        return;
    }

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];
    let startAngle = 0;
    let colorIndex = 0;

    Object.keys(categoryTotals).forEach(cat => {
        const amount = categoryTotals[cat];
        const sliceAngle = (amount / totalExpense) * (2 * Math.PI);
        const color = colors[colorIndex % colors.length];

        // Pasta Dilimi Çiz
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.arc(100, 100, 75, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        startAngle += sliceAngle;

        // Lejant Ekle
        const percentage = ((amount / totalExpense) * 100).toFixed(0);
        const item = document.createElement('div');
        item.classList.add('legend-item');
        item.innerHTML = `<span class="legend-dot" style="background:${color}"></span> ${cat}: %${percentage}`;
        legendEl.appendChild(item);

        colorIndex++;
    });
}

// GÜVENLİ KASA & MASKELEME MİMARİSİ
const vaultTitle = document.getElementById('vault-title');
const vaultContent = document.getElementById('vault-content');
const addVaultBtn = document.getElementById('add-vault-btn');
const vaultList = document.getElementById('vault-list');
let vaultItems = JSON.parse(localStorage.getItem('vault_items')) || [];
let isMasked = false;

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

function toggleMaskMode() {
    isMasked = !isMasked;
    const btn = document.getElementById('mask-mode-btn');
    btn.innerHTML = isMasked ? '<i class="fa-solid fa-eye"></i> Göster' : '<i class="fa-solid fa-eye-slash"></i> Maskele';
    renderVault();
}

function renderVault() {
    vaultList.innerHTML = '';
    if (vaultItems.length === 0) {
        vaultList.innerHTML = '<li style="text-align:center; color: var(--text-muted); font-size: 0.8rem;">Kayıt bulunmuyor.</li>';
        return;
    }
    vaultItems.forEach(v => {
        const displayContent = isMasked ? '••••••••••••••••' : v.content;
        const li = document.createElement('li');
        li.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 12px; border-radius: 10px;";
        li.innerHTML = `
            <div>
                <strong style="font-size:0.85rem; display:block;">${v.title}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted); word-break:break-all;">${displayContent}</span>
            </div>
            <button onclick="deleteVaultItem(${v.id})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
        `;
        vaultList.appendChild(li);
    });
}

// JSON YEDEKLEME VE GERİ YÜKLEME
function exportData() {
    const backupData = {
        transactions: transactions,
        vault_items: vaultItems,
        date: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `luresystems_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            if (json.transactions && json.vault_items) {
                transactions = json.transactions;
                vaultItems = json.vault_items;
                localStorage.setItem('transactions', JSON.stringify(transactions));
                localStorage.setItem('vault_items', JSON.stringify(vaultItems));
                updateUI();
                renderVault();
                alert('Yedek başarıyla yüklendi!');
            } else {
                alert('Geçersiz yedek dosyası formatı!');
            }
        } catch (err) {
            alert('Dosya okunurken hata oluştu!');
        }
    };
    reader.readAsText(file);
}

// GERÇEK GEMINI API ENTEGRASYONU
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const chatMessages = document.getElementById('chat-messages');

sendChatBtn.addEventListener('click', handleAiMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAiMessage(); });

async function handleAiMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatInput.value = '';

    // Kullanıcının bütçe durumunu ve kasasını yapay zekaya bağlam olarak verelim
    const totalWealth = grandTotalEl.textContent;
    const systemPrompt = `Sen Semih'in (LureSystems geliştiricisi) kişisel dijital asistanısın. Kullanıcının toplam varlığı: ${totalWealth}. Samimi, teknoloji odaklı ve kısa yanıtlar ver.`;

    const loadingId = appendMessage('Düşünüyor...', 'ai loading');

    try {
        // Gerçek Gemini API İsteği (Public Gemini API Endpoint)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AQ.Ab8RN6Jp7Jc2Mgw-n2EscaOAuochEjiiGsK5chKieLYyDjL8lA`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: systemPrompt + "\nSoru: " + text }] }
                ]
            })
        });

        // Not: Eğer API anahtarı girilmemişse veya demo modunda çalışıyorsa akıllı fallback yanıt üretir
        removeMessage(loadingId);
        
        if (!response.ok) {
            throw new Error('API yanıt vermedi');
        }

        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        appendMessage(reply, 'ai');

    } catch (error) {
        removeMessage(loadingId);
        // Akıllı Yerel Fallback / Asistan Yanıtı
        let fallbackReply = "Seni dinliyorum Semih! Kodlama veya bütçe konusunda nasıl yardımcı olabilirim?";
        const lower = text.toLowerCase();
        if (lower.includes('bütçe') || lower.includes('para')) {
            fallbackReply = `Toplam varlığın şu an ${totalWealth}. Finansal durumun gayet stabil görünyor!`;
        } else if (lower.includes('merhaba') || lower.includes('selam')) {
            p = "Selam patron! LureSystems altyapısı çalışıyor.";
            fallbackReply = p;
        }
        appendMessage(fallbackReply, 'ai');
    }
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('chat-msg');
    if (sender.includes('user')) div.classList.add('user');
    else div.classList.add('ai');
    
    if (sender.includes('loading')) div.id = 'loading-msg';
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div.id || (div.id = 'msg-' + Date.now());
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

updateUI();
renderVault();
