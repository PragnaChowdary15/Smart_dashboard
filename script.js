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
input.addEventListener("keydown", function (e) {
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

// -------- WEATHER --------
document.getElementById("getWeatherBtn").addEventListener("click", function () {

  const city = document.getElementById("cityInput").value.trim();
  const apiKey = "522ff9abc92b3e0a2cd462216ffb59c7";

  if (!city) return;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Weather error");
      }
      return response.json();
    })
    .then(data => {

      const icon = data.weather[0].icon;

      document.getElementById("weatherResult").innerHTML =
        `<b>${data.name}</b><br>
         <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
         <br>🌡 ${data.main.temp}°C
         <br>${data.weather[0].main}`;

    })
    .catch(() => {
      document.getElementById("weatherResult").textContent =
        "Weather not available (API key or city issue)";
    });

});
function showSection(sectionId) {

    // Select ALL sections inside maincontent
    const sections = document.querySelectorAll(".maincontent > div");

    // Hide all sections
    sections.forEach(section => {
        section.style.display = "none";
    });

    // Show only the clicked section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = "block";
    }
}

//notes feature
const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");

// add note
addNoteBtn.addEventListener("click", function(){

  const text = noteInput.value.trim();
  if(text === "") return;

  const note = document.createElement("div");
  note.classList.add("note-item");

  note.textContent = text;

  // delete on click
  note.addEventListener("click", function(){
    note.remove();
    saveNotes();
  });

  notesList.appendChild(note);

  noteInput.value = "";

  saveNotes();
});

// save notes
function saveNotes(){
  localStorage.setItem("notes", notesList.innerHTML);
}

// load notes
function loadNotes(){

  notesList.innerHTML = localStorage.getItem("notes") || "";

  document.querySelectorAll(".note-item").forEach(note => {
    note.addEventListener("click", function(){
      note.remove();
      saveNotes();
    });
  });
}

loadNotes();

let chart;

function updateChart(){

  const total = document.querySelectorAll(".task-list div").length;
  const completed = document.querySelectorAll(".completed").length;
  const pending = total - completed;

  const ctx = document.getElementById("taskChart");

  if(!ctx) return; // safety

  if(chart){
    chart.destroy();
  }

  chart = new Chart(ctx,{
    type:"pie",
    data:{
      labels:["Completed","Pending"],
      datasets:[{
        data:[completed,pending],
        backgroundColor:["#4caf50","#ff6b6b"]
      }]
    },
    options:{
      plugins:{
        legend:{
          labels:{color:"black"}
        }
      }
    }  
  });
}
updateChart();

//login check
if(localStorage.getItem("isLoggedIn")!== "true")
{
  window.location.href = "login.html";
}
//login button
document.getElementById("loginBtn").addEventListener("click", function(){
   console.log("clicked");   // 👈 test
});

// ================= SETTINGS SYSTEM =================

let settings = {
  darkMode: false,
  refreshInterval: 30
};

// LOAD SETTINGS WHEN PAGE STARTS
window.addEventListener("load", () => {
  const saved = localStorage.getItem("settings");

  if(saved){
    settings = JSON.parse(saved);
  }

  applySettings();
  loadSettingsUI();
});

// APPLY SETTINGS TO DASHBOARD
function applySettings(){

  if(settings.darkMode){
    document.body.classList.add("dark");
  }else{
    document.body.classList.remove("dark");
  }

}

// LOAD VALUES INTO SETTINGS PAGE
function loadSettingsUI(){
  document.getElementById("darkModeSetting").checked = settings.darkMode;
  document.getElementById("refreshSetting").value = settings.refreshInterval;
}

// SAVE BUTTON
function saveSettings(){

  settings.darkMode = document.getElementById("darkModeSetting").checked;
  settings.refreshInterval = document.getElementById("refreshSetting").value;

  localStorage.setItem("settings", JSON.stringify(settings));

  applySettings();

  alert("Settings Saved!");
}