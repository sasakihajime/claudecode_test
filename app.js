// Todo App with localStorage persistence

class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.initElements();
        this.attachEventListeners();
        this.render();
    }

    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.todoCount = document.getElementById('todoCount');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            archived: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    archiveTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.archived = true;
            this.saveTodos();
            this.render();
        }
    }

    unarchiveTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.archived = false;
            this.saveTodos();
            this.render();
        }
    }

    clearCompletedTodos() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed && !t.archived);
            case 'completed':
                return this.todos.filter(t => t.completed && !t.archived);
            case 'archived':
                return this.todos.filter(t => t.archived);
            default:
                return this.todos.filter(t => !t.archived);
        }
    }

    render() {
        const filteredTodos = this.getFilteredTodos();

        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '40px';
            emptyMessage.style.color = '#999';
            emptyMessage.textContent = this.currentFilter === 'all'
                ? 'タスクがありません'
                : this.currentFilter === 'active'
                    ? '未完了のタスクはありません'
                    : this.currentFilter === 'completed'
                        ? '完了済みのタスクはありません'
                        : 'アーカイブされたタスクはありません';
            this.todoList.appendChild(emptyMessage);
        } else {
            filteredTodos.forEach(todo => {
                const li = this.createTodoElement(todo);
                this.todoList.appendChild(li);
            });
        }

        this.updateStats();
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.archived ? 'archived' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.disabled = todo.archived;
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';

        if (todo.archived) {
            const unarchiveBtn = document.createElement('button');
            unarchiveBtn.className = 'unarchive-btn';
            unarchiveBtn.textContent = '復元';
            unarchiveBtn.addEventListener('click', () => this.unarchiveTodo(todo.id));
            buttonContainer.appendChild(unarchiveBtn);
        } else {
            const archiveBtn = document.createElement('button');
            archiveBtn.className = 'archive-btn';
            archiveBtn.textContent = 'アーカイブ';
            archiveBtn.addEventListener('click', () => this.archiveTodo(todo.id));
            buttonContainer.appendChild(archiveBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
        buttonContainer.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(buttonContainer);

        return li;
    }

    updateStats() {
        const activeCount = this.todos.filter(t => !t.completed && !t.archived).length;
        this.todoCount.textContent = `${activeCount} 個のタスク`;

        const completedCount = this.todos.filter(t => t.completed && !t.archived).length;
        this.clearCompleted.style.display = completedCount > 0 ? 'block' : 'none';
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
