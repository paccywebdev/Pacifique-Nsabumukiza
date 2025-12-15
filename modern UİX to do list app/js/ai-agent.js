function renderAIAgent() {
    const container = document.getElementById('content-area');


    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
    const allT = window.translations ? (window.translations[lang] || window.translations['en']) : {};
    const t = allT.ai || (window.translations['en'] ? window.translations['en'].ai : {
        placeholder: "Type your request...",
        hello: "Hello, Paccy!",
        intro: "I am your advanced AI assistant.",
        suggestions: ["Add a new course", "Go to Calendar"]
    });

    container.innerHTML = `
        <div class="animate-in" style="height: 100%; display: flex; flex-direction: column;">
            <div class="glass-panel" style="flex: 1; margin-bottom: 2rem; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; position: relative;">
                <!-- AI Blob Animation Background -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; height: 300px; background: radial-gradient(circle, var(--primary-glow), transparent 70%); opacity: 0.15; filter: blur(60px); pointer-events: none; animation: pulse 4s infinite ease-in-out;"></div>

                <div class="chat-header" style="padding: 1rem 2rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2); z-index: 2; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--primary), #ff00cc); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px var(--primary-glow); border: 2px solid white;">
                            <i class="fa-solid fa-sparkles" style="color: white; font-size: 1.2rem;"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0; font-size: 1.1rem;">Paccy GPT-4o</h4>
                            <span style="font-size: 0.8rem; color: var(--success); display: flex; align-items: center; gap: 5px;">
                                <span style="width: 6px; height: 6px; background: var(--success); border-radius: 50%; box-shadow: 0 0 5px var(--success);"></span> Intelligent Assistant
                            </span>
                        </div>
                    </div>
                    <button class="icon-btn" title="Clear Chat" onclick="document.getElementById('chat-messages').innerHTML = ''">
                        <i class="fa-solid fa-rotate-right"></i>
                    </button>
                </div>
                
                <div id="chat-messages" style="flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.2rem; z-index: 2; scrollbar-width: thin;">
                    <div style="align-self: flex-start; max-width: 85%; background: var(--glass-highlight); padding: 1.2rem; border-radius: 16px 16px 16px 0; border: 1px solid var(--glass-border); line-height: 1.5;">
                        <strong>${t.hello}</strong> 👋<br>
                        ${t.intro}<br><br>
                        Try asking me to:
                        <ul style="margin-top: 5px; padding-left: 20px; font-size: 0.9em; opacity: 0.9;">
                            ${t.suggestions.map(s => `<li>"${s}"</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div style="padding: 1.5rem 2rem; background: rgba(0,0,0,0.3); border-top: 1px solid var(--glass-border); z-index: 2;">
                    <div style="display: flex; gap: 1rem; position: relative; align-items: flex-end;">
                        <div style="flex: 1; position: relative;">
                            <textarea id="ai-input" rows="1" placeholder="${t.placeholder}" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 16px; color: white; outline: none; backdrop-filter: blur(10px); resize: none; font-family: var(--font-body); transition: all 0.2s;"></textarea>
                        </div>
                        <button id="send-ai-btn" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; width: 56px; height: 56px; border-radius: 16px; color: white; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s; box-shadow: 0 4px 15px var(--primary-glow); display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <style>
            @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.25; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
            }
        </style>
    `;

    document.getElementById('page-title').innerText = 'AI Assistant';

    const btn = document.getElementById('send-ai-btn');
    const input = document.getElementById('ai-input');
    const chat = document.getElementById('chat-messages');

    // Auto focus
    if (input) {
        input.focus();
        input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if (this.value === '') this.style.height = 'auto';
        });
    }

    const addMessage = (text, isUser = false) => {
        const msg = document.createElement('div');
        msg.style.cssText = isUser
            ? "align-self: flex-end; max-width: 80%; background: linear-gradient(135deg, var(--primary), #ff00cc); color: white; padding: 1rem 1.5rem; border-radius: 16px 16px 0 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-weight: 500;"
            : "align-self: flex-start; max-width: 85%; background: var(--glass-highlight); color: var(--text-main); padding: 1.2rem; border-radius: 16px 16px 16px 0; border: 1px solid var(--glass-border); line-height: 1.6;";
        msg.innerHTML = text;
        chat.appendChild(msg);
        chat.scrollTop = chat.scrollHeight;
    };

    const processCommand = (text) => {
        const lower = text.toLowerCase();
        let response = '';
        let actionTaken = false;
        const data = Storage.get(); // Access latest data for "reading" capabilities

        // 1. Navigation Logic
        if (lower.includes('go to') || lower.includes('show me') || lower.includes('open') || lower.includes('navigate')) {
            if (lower.includes('dashboard') || lower.includes('home')) {
                if (window.navigateApp) { window.navigateApp('dashboard'); actionTaken = true; }
                response = 'Navigating to <strong>Dashboard</strong>.';
            } else if (lower.includes('calendar') || lower.includes('schedule')) {
                if (window.navigateApp) { window.navigateApp('calendar'); actionTaken = true; }
                response = 'Opening your <strong>Calendar</strong>.';
            } else if (lower.includes('task') || lower.includes('todo') || lower.includes('list') || lower.includes('course')) {
                if (window.navigateApp) { window.navigateApp('todo'); actionTaken = true; }
                response = 'Here is your <strong>To-Do & Course List</strong>.';
            }
        }

        // 2. "Read" Logic (Listing Tasks/Courses) - NEW FEATURE
        if (!actionTaken && (lower.includes('what') || lower.includes('list') || lower.includes('show') || lower.includes('do i have'))) {
            if (lower.includes('task') || lower.includes('do')) {
                const pendingTasks = data.tasks.filter(t => t.status === 'pending');
                if (pendingTasks.length > 0) {
                    const limit = pendingTasks.slice(0, 3).map(t => `• ${t.title} (${t.priority || 'medium'})`).join('<br>');
                    response = `You have <strong>${pendingTasks.length} pending tasks</strong>.<br>Here are the top ones:<br>${limit}${pendingTasks.length > 3 ? '<br>...and more.' : ''}`;
                } else {
                    response = 'You have <strong>no pending tasks</strong>! 🎉 Great job.';
                }
                actionTaken = true;
            } else if (lower.includes('course')) {
                const courses = data.courses.map(c => `• ${c.name}`).join('<br>');
                response = `You are currently enrolled in:<br>${courses}`;
                actionTaken = true;
            }
        }

        // 3. Add Course Logic
        if (!actionTaken && (lower.includes('add course') || lower.includes('new course') || lower.includes('create course'))) {
            const nameMatch = text.match(/(?:course|called|named)\s+([a-zA-Z0-9\s]+)/i);
            const rawName = nameMatch ? nameMatch[1].trim() : text.replace(/add course|new course/gi, '').trim();
            const courseName = rawName.replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter

            if (courseName.length > 2) {
                // Generate random vibrant color
                const colors = ['#8b5cf6', '#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                Storage.addCourse(courseName, color);
                response = `I've created the course <strong>${courseName}</strong> with a nice tag color for you. <br>You can now add tasks to it.`;
                actionTaken = true;
            }
        }

        // 4. Add Task Logic
        if (!actionTaken && (lower.includes('add') || lower.includes('remind') || lower.includes('study') || lower.includes('schedule'))) {
            // Date parsing
            let taskDate = new Date().toISOString().split('T')[0];
            if (lower.includes('tomorrow')) {
                const d = new Date(); d.setDate(d.getDate() + 1);
                taskDate = d.toISOString().split('T')[0];
            } else if (lower.includes('next week')) {
                const d = new Date(); d.setDate(d.getDate() + 7);
                taskDate = d.toISOString().split('T')[0];
            } else {
                const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
                if (dateMatch) taskDate = dateMatch[0];
            }

            // Priority detection
            let priority = 'medium';
            if (lower.includes('urgent') || lower.includes('important') || lower.includes('high priority') || lower.includes('asap')) {
                priority = 'high';
            } else if (lower.includes('low priority') || lower.includes('when you can') || lower.includes('whenever')) {
                priority = 'low';
            }

            // Clean title
            let taskTitle = text
                .replace(/add|remind me to|schedule|study|task/gi, '')
                .replace(/tomorrow|next week|on \d{4}-\d{2}-\d{2}/gi, '')
                .replace(/urgent|important|high priority|low priority|asap|when you can|whenever/gi, '')
                .trim();

            if (taskTitle) {
                taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
                Storage.addTask({
                    title: taskTitle,
                    courseId: 'general',
                    priority: priority,
                    dueDate: taskDate,
                    type: 'task'
                });

                const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' };
                response = `Task added: <strong>${taskTitle}</strong> ${priorityEmoji[priority]}<br>Priority: <strong>${priority.toUpperCase()}</strong><br>Due: <strong>${taskDate}</strong>`;
                actionTaken = true;
            }
        }

        // 5. Google Calendar Logic
        if (!actionTaken && (lower.includes('google') || lower.includes('sync'))) {
            response = `To sync with <strong>Google Calendar</strong>, please go to the Calendar view and click the "Sync" button at the bottom. I can guide you there if you say "Go to Calendar".`;
            actionTaken = true;
        }

        // Default "AI" Chat
        if (!actionTaken) {
            const greetings = ["hi there!", "hello!", "hey paccy user!"];
            if (greetings.some(g => lower.includes(g))) {
                response = "Hello! I am ready to help you organize your studies. What's the plan for today?";
            } else {
                response = `I understand you said "<em>${text}</em>". <br>I am currently optimized to help you with: <br>1. Navigation <br>2. listing Tasks <br>3. Adding Courses <br>4. Scheduling Tasks. <br><br>Try "Show me my pending tasks"!`;
            }
        }

        setTimeout(() => {
            addMessage(response);
        }, 800 + Math.random() * 500);
    };

    const sendMessage = () => {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = '';
        input.style.height = 'auto';

        const typingId = 'typing-' + Date.now();
        const typing = document.createElement('div');
        typing.id = typingId;
        typing.style.cssText = "align-self: flex-start; color: var(--text-muted); padding: 0.5rem 1rem; font-size: 0.85rem; font-style: italic; opacity: 0.8;";
        typing.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> keying...';
        chat.appendChild(typing);
        chat.scrollTop = chat.scrollHeight;

        setTimeout(() => {
            document.getElementById(typingId)?.remove();
            processCommand(text);
        }, 600);
    };

    if (btn) btn.addEventListener('click', sendMessage);
    if (input) input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}
window.renderAIAgent = renderAIAgent;
