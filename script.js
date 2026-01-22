// -------- SELECTORS --------
const input = document.getElementById("taskInput");
const addButton = document.getElementById("addBtn");
const taskList = document.querySelector(".task-list");

// -------- ADD TASK --------
addButton.addEventListener("click", function () {
  const taskText = input.value.trim();
  if (taskText === "") return;

  const taskItem = document.createElement("div");

  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("dueDate").value;
  taskItem.classList.add(priority);

  const textSpan = document.createElement("span");
  textSpan.textContent = taskText;

  // toggle complete
  textSpan.addEventListener("click", function () {
    textSpan.classList.toggle("completed");
    saveTasks();
    updateCount();
    updateStats();
  });

  // due date
  if (dueDate) {
    const dateSpan = document.createElement("small");
    dateSpan.textContent = "Due: " + dueDate;
    dateSpan.style.marginLeft = "10px";
    taskItem.appendChild(dateSpan);
    checkOverdue(taskItem, dueDate);
  }

  // edit
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", function () {
    const newText = prompt("Edit task:", textSpan.textContent);
    if (newText && newText.trim() !== "") {
      textSpan.textContent = newText.trim();
      saveTasks();
    }
  });

  // delete
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.addEventListener("click", function () {
    taskItem.remove();
    saveTasks();
    updateCount();
    updateStats();
  });

  taskItem.appendChild(textSpan);
  taskItem.appendChild(editBtn);
  taskItem.appendChild(deleteBtn);
  taskList.appendChild(taskItem);

  input.value = "";
  document.getElementById("dueDate").value = "";

  saveTasks();
  updateCount();
  updateStats();
});

// -------- STORAGE --------
function saveTasks() {
  localStorage.setItem("tasks", taskList.innerHTML);
}

// -------- COUNTER --------
function updateCount() {
  const total = document.querySelectorAll(".task-list div").length;
  document.getElementById("count").textContent = "Total Tasks: " + total;
}

// -------- STATS --------
function updateStats() {
  const total = document.querySelectorAll(".task-list div").length;
  const completed = document.querySelectorAll(".completed").length;
  const pending = total - completed;
  let percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById("stats").textContent =
    `Total: ${total} | Completed: ${completed} | Pending: ${pending}`;

  document.getElementById("progress").value = percent;
  
}

// -------- LOAD --------
function loadTasks() {
  taskList.innerHTML = localStorage.getItem("tasks") || "";

  document.querySelectorAll(".task-list div").forEach(taskItem => {
    const textSpan = taskItem.querySelector("span");
    const buttons = taskItem.querySelectorAll("button");
    const editBtn = buttons[0];
    const deleteBtn = buttons[1];

    const dateSpan = taskItem.querySelector("small");
    if (dateSpan) {
      const date = dateSpan.textContent.replace("Due: ", "");
      checkOverdue(taskItem, date);
    }

    textSpan.addEventListener("click", function () {
      textSpan.classList.toggle("completed");
      saveTasks();
      updateCount();
      updateStats();
    });

    deleteBtn.addEventListener("click", function () {
      taskItem.remove();
      saveTasks();
      updateCount();
      updateStats();
    });

    editBtn.addEventListener("click", function () {
      const newText = prompt("Edit task:", textSpan.textContent);
      if (newText && newText.trim() !== "") {
        textSpan.textContent = newText.trim();
        saveTasks();
      }
    });
  });

  updateCount();
  updateStats();
}
loadTasks();

// -------- ENTER KEY --------
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") addButton.click();
});

// -------- FILTERS --------
function showAll() {
  document.querySelectorAll(".task-list div").forEach(t => t.style.display = "flex");
}
function showCompleted() {
  document.querySelectorAll(".task-list div").forEach(task => {
    const isDone = task.querySelector("span").classList.contains("completed");
    task.style.display = isDone ? "flex" : "none";
  });
}
function showPending() {
  document.querySelectorAll(".task-list div").forEach(task => {
    const isDone = task.querySelector("span").classList.contains("completed");
    task.style.display = isDone ? "none" : "flex";
  });
}

// -------- OVERDUE --------
function checkOverdue(taskItem, date) {
  const today = new Date().toISOString().split("T")[0];
  if (date < today) taskItem.classList.add("overdue");
}

// -------- CLOCK --------
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// -------- DARK MODE --------
document.getElementById("darkToggle").addEventListener("click", function () {
  document.body.classList.toggle("dark");
});

// -------- SEARCH --------
document.getElementById("search").addEventListener("input", function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll(".task-list div").forEach(task => {
    const text = task.querySelector("span").textContent.toLowerCase();
    task.style.display = text.includes(value) ? "flex" : "none";
  });
});
