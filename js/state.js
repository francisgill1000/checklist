window.App = window.App || {};

(function () {
  "use strict";
  var KEY_V2 = "daily-checklist-v2";
  var KEY_V1 = "daily-checklist-tasks";

  function defaultState() {
    return {
      version: 2,
      activeListId: "default",
      lists: [{ id: "default", name: "Daily", color: "#6d5ef6", createdAt: new Date().toISOString() }],
      tasks: [],
      templates: [],
      branding: { logo: null, accent: "#6d5ef6", companyName: "" }
    };
  }

  App.state = null;
  App.statusTab = "pending";
  App.filter = { from: "", to: "" };

  App.load = function () {
    try {
      var raw = localStorage.getItem(KEY_V2);
      if (raw) {
        App.state = JSON.parse(raw);
        var d = defaultState();
        if (!App.state.branding) App.state.branding = d.branding;
        if (!App.state.templates) App.state.templates = [];
        if (!App.state.lists || !App.state.lists.length) App.state.lists = d.lists;
        if (!App.state.activeListId) App.state.activeListId = App.state.lists[0].id;
        return;
      }
      App.state = defaultState();
      var v1 = localStorage.getItem(KEY_V1);
      if (v1) {
        var oldTasks = JSON.parse(v1);
        if (Array.isArray(oldTasks)) {
          oldTasks.forEach(function (t) {
            if (t.image && !t.images) { t.images = [t.image]; delete t.image; }
            t.listId = "default";
            if (!t.subtasks) t.subtasks = [];
          });
          App.state.tasks = oldTasks;
        }
      }
      App.save();
    } catch (e) {
      App.state = defaultState();
    }
  };

  App.save = function () {
    try { localStorage.setItem(KEY_V2, JSON.stringify(App.state)); return true; }
    catch (e) { App.toast && App.toast("Storage full"); return false; }
  };

  App.activeList = function () {
    var s = App.state;
    for (var i = 0; i < s.lists.length; i++) if (s.lists[i].id === s.activeListId) return s.lists[i];
    return s.lists[0];
  };
  App.tasksFor = function (listId) {
    return App.state.tasks.filter(function (t) { return t.listId === listId; });
  };
  App.activeTasks = function () { return App.tasksFor(App.state.activeListId); };

  App.createList = function (name, color) {
    var id = "l-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    App.state.lists.push({ id: id, name: name || "Untitled", color: color || "#6d5ef6", createdAt: new Date().toISOString() });
    App.state.activeListId = id;
    App.save();
    return id;
  };
  App.deleteList = function (id) {
    if (App.state.lists.length <= 1) return false;
    App.state.lists = App.state.lists.filter(function (l) { return l.id !== id; });
    App.state.tasks = App.state.tasks.filter(function (t) { return t.listId !== id; });
    if (App.state.activeListId === id) App.state.activeListId = App.state.lists[0].id;
    App.save();
    return true;
  };
  App.renameList = function (id, name) {
    var l = App.state.lists.find(function (l) { return l.id === id; });
    if (l) { l.name = name; App.save(); }
  };
  App.switchList = function (id) { App.state.activeListId = id; App.save(); };

  App.findTask = function (id) {
    for (var i = 0; i < App.state.tasks.length; i++) if (App.state.tasks[i].id === id) return App.state.tasks[i];
    return null;
  };
  App.addTask = function (text, opts) {
    text = (text || "").trim();
    if (!text) return null;
    opts = opts || {};
    var task = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      listId: App.state.activeListId,
      text: text,
      done: false,
      createdAt: new Date().toISOString(),
      subtasks: []
    };
    if (opts.priority) task.priority = opts.priority;
    if (opts.repeats) task.repeats = opts.repeats;
    App.state.tasks.push(task);
    App.save();
    return task;
  };
  App.toggleTask = function (id) {
    var t = App.findTask(id);
    if (!t) return;
    t.done = !t.done;
    if (t.done) t.completedAt = new Date().toISOString(); else delete t.completedAt;
    App.save();
  };
  App.deleteTask = function (id) {
    App.state.tasks = App.state.tasks.filter(function (t) { return t.id !== id; });
    App.save();
  };
  App.setPriority = function (id, p) {
    var t = App.findTask(id);
    if (!t) return;
    if (p) t.priority = p; else delete t.priority;
    App.save();
  };
  App.setRecurring = function (id, repeats) {
    var t = App.findTask(id);
    if (!t) return;
    if (repeats) t.repeats = repeats; else delete t.repeats;
    App.save();
  };
  App.updateTaskText = function (id, text) {
    var t = App.findTask(id);
    if (!t) return;
    t.text = String(text || "").trim();
    App.save();
  };

  App.addSubtask = function (taskId, text) {
    var t = App.findTask(taskId);
    if (!t) return;
    text = (text || "").trim();
    if (!text) return;
    if (!t.subtasks) t.subtasks = [];
    t.subtasks.push({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 5), text: text, done: false });
    App.save();
  };
  App.toggleSubtask = function (taskId, subId) {
    var t = App.findTask(taskId);
    if (!t || !t.subtasks) return;
    for (var i = 0; i < t.subtasks.length; i++) {
      if (t.subtasks[i].id === subId) { t.subtasks[i].done = !t.subtasks[i].done; break; }
    }
    App.save();
  };
  App.deleteSubtask = function (taskId, subId) {
    var t = App.findTask(taskId);
    if (!t || !t.subtasks) return;
    t.subtasks = t.subtasks.filter(function (x) { return x.id !== subId; });
    App.save();
  };

  App.addImageToTask = function (id, dataUrl) {
    var t = App.findTask(id);
    if (!t) return false;
    if (!t.images) t.images = [];
    t.images.push(dataUrl);
    if (!App.save()) {
      t.images.pop();
      if (!t.images.length) delete t.images;
      App.save();
      return false;
    }
    return true;
  };
  App.removeImageAt = function (id, index) {
    var t = App.findTask(id);
    if (!t || !t.images) return;
    t.images.splice(index, 1);
    if (!t.images.length) delete t.images;
    App.save();
  };

  App.dateKey = function (d) {
    var dt = new Date(d);
    var m = ("0" + (dt.getMonth() + 1)).slice(-2);
    var day = ("0" + dt.getDate()).slice(-2);
    return dt.getFullYear() + "-" + m + "-" + day;
  };

  App.toast = function (msg) {
    var el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 1800);
  };
})();
