// -------- SELECTORS --------
const input = document.getElementById("taskInput");
const addButton = document.getElementById("addBtn");
const taskList = document.querySelector(".task-list");
<<<<<<< HEAD

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
=======
const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");

// ========== APP ORGANIZATION ==========
const DashboardApp = {
  // State
  state: {
    settings: {
      darkMode: false,
      refreshInterval: 30
    }
  },
  
  // Initialize everything
  init() {
    this.loadFromStorage();
    this.setupEventListeners();
    this.startAutoRefresh();
    this.tasks.updateStats();
    this.tasks.updateChart();
    
    // Initialize Pomodoro after dashboard loads
    setTimeout(() => {
      if (typeof PomodoroTimer !== 'undefined') {
        PomodoroTimer.init();
        watchTaskChanges();
      }
    }, 500);
    
    console.log("✅ App initialized successfully!");
  },
  
  // Load all data from localStorage
  loadFromStorage() {
    // Load settings
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      this.state.settings = JSON.parse(savedSettings);
    }
    
    // Load tasks
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      taskList.innerHTML = savedTasks;
    }
    
    // Load notes
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      notesList.innerHTML = savedNotes;
    }
    
    // Apply settings
    this.applySettings();
    
    // Reattach listeners to loaded items
    setTimeout(() => {
      this.tasks.reattachListeners();
      this.notes.reattachListeners();
    }, 100);
  },
  
  // Setup all event listeners
  setupEventListeners() {
    const self = this;
    
    // ----- TASK LISTENERS -----
    addButton.addEventListener("click", () => self.tasks.add());
    
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        self.tasks.add();
        return false;
      }
    });
    
    document.getElementById("search").addEventListener("input", (e) => {
      self.tasks.search(e.target.value);
    });
    
    // ----- NOTE LISTENERS -----
    addNoteBtn.addEventListener("click", () => self.notes.add());
    
    if (noteInput) {
      noteInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          self.notes.add();
        }
      });
    }
    
    // ----- SETTINGS LISTENERS -----
    document.getElementById("darkToggle").addEventListener("click", () => {
      self.toggleDarkMode();
    });
    
    // ----- WEATHER LISTENER -----
    document.getElementById("getWeatherBtn").addEventListener("click", () => {
      self.weather.fetch();
    });
  },
  
  // Start auto-refresh
  startAutoRefresh() {
    // Update clock every second
    setInterval(() => this.updateClock(), 1000);
    this.updateClock();
    
    // Check overdue tasks every minute
    setInterval(() => this.tasks.checkOverdueAll(), 60000);
  },
  
  // Apply settings to UI
  applySettings() {
    if (this.state.settings.darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    
    // Update settings UI if elements exist
    const darkModeSetting = document.getElementById("darkModeSetting");
    const refreshSetting = document.getElementById("refreshSetting");
    
    if (darkModeSetting) darkModeSetting.checked = this.state.settings.darkMode;
    if (refreshSetting) refreshSetting.value = this.state.settings.refreshInterval;
  },
  
  // Toggle dark mode
  toggleDarkMode() {
    this.state.settings.darkMode = !this.state.settings.darkMode;
    this.applySettings();
    this.storage.saveSettings();
  },
  
  // Update clock
  updateClock() {
    const clock = document.getElementById("clock");
    if (clock) {
      const now = new Date();
      clock.textContent = now.toLocaleTimeString();
    }
  },
  
  // ===== TASK MANAGEMENT =====
  tasks: {
    add() {
      const taskText = input.value.trim();
      if (taskText === "") {
        return;
      }
      
      const taskItem = document.createElement("div");
      const priority = document.getElementById("priority").value;
      const dueDate = document.getElementById("dueDate").value;
      
      taskItem.classList.add(priority);
      
      const textSpan = document.createElement("span");
      textSpan.textContent = taskText;
      taskItem.appendChild(textSpan);
      
      // Due date
      if (dueDate) {
        const dateSpan = document.createElement("small");
        dateSpan.textContent = "Due: " + dueDate;
        dateSpan.style.marginLeft = "10px";
        taskItem.appendChild(dateSpan);
        DashboardApp.tasks.checkOverdue(taskItem, dueDate);
      }
      
      // Edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.style.marginLeft = "auto";
      taskItem.appendChild(editBtn);
      
      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌";
      taskItem.appendChild(deleteBtn);
      
      taskList.appendChild(taskItem);
      
      // Add listeners
      DashboardApp.tasks.attachTaskListeners(taskItem);
      
      // Clear inputs
      input.value = "";
      document.getElementById("dueDate").value = "";
      
      // Save and update
      DashboardApp.storage.saveTasks();
      DashboardApp.tasks.updateStats();
      DashboardApp.tasks.updateChart();
    },
    
    attachTaskListeners(taskItem) {
      const textSpan = taskItem.querySelector("span");
      const buttons = taskItem.querySelectorAll("button");
      const editBtn = buttons[0];
      const deleteBtn = buttons[1];
      
      // Toggle complete
      textSpan.addEventListener("click", () => {
        textSpan.classList.toggle("completed");
        DashboardApp.storage.saveTasks();
        DashboardApp.tasks.updateStats();
        DashboardApp.tasks.updateChart();
      });
      
      // Edit
      editBtn.addEventListener("click", () => {
        const newText = prompt("Edit task:", textSpan.textContent);
        if (newText && newText.trim() !== "") {
          textSpan.textContent = newText.trim();
          DashboardApp.storage.saveTasks();
        }
      });
      
      // Delete
      deleteBtn.addEventListener("click", () => {
        taskItem.remove();
        DashboardApp.storage.saveTasks();
        DashboardApp.tasks.updateStats();
        DashboardApp.tasks.updateChart();
      });
    },
    
    reattachListeners() {
      document.querySelectorAll(".task-list div").forEach(task => {
        DashboardApp.tasks.attachTaskListeners(task);
      });
    },
    
    checkOverdue(taskItem, date) {
      const today = new Date().toISOString().split("T")[0];
      if (date < today) {
        taskItem.classList.add("overdue");
      }
    },
    
    checkOverdueAll() {
      document.querySelectorAll(".task-list div").forEach(task => {
        const dateSpan = task.querySelector("small");
        if (dateSpan) {
          const date = dateSpan.textContent.replace("Due: ", "");
          DashboardApp.tasks.checkOverdue(task, date);
        }
      });
    },
    
    search(searchText) {
      const value = searchText.toLowerCase();
      document.querySelectorAll(".task-list div").forEach(task => {
        const text = task.querySelector("span").textContent.toLowerCase();
        task.style.display = text.includes(value) ? "flex" : "none";
      });
    },
    
    updateStats() {
      const total = document.querySelectorAll(".task-list div").length;
      const completed = document.querySelectorAll(".completed").length;
      const pending = total - completed;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const countEl = document.getElementById("count");
      const statsEl = document.getElementById("stats");
      const progressEl = document.getElementById("progress");
      
      if (countEl) countEl.textContent = "Total Tasks: " + total;
      if (statsEl) statsEl.textContent = `Total: ${total} | Completed: ${completed} | Pending: ${pending}`;
      if (progressEl) progressEl.value = percent;
    },
    
    updateChart() {
      const ctx = document.getElementById("taskChart");
      if (!ctx) return;
      
      const total = document.querySelectorAll(".task-list div").length;
      const completed = document.querySelectorAll(".completed").length;
      const pending = total - completed;
      
      // Don't show chart if no tasks
      if (total === 0) {
        return;
      }
      
      // Destroy existing chart SAFELY
      if (window.taskChart && typeof window.taskChart.destroy === 'function') {
        window.taskChart.destroy();
      }
      
      // Create new chart
      try {
        window.taskChart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: ["✅ Completed", "⏳ Pending"],
            datasets: [{
              data: [completed, pending],
              backgroundColor: ["#85ca88", "#a11811"],
              borderColor: ["#d8ddd8", "#e3f1e7"],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: document.body.classList.contains("dark") ? "white" : "black",
                  font: {
                    size: 14,
                    weight: "bold"
                  }
                }
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "white",
                bodyColor: "white",
                padding: 10
              }
            }
          }
        });
      } catch (error) {
        console.error("Chart error:", error);
      }
    }
  },
  
  // ===== NOTES MANAGEMENT =====
  notes: {
    add() {
      const text = noteInput.value.trim();
      if (text === "") return;
      
      const note = document.createElement("div");
      note.classList.add("note-item");
      note.textContent = text;
      
      note.addEventListener("click", () => {
        note.remove();
        DashboardApp.storage.saveNotes();
      });
      
      notesList.appendChild(note);
      noteInput.value = "";
      DashboardApp.storage.saveNotes();
    },
    
    reattachListeners() {
      document.querySelectorAll(".note-item").forEach(note => {
        note.addEventListener("click", () => {
          note.remove();
          DashboardApp.storage.saveNotes();
        });
      });
    }
  },
  
  // ===== WEATHER MANAGEMENT =====
  weather: {
    apiKey: "522ff9abc92b3e0a2cd462216ffb59c7",
    
    fetch() {
      const city = document.getElementById("cityInput").value.trim();
      if (!city) return;
      
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${this.apiKey}&units=metric`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error("Weather error");
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
    }
  },
  
  // ===== STORAGE MANAGEMENT =====
  storage: {
    saveTasks() {
      localStorage.setItem("tasks", taskList.innerHTML);
    },
    
    saveNotes() {
      localStorage.setItem("notes", notesList.innerHTML);
    },
    
    saveSettings() {
      localStorage.setItem("settings", JSON.stringify(DashboardApp.state.settings));
    }
  }
};

// ========== GLOBAL FUNCTIONS (for HTML onclick) ==========
function showSection(sectionId) {
  const sections = document.querySelectorAll(".maincontent > div");
  sections.forEach(section => {
    section.style.display = "none";
  });
  
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.style.display = "block";
    
    // Update Pomodoro when showing its section
    if (sectionId === "pomodoroSection" && typeof PomodoroTimer !== 'undefined') {
      setTimeout(() => {
        PomodoroTimer.populateTaskDropdown();
      }, 100);
    }
  }
}

function showAll() {
  document.querySelectorAll(".task-list div").forEach(t => t.style.display = "flex");
}

>>>>>>> main
function showCompleted() {
  document.querySelectorAll(".task-list div").forEach(task => {
    const isDone = task.querySelector("span").classList.contains("completed");
    task.style.display = isDone ? "flex" : "none";
  });
}
<<<<<<< HEAD
=======

>>>>>>> main
function showPending() {
  document.querySelectorAll(".task-list div").forEach(task => {
    const isDone = task.querySelector("span").classList.contains("completed");
    task.style.display = isDone ? "none" : "flex";
  });
}

<<<<<<< HEAD
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
=======
function saveSettings() {
  DashboardApp.state.settings.darkMode = document.getElementById("darkModeSetting").checked;
  DashboardApp.state.settings.refreshInterval = parseInt(document.getElementById("refreshSetting").value);
  
  DashboardApp.storage.saveSettings();
  DashboardApp.applySettings();
  alert("Settings Saved!");
}

// ========== INITIALIZE THE APP ==========
// Check login first
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
} else {
  // Make sure DOM is fully loaded before initializing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => DashboardApp.init());
  } else {
    DashboardApp.init();
  }
}

// ========== PASTE POMODORO CODE HERE ==========
// ===== POMODORO TIMER =====
const PomodoroTimer = {
  // Timer state
  state: {
    mode: 'pomodoro',
    isRunning: false,
    isPaused: false,
    timeLeft: 25 * 60,
    currentTaskId: null,
    currentTaskText: '',
    interval: null,
    
    // Stats
    stats: {
      today: 0,
      week: 0,
      total: 0,
      lastReset: new Date().toDateString()
    }
  },
  
  // Timer durations (in seconds)
  durations: {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  },
  
  // Initialize timer
  init() {
    console.log("🍅 Pomodoro Timer initializing...");
    this.loadStats();
    this.updateDisplay();
    this.populateTaskDropdown();
    this.setupEventListeners();
    this.startAutoSave();
  },
  
  // Setup event listeners
  setupEventListeners() {
    const self = this;
    
    // Control buttons
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const resetBtn = document.getElementById('resetTimer');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => self.start());
      startBtn.disabled = false;
    }
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => self.pause());
      pauseBtn.disabled = true;
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => self.reset());
    }
    
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        self.switchMode(mode);
      });
    });
    
    // Task selection
    const taskSelect = document.getElementById('pomodoroTaskSelect');
    if (taskSelect) {
      taskSelect.addEventListener('change', (e) => {
        self.selectTask(e.target.value);
      });
    }
  },
  
  // Start timer
  start() {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    this.state.isPaused = false;
    
    // Update UI
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const statusEl = document.getElementById('timerStatus');
    const timerDisplay = document.querySelector('.timer-display');
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    if (statusEl) statusEl.textContent = 'Focus time! 🎯';
    if (timerDisplay) timerDisplay.classList.add('running');
    
    // Start countdown
    this.state.interval = setInterval(() => {
      this.tick();
    }, 1000);
  },
  
  // Pause timer
  pause() {
    if (!this.state.isRunning || this.state.isPaused) return;
    
    this.state.isPaused = true;
    this.state.isRunning = false;
    
    clearInterval(this.state.interval);
    
    // Update UI
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const statusEl = document.getElementById('timerStatus');
    const timerDisplay = document.querySelector('.timer-display');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (statusEl) statusEl.textContent = 'Paused ⏸️';
    if (timerDisplay) timerDisplay.classList.remove('running');
  },
  
  // Reset timer
  reset() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    
    clearInterval(this.state.interval);
    
    // Reset to current mode's duration
    this.state.timeLeft = this.durations[this.state.mode];
    this.updateDisplay();
    
    // Update UI
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const statusEl = document.getElementById('timerStatus');
    const timerDisplay = document.querySelector('.timer-display');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (statusEl) statusEl.textContent = 'Ready to focus! 🎯';
    if (timerDisplay) timerDisplay.classList.remove('running');
    
    // Update progress bar
    this.updateProgressBar();
  },
  
  // Timer tick (每秒执行)
  tick() {
    if (this.state.timeLeft <= 0) {
      this.complete();
      return;
    }
    
    this.state.timeLeft--;
    this.updateDisplay();
    this.updateProgressBar();
  },
  
  // Complete pomodoro
  complete() {
    // Play sound
    this.playNotification();
    
    // Update stats
    if (this.state.mode === 'pomodoro') {
      this.state.stats.today++;
      this.state.stats.total++;
      this.saveStats();
      this.updateStats();
      
      // Show completion message
      this.showNotification('Pomodoro completed! 🎉');
    }
    
    // Auto-switch to break
    if (this.state.mode === 'pomodoro') {
      // After 4 pomodoros, take long break
      if (this.state.stats.today % 4 === 0) {
        this.switchMode('long');
      } else {
        this.switchMode('short');
      }
    } else {
      // After break, back to pomodoro
      this.switchMode('pomodoro');
    }
    
    // Auto-start break
    this.start();
  },
  
  // Switch mode
  switchMode(mode) {
    this.state.mode = mode;
    this.state.timeLeft = this.durations[mode];
    
    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      }
    });
    
    // Update session type display
    const statusEl = document.getElementById('timerStatus');
    if (statusEl) {
      statusEl.textContent = mode === 'pomodoro' ? 'Focus time! 🎯' : 'Take a break! ☕';
    }
    
    // Reset timer
    this.reset();
  },
  
  // Select task
  selectTask(taskText) {
    if (!taskText) {
      this.state.currentTaskId = null;
      this.state.currentTaskText = '';
      document.getElementById('currentFocus').style.display = 'none';
      return;
    }
    
    this.state.currentTaskText = taskText;
    
    // Find task in DOM to get its ID/index
    const tasks = document.querySelectorAll('.task-list div span');
    tasks.forEach((task, index) => {
      if (task.textContent === taskText) {
        this.state.currentTaskId = index;
      }
    });
    
    // Show current focus
    const currentFocus = document.getElementById('currentFocus');
    const selectedTaskName = document.getElementById('selectedTaskName');
    
    if (currentFocus && selectedTaskName) {
      selectedTaskName.textContent = taskText;
      currentFocus.style.display = 'block';
    }
  },
  
  // Populate task dropdown from task list
  populateTaskDropdown() {
    const select = document.getElementById('pomodoroTaskSelect');
    if (!select) return;
    
    // Clear existing options
    select.innerHTML = '<option value="">No task selected</option>';
    
    // Add tasks from task list
    const tasks = document.querySelectorAll('.task-list div span');
    tasks.forEach(task => {
      const option = document.createElement('option');
      option.value = task.textContent;
      option.textContent = task.textContent;
      select.appendChild(option);
    });
  },
  
  // Update timer display
  updateDisplay() {
    const minutes = Math.floor(this.state.timeLeft / 60);
    const seconds = this.state.timeLeft % 60;
    
    const display = document.getElementById('timer');
    if (display) {
      display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update page title
    document.title = `(${display.textContent}) Pomodoro`;
  },
  
  // Update progress bar
  updateProgressBar() {
    const total = this.durations[this.state.mode];
    const remaining = this.state.timeLeft;
    const progress = ((total - remaining) / total) * 100;
    
    const progressBar = document.getElementById('progressFill');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  },
  
  // Update stats display
  updateStats() {
    const todayEl = document.getElementById('todayPomodoros');
    const weekEl = document.getElementById('weekPomodoros');
    const totalEl = document.getElementById('totalPomodoros');
    
    if (todayEl) todayEl.textContent = this.state.stats.today;
    if (weekEl) weekEl.textContent = this.state.stats.week;
    if (totalEl) totalEl.textContent = this.state.stats.total;
  },
  
  // Save stats to localStorage
  saveStats() {
    // Check if day changed
    const today = new Date().toDateString();
    if (today !== this.state.stats.lastReset) {
      this.state.stats.week += this.state.stats.today;
      this.state.stats.today = 0;
      this.state.stats.lastReset = today;
    }
    
    localStorage.setItem('pomodoroStats', JSON.stringify(this.state.stats));
  },
  
  // Load stats from localStorage
  loadStats() {
    const saved = localStorage.getItem('pomodoroStats');
    if (saved) {
      this.state.stats = JSON.parse(saved);
      
      // Reset today if new day
      const today = new Date().toDateString();
      if (today !== this.state.stats.lastReset) {
        this.state.stats.week += this.state.stats.today;
        this.state.stats.today = 0;
        this.state.stats.lastReset = today;
      }
    }
    this.updateStats();
  },
  
  // Play notification sound
  playNotification() {
    try {
      const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio play failed');
    }
  },
  
  // Show browser notification
  showNotification(message) {
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: message,
        icon: '🍅'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  },
  
  // Auto-save every minute
  startAutoSave() {
    setInterval(() => {
      if (this.state.isRunning) {
        this.saveStats();
      }
    }, 60000);
  }
};

// Watch for task list changes to update dropdown
function watchTaskChanges() {
  const taskList = document.querySelector('.task-list');
  if (!taskList) return;
  
  const observer = new MutationObserver(() => {
    if (typeof PomodoroTimer !== 'undefined') {
      PomodoroTimer.populateTaskDropdown();
    }
  });
  
  observer.observe(taskList, { childList: true, subtree: true });
}
>>>>>>> main
