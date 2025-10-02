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

// ===== CRUD =====

function createTodo(title){
  const t = title.trim();
  if(!t) return;
  state.todos.unshift({ 
    id: uid(),
    title: t,
    notes: "",
    done: false,
    createdAt: Date.now() 
  });
  save();
  $("#newTitle").value = "";
}

function toggleTodo(id){
  const t = state.todos.find(x => x.id === id);
  if(!t) return;
  t.done = !t.done;
  save();
}

function deleteTodo(id){
  state.todos = state.todos.filter(x => x.id !== id);
  save();
}

function updateTodo(id, title, notes){
  const t = state.todos.find(x => x.id === id);
  if(!t) return;
  t.title = title.trim();
  t.notes = (notes || "").trim();
  save();
}

function clearCompleted(){
  state.todos = state.todos.filter(x => !x.done);
  save();
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

$("#editCancel").addEventListener("click", () => dlg.close());

$("#editSave").addEventListener("click", () => {
  const title = $("#editTitle").value;
  const notes = $("#editNotes").value;
  if(!title.trim()){ alert("Title is required"); return; }
  updateTodo(editingId, title, notes);
  dlg.close();
});

// ===== Events =====

$("#newTitle").addEventListener("keydown", e => {
  if(e.key === "Enter") createTodo(e.currentTarget.value);
});

$("#addBtn").addEventListener("click", () => {
  const val = $("#newTitle").value;
  if(val.trim()){
    createTodo(val);
  }
});

$("#search").addEventListener("input", e => {
  state.search = e.currentTarget.value;
  render();
});

$$(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    render();
  });
});

$("#clearCompleted").addEventListener("click", () => {
  if(confirm("Clear all completed tasks?")) clearCompleted();
});

$("#wipe").addEventListener("click", () => {
  if(!confirm("Wipe ALL tasks? This cannot be undone.")) return;
  state.todos = [];
  save();
});

// Import/Export (simple JSON)

$("#export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state.todos, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "todos.json"; a.click();
  URL.revokeObjectURL(url);
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

      state.todos = [...arr, ...state.todos];
      save();
      alert("Imported!");
    } catch(err){
      alert("Import failed: " + err.message);
    }
  });
  input.click();
});

// ===== Init =====

load();
render();