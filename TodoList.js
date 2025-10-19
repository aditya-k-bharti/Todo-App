// ===== Theme Management =====

function initTheme(){
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme(){
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? 'light' : 'dark';

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);

  // Show toast notification for theme change
  showToast(`Switched to ${newTheme} mode`, 'info');
}

function updateThemeIcon(theme){
  const themeIcon = document.querySelector(".theme-icon");
  themeIcon.textContent = theme === "dark" ? '☀️' : '🌙';
}

// ===== Toast Notification System =====

function showToast(message, type = 'info', duration = 3000){
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animation

  setTimeout(()=>{
    toast.classList.add('show');
  }, 10);

  // Auto remove

  setTimeout(()=>{
    toast.classList.remove('show');
    setTimeout(()=>{
      if(container.contains(toast)){
        container.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// ===== State & Storage =====

const STORAGE_KEY = "todos-v1";
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

let state = {
  todos: [],
  filter: "all",
  search: ""
};

function uid(){ 
  return Math.random().toString(36).slice(2,9); 
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
  render();
}

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    state.todos = raw ? JSON.parse(raw) : [];
  } catch(e){
    console.warn("Failed to parse todos:", e);
    state.todos = [];
  }
}

// ===== Error Display =====

function showError(message){
  const input = $("newTitle");
  const originalPlaceholder = input.placeholder;

  input.style.borderColor = "var(--danger)";
  input.placeholder = message;
  input.classList.add("error");

  setTimeout(()=>{
    input.style.borderColor = '';
    input.placeholder = originalPlaceholder;
    input.classList.remove("error");
  }, 3000);
}

// ===== CRUD =====

function createTodo(title){
  const t = title.trim();
  if(!t){
    showToast("Please enter a task!", 'error');
    return;
  } 
  state.todos.unshift({ 
    id: uid(),
    title: t,
    notes: "",
    done: false,
    createdAt: Date.now()
  });
  save();
  $("#newTitle").value = "";
  showToast("Task added successfully!", 'success');
}

function toggleTodo(id){
  const t = state.todos.find(x => x.id === id);
  if(!t) return;
  t.done = !t.done;
  save();
  showToast(`Task marked as ${t.done ? 'completed' : 'active'}`, 'success');
}

function deleteTodo(id){
  state.todos = state.todos.filter(x => x.id !== id);
  save();
  showToast("Task deleted", 'info');
}

function updateTodo(id, title, notes){
  const t = state.todos.find(x => x.id === id);
  if(!t) return;
  t.title = title.trim();
  t.notes = (notes || "").trim();
  save();
  showToast("Task updated successfully!", 'success');
}

function clearCompleted(){
  const completedCount = state.todos.filter(x => x.done).length;
  state.todos = state.todos.filter(x => !x.done);
  save();
  showToast(`${completedCount} completed tasks cleared`, 'info');
}

// ===== UI Helpers =====

function formatDate(ts){
  const d = new Date(ts);
  return d.toLocaleString();
}

function filteredTodos(){
  const q = state.search.trim().toLowerCase();
  return state.todos.filter(t => {
    const matchesQ = !q || t.title.toLowerCase().includes(q) || (t.notes||"").toLowerCase().includes(q);
    const matchesF = state.filter === "all" ? true : state.filter === "active" ? !t.done : t.done;
    return matchesQ && matchesF;
  });
}

function render(){
  const list = $("#list");
  list.innerHTML = "";

  const items = filteredTodos();
  $("#empty").classList.toggle("hide", items.length > 0);

  items.forEach(t => {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = t.id;

    // left: checkbox

    const check = document.createElement("button");
    check.className = "check" + (t.done ? " done" : "");
    check.title = t.done ? "Mark as active" : "Mark as done";
    check.setAttribute("aria-pressed", t.done ? "true" : "false");
    check.addEventListener("click", () => toggleTodo(t.id));
    li.appendChild(check);

    // middle: content

    const mid = document.createElement("div");
    mid.className = "item-content";
    const title = document.createElement("div");
    title.className = "title" + (t.done ? " done" : "");
    title.textContent = t.title;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = t.notes ? t.notes : "Created " + formatDate(t.createdAt);
    mid.appendChild(title);
    mid.appendChild(meta);
    li.appendChild(mid);

    // right: actions

    const actions = document.createElement("div");
    actions.className = "actions";

    const badge = document.createElement("span");
    badge.className = "pill";
    badge.textContent = t.done ? "Done" : "Active";
    actions.appendChild(badge);

    const edit = document.createElement("button");
    edit.className = "iconbtn";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => openEdit(t.id));
    actions.appendChild(edit);

    const del = document.createElement("button");
    del.className = "iconbtn";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      const sure = confirm("Delete this task?");
      if(sure) deleteTodo(t.id);
    });
    actions.appendChild(del);

    li.appendChild(actions);
    list.appendChild(li);
  });

  // footer count

  const all = state.todos.length;
  const active = state.todos.filter(t => !t.done).length;
  $("#count").textContent = `${all} items • ${active} active`;
}

// ===== Edit dialog =====

const dlg = $("#editDialog");
let editingId = null;

function openEdit(id){
  const t = state.todos.find(x => x.id === id);
  if(!t) return;
  editingId = id;
  $("#editTitle").value = t.title;
  $("#editNotes").value = t.notes || "";
  dlg.showModal();
  $("#editTitle").focus();
}

$("#editCancel").addEventListener("click", () =>{
  dlg.close();
  showToast("Edit cancelled", 'info');
}); 

$("#editSave").addEventListener("click", () => {
  const title = $("#editTitle").value;
  const notes = $("#editNotes").value;
  if(!title.trim()){  
    showToast("Title is required", 'error');
    return; 
  }
  updateTodo(editingId, title, notes);
  dlg.close();
});

// ===== Events =====

$("#newTitle").addEventListener("keydown", e => {
  if(e.key === "Enter") createTodo(e.currentTarget.value);
});

$("#addBtn").addEventListener("click", () => {
  const val = $("#newTitle").value;
  createTodo(val);
});

$("#search").addEventListener("input", e => {
  state.search = e.currentTarget.value;
  render();
});

// Enhanced filter button handling with better visual feedback

$$(".chip").forEach(btn => {
  btn.addEventListener("click", () => {

    // Remove active class from all chips

    $$(".chip").forEach(b => b.classList.remove("active"));

    // Add active class to clicked chip

    btn.classList.add("active");
    const oldFilter = state.filter;
    state.filter = btn.dataset.filter;

    // Show toast notification for filter change

    const filterNames = {
      'all': 'All tasks',
      'active': 'Active tasks',
      'completed': 'Completed tasks'
    };

    if(oldFilter !== state.filter){
      showToast(`Showing ${filterNames[state.filter]}`, 'info');
    }
    
    render();
  });
});

$("#clearCompleted").addEventListener("click", () => {
  const completedCount = state.todos.filter(t => t.done).length;
  if(completedCount === 0){
    showToast("No completed tasks to clear", 'info');
    return;
  }
  if(confirm("Clear all completed tasks?")){
    clearCompleted();
  }
});

$("#wipe").addEventListener("click", () => {
  if(!confirm("Wipe ALL tasks? This cannot be undone.")) return;
  const taskCount = state.todos.length;
  state.todos = [];
  save();
  showToast(`${taskCount} tasks wiped`, 'info');
});

// Theme toggle

$("#themeToggle").addEventListener("click", toggleTheme);

// Import/Export (simple JSON)

$("#export").addEventListener("click", () => {
  if(state.todos.length === 0){
    showToast("No tasks to export", 'info');
    return;
  }

  const blob = new Blob([JSON.stringify(state.todos, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "todos.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("Tasks exported successfully!", 'success');
});

$("#import").addEventListener("click", async () => {
  const input = document.createElement("input");
  input.type = "file"; input.accept = "application/json";
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if(!file) return;
    try{
      const text = await file.text();
      const arr = JSON.parse(text);
      if(!Array.isArray(arr)) throw new Error("Invalid file");

      // naive merge: imported items go to top

      const importCount = arr.length;
      state.todos = [...arr, ...state.todos];
      save();
      showToast(`${importCount} tasks imported successfully!`, 'success');
    } catch(err){
      showToast("Import failed: " + err.message, 'error');
    }
  });
  input.click();
});

// ===== Init =====

document.addEventListener("DOMContentLoaded", ()=>{
  initTheme();
  load();
  render();

  // Welcome message

  setTimeout(()=>{
    showToast("Welcome to Task mate!", 'info')
  }, 500);
});