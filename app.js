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

    const totalWealth = grandTotalEl.textContent;
    const systemPrompt = `Sen Semih'in (LureSystems geliştiricisi) kişisel dijital asistanısın. Kullanıcının toplam varlığı: ${totalWealth}. Samimi, teknoloji odaklı ve kısa yanıtlar ver.`;

    const loadingId = appendMessage('Düşünüyor...', 'ai loading');

    try {
        // BURAYA DİKKAT: Sadece BURAYA_API_ANAHTARINI_YAZ yazan yeri silip kendi anahtarını yapıştır.
        const apiKey = "AQ.Ab8RN6Jp7Jc2Mgw-n2EscaOAuochEjiiGsK5chKieLYyDjL8lA";
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: systemPrompt + "\nSoru: " + text }] }
                ]
            })
        });

        removeMessage(loadingId);
        
        if (!response.ok) {
            throw new Error('API yanıt vermedi');
        }

        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        appendMessage(reply, 'ai');

    } catch (error) {
        removeMessage(loadingId);
        let fallbackReply = "Seni dinliyorum Semih! Kodlama veya bütçe konusunda nasıl yardımcı olabilirim?";
        const lower = text.toLowerCase();
        if (lower.includes('bütçe') || lower.includes('para')) {
            fallbackReply = `Toplam varlığın şu an ${totalWealth}. Finansal durumun gayet stabil görünüyor!`;
        } else if (lower.includes('merhaba') || lower.includes('selam')) {
            fallbackReply = "Selam patron! LureSystems altyapısı çalışıyor.";
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
