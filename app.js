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

    renderTasks() {
        const activeTasks = document.getElementById('activeTasks');
        const completedTasks = document.getElementById('completedTasks');
        
        activeTasks.innerHTML = '';
        completedTasks.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            if (task.isCompleted) {
                completedTasks.appendChild(taskElement);
            } else {
                activeTasks.appendChild(taskElement);
            }
        });
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
                <div class="task-details">
                    ${task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
            </div>
        `;

        // Add delete functionality
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => this.deleteTask(task.id);
        taskDiv.appendChild(deleteBtn);

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