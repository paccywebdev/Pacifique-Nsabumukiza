function renderNotes() {
    const container = document.getElementById('content-area');
    const data = Storage.get();
    const notes = data.notes || [];

    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
    // Robust fallback: English defaults
    const defaultT = window.translations['en'].notes;
    // Current language translations (safe access)
    const langT = (window.translations && window.translations[lang]) ? window.translations[lang].notes : {};

    // Explicitly merge ensuring no undefined values overwrite defaults
    const t = {
        title: langT.title || defaultT.title,
        add: langT.add || defaultT.add,
        placeholder: langT.placeholder || defaultT.placeholder,
        empty: langT.empty || defaultT.empty,
        save: langT.save || defaultT.save
    };

    container.innerHTML = `
        <div class="animate-in" style="height: 100%; display: flex; flex-direction: column;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="font-family: var(--font-heading); background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${t.title}</h2>
                <button id="add-note-btn" class="glass-panel" style="padding: 0.8rem 1.5rem; border-radius: 50px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s;">
                    <i class="fa-solid fa-plus"></i> ${t.add}
                </button>
            </div>

            <!-- Notes Grid -->
            <div id="notes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; flex: 1; overflow-y: auto;">
                ${notes.length === 0 ? `
                    <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; height: 300px;">
                        <i class="fa-solid fa-sticky-note" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p>${t.empty}</p>
                    </div>
                ` : notes.map(note => createNoteCard(note)).join('')}
            </div>
        </div>

        <!-- Edit Note Modal -->
        <div id="note-modal" class="modal-overlay hidden" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); justify-content: center; align-items: center;">
            <div class="glass-panel animate-in" style="width: 90%; max-width: 600px; padding: 2rem; border-radius: 20px; display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <input type="text" id="note-title-input" placeholder="Title" style="background: transparent; border: none; font-size: 1.5rem; font-family: var(--font-heading); color: var(--text-main); width: 100%; outline: none;">
                    <button id="close-note-modal" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="height: 1px; background: var(--glass-border); width: 100%;"></div>
                <textarea id="note-content-input" placeholder="${t.placeholder}" style="background: transparent; border: none; color: var(--text-main); font-family: var(--font-body); font-size: 1rem; min-height: 300px; resize: none; outline: none; line-height: 1.6;"></textarea>
                <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                    <span id="last-edited" style="margin-right: auto; font-size: 0.8rem; color: var(--text-muted);"></span>
                    <button id="delete-note-btn" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid var(--danger); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: none;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    <button id="save-note-btn" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        ${t.save || 'Save'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('page-title').innerText = t.title;

    // Event Listeners
    setupNoteEvents(t);
}

function createNoteCard(note) {
    // Random rotation for sticky note feel
    const rot = Math.random() * 2 - 1;
    const date = new Date(note.updatedAt).toLocaleDateString();

    // Preview Content (truncate)
    const preview = note.content ? (note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')) : '';

    return `
        <div class="note-card glass-panel" data-id="${note.id}" style="padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.2s; position: relative; display: flex; flex-direction: column; gap: 0.5rem; height: 200px; transform: rotate(${rot}deg);" onclick="editNote(${note.id})">
            <h3 style="font-size: 1.1rem; color: var(--text-main); font-weight: bold;">${note.title || 'Untitled'}</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; flex: 1;">${preview}</p>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: auto; opacity: 0.7;">
                ${date}
            </div>
            <div class="note-hover-effect" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent); opacity: 0; transition: 0.2s;"></div>
        </div>
    `;
}

let currentNoteId = null;

function setupNoteEvents(t) {
    const modal = document.getElementById('note-modal');
    const closeBtn = document.getElementById('close-note-modal');
    const saveBtn = document.getElementById('save-note-btn');
    const deleteBtn = document.getElementById('delete-note-btn');
    const addBtn = document.getElementById('add-note-btn');

    const titleInput = document.getElementById('note-title-input');
    const contentInput = document.getElementById('note-content-input');
    const lastEditedStr = document.getElementById('last-edited');

    // Close Modal
    const closeModal = () => {
        modal.classList.add('hidden');
        currentNoteId = null;
        renderNotes(); // Re-render to show changes
    };
    closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // New Note
    addBtn.onclick = () => {
        currentNoteId = null;
        titleInput.value = '';
        contentInput.value = '';
        deleteBtn.style.display = 'none';
        lastEditedStr.innerText = '';
        modal.classList.remove('hidden');
        titleInput.focus();
    };

    // Save
    saveBtn.onclick = () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title && !content) return closeModal();

        if (currentNoteId) {
            Storage.updateNote({ id: currentNoteId, title, content });
        } else {
            Storage.addNote({ title, content });
        }
        closeModal();
    };

    // Delete
    deleteBtn.onclick = () => {
        if (confirm('Delete this note?')) {
            Storage.deleteNote(currentNoteId);
            closeModal();
        }
    };

    // Edit Function (Global scope to be called by onclick html)
    window.editNote = (id) => {
        const data = Storage.get();
        const note = data.notes.find(n => n.id === id);
        if (note) {
            currentNoteId = id;
            titleInput.value = note.title || '';
            contentInput.value = note.content || '';
            deleteBtn.style.display = 'block';
            lastEditedStr.innerText = 'Edited: ' + new Date(note.updatedAt).toLocaleString();
            modal.classList.remove('hidden');
        }
    };

    // Add hover styles dynamically via JS (or reliance on inline style + class)
    // Style override for hover
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
            card.style.borderColor = 'var(--primary)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `rotate(${Math.random() * 2 - 1}deg)`; // Reset to subtle rotation
            card.style.borderColor = 'var(--glass-border)';
        });
    });
}

window.renderNotes = renderNotes;
