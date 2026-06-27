class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.render();
    }

    cacheElements() {
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.charCount = document.getElementById('charCount');
        this.clearBtn = document.getElementById('clearBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
    }

    attachEventListeners() {
        this.taskForm.addEventListener('submit', (e) => this.addTask(e));
        this.taskInput.addEventListener('input', (e) => this.updateCharCount(e));
        this.clearBtn.addEventListener('click', () => this.clearCompleted());
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e));
        });
    }

    addTask(e) {
        e.preventDefault();
        const text = this.taskInput.value.trim();

        if (text.length === 0) {
            this.animateShake(this.taskInput);
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.charCount.textContent = '0';
        this.render();
        this.taskInput.focus();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.render();
    }

    setFilter(e) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const completed = this.tasks.filter(task => task.completed).length;
        const active = this.tasks.length - completed;

        this.totalCount.textContent = this.tasks.length;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;

        this.clearBtn.disabled = completed === 0;
    }

    updateCharCount(e) {
        this.charCount.textContent = e.target.value.length;
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        this.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        filteredTasks.forEach(task => {
            const taskEl = this.createTaskElement(task);
            this.taskList.appendChild(taskEl);
        });
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const checkbox = document.createElement('button');
        checkbox.className = 'task-checkbox';
        checkbox.type = 'button';
        checkbox.innerHTML = `<svg viewBox="0 0 20 20" fill="none"><path d="M5 10L9 14L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        checkbox.addEventListener('click', () => this.toggleTask(task.id));

        const content = document.createElement('div');
        content.className = 'task-content';
        content.innerHTML = `
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <span class="task-time">${task.createdAt}</span>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.type = 'button';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(content);
        li.appendChild(deleteBtn);

        return li;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    animateShake(element) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'shake 0.4s ease';
        }, 10);
    }

    render() {
        this.renderTasks();
        this.updateStats();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});