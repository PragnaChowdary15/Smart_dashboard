// -------- SELECTORS --------
const input = document.getElementById("taskInput");
const addButton = document.getElementById("addBtn");
const taskList = document.querySelector(".task-list");
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
    // Store reference to this
    const self = this;
    
    // ----- TASK LISTENERS -----
    // Add button
    addButton.addEventListener("click", function() {
      self.tasks.add();
    });
    
    // Enter key in task input - THIS IS THE FIXED VERSION
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault(); // Stop any form submission
        e.stopPropagation(); // Stop event bubbling
        self.tasks.add(); // Direct call to add task
        return false; // Extra safety
      }
    });
    
    // Search
    document.getElementById("search").addEventListener("input", function() {
      self.tasks.search(this.value);
    });
    
    // ----- NOTE LISTENERS -----
    addNoteBtn.addEventListener("click", function() {
      self.notes.add();
    });
    
    // Enter key in note input
    if (noteInput) {
      noteInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          self.notes.add();
        }
      });
    }
    
    // ----- SETTINGS LISTENERS -----
    document.getElementById("darkToggle").addEventListener("click", function() {
      self.toggleDarkMode();
    });
    
    // ----- WEATHER LISTENER -----
    document.getElementById("getWeatherBtn").addEventListener("click", function() {
      self.weather.fetch();
    });
    
    // ----- FILTER BUTTONS -----
    // These are handled by global functions showAll(), showCompleted(), showPending()
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
      console.log("Adding task..."); // Debug log
      const taskText = input.value.trim();
      if (taskText === "") {
        console.log("Empty task, not adding");
        return;
      }
      
      const taskItem = document.createElement("div");
      const priority = document.getElementById("priority").value;
      const dueDate = document.getElementById("dueDate").value;
      
      taskItem.classList.add(priority);
      
      const textSpan = document.createElement("span");
      textSpan.textContent = taskText;
      
      // Due date
      if (dueDate) {
        const dateSpan = document.createElement("small");
        dateSpan.textContent = "Due: " + dueDate;
        dateSpan.style.marginLeft = "10px";
        taskItem.appendChild(dateSpan);
        DashboardApp.tasks.checkOverdue(taskItem, dueDate);
      }
      
      // Buttons
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.style.marginLeft = "auto";
      
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌";
      
      taskItem.appendChild(textSpan);
      taskItem.appendChild(editBtn);
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
      
      console.log("Task added successfully");
    },
    
    attachTaskListeners(taskItem) {
      const textSpan = taskItem.querySelector("span");
      const buttons = taskItem.querySelectorAll("button");
      const editBtn = buttons[0];
      const deleteBtn = buttons[1];
      
      // Toggle complete
      textSpan.addEventListener("click", function() {
        textSpan.classList.toggle("completed");
        DashboardApp.storage.saveTasks();
        DashboardApp.tasks.updateStats();
        DashboardApp.tasks.updateChart();
      });
      
      // Edit
      editBtn.addEventListener("click", function() {
        const newText = prompt("Edit task:", textSpan.textContent);
        if (newText && newText.trim() !== "") {
          textSpan.textContent = newText.trim();
          DashboardApp.storage.saveTasks();
        }
      });
      
      // Delete
      deleteBtn.addEventListener("click", function() {
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
      let percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
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
      
      // Destroy existing chart
      if (window.taskChart) {
        window.taskChart.destroy();
      }
      
      // Create new chart
      window.taskChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Completed", "Pending"],
          datasets: [{
            data: [completed, pending],
            backgroundColor: ["#4caf50", "#ff6b6b"]
          }]
        },
        options: {
          plugins: {
            legend: {
              labels: { 
                color: document.body.classList.contains("dark") ? "white" : "black" 
              }
            }
          }
        }
      });
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
      
      note.addEventListener("click", function() {
        note.remove();
        DashboardApp.storage.saveNotes();
      });
      
      notesList.appendChild(note);
      noteInput.value = "";
      DashboardApp.storage.saveNotes();
    },
    
    reattachListeners() {
      document.querySelectorAll(".note-item").forEach(note => {
        note.addEventListener("click", function() {
          note.remove();
          DashboardApp.storage.saveNotes();
        });
      });
    }
  },
  
  // ===== WEATHER MANAGEMENT =====
  weather: {
    fetch() {
      const city = document.getElementById("cityInput").value.trim();
      const apiKey = "522ff9abc92b3e0a2cd462216ffb59c7";
      
      if (!city) return;
      
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`)
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
  }
}

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