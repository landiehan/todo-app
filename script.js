function setTheme() {
  // Set default theme based on local storage on startup
  const theme = localStorage.getItem('theme');
  document.documentElement.setAttribute('data-theme', theme ? theme: 'light');  

  // Initial theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = theme === 'light' ? 'dark' : 'light';
  });  
}

const DOM = {
  create(todo) {
    // <li class="todo-item-grid"> 
    //   <input class="rounded-checkbox-input visually-hidden" type="checkbox" id="rounded-checkbox">
    //   <label class="left circle rounded-checkbox-label" for="rounded-checkbox"></label> 

    //   <p class="center todo-desc">Jog around the park 3x</p>
    //   <button class="right cross-button"></button>
    // </li>
    const { id, desc, isCompleted } = todo;

    const li = document.createElement('li');
    li.className = 'todo-item-grid';

    const input = document.createElement('input');
    input.className = 'rounded-checkbox-input visually-hidden';
    input.type = 'checkbox';
    input.id = `rounded-checkbox-${id}`;
    input.checked = isCompleted;
    input.addEventListener('change', () => {
      // Toggle property: isCompleted
      for (let i = 0; i < TodoList.list.length; i++) {
        const todo = TodoList.list[i];
        if (todo.id === id) {
          todo.isCompleted = !todo.isCompleted;
          break;
        }
      }
    });

    const label = document.createElement('label');
    label.className = 'left circle rounded-checkbox-label';
    label.htmlFor = `rounded-checkbox-${id}`;

    const p = document.createElement('p');
    p.className = 'center todo-desc';
    p.textContent = desc;

    const button = document.createElement('button');
    button.className = 'right cross-button';
    // button.dataset.index = index;
    button.addEventListener('click', () => {
      TodoApp.delete(id);
      li.remove();
    });

    const todoList = document.querySelector('.todo-list');
    li.append(input, label, p, button);
    todoList.append(li);
  },
  updateTodoList(todoList) {
    // Clear current todo list
    const todoListElement = document.querySelector('.todo-list');
    while (todoListElement.firstChild) {
      todoListElement.firstChild.remove();
    };

    // Render lastest todos
    todoList.forEach((todo) => {
      this.create(todo);
    });

    // Update todo items number
    const itemsLeft = document.querySelector('.items-left span');
    itemsLeft.textContent = todoList.length;
  },
  addCreateHandler() {
    const createTodoInput = document.querySelector('.create-todo-input');
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const inputValue = createTodoInput.value;

        if (!inputValue) return;

        TodoApp.create(inputValue);
        createTodoInput.value = '';
      }
    });
  },
  initClearCompletedButton() {
    const clearCompletedButton = document.querySelector('[data-button="clear-completed"]');
    clearCompletedButton.addEventListener('click', () => {
      TodoList.list = TodoList.list.filter(todo => !todo.isCompleted);

      const filter = localStorage.getItem('filter');
      const filteredList = getFilteredTodoList(filter);
      this.updateTodoList(filteredList);
    });
  },
  initFilterButtons() {
    // Initial setup
    let initialFilter = localStorage.getItem('filter');
    if (!initialFilter) {
      localStorage.setItem('filter', 'all');
      initialFilter = 'all';
    }
    const initialFilterElement = document.querySelector(`[data-filter="${initialFilter}"]`);
    initialFilterElement.setAttribute('aria-current', true);

    const filteredList = getFilteredTodoList(initialFilter);
    this.updateTodoList(filteredList);

    // Set event handler
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(filterButton => {
      filterButton.addEventListener('click', () => {
        const filter = filterButton.dataset.filter;
        const currentFilter = localStorage.getItem('filter');

        if (filter === currentFilter) return;

        const currentFilterElement = document.querySelector(`[data-filter="${currentFilter}"]`);
        console.log(currentFilter, currentFilterElement);
        currentFilterElement.removeAttribute('aria-current');

        const filteredList = getFilteredTodoList(filter);
        this.updateTodoList(filteredList);

        filterButton.setAttribute('aria-current', true);
        localStorage.setItem('filter', filter);
      });
    });
  }
};

const TodoList = {
  list: [
    {
      id: 1,
      desc: 'Complete online JavaScript course',
      isCompleted: true
    },
    {
      id: 2,
      desc: 'Jog around the park 3x',
      isCompleted: false
    },
    {
      id: 3,
      desc: '10 minutes meditation',
      isCompleted: false
    }
  ],
  delete(index) {
    this.list.splice(index, 1);
  },
  create(id, desc, isCompleted = false) {
    const newTodo = { id, desc, isCompleted };
    this.list.push(newTodo);
  },
  get lastIndex() {
    return this.list.length ? this.list.length - 1 : 0;
  }
};

const TodoApp = {
  init() {
    setTheme();
    
    // Initialize DOM
    DOM.updateTodoList(TodoList.list);
    DOM.addCreateHandler();
    DOM.initClearCompletedButton(TodoList.list);
    DOM.initFilterButtons(TodoList.list);
  },
  delete(index) {
    TodoList.delete(index);
    DOM.updateTodoList(TodoList.list);
  },
  create(desc) {
    const newId = TodoList.list.length + 1;
    TodoList.create(newId, desc);
    DOM.create(TodoList.list[TodoList.lastIndex]);
    DOM.updateItemsLeft(TodoList.list);
  }
};

TodoApp.init();

function getFilteredTodoList(filter) {
  let todos;
  switch (filter) {
    case 'active':
      todos = TodoList.list.filter(todo => !todo.isCompleted);
      break;
    case 'is-completed':
      todos = TodoList.list.filter(todo => todo.isCompleted);
      break;
    default:
      todos = TodoList.list;
      break;
  }
  return todos;
}