document.addEventListener('DOMContentLoaded', () => {
    // Kişiselleştirilmiş Selamlama
    const hour = new Date().getHours();
    let greeting = "İyi Günler Semih";
    if (hour >= 5 && hour < 12) greeting = "Günaydın Semih";
    else if (hour >= 18 && hour < 22) greeting = "İyi Akşamlar Semih";
    else if (hour >= 22 || hour < 5) greeting = "Gece Çalışması Semih";
    document.getElementById('greeting-title').innerText = greeting;

    // Hava Durumu
    document.getElementById('weather-display').innerText = "☁️ Soma: 23°C, Bulutlu";

    // Tarih ve Saat Güncelleyici
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('tr-TR', options);
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date-time-display').innerText = `${dateStr} • ${timeStr}`;

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

    // DOM Elementleri
    const habitListEl = document.getElementById('habit-list');
    const progressBarHomeEl = document.getElementById('progress-bar-home');
    const progressTextHomeEl = document.getElementById('progress-text-home');
    const streakListEl = document.getElementById('streak-list');

    function renderApp() {
        renderHabits();
        renderStreaks();
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
                <span style="font-weight: 600; color: #fbbf24;">🔥 ${habit.streak} Gün</span>
            `;
            streakListEl.appendChild(row);
        });
    }

    function updateProgress() {
        const activeHabits = habits.filter(h => h.type !== 'conditional' || h.activeDays.includes(new Date().getDay()));
        const total = activeHabits.length;
        const completed = activeHabits.filter(h => h.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        progressBarHomeEl.style.width = percentage + '%';
        progressTextHomeEl.innerText = `%${percentage}`;
    }

    function saveData() {
        localStorage.setItem('lure_habits', JSON.stringify(habits));
    }

    // Sekme Değiştirme (Smooth Transition)
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
