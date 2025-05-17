// Task Management
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    addTask(task) {
        this.tasks.push({
            id: Date.now(),
            ...task,
            createdAt: new Date(),
            isCompleted: false
        });
        this.saveTasks();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.isCompleted = !task.isCompleted;
            this.saveTasks();
        }
    }

    updateTask(taskId, updates) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            Object.assign(task, updates);
            this.saveTasks();
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.renderTasks();
    }

    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dateText = '';
        if (date.toDateString() === today.toDateString()) {
            dateText = 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dateText = 'Tomorrow';
        } else {
            dateText = date.toLocaleDateString();
        }
        
        return `${dateText} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    }

    updateTaskCounts() {
        const activeTasks = this.tasks.filter(task => !task.isCompleted).length;
        const completedTasks = this.tasks.filter(task => task.isCompleted).length;
        const totalTasks = this.tasks.length;
        
        document.querySelector('#activeTasks .task-count').textContent = `${activeTasks} tasks`;
        document.querySelector('#completedTasks .task-count').textContent = 
            `${completedTasks} tasks (${Math.round((completedTasks / totalTasks) * 100) || 0}% completed)`;
    }

    renderTasks() {
        const activeTasksList = document.querySelector('#activeTasks .tasks-list');
        const completedTasksList = document.querySelector('#completedTasks .tasks-list');
        
        activeTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            if (task.isCompleted) {
                completedTasksList.appendChild(taskElement);
            } else {
                activeTasksList.appendChild(taskElement);
            }
        });

        this.updateTaskCounts();
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.innerHTML = `
            <div class="task-checkbox ${task.isCompleted ? 'checked' : ''}" 
                 onclick="taskManager.toggleTask(${task.id})">
                ${task.isCompleted ? '✓' : ''}
            </div>
            <div class="task-content">
                <div class="task-title ${task.isCompleted ? 'completed' : ''}">${task.title}</div>
                ${task.dueDate || task.priority || task.notes ? `
                    <div class="task-details">
                        ${task.dueDate ? `Due: ${this.formatDateTime(task.dueDate)}` : ''}
                        ${task.priority ? `<span class="task-priority">${task.priority}</span>` : ''}
                        ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
                    </div>
                ` : ''}
            </div>
            <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">🗑️</button>
        `;

        return taskDiv;
    }
}

// Modal Management
class ModalManager {
    constructor() {
        this.modal = document.getElementById('taskModal');
        this.form = document.getElementById('taskForm');
        this.addButton = document.getElementById('addTaskBtn');
        this.cancelButton = document.getElementById('cancelTask');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.addButton.onclick = () => this.openModal();
        this.cancelButton.onclick = () => this.closeModal();
        this.form.onsubmit = (e) => this.handleSubmit(e);

        // Close modal when clicking outside
        window.onclick = (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        };
    }

    openModal() {
        this.modal.classList.add('show');
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.form.reset();
    }

    handleSubmit(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('taskTitle').value,
            dueDate: document.getElementById('taskDueDate').value,
            priority: document.getElementById('taskPriority').value,
            notes: document.getElementById('taskNotes').value
        };

        taskManager.addTask(formData);
        this.closeModal();
    }
}

// Initialize
const taskManager = new TaskManager();
const modalManager = new ModalManager();

// Initial render
taskManager.renderTasks(); 
const taskManager = new TaskManager();
const modalManager = new ModalManager();

// Initial render
taskManager.renderTasks(); 
