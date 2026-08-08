// DailyFlow - Today's Task Planner Application Logic

const DEFAULT_DAILY_TASKS = [
  { id: '1', title: '🏃 Morning Exercise / Stretching', isImportant: true, completed: false },
  { id: '2', title: '📖 Read 15-20 pages of a book', isImportant: false, completed: false },
  { id: '3', title: '💻 Complete today\'s work & study goals', isImportant: true, completed: false }
];

class DailyFlowApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('dailyflow_tasks')) || DEFAULT_DAILY_TASKS;
    this.currentFilter = 'all';
    this.isImportantInput = false;

    this.initDOM();
    this.bindEvents();
    this.renderDate();
    this.render();
  }

  initDOM() {
    this.currentDateEl = document.getElementById('current-date');
    this.progressTextEl = document.getElementById('progress-text');
    this.percentBadgeEl = document.getElementById('percent-badge');
    this.progressFillEl = document.getElementById('progress-fill');

    this.addForm = document.getElementById('add-task-form');
    this.taskInput = document.getElementById('task-input');
    this.priorityToggle = document.getElementById('priority-toggle');
    this.prioLabel = document.getElementById('prio-label');

    this.filterGroup = document.getElementById('filter-group');
    this.startNewDayBtn = document.getElementById('start-new-day-btn');

    this.taskListEl = document.getElementById('task-list');
    this.emptyStateEl = document.getElementById('empty-state');
    this.emptyTitleEl = document.getElementById('empty-title');
    this.emptyDescEl = document.getElementById('empty-desc');
  }

  renderDate() {
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    this.currentDateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  bindEvents() {
    // Add Form Submit
    this.addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask(this.taskInput.value.trim(), this.isImportantInput);
      this.taskInput.value = '';
    });

    // Priority Toggle Button
    this.priorityToggle.addEventListener('click', () => {
      this.isImportantInput = !this.isImportantInput;
      this.priorityToggle.classList.toggle('active', this.isImportantInput);
      const icon = this.priorityToggle.querySelector('i');
      if (this.isImportantInput) {
        icon.className = 'fa-solid fa-star';
        this.prioLabel.textContent = 'Important';
      } else {
        icon.className = 'fa-regular fa-star';
        this.prioLabel.textContent = 'Normal';
      }
    });

    // Quick Routine Chips
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskText = btn.dataset.task;
        this.addTask(taskText, false);
      });
    });

    // Filter Buttons
    this.filterGroup.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
      }
    });

    // Start New Day / Reset Completed
    this.startNewDayBtn.addEventListener('click', () => {
      if (confirm("Start a new day? This will clear all completed tasks.")) {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveAndRender();
      }
    });
  }

  addTask(title, isImportant) {
    if (!title) return;

    const newTask = {
      id: Date.now().toString(),
      title,
      isImportant,
      completed: false
    };

    this.tasks.unshift(newTask);
    this.saveAndRender();
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveAndRender();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveAndRender();
  }

  saveAndRender() {
    localStorage.setItem('dailyflow_tasks', JSON.stringify(this.tasks));
    this.render();
  }

  getFilteredTasks() {
    if (this.currentFilter === 'active') return this.tasks.filter(t => !t.completed);
    if (this.currentFilter === 'completed') return this.tasks.filter(t => t.completed);
    return this.tasks;
  }

  updateProgress() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.progressTextEl.textContent = `${completed} of ${total} tasks completed today`;
    this.percentBadgeEl.textContent = `${rate}%`;
    this.progressFillEl.style.width = `${rate}%`;
  }

  render() {
    this.updateProgress();
    const filtered = this.getFilteredTasks();

    this.taskListEl.innerHTML = '';

    if (filtered.length === 0) {
      this.emptyStateEl.classList.remove('hidden');
      if (this.currentFilter === 'completed') {
        this.emptyTitleEl.textContent = 'No completed tasks yet';
        this.emptyDescEl.textContent = 'Check off tasks as you finish them during the day!';
      } else {
        this.emptyTitleEl.textContent = 'No tasks remaining!';
        this.emptyDescEl.textContent = 'Add a new task above to plan your day.';
      }
    } else {
      this.emptyStateEl.classList.add('hidden');

      filtered.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;

        card.innerHTML = `
          <div class="task-card-left">
            <div class="check-circle" data-action="toggle">
              <i class="fa-solid fa-check"></i>
            </div>
            <div class="task-title-content">
              <span class="task-title-text">${this.escapeHTML(task.title)}</span>
              ${task.isImportant ? '<i class="fa-solid fa-star star-badge" title="Important Task"></i>' : ''}
            </div>
          </div>
          <button class="btn-delete-task" data-action="delete" title="Delete Task">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        `;

        card.querySelector('[data-action="toggle"]').addEventListener('click', () => this.toggleTask(task.id));
        card.querySelector('[data-action="delete"]').addEventListener('click', () => this.deleteTask(task.id));

        this.taskListEl.appendChild(card);
      });
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DailyFlowApp();
});
