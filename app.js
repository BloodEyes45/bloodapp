document.addEventListener('DOMContentLoaded', () => {
    // Tarih Gösterimi
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('tr-TR', options);

    // Gün Kontrolü (Gece yarısı otomatik sıfırlama veya tarih değişimi algılama)
    const todayStr = new Date().toISOString().slice(0, 10);
    let lastActiveDate = localStorage.getItem('lure_last_date');

    // Başlangıç Alışkanlık Veri Şeması (Kronolojik Sıralı)
    let habits = JSON.parse(localStorage.getItem('lure_habits')) || [
        { id: 'sleep_wake', title: '⏰ Uyku Disiplini: 07:00 Kalkış', completed: false, streak: 0, type: 'standard' },
        { id: 'health_med', title: '💊 Sağlık / İlaç Kullanımı', completed: false, streak: 0, type: 'standard' },
        { id: 'walk', title: '🚶‍♂️ Fiziksel Hareket (20-30dk Yürüyüş)', completed: false, streak: 0, type: 'standard' },
        { id: 'water', title: '💧 Su Takibi (Hedef: 2500ml)', current: 0, target: 2500, completed: false, streak: 0, type: 'water' },
        { id: 'youtube', title: '📺 Zihinsel Gelişim (Eğitici Video İzle)', completed: false, streak: 0, type: 'standard' },
        { id: 'coding', title: '💻 Kodlama & Proje (Perş-Cuma-Cmt)', completed: false, streak: 0, type: 'conditional', activeDays: [4, 5, 6] }, // Perşembe(4), Cuma(5), Cumartesi(6)
        { id: 'main_goal', title: '🎯 Günün Tek Odak Noktası (The One Thing)', completed: false, streak: 0, type: 'standard' },
        { id: 'clean', title: '🧹 5 Dakikalık Dağınıklık Giderme', completed: false, streak: 0, type: 'standard' },
        { id: 'sleep_bed', title: '🌙 Uyku Disiplini: 00:00 - 01:00 Yatış', completed: false, streak: 0, type: 'standard' }
    ];

    // Tarih değiştiyse günlük görevleri sıfırla
    if (lastActiveDate !== todayStr) {
        habits.forEach(h => {
            if (h.type === 'water') {
                h.current = 0;
            }
            h.completed = false;
        });
        localStorage.setItem('lure_last_date', todayStr);
    }

    // Başarımlar Tanımları
    const achievements = [
        { id: 'first_step', title: 'İlk Adım', desc: 'Herhangi bir görevi ilk kez tamamla.', icon: '🎯', unlocked: false },
        { id: 'streak_3', title: 'Kıdemli Çırak', desc: 'Herhangi bir alışkanlıkta 3 gün seriye ulaş.', icon: '🔥', unlocked: false },
        { id: 'water_master', title: 'Su Canavarı', desc: 'Günlük 2500ml su hedefini tamamla.', icon: '💧', unlocked: false },
        { id: 'coder', title: 'Lure Developer', desc: 'Kodlama seansını başarıyla tamamla.', icon: '💻', unlocked: false }
    ];

    // LocalStorage'dan başarımları yükle
    let savedAchievements = JSON.parse(localStorage.getItem('lure_achievements')) || achievements;

    // Arayüz Elementleri
    const habitListEl = document.getElementById('habit-list');
    const progressBarEl = document.getElementById('progress-bar');
    const progressTextEl = document.getElementById('progress-text');
    const streakListEl = document.getElementById('streak-list');
    const achievementListEl = document.getElementById('achievement-list');

    function renderApp() {
        renderHabits();
        renderStreaks();
        renderAchievements();
        updateProgress();
        saveData();
    }

    function renderHabits() {
        habitListEl.innerHTML = '';
        const currentDayOfWeek = new Date().getDay(); // 0: Pazar, 1: Pazartesi ... 4: Perşembe, 5: Cuma, 6: Cumartesi

        habits.forEach((habit, index) => {
            // Eğer koşullu görevse ve bugün aktif gün değilse gizle veya pasif göster
            if (habit.type === 'conditional' && !habit.activeDays.includes(currentDayOfWeek)) {
                return; // Bugün bu görev listede görünmez (Örn: Kodlama sadece Perş-Cuma-Cmt)
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
                        <button class="water-btn" onclick="addWater(${index}, 250)">+250ml</button>
                        <button class="water-btn" onclick="addWater(${index}, 500)">+500ml</button>
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
            checkAchievementsOnComplete(habits[index].id);
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
                checkAchievementsOnComplete('water_master');
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

    function renderAchievements() {
        achievementListEl.innerHTML = '';
        savedAchievements.forEach(ach => {
            const card = document.createElement('div');
            card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;
            card.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <h4>${ach.title} ${ach.unlocked ? '✅' : '🔒'}</h4>
                    <p>${ach.desc}</p>
                </div>
            `;
            achievementListEl.appendChild(card);
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

    function checkAchievementsOnComplete(id) {
        // İlk adım rozeti
        unlockAchievement('first_step');

        // Su rozeti
        if (id === 'water_master') unlockAchievement('water_master');
        if (id === 'coding') unlockAchievement('coder');

        // Seri kontrolü
        habits.forEach(h => {
            if (h.streak >= 3) unlockAchievement('streak_3');
        });
    }

    function unlockAchievement(achId) {
        const ach = savedAchievements.find(a => a.id === achId);
        if (ach && !ach.unlocked) {
            ach.unlocked = true;
            localStorage.setItem('lure_achievements', JSON.stringify(savedAchievements));
        }
    }

    function saveData() {
        localStorage.setItem('lure_habits', JSON.stringify(habits));
        localStorage.setItem('lure_achievements', JSON.stringify(savedAchievements));
    }

    // Sekme Değiştirme Fonksiyonu
    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        if (tabName === 'daily') {
            document.getElementById('tab-daily').classList.add('active');
            event.currentTarget.classList.add('active');
        } else if (tabName === 'streaks') {
            document.getElementById('tab-streaks').classList.add('active');
            event.currentTarget.classList.add('active');
        } else if (tabName === 'achievements') {
            document.getElementById('tab-achievements').classList.add('active');
            event.currentTarget.classList.add('active');
        }
    }

    renderApp();
});
