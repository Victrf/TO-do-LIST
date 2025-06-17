// Load tasks from Local Storage
document.addEventListener("DOMContentLoaded", loadTasks);

const addBtn = document.getElementById("add-btn");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

addBtn.addEventListener("click", addTask);

function addTask() {
    const task = taskInput.value.trim();
    if (task === "") return;

    const li = createTaskElement(task);
    taskList.appendChild(li);

    saveTaskToStorage(task);
    taskInput.value = "";
}

function createTaskElement(taskText, completed = false) {
    const li = document.createElement("li");
    if (completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.textContent = taskText;
    span.addEventListener("click", () => {
        li.classList.toggle("completed");
        updateTaskStatus(taskText, li.classList.contains("completed"));
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => {
        li.remove();
        deleteTaskFromStorage(taskText);
    });
    li.setAttribute("draggable", true);

    // Drag and drop handlers
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);


    li.appendChild(span);
    li.appendChild(delBtn);

    return li;
    
}

function saveTaskToStorage(task) {
    const tasks = getTasksFromStorage();
    tasks.push({ text: task, completed: false });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function loadTasks() {
    const tasks = getTasksFromStorage();
    tasks.forEach(({ text, completed }) => {
        const li = createTaskElement(text, completed);
        taskList.appendChild(li);
    });
}

function deleteTaskFromStorage(taskText) {
    let tasks = getTasksFromStorage();
    tasks = tasks.filter((t) => t.text !== taskText);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskStatus(taskText, isCompleted) {
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex((t) => t.text === taskText);
    if (index !== -1) {
        tasks[index].completed = isCompleted;
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}


// Filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filterTasks(btn.dataset.filter);
    });
});

function filterTasks(type) {
    const listItems = document.querySelectorAll("#task-list li");

    listItems.forEach(li => {
        const isCompleted = li.classList.contains("completed");

        switch (type) {
            case "all":
                li.style.display = "flex";
                break;
            case "active":
                li.style.display = isCompleted ? "none" : "flex";
                break;
            case "completed":
                li.style.display = isCompleted ? "flex" : "none";
                break;
        }
    });
}

// Clear completed
document.getElementById("clear-completed").addEventListener("click", () => {
    const listItems = document.querySelectorAll("#task-list li.completed");
    listItems.forEach(li => {
        deleteTaskFromStorage(li.querySelector("span").textContent);
        li.remove();
    });
});
  



let dragSource = null;

function handleDragStart(e) {
    dragSource = this;
    this.style.opacity = "0.4";
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow drop
}

function handleDrop(e) {
    e.preventDefault();

    if (dragSource !== this) {
        const fromText = dragSource.querySelector("span").textContent;
        const toText = this.querySelector("span").textContent;

        const fromCompleted = dragSource.classList.contains("completed");
        const toCompleted = this.classList.contains("completed");

        // Swap DOM
        const temp = this.innerHTML;
        this.innerHTML = dragSource.innerHTML;
        dragSource.innerHTML = temp;

        // Re-bind events (since innerHTML wiped them)
        rebuildEventListeners(this);
        rebuildEventListeners(dragSource);

        // Update local storage
        reorderTasks();
    }
}

function handleDragEnd() {
    this.style.opacity = "1";
}

function rebuildEventListeners(li) {
    const span = li.querySelector("span");
    const delBtn = li.querySelector(".delete-btn");

    span.addEventListener("click", () => {
        li.classList.toggle("completed");
        updateTaskStatus(span.textContent, li.classList.contains("completed"));
    });

    delBtn.addEventListener("click", () => {
        deleteTaskFromStorage(span.textContent);
        li.remove();
    });

    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);
}

function reorderTasks() {
    const taskItems = document.querySelectorAll("#task-list li");
    const newTasks = [];

    taskItems.forEach(li => {
        const text = li.querySelector("span").textContent;
        const completed = li.classList.contains("completed");
        newTasks.push({ text, completed });
    });

    localStorage.setItem("tasks", JSON.stringify(newTasks));
}
