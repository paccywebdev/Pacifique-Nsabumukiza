// Main entry point - relying on global variables now
const routes = {
    'dashboard': window.renderDashboard || (() => console.error('Dashboard logic missing')),
    'todo': window.renderTodo || (() => console.error('Todo logic missing')),
    'calendar': window.renderCalendar || (() => console.error('Calendar logic missing')),
    'ai-agent': window.renderAIAgent || (() => console.error('AI logic missing')),
    'notes': window.renderNotes || (() => console.error('Notes logic missing'))
};

document.addEventListener('DOMContentLoaded', () => {
    // Apply galactic theme by default on page load
    document.body.classList.add('bg-galactic');

    // Sidebar Navigation
    const navBtns = document.querySelectorAll('.nav-btn');

    // Navigate function
    function navigate(viewName) {
        // Update Active State
        navBtns.forEach(btn => {
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Render View
        const renderFn = routes[viewName];
        if (renderFn) {
            renderFn();
            applyLang(getCurrentLang()); // Re-apply lang after render
        }
    }
    window.navigateApp = navigate;

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            navigate(view);
        });
    });

    // Theme Toggle (Still keeps light/dark mode logic if user wants)
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
    });

    // --- SETTINGS LOGIC ---

    // Open Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('modal-container').classList.remove('hidden');
    });

    // Language Handling
    const langSelect = document.getElementById('lang-select');
    // Populate Select

    // Safety check for translations availability
    if (window.translations) {
        Object.keys(window.translations).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.innerHTML = `${window.translations[key].flag} ${window.translations[key].name}`;
            if (key === window.getCurrentLang()) option.selected = true;
            langSelect.appendChild(option);
        });

        langSelect.addEventListener('change', (e) => {
            window.setLang(e.target.value);
            const activeBtn = document.querySelector('.nav-btn.active');
            if (activeBtn && window.navigateApp) {
                window.navigateApp(activeBtn.dataset.view);
            }
        });
    }

    // Background Handling
    document.querySelectorAll('.bg-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const bgType = btn.dataset.bg;
            document.body.className = ''; // Reset
            document.body.classList.add('bg-' + bgType);
        });
    });

    // Google Config Handling
    const clientIdInput = document.getElementById('google-client-id');
    const apiKeyInput = document.getElementById('google-api-key');
    const saveKeysBtn = document.getElementById('save-google-config');

    if (clientIdInput && apiKeyInput) {
        // Load existing
        clientIdInput.value = localStorage.getItem('paccy_google_client_id') || '';
        apiKeyInput.value = localStorage.getItem('paccy_google_api_key') || '';

        saveKeysBtn.addEventListener('click', () => {
            const cid = clientIdInput.value.trim();
            const key = apiKeyInput.value.trim();
            if (window.updateGoogleConfig) {
                window.updateGoogleConfig(cid, key);
            }
        });
    }

    // Global Google Pair
    document.getElementById('global-google-sync')?.addEventListener('click', function () {
        this.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i> Pairing...';
        setTimeout(() => {
            this.innerHTML = '<i class="fa-solid fa-check"></i> Account Connected';
            this.style.borderColor = 'var(--success)';
            this.style.color = 'var(--success)';
            // Set flag in storage if implemented
        }, 1500);
    });

    // Initial Render
    if (window.applyLang && window.getCurrentLang) {
        window.applyLang(window.getCurrentLang());
    }
    navigate('dashboard');

    // Quick Add Button (Global)
    const quickAddBtn = document.getElementById('quick-add-btn');
    quickAddBtn.addEventListener('click', () => {
        // Navigate to todo list and focus or open modal (mock)
        navigate('todo');
        // Simulating the user wanting to add something
        const taskContainer = document.querySelector('.task-list');
        if (taskContainer) {
            taskContainer.scrollIntoView({ behavior: 'smooth' });
            // In a real app, open a modal here
            alert('Tip: Use the AI Agent to help you draft tasks effectively!');
        }
    });
});
