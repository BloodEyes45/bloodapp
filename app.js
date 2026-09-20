document.addEventListener('DOMContentLoaded', () => {
    // Kişiselleştirilmiş Selamlama ve Saat / Tarih
    const hour = new Date().getHours();
    let greeting = "İyi Günler Semih";
    if (hour >= 5 && hour < 12) greeting = "Günaydın Semih";
    else if (hour >= 18 && hour < 22) greeting = "İyi Akşamlar Semih";
    else if (hour >= 22 || hour < 5) greeting = "Gece Çalışması Semih";
    document.getElementById('greeting-title').innerText = greeting;

    // Hava Durumu Otomatik Simge (Soma için güncel simge)
    document.getElementById('weather-display').innerText = "☁️ Soma: 23°C, Bulutlu";

    // Tarih ve Saat Güncelleyici
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('tr-TR', options);
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date-time-display').innerText = `${dateStr} • Saat: ${timeStr}`;

    // Gün Kontrolü (Gece yarısı sıfırlama)
    const todayStr = new Date().toISOString().slice(0, 10);
    let lastActiveDate = localStorage.getItem('lure_last_date');

    // Alışkanlık Veri Şeması
    let habits = JSON.parse(localStorage.getItem('lure_habits')) || [
        { id: 'sleep_wake', title: '⏰ Uyku Disiplini: 07:00 Kalkış', completed: false, streak: 0, type: 'standard' },
        { id: 'health_med', title: '💊 Sağlık / İlaç Kullanımı', completed: false, streak: 0, type: 'standard' },
        { id: 'walk', title: '🚶‍♂️ Fiziksel Hareket (20-30dk Yürüyüş)', completed: false, streak: 0, type: 'standard' },
        { id: 'water', title: '💧 Su Takibi (Hedef: 2500ml)', current: 0, target: 2500, completed: false, streak: 0, type: 'water' },
        { id: 'youtube', title: '📺 Zihinsel Gelişim (Eğitici Video İzle)', completed: false, streak: 0, type: 'standard' },
        { id: 'coding', title: '💻 Kodlama & Proje (Perş-Cuma-Cmt)', completed: false, streak: 0, type: 'conditional', activeDays: [4, 5, 6] },
        { id: 'main_goal', title: '🎯 Günün Tek Odak Noktası (The One Thing)', completed: false, streak: 0, type: 'standard' },
        { id: 'clean', title: '🧹 5 Dakikalık Dağınıklık Giderme', completed: false, streak: 0, type: 'standard' },
        { id: 'sleep_bed', title: '🌙 Uyku Disiplini: 00:00 - 01:00 Yatış', completed: false, streak: 0, type: 'standard' }
    ];

    if (lastActiveDate !== todayStr) {
        habits.forEach(h => {
            if (h.type === 'water') h.current = 0;
            h.completed = false;
        });
        localStorage.setItem('lure_last_date', todayStr);
    }

    // Brain Dump Notları
    let notes = JSON.parse(localStorage.getItem('lure_notes')) || [];

    // DOM Elementleri
    const habitListEl = document.getElementById('habit-list');
    const progressBarEl = document.getElementById('progress-bar');
    const progressTextEl = document.getElementById('progress-text');
    const streakListEl = document.getElementById('streak-list');
    const notesListEl = document.getElementById('notes-list');

    function renderApp() {
        renderHabits();
        renderStreaks();
        renderNotes();
        updateProgress();
        saveData();
    }

    function renderHabits() {
        habitListEl.innerHTML = '';
        const currentDayOfWeek = new Date().getDay();

        habits.forEach((habit, index) => {
            if (habit.type === 'conditional' && !habit.activeDays.includes(currentDayOfWeek)) {
                return;
            }

            const li = document.createElement('li');
            li.className = `habit-item ${habit.completed ? 'completed' : ''}`;

            if (habit.type === 'water') {
                li.innerHTML = `
                    <div class="habit-info" onclick="toggleHabit(${index})">
                        <input type="checkbox" class="habit-checkbox" ${habit.completed ? 'checked' : ''} style="pointer-events: none;">
                        <div class="habit-text-wrap">
                            <span class="habit-title">${habit.title} (${habit.current}/${habit.target} ml)</span>
                            <span class="habit-streak-badge">🔥 ${habit.streak} Gün Seri</span>
                        </div>
                    </div>
                    <div class="water-controls">
                        <button class="water-btn" onclick="addWater(${index}, 250)">+250</button>
                        <button class="water-btn" onclick="addWater(${index}, 500)">+500</button>
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <div class="habit-info" onclick="toggleHabit(${index})">
                        <input type="checkbox" class="habit-checkbox" ${habit.completed ? 'checked' : ''} style="pointer-events: none;">
                        <div class="habit-text-wrap">
                            <span class="habit-title">${habit.title}</span>
                            <span class="habit-streak-badge">🔥 ${habit.streak} Gün Seri</span>
                        </div>
                    </div>
                `;
            }
            habitListEl.appendChild(li);
        });
    }

    window.toggleHabit = function(index) {
        habits[index].completed = !habits[index].completed;
        if (habits[index].completed) {
            habits[index].streak += 1;
        } else {
            habits[index].streak = Math.max(0, habits[index].streak - 1);
        }
        renderApp();
    }

    window.addWater = function(index, amount) {
        habits[index].current += amount;
        if (habits[index].current >= habits[index].target) {
            habits[index].current = habits[index].target;
            if (!habits[index].completed) {
                habits[index].completed = true;
                habits[index].streak += 1;
            }
        }
        renderApp();
    }

    function renderStreaks() {
        streakListEl.innerHTML = '';
        habits.forEach(habit => {
            const row = document.createElement('div');
            row.className = 'stat-row';
            row.innerHTML = `
                <span>${habit.title.split(':')[0]}</span>
                <span style="font-weight: 600; color: #f59e0b;">🔥 ${habit.streak} Gün</span>
            `;
            streakListEl.appendChild(row);
        });
    }

    window.saveBrainDump = function() {
        const input = document.getElementById('brain-dump-input');
        const text = input.value.trim();
        if (text) {
            notes.unshift({ id: Date.now(), text, date: new Date().toLocaleDateString('tr-TR') });
            input.value = '';
            renderNotes();
            saveData();
        }
    }

    window.deleteNote = function(id) {
        notes = notes.filter(n => n.id !== id);
        renderNotes();
        saveData();
    }

    function renderNotes() {
        notesListEl.innerHTML = '';
        notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <div>
                    <p style="margin-bottom: 4px;">${note.text}</p>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${note.date}</span>
                </div>
                <button class="note-delete-btn" onclick="deleteNote(${note.id})">🗑️</button>
            `;
            notesListEl.appendChild(card);
        });
    }

    function updateProgress() {
        const activeHabits = habits.filter(h => h.type !== 'conditional' || h.activeDays.includes(new Date().getDay()));
        const total = activeHabits.length;
        const completed = activeHabits.filter(h => h.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        progressBarEl.style.width = percentage + '%';
        progressTextEl.innerText = `%${percentage} Tamamlandı (${completed}/${total})`;
    }

    function saveData() {
        localStorage.setItem('lure_habits', JSON.stringify(habits));
        localStorage.setItem('lure_notes', JSON.stringify(notes));
    }

    // Sekme Değiştirme
    window.switchTab = function(tabName, event) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        document.getElementById(`tab-${tabName}`).classList.add('active');
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
    }

    renderApp();
});
