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

        // 詳細統計要素
        this.totalCountEl = document.getElementById('totalCount');
        this.activeCountEl = document.getElementById('activeCount');
        this.completedCountEl = document.getElementById('completedCount');
        this.completionRateEl = document.getElementById('completionRate');
        this.todayAddedEl = document.getElementById('todayAdded');
        this.todayCompletedEl = document.getElementById('todayCompleted');
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
            createdAt: new Date().toISOString(),
            completedAt: null
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
            todo.completedAt = todo.completed ? new Date().toISOString() : null;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
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
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
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
                    : '完了済みのタスクはありません';
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
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        return li;
    }

    updateStats() {
        const totalCount = this.todos.length;
        const activeCount = this.todos.filter(t => !t.completed).length;
        const completedCount = this.todos.filter(t => t.completed).length;
        const completionRate = totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0;

        // 今日の日付を取得（YYYY-MM-DD形式）
        const today = new Date().toISOString().split('T')[0];

        // 今日追加されたタスク数
        const todayAdded = this.todos.filter(t => {
            return t.createdAt && t.createdAt.split('T')[0] === today;
        }).length;

        // 今日完了したタスク数
        const todayCompleted = this.todos.filter(t => {
            return t.completedAt && t.completedAt.split('T')[0] === today;
        }).length;

        // 基本統計の更新
        this.todoCount.textContent = `${activeCount} 個のタスク`;

        // 詳細統計の更新（HTML要素がある場合のみ）
        if (this.totalCountEl) this.totalCountEl.textContent = totalCount;
        if (this.activeCountEl) this.activeCountEl.textContent = activeCount;
        if (this.completedCountEl) this.completedCountEl.textContent = completedCount;
        if (this.completionRateEl) this.completionRateEl.textContent = `${completionRate}%`;
        if (this.todayAddedEl) this.todayAddedEl.textContent = todayAdded;
        if (this.todayCompletedEl) this.todayCompletedEl.textContent = todayCompleted;

        this.clearCompleted.style.display = completedCount > 0 ? 'block' : 'none';
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load todos from localStorage:', error);
            return [];
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
