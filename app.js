// Database setup
const db = new Dexie('GetItDoneDB');

// Define the database schema
db.version(1).stores({
    tasks: '++id, title, dueDate, notes, isCompleted, createdAt'
});

// Task Management
class TaskManager {
    constructor() {
        this.tasks = [];
        this.loadTasks();
    }

    async loadTasks() {
        try {
            this.tasks = await db.tasks.toArray();
            this.renderTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async addTask(task) {
        try {
            const newTask = {
                ...task,
                createdAt: new Date(),
                isCompleted: false
            };
            const id = await db.tasks.add(newTask);
            newTask.id = id;
            this.tasks.push(newTask);
            this.renderTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    async deleteTask(taskId) {
        try {
            await db.tasks.delete(taskId);
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.renderTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    async toggleTask(taskId) {
        try {
            const task = this.tasks.find(task => task.id === taskId);
            if (task) {
                task.isCompleted = !task.isCompleted;
                await db.tasks.update(taskId, { isCompleted: task.isCompleted });
                this.renderTasks();
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    }

    async updateTask(taskId, updates) {
        try {
            const task = this.tasks.find(task => task.id === taskId);
            if (task) {
                Object.assign(task, updates);
                await db.tasks.update(taskId, updates);
                this.renderTasks();
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
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
            <div class="task-checkbox ${task.isCompleted ? 'checked' : ''}">
                ${task.isCompleted ? '✓' : ''}
            </div>
            <div class="task-content">
                <div class="task-title ${task.isCompleted ? 'completed' : ''}">${task.title}</div>
                ${task.dueDate || task.notes ? `
                    <div class="task-details">
                        ${task.dueDate ? `Due: ${this.formatDateTime(task.dueDate)}` : ''}
                        ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
                    </div>
                ` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            </div>
        `;

        // Add event listeners
        const checkbox = taskDiv.querySelector('.task-checkbox');
        checkbox.addEventListener('click', () => this.toggleTask(task.id));

        const editBtn = taskDiv.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => modalManager.openModal(task.id));

        const deleteBtn = taskDiv.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

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
        this.currentTaskId = null;

        // Check for required elements
        if (!this.modal) {
            console.error('Modal element not found. Make sure element with id="taskModal" exists.');
            return;
        }

        if (!this.form) {
            console.error('Form element not found. Make sure element with id="taskForm" exists.');
            return;
        }

        // Set up modal attributes
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-labelledby', 'modalTitle');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add task button
        if (this.addButton) {
            this.addButton.onclick = () => {
                this.currentTaskId = null;
                this.openModal();
            };
        } else {
            console.warn('Add Task button not found. Make sure element with id="addTaskBtn" exists.');
        }

        // Cancel button
        if (this.cancelButton) {
            this.cancelButton.onclick = () => this.closeModal();
        } else {
            console.warn('Cancel button not found. Make sure element with id="cancelTask" exists.');
        }

        // Form submission
        if (this.form) {
            this.form.onsubmit = (e) => this.handleSubmit(e);
        }

        // Click outside modal to close
        window.onclick = (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        };
    }

    openModal(taskId = null) {
        this.currentTaskId = taskId;
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = taskId ? 'Edit Task' : 'Add New Task';
        }
        
        if (taskId) {
            const task = taskManager.tasks.find(t => t.id === taskId);
            if (task) {
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDueDate').value = task.dueDate || '';
                document.getElementById('taskNotes').value = task.notes || '';
            }
        } else {
            this.form.reset();
        }
        
        if (this.modal) this.modal.classList.add('show');
    }

    closeModal() {
        if (this.modal) this.modal.classList.remove('show');
        if (this.form) this.form.reset();
        this.currentTaskId = null;
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = {
            title: document.getElementById('taskTitle').value,
            dueDate: document.getElementById('taskDueDate').value,
            notes: document.getElementById('taskNotes').value
        };

        if (this.currentTaskId) {
            taskManager.updateTask(this.currentTaskId, formData);
        } else {
            taskManager.addTask(formData);
        }
        
        this.closeModal();
    }
} 
        this.closeModal();
    }
} 
