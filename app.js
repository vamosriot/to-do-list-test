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
        const activeCountEl = document.querySelector('#activeTasks .task-count');
        const completedCountEl = document.querySelector('#completedTasks .task-count');
        if (activeCountEl) activeCountEl.textContent = `${activeTasks} tasks`;
        if (completedCountEl) completedCountEl.textContent = `${completedTasks} tasks (${Math.round((completedTasks / totalTasks) * 100) || 0}% completed)`;
    }

    renderTasks() {
        const activeTasksList = document.querySelector('#activeTasks .tasks-list');
        const completedTasksList = document.querySelector('#completedTasks .tasks-list');
        if (!activeTasksList || !completedTasksList) return;
        activeTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        let hasActive = false, hasCompleted = false;
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            if (task.isCompleted) {
                completedTasksList.appendChild(taskElement);
                hasCompleted = true;
            } else {
                activeTasksList.appendChild(taskElement);
                hasActive = true;
            }
        });
        if (!hasActive) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'No tasks yet!';
            activeTasksList.appendChild(empty);
        }
        if (!hasCompleted) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'No completed tasks yet!';
            completedTasksList.appendChild(empty);
        }
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
        if (this.modal) {
            this.modal.setAttribute('role', 'dialog');
            this.modal.setAttribute('aria-modal', 'true');
            this.modal.setAttribute('aria-labelledby', 'modalTitle');
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.addButton) {
            this.addButton.onclick = () => {
                console.log('Add Task button clicked');
                this.openModal();
            };
        } else {
            console.warn('Add Task button not found');
        }
        if (this.cancelButton) {
            this.cancelButton.onclick = () => {
                console.log('Cancel button clicked');
                this.closeModal();
            };
        } else {
            console.warn('Cancel button not found');
        }
        if (this.form) {
            this.form.onsubmit = (e) => {
                console.log('Form submitted');
                this.handleSubmit(e);
            };
        } else {
            console.warn('Task form not found');
        }
        window.onclick = (e) => {
            if (e.target === this.modal) {
                console.log('Clicked outside modal');
                this.closeModal();
            }
        };
    }

    openModal() {
        if (this.modal) this.modal.classList.add('show');
    }

    closeModal() {
        if (this.modal) this.modal.classList.remove('show');
        if (this.form) this.form.reset();
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
taskManager.renderTasks(); 
