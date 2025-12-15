function renderTodo() {
    const container = document.getElementById('content-area');
    const data = Storage.get();
    let currentFilter = 'all';

    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
    const allT = window.translations ? (window.translations[lang] || window.translations['en']) : {};
    // Fallback to English for todo section if missing in target lang
    const t = allT.todo || (window.translations['en'] ? window.translations['en'].todo : {
        courseManagement: 'Course Management',
        addCourse: 'Add New Course',
        yourCourses: 'Your Courses',
        taskManagement: 'Task Management',
        createTask: 'Create New Task',
        taskTitle: 'Task Title',
        course: 'Course',
        priority: 'Priority',
        dueDate: 'Due Date',
        addBtn: 'Add Task',
        allTasks: 'All Tasks',
        pending: 'Pending',
        completed: 'Completed',
        noTasks: 'No tasks found.',
        subtasks: 'Subtasks',
        courseName: 'Course Name',
        courseColor: 'Course Color'
    });

    const render = () => {
        const filteredTasks = currentFilter === 'all'
            ? data.tasks
            : data.tasks.filter(t => t.status === (currentFilter === 'pending' ? 'pending' : 'completed'));

        container.innerHTML = `
            <div class="animate-in" style="display: flex; flex-direction: column; gap: 2rem;">
                
                <!-- SECTION 1: Course Management -->
                <div class="glass-panel" style="padding: 2rem; border-radius: 20px;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <i class="fa-solid fa-graduation-cap" style="color: var(--primary); font-size: 1.5rem;"></i>
                        <h2 style="margin: 0; font-family: var(--font-heading); color: var(--primary);">${t.courseManagement}</h2>
                    </div>
                    
                    <!-- Add Course Form -->
                    <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <h4 style="margin: 0 0 1rem 0; color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">${t.addCourse}</h4>
                        <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 200px;">
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">${t.courseName}</label>
                                <input type="text" id="new-course-name" placeholder="e.g., Advanced Physics" style="width: 100%; background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: white;">
                            </div>
                            <div style="min-width: 150px;">
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">${t.courseColor}</label>
                                <select id="new-course-color" style="width: 100%; background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: white;">
                                    <option value="#8b5cf6">Purple</option>
                                    <option value="#14b8a6">Teal</option>
                                    <option value="#10b981">Green</option>
                                    <option value="#f59e0b">Amber</option>
                                    <option value="#ef4444">Red</option>
                                    <option value="#ec4899">Pink</option>
                                </select>
                            </div>
                            <button id="add-course-btn" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; padding: 0.75rem 2rem; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px var(--primary-glow); transition: transform 0.2s;">
                                <i class="fa-solid fa-plus"></i> ${t.addBtn}
                            </button>
                        </div>
                    </div>

                    <!-- Existing Courses -->
                    <div>
                        <h4 style="margin: 0 0 1rem 0; color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">${t.yourCourses}</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                            ${data.courses.map(course => `
                                <div class="glass-panel" style="padding: 0.75rem 1.25rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s; border-left: 3px solid ${course.color};">
                                    <span style="width: 12px; height: 12px; background: ${course.color}; border-radius: 50%; box-shadow: 0 0 8px ${course.color};"></span>
                                    <span style="font-weight: 500;">${course.name}</span>
                                    ${course.id !== 'general' ? `
                                        <button class="delete-course-btn" data-id="${course.id}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; margin-left: 0.5rem; padding: 0.25rem; transition: all 0.2s;" title="Delete Course">
                                            <i class="fa-solid fa-trash" style="font-size: 0.85rem;"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- SECTION 2: Task Management -->
                <div class="glass-panel" style="padding: 2rem; border-radius: 20px;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <i class="fa-solid fa-list-check" style="color: var(--secondary); font-size: 1.5rem;"></i>
                        <h2 style="margin: 0; font-family: var(--font-heading); color: var(--secondary);">${t.taskManagement}</h2>
                    </div>

                    <!-- Add Task Form -->
                    <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <h4 style="margin: 0 0 1rem 0; color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">${t.createTask}</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: flex-end;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">${t.taskTitle}</label>
                                <input type="text" id="new-task-title" placeholder="What needs to be done?" style="width: 100%; background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: white;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">${t.course}</label>
                                <select id="new-task-course" style="width: 100%; background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: white;">
                                    ${data.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">${t.priority}</label>
                                <select id="new-task-priority" style="width: 100%; background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: white;">
                                    <option value="low">🟢 ${t.priorityLevel ? t.priorityLevel.low : 'Low'}</option>
                                    <option value="medium" selected>🟡 ${t.priorityLevel ? t.priorityLevel.medium : 'Medium'}</option>
                                    <option value="high">🔴 ${t.priorityLevel ? t.priorityLevel.high : 'High'}</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">${t.dueDate}</label>
                                <input type="date" id="new-task-date" style="width: 100%; background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: white;">
                            </div>
                        </div>
                        <button id="add-task-btn" style="background: linear-gradient(135deg, var(--secondary), var(--primary)); border: none; padding: 0.75rem 2rem; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; margin-top: 1rem; box-shadow: 0 4px 12px var(--secondary-glow); transition: transform 0.2s;">
                            <i class="fa-solid fa-plus"></i> ${t.addTaskBtn}
                        </button>
                    </div>

                    <!-- Filter Buttons -->
                    <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
                        <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all" style="background: ${currentFilter === 'all' ? 'var(--primary)' : 'var(--glass-bg)'}; border: 1px solid var(--glass-border); padding: 0.5rem 1.25rem; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s;">
                            ${t.allTasks} (${data.tasks.length})
                        </button>
                        <button class="filter-btn ${currentFilter === 'pending' ? 'active' : ''}" data-filter="pending" style="background: ${currentFilter === 'pending' ? 'var(--primary)' : 'var(--glass-bg)'}; border: 1px solid var(--glass-border); padding: 0.5rem 1.25rem; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s;">
                            ${t.pending} (${data.tasks.filter(t => t.status === 'pending').length})
                        </button>
                        <button class="filter-btn ${currentFilter === 'completed' ? 'active' : ''}" data-filter="completed" style="background: ${currentFilter === 'completed' ? 'var(--primary)' : 'var(--glass-bg)'}; border: 1px solid var(--glass-border); padding: 0.5rem 1.25rem; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s;">
                            ${t.completed} (${data.tasks.filter(t => t.status === 'completed').length})
                        </button>
                    </div>

                    <!-- Task List -->
                    <div class="task-list" style="display: flex; flex-direction: column; gap: 1rem;">
                        ${filteredTasks.length === 0 ? `
                            <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                                <i class="fa-solid fa-inbox" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                                <p>${t.noTasks}</p>
                            </div>
                        ` : filteredTasks.map(task => {
            const course = data.courses.find(c => c.id === task.courseId) || { name: 'Unknown', color: '#888' };
            const priorityColors = {
                high: 'var(--priority-high)',
                medium: 'var(--priority-medium)',
                low: 'var(--priority-low)'
            };
            const priorityIcons = { high: '🔴', medium: '🟡', low: '🟢' };

            return `
                                <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; transition: all 0.2s; ${task.status === 'completed' ? 'opacity: 0.6;' : ''} border-left: 4px solid ${priorityColors[task.priority || 'medium']};">
                                    <div style="display: flex; align-items: flex-start; gap: 1rem;">
                                        <input type="checkbox" class="task-toggle" data-id="${task.id}" ${task.status === 'completed' ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; margin-top: 2px; accent-color: var(--success);">
                                        
                                        <div style="flex: 1;">
                                            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
                                                <h3 style="margin: 0; font-size: 1.1rem; ${task.status === 'completed' ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${task.title}</h3>
                                                <span style="background: ${course.color}30; color: ${course.color}; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; border: 1px solid ${course.color};">
                                                    ${course.name}
                                                </span>
                                                <span style="background: ${priorityColors[task.priority || 'medium']}20; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
                                                    ${priorityIcons[task.priority || 'medium']} ${(task.priority || 'medium').toUpperCase()} ${t.priority}
                                                </span>
                                            </div>
                                            
                                            <div style="display: flex; align-items: center; gap: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
                                                <span><i class="fa-regular fa-calendar"></i> ${task.dueDate}</span>
                                                <span><i class="fa-regular fa-clock"></i> ${task.type === 'task' ? 'Task' : 'Event'}</span>
                                            </div>
                                            
                                            ${task.subtasks && task.subtasks.length > 0 ? `
                                                <div style="margin-top: 0.75rem; padding-left: 1rem; border-left: 2px solid var(--glass-border);">
                                                    <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Subtasks</p>
                                                    ${task.subtasks.map(st => `
                                                        <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                                                            <i class="fa-solid fa-chevron-right" style="font-size: 0.6rem; margin-right: 0.5rem;"></i> ${st}
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            ` : ''}
                                        </div>
                                        
                                        <button class="delete-task-btn" data-id="${task.id}" style="background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 0.5rem 0.75rem; border-radius: 8px; color: var(--text-muted); cursor: pointer; transition: all 0.2s;" title="Delete Task">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        bindEvents();
    };

    const bindEvents = () => {
        // Add Course
        document.getElementById('add-course-btn')?.addEventListener('click', () => {
            const name = document.getElementById('new-course-name').value.trim();
            const color = document.getElementById('new-course-color').value;
            if (name) {
                Storage.addCourse(name, color);
                document.getElementById('new-course-name').value = '';
                render();
            }
        });

        // Delete Course
        document.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Are you sure you want to delete this course? Associated tasks will be moved to General.')) {
                    Storage.removeCourse(id);
                    render();
                }
            });
        });

        // Add Task
        document.getElementById('add-task-btn')?.addEventListener('click', () => {
            const title = document.getElementById('new-task-title').value.trim();
            const courseId = document.getElementById('new-task-course').value;
            const priority = document.getElementById('new-task-priority').value;
            const dueDate = document.getElementById('new-task-date').value;

            if (title && dueDate) {
                Storage.addTask({
                    title,
                    courseId,
                    priority,
                    dueDate,
                    type: 'task'
                });
                document.getElementById('new-task-title').value = '';
                document.getElementById('new-task-date').value = '';
                render();
            }
        });

        // Toggle Task
        document.querySelectorAll('.task-toggle').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                Storage.toggleTask(parseInt(id));
                render();
            });
        });

        // Delete Task
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Delete this task?')) {
                    Storage.deleteTask(parseInt(id));
                    render();
                }
            });
        });

        // Filter Tasks
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentFilter = e.target.dataset.filter;
                render();
            });
        });
    };

    render();
    document.getElementById('page-title').innerText = 'Tasks & Courses';
}
window.renderTodo = renderTodo;
