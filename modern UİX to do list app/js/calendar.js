function renderCalendar() {
    const container = document.getElementById('content-area');
    const data = Storage.get();

    // State for current view
    // We attach it to the element or window to persist? No, simple re-render resets it unless we store it globally.
    // For now, let's keep it simple: Reset to today on nav, or we could use a global variable.
    // The previous implementation had a variable outside. Let's fix that scope issue properly.
    // We'll use a static property on the function or global state if we want persistence during tab switches.
    // But for now, reset is fine.

    if (!window.calendarState) {
        window.calendarState = { date: new Date() };
    }
    const currentDate = window.calendarState.date;

    // Translations
    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
    const allT = window.translations ? (window.translations[lang] || window.translations['en']) : {};
    const t = allT.calendar || (window.translations['en'] ? window.translations['en'].calendar : {
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        weekView: 'Week View (Coming Soon)',
        syncGoogle: 'Sync with Google Calendar'
    });

    const render = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);

        const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon=0
        const totalDays = lastDay.getDate();

        // Month Names from Translation
        const monthName = t.months[month];

        // Filter tasks for this month
        const tasks = data.tasks.filter(t => {
            if (!t.dueDate) return false;
            const [tYear, tMonth] = t.dueDate.split('-').map(Number);
            return tMonth === (month + 1) && tYear === year;
        });

        // Grid HTML
        let gridHtml = '';

        // Empty cells for previous month
        for (let i = 0; i < startingDayOfWeek; i++) {
            gridHtml += `<div style="background: var(--bg-color); border-right: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); min-height: 100px;"></div>`;
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);

            gridHtml += `
            <div style="background: var(--glass-bg); border-right: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); min-height: 100px; padding: 0.5rem; display: flex; flex-direction: column; gap: 4px; transition: background 0.2s;" class="calendar-day">
                <span style="font-weight: bold; color: ${dayTasks.length > 0 ? 'var(--text-main)' : 'var(--text-muted)'}; margin-bottom: 4px;">${day}</span>
                ${dayTasks.map(t => {
                const course = data.courses.find(c => c.id === t.courseId) || { color: '#ffbf00' };
                return `
                        <div style="background: ${course.color}20; border-left: 2px solid ${course.color}; padding: 2px 4px; border-radius: 4px; font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="${t.title}">
                            ${t.title}
                        </div>
                    `;
            }).join('')}
            </div>
        `;
        }

        container.innerHTML = `
        <div class="animate-in" style="height: 100%; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div style="display: flex; gap: 1rem;">
                    <button id="prev-month" class="glass-panel" style="padding: 0.5rem 1rem; border-radius: 8px; color: var(--text-main); cursor: pointer;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button id="next-month" class="glass-panel" style="padding: 0.5rem 1rem; border-radius: 8px; color: var(--text-main); cursor: pointer;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                <h3 style="color: var(--primary); font-family: var(--font-heading); font-size: 1.5rem;">${monthName} ${year}</h3>
                <button class="glass-panel" style="padding: 0.5rem 1rem; border-radius: 8px; color: var(--text-muted);">${t.weekView}</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); background: var(--bg-color); border: 1px solid var(--glass-border); border-radius: 12px; height: auto;">
                <!-- Headers -->
                <div style="padding: 1rem; text-align: center; background: rgba(255,255,255,0.02); font-weight: bold; color: var(--text-muted);">Mon</div>
                <div style="padding: 1rem; text-align: center; background: rgba(255,255,255,0.02); font-weight: bold; color: var(--text-muted);">Tue</div>
                <div style="padding: 1rem; text-align: center; background: rgba(255,255,255,0.02); font-weight: bold; color: var(--text-muted);">Wed</div>
                <div style="padding: 1rem; text-align: center; background: rgba(255,255,255,0.02); font-weight: bold; color: var(--text-muted);">Thu</div>
                <div style="padding: 1rem; text-align: center; background: rgba(255,255,255,0.02); font-weight: bold; color: var(--text-muted);">Fri</div>
                <div style="padding: 1rem; text-align: center; background: rgba(255,255,255,0.02); font-weight: bold; color: var(--primary);">Sat</div>
                <div style="padding: 1rem; text-align: center; background: rgba(255,255,255,0.02); font-weight: bold; color: var(--primary);">Sun</div>
                
                ${gridHtml}
            </div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                <button class="glass-panel" id="google-sync-btn" style="padding: 0.8rem; border-radius: 12px; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <i class="fa-brands fa-google"></i> ${t.syncGoogle}
                </button>
            </div>
        </div>
    `;

        // Re-bind listeners
        document.getElementById('prev-month').onclick = () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            render();
        };
        document.getElementById('next-month').onclick = () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            render();
        };
        document.getElementById('google-sync-btn').addEventListener('click', function () {
            const btn = this;
            btn.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i> Syncing...';
            btn.style.borderColor = 'var(--primary)';

            // Try Real Sync
            if (window.handleGoogleAuth) {
                try {
                    window.handleGoogleAuth(async () => {
                        try {
                            const count = await window.listUpcomingEvents();
                            btn.innerHTML = `<i class="fa-solid fa-check"></i> Synced ${count} Events`;
                            btn.style.color = 'var(--success)';
                            setTimeout(() => {
                                render(); // Show new
                                btn.innerHTML = `<i class="fa-brands fa-google"></i> ${t.syncGoogle}`;
                                btn.style.color = 'var(--text-main)';
                            }, 2000);
                        } catch (err) {
                            console.error(err);
                            fallbackSync(btn, t);
                        }
                    });
                } catch (e) {
                    console.error("Auth init failed or mock needed", e);
                    fallbackSync(btn, t);
                }
            } else {
                fallbackSync(btn, t);
            }
        });
    };

    function fallbackSync(btn, t) {
        // MOCK SYNC
        setTimeout(() => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const events = [
                { title: 'Google: Team Meeting', date: `${year}-${month}-15` },
                { title: 'Google: Project Deadline', date: `${year}-${month}-20` }
            ];
            events.forEach(e => {
                Storage.addTask({
                    title: e.title,
                    courseId: 'general',
                    dueDate: e.date,
                    type: 'task',
                    status: 'pending'
                });
            });
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Mock Synced (Config API)';
            btn.style.color = 'var(--warning)';
            setTimeout(() => {
                render();
                btn.innerHTML = `<i class="fa-brands fa-google"></i> ${t.syncGoogle}`;
                btn.style.color = 'var(--text-main)';
            }, 2000);
        }, 1500);
    }

    render();
    document.getElementById('page-title').innerText = t.months[currentDate.getMonth()]; // or just 'Schedule' ? The user might prefer "Calendar"
    // Actually, let's stick to the title "Schedule" or "Calendar" from translation? 
    document.getElementById('page-title').innerText = 'Calendar';
}
window.renderCalendar = renderCalendar;
