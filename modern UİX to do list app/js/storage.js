

const STORAGE_KEY = 'paccy_app_data';

const defaultData = {
    tasks: [
        { id: 1, title: 'Complete Calculus Assignment', courseId: 'math101', dueDate: '2025-12-12', status: 'pending', type: 'task', priority: 'high', createdAt: Date.now(), subtasks: [] },
        { id: 2, title: 'Physics Lab Report', courseId: 'phys202', dueDate: '2025-12-14', status: 'completed', type: 'task', priority: 'medium', createdAt: Date.now() - 86400000, completedAt: Date.now() - 40000, subtasks: [] },
        { id: 3, title: 'Study Group Meeting', courseId: 'general', dueDate: '2025-12-13', status: 'pending', type: 'event', priority: 'low', createdAt: Date.now(), subtasks: [] }
    ],
    courses: [
        { id: 'math101', name: 'Math 101', color: '#8b5cf6' },
        { id: 'phys202', name: 'Physics 202', color: '#14b8a6' },
        { id: 'cs305', name: 'CS 305', color: '#10b981' },
        { id: 'general', name: 'General', color: '#f59e0b' }
    ],
    notes: [], // Add notes array
    user: {
        name: 'Paccy',
        email: 'paccy@student.edu',
        level: 'Undergraduate'
    }
};

const Storage = {
    _cache: null,
    _cache: null,

    get() {
        if (this._cache) return this._cache;

        const data = localStorage.getItem(STORAGE_KEY);
        // Deep merge or simple fallback to ensure structure exists if schema changes
        if (!data) {
            this._cache = defaultData;
            return this._cache;
        }

        try {
            const parsed = JSON.parse(data);
            if (!parsed.courses) parsed.courses = defaultData.courses;
            if (!parsed.notes) parsed.notes = [];
            this._cache = parsed;
            return this._cache;
        } catch (e) {
            console.error("Data corruption", e);
            this._cache = defaultData;
            return this._cache;
        }
    },

    save(data) {
        this._cache = data; // Update cache immediately
        // Async save to avoid blocking UI thread for large datasets? 
        // For strict correctness we usually sync save in JS, but for "responsiveness" we can debounce or just save.
        // Let's stick to sync for safety, but cache read is the big win.
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // Mock Cloud Sync
        const cloudIcon = document.querySelector('.cloud-status');
        if (cloudIcon) {
            // Debounce the UI flickers
            if (!this._syncTimeout) {
                cloudIcon.innerHTML = `<i class="fa-solid fa-sync fa-spin"></i> Syncing...`;
                this._syncTimeout = setTimeout(() => {
                    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
                    const syncedText = (window.translations && window.translations[lang]) ? window.translations[lang].header.synced : 'Synced';
                    cloudIcon.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> ${syncedText}`;
                    this._syncTimeout = null;
                }, 800);
            }
        }
    },

    addCourse(name, color) {
        const data = this.get();
        const id = name.toLowerCase().replace(/\s+/g, '') + Date.now().toString().slice(-4);
        data.courses.push({ id, name, color: color || '#ffffff' });
        this.save(data);
        return data.courses;
    },

    removeCourse(id) {
        const data = this.get();
        data.courses = data.courses.filter(c => c.id !== id);
        data.tasks.forEach(t => {
            if (t.courseId === id) t.courseId = 'general';
        });
        this.save(data);
        return data.courses;
    },

    addTask(task) {
        const data = this.get();
        task.id = Date.now();
        task.createdAt = Date.now();
        task.status = 'pending';
        task.priority = task.priority || 'medium';
        task.subtasks = task.subtasks || [];
        data.tasks.push(task);
        this.save(data);
        return data.tasks;
    },

    toggleTask(id) {
        const data = this.get();
        const task = data.tasks.find(t => t.id == id);
        if (task) {
            if (task.status !== 'completed') {
                task.status = 'completed';
                task.completedAt = Date.now();
            } else {
                task.status = 'pending';
                delete task.completedAt;
            }
            this.save(data);
        }
        return data.tasks;
    },

    deleteTask(id) {
        const data = this.get();
        data.tasks = data.tasks.filter(t => t.id != id);
        this.save(data);
        return data.tasks;
    },

    // Notes Methods
    addNote(note) {
        const data = this.get();
        note.id = Date.now();
        note.updatedAt = Date.now();
        if (!data.notes) data.notes = [];
        data.notes.push(note);
        this.save(data);
        return data.notes;
    },

    updateNote(updatedNote) {
        const data = this.get();
        if (!data.notes) return;
        const index = data.notes.findIndex(n => n.id === updatedNote.id);
        if (index !== -1) {
            data.notes[index] = { ...data.notes[index], ...updatedNote, updatedAt: Date.now() };
            this.save(data);
        }
        return data.notes;
    },

    deleteNote(id) {
        const data = this.get();
        if (!data.notes) return;
        data.notes = data.notes.filter(n => n.id !== id);
        this.save(data);
        return data.notes;
    },

    getStats() {
        const tasks = this.get().tasks;
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const pending = total - completed;
        const performance = total === 0 ? 0 : Math.round((completed / total) * 100);

        // Calculate last 7 days performance
        const last7Days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);

            const tasksThatDay = tasks.filter(t => {
                if (t.status === 'completed' && t.completedAt) {
                    return t.completedAt >= day.getTime() && t.completedAt < nextDay.getTime();
                }
                return false;
            }).length;

            last7Days.push(Math.min(tasksThatDay * 20, 100));
        }

        return {
            total,
            completed,
            pending,
            performance,
            last7Days
        };
    }
};
window.Storage = Storage;
