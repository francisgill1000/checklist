(function () {
  "use strict";

  function open(id) { document.getElementById(id).classList.add("open"); }
  function close(id) { document.getElementById(id).classList.remove("open"); }
  App.openSheet = open;
  App.closeSheet = close;

  /* ---------------- priority sheet ---------------- */
  App.openPrioSheet = function (taskId) {
    App.prioTaskId = taskId;
    var t = App.findTask(taskId);
    var cur = (t && t.priority) || 0;
    var opts = document.querySelectorAll("#prioSheet .prio-opt");
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.toggle("sel", +opts[i].getAttribute("data-p") === cur);
    }
    open("prioSheet");
  };

  /* ---------------- date filter sheet ---------------- */
  App.openFilterSheet = function () {
    document.getElementById("fromDate").value = App.filter.from || "";
    document.getElementById("toDate").value = App.filter.to || "";
    open("dateSheet");
  };

  /* ---------------- add task sheet ---------------- */
  App.openAddSheet = function () {
    document.getElementById("taskInput").value = "";
    var pSel = document.getElementById("addPriority");
    if (pSel) pSel.value = "0";
    var rSel = document.getElementById("addRepeats");
    if (rSel) rSel.value = "";
    open("addSheet");
    setTimeout(function () { document.getElementById("taskInput").focus(); }, 60);
  };

  /* ---------------- export options sheet ---------------- */
  App.openExportSheet = function () { open("exportSheet"); };

  /* ---------------- lists sheet ---------------- */
  App.openListsSheet = function () {
    renderListsSheet();
    open("listsSheet");
  };
  function renderListsSheet() {
    var wrap = document.getElementById("listsContent");
    wrap.innerHTML = "";
    App.state.lists.forEach(function (l) {
      var n = App.tasksFor(l.id).length;
      var row = document.createElement("div");
      row.className = "list-item" + (l.id === App.state.activeListId ? " active" : "");
      row.innerHTML =
        '<span class="lswatch" style="background:' + (l.color || "#6d5ef6") + '"></span>' +
        '<span class="lname"></span>' +
        '<span class="lcount">' + n + '</span>' +
        '<span class="lactions">' +
          '<button class="icon" data-act="rename" aria-label="Rename"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
          (App.state.lists.length > 1 ? '<button class="icon" data-act="delete" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' : "") +
        '</span>';
      row.querySelector(".lname").textContent = l.name;
      row.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-act]");
        if (btn) {
          var act = btn.getAttribute("data-act");
          if (act === "rename") {
            var name = prompt("Rename list", l.name);
            if (name && name.trim()) { App.renameList(l.id, name.trim()); renderListsSheet(); App.render(); }
          } else if (act === "delete") {
            if (confirm("Delete list \"" + l.name + "\" and all its tasks?")) {
              App.deleteList(l.id);
              renderListsSheet(); App.render();
            }
          }
          return;
        }
        App.switchList(l.id);
        close("listsSheet");
        App.render();
      });
      wrap.appendChild(row);
    });
  }

  /* ---------------- settings sheet ---------------- */
  App.openSettingsSheet = function () {
    renderSettings();
    open("settingsSheet");
  };
  function renderSettings() {
    var b = App.state.branding || {};
    document.getElementById("companyName").value = b.companyName || "";
    var logoBox = document.getElementById("logoBox");
    logoBox.innerHTML = "";
    if (b.logo) {
      var img = document.createElement("img");
      img.src = b.logo;
      logoBox.appendChild(img);
    } else {
      var ph = document.createElement("div");
      ph.className = "empty-logo";
      ph.innerHTML = App.ICONS.camera;
      logoBox.appendChild(ph);
    }
    var swatches = document.getElementById("colorSwatches");
    swatches.innerHTML = "";
    App.accentPresets.forEach(function (c) {
      var b2 = document.createElement("button");
      b2.type = "button";
      b2.style.background = c;
      if (c === (App.state.branding.accent || "#6d5ef6")) b2.classList.add("active");
      b2.addEventListener("click", function () {
        App.setAccent(c);
        renderSettings();
        App.render();
      });
      swatches.appendChild(b2);
    });
  }

  /* ---------------- templates sheet ---------------- */
  App.openTemplatesSheet = function () {
    renderTemplates();
    open("templatesSheet");
  };
  function renderTemplates() {
    var wrap = document.getElementById("templatesContent");
    wrap.innerHTML = "";
    App.allTemplates().forEach(function (tpl) {
      var c = document.createElement("div");
      c.className = "tpl-card";
      c.innerHTML =
        '<div class="tpl-icon">' + tpl.icon + '</div>' +
        '<div class="tpl-meta">' +
          '<div class="tpl-name"></div>' +
          '<div class="tpl-desc"></div>' +
        '</div>';
      c.querySelector(".tpl-name").textContent = tpl.name + (tpl.custom ? " (saved)" : "");
      c.querySelector(".tpl-desc").textContent = (tpl.desc || "") + " — " + tpl.items.length + " items";
      c.addEventListener("click", function () {
        if (confirm("Add " + tpl.items.length + " items from \"" + tpl.name + "\" to the current list?")) {
          App.applyTemplate(tpl.id);
          close("templatesSheet");
          App.render();
        }
      });
      wrap.appendChild(c);
    });
  }

  /* ---------------- task detail sheet ---------------- */
  App.openTaskDetail = function (taskId) {
    App.detailTaskId = taskId;
    renderTaskDetail();
    open("taskDetailSheet");
  };
  function renderTaskDetail() {
    var t = App.findTask(App.detailTaskId);
    if (!t) { close("taskDetailSheet"); return; }
    document.getElementById("dtText").value = t.text;
    var rSel = document.getElementById("dtRepeats");
    rSel.value = t.repeats || "";
    var pSel = document.getElementById("dtPriority");
    pSel.value = String(t.priority || 0);
    renderSubtasks();
  }
  function renderSubtasks() {
    var t = App.findTask(App.detailTaskId);
    var wrap = document.getElementById("dtSubtasks");
    wrap.innerHTML = "";
    if (!t.subtasks) t.subtasks = [];
    t.subtasks.forEach(function (s) {
      var row = document.createElement("div");
      row.className = "subtask" + (s.done ? " done" : "");
      row.innerHTML =
        '<button class="scheck" type="button"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>' +
        '<span class="stext"></span>' +
        '<button class="sdel" type="button">✕</button>';
      row.querySelector(".stext").textContent = s.text;
      row.querySelector(".scheck").addEventListener("click", function () {
        App.toggleSubtask(t.id, s.id); renderSubtasks(); App.render();
      });
      row.querySelector(".sdel").addEventListener("click", function () {
        App.deleteSubtask(t.id, s.id); renderSubtasks(); App.render();
      });
      wrap.appendChild(row);
    });
    var addRow = document.createElement("div");
    addRow.className = "subtask-add";
    addRow.innerHTML = '<input id="dtSubInput" type="text" placeholder="Add a sub-step…" autocomplete="off" maxlength="120"/><button type="button" id="dtSubAdd">+</button>';
    wrap.appendChild(addRow);
    function commit() {
      var v = document.getElementById("dtSubInput").value;
      if (v.trim()) { App.addSubtask(t.id, v); renderSubtasks(); App.render(); }
    }
    document.getElementById("dtSubAdd").addEventListener("click", commit);
    document.getElementById("dtSubInput").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); commit(); } });
  }

  /* dismiss backdrop click */
  document.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("sheet-modal")) {
      e.target.classList.remove("open");
    }
  });
})();
