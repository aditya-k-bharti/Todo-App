# ✅ Task Mate
 
> A clean, feature-rich to-do list app built with vanilla HTML, CSS, and JavaScript — with dark mode, localStorage persistence, import/export, and smooth toast notifications.
 
**Live Demo → [adityakbharti-task-mate.netlify.app](https://adityakbharti-task-mate.netlify.app)**
 
---
 
## ✨ Features
 
- ➕ **Add, edit, delete tasks** — with optional notes per task
- ✅ **Mark tasks as done** — toggle completion with a single click
- 🔍 **Search & filter** — find tasks instantly; filter by All / Active / Completed
- 🌙 **Dark / Light mode** — persistent theme toggle saved to `localStorage`
- 💾 **Persistent storage** — all tasks saved in `localStorage`, survive page refresh
- 📤 **Export tasks** — download your tasks as a `.json` file
- 📥 **Import tasks** — load tasks back from a `.json` file
- 🗑️ **Clear completed / Wipe all** — bulk task management with confirmation dialogs
- 🔔 **Toast notifications** — smooth, animated feedback for every action
- 📱 **Fully responsive** — works great on mobile and desktop
---
 
## 🗂️ Project Structure
 
```
TaskMate/
├── index.html       # App shell — layout, dialogs, toast container
├── TodoList.css     # Full styling — light/dark themes, responsive layout
├── TodoList.js      # All app logic — CRUD, filters, import/export, theme
└── Todo.png         # App logo / favicon
```
 
---
 
## 🛠️ Tech Stack
 
| Technology | Usage |
|---|---|
| HTML5 | App structure & semantic markup |
| CSS3 | Custom light/dark theming, animations |
| JavaScript (ES6+) | App logic, state management |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | UI icons throughout |
| `localStorage` | Task persistence & theme preference |
 
---
 
## 🚀 Run Locally
 
No build tools needed — pure vanilla project.
 
```bash
git clone https://github.com/aditya-k-bharti/TaskMate.git
cd TaskMate
```
 
Then open `index.html` in your browser, or use a local server:
 
```bash
# With VS Code → Live Server extension (recommended)
# OR with Python
python -m http.server 8000
```
 
---
 
## 📸 Pages
 
| File | Description |
|---|---|
| `index.html` | Main app — task list, filters, header, footer |
| `TodoList.js` | All logic — state, render, CRUD, dialogs, toasts |
| `TodoList.css` | Theming — CSS variables for light/dark, responsive styles |
 
---
 
## 🙌 Author
 
**Aditya Kumar Bharti**
 
[![GitHub](https://img.shields.io/badge/GitHub-aditya--k--bharti-181717?style=flat&logo=github)](https://github.com/aditya-k-bharti)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aditya--kumar--bharti-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/aditya-kumar-bharti-dev-6214b6354)
 
---
 
## 📄 License
 
MIT License — feel free to fork, modify, and use.
