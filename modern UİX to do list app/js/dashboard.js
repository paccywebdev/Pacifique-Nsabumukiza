function renderDashboard() {
    const container = document.getElementById('content-area');
    const data = Storage.get();
    const tasks = data.tasks;
    const courses = data.courses;

    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
    const t = (window.translations && window.translations[lang]) ? window.translations[lang].dashboard : {
        title: 'Dashboard',
        totalTasks: 'Total Tasks',
        pending: 'Pending',
        completed: 'Completed',
        weeklyProgress: 'Weekly Progress'
    };

    // Calculate Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Calculate High Priority Pending
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status === 'pending').length;

    // Course Stats (Robust ID matching)
    const courseStats = courses.map(course => {
        const courseTasks = tasks.filter(t => t.courseId == course.id); // Loose comparison
        const done = courseTasks.filter(t => t.status === 'completed').length;
        return {
            name: course.name,
            total: courseTasks.length,
            done: done,
            color: course.color
        };
    });

    const hasCourseData = courseStats.some(c => c.total > 0);

    container.innerHTML = `
        <div class="animate-in">
            <!-- Top Stats Row -->
            <div class="dashboard-grid">
                <!-- ... Same Stats Cards ... -->
                <div class="stat-card glass-panel">
                    <span class="stat-label">${t.totalTasks}</span>
                    <div class="stat-value" style="color: var(--primary)">${totalTasks}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        <span style="color: var(--success);"><i class="fa-solid fa-arrow-up"></i> +${tasks.length > 0 ? '12' : '0'}%</span> vs last month
                    </div>
                    <i class="fa-solid fa-list-check stat-icon-bg" style="color: var(--primary);"></i>
                </div>

                <div class="stat-card glass-panel">
                    <span class="stat-label">Completion Rate</span>
                    <div class="stat-value" style="color: var(--secondary)">${completionRate}%</div>
                    <div class="progress-bar-bg" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 10px; overflow: hidden;">
                        <div style="width: ${completionRate}%; height: 100%; background: var(--secondary); border-radius: 3px; box-shadow: 0 0 10px var(--secondary);"></div>
                    </div>
                    <i class="fa-solid fa-chart-pie stat-icon-bg" style="color: var(--secondary);"></i>
                </div>

                <div class="stat-card glass-panel">
                    <span class="stat-label">Active Pending</span>
                    <div class="stat-value" style="color: var(--warning)">${pendingTasks}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        ${highPriority} High Priority
                    </div>
                    <i class="fa-regular fa-clock stat-icon-bg" style="color: var(--warning);"></i>
                </div>

                <div class="stat-card glass-panel">
                    <span class="stat-label">Courses Active</span>
                    <div class="stat-value" style="color: #f472b6">${courses.length}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        Academic Term
                    </div>
                    <i class="fa-solid fa-graduation-cap stat-icon-bg" style="color: #f472b6;"></i>
                </div>
            </div>

            <!-- Charts Row 1 -->
            <div class="charts-row">
                <!-- Bar Chart: Tasks per Course -->
                <div class="chart-card glass-panel">
                    <h3 style="margin-bottom: 1rem; color: var(--text-main);">Course Workload</h3>
                    <div style="flex: 1; position: relative; display: flex; align-items: center; justify-content: center;">
                        <canvas id="courseBarChart"></canvas>
                        ${!hasCourseData ? '<div style="position: absolute; color: var(--text-muted); font-size: 0.9rem;">No tasks assigned yet.</div>' : ''}
                    </div>
                </div>

                <!-- Doughnut text: Status -->
                <div class="chart-card glass-panel">
                    <h3 style="margin-bottom: 1rem; color: var(--text-main);">Task Status</h3>
                    <div style="flex: 1; position: relative; display: flex; align-items: center; justify-content: center;">
                        <canvas id="statusDoughnutChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Charts Row 2 -->
            <div class="charts-row">
                <!-- Line Chart: Activity -->
                <div class="chart-card glass-panel full-width-chart">
                    <h3 style="margin-bottom: 1rem; color: var(--text-main);">Productivity Trend</h3>
                    <div style="flex: 1; position: relative;">
                        <canvas id="activityLineChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('page-title').innerText = t.title;

    // Render Charts
    setTimeout(() => {
        initCharts(courseStats, { completed: completedTasks, pending: pendingTasks });
    }, 100);
}

// Keep track of chart instances to destroy them before re-rendering
window.dashboardChartInstances = {};

function initCharts(courseStats, taskStats) {
    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--primary').trim() || '#38bdf8';
    const secondaryColor = style.getPropertyValue('--secondary').trim() || '#4ade80';
    const textColor = style.getPropertyValue('--text-muted').trim() || '#94a3b8';

    // 1. Course Bar Chart
    const ctxBar = document.getElementById('courseBarChart');
    if (ctxBar) {
        if (window.dashboardChartInstances.bar) window.dashboardChartInstances.bar.destroy();

        window.dashboardChartInstances.bar = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: courseStats.map(c => c.name),
                datasets: [
                    {
                        label: 'Completed',
                        data: courseStats.map(c => c.done),
                        backgroundColor: secondaryColor,
                        borderRadius: 5,
                    },
                    {
                        label: 'Total Tasks',
                        data: courseStats.map(c => c.total),
                        backgroundColor: primaryColor + '30', // Add transparency hex/string
                        borderColor: primaryColor,
                        borderWidth: 1,
                        borderRadius: 5,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: textColor, precision: 0 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }

    // 2. Status Doughnut Chart
    const ctxDoughnut = document.getElementById('statusDoughnutChart');
    if (ctxDoughnut) {
        if (window.dashboardChartInstances.doughnut) window.dashboardChartInstances.doughnut.destroy();

        window.dashboardChartInstances.doughnut = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending'],
                datasets: [{
                    data: [taskStats.completed, taskStats.pending],
                    backgroundColor: [secondaryColor, '#fbbf24'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor } }
                },
                cutout: '70%',
            }
        });
    }

    // 3. Activity Line Chart (Mock Data)
    const ctxLine = document.getElementById('activityLineChart');
    if (ctxLine) {
        if (window.dashboardChartInstances.line) window.dashboardChartInstances.line.destroy();

        window.dashboardChartInstances.line = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: [2, 4, 3, 5, 2, 6, 4],
                    borderColor: primaryColor,
                    backgroundColor: primaryColor + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }
}

window.renderDashboard = renderDashboard;
