(function () {
  "use strict";

  var ICONS = {
    flag: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="3.6"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.4 4.4l1.4 1.4M18.2 18.2l1.4 1.4M2.5 12h2M19.5 12h2M4.4 19.6l1.4-1.4M18.2 5.8l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-9.45-9.45A1 1 0 0 0 9.36 2 10 10 0 1 0 22 14.66a1 1 0 0 0-.36-1.66z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>',
    empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14l2 2 4-4"/></svg>',
    done: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  };
  App.ICONS = ICONS;

  function hasFilter() { return !!(App.filter.from || App.filter.to); }

  function visibleForList() {
    var items = App.activeTasks();
    if (!hasFilter()) return items;
    return items.filter(function (t) {
      var k = App.dateKey(t.createdAt);
      if (App.filter.from && k < App.filter.from) return false;
      if (App.filter.to && k > App.filter.to) return false;
      return true;
    });
  }

  function emptyBox(svg, title, sub) {
    var d = document.createElement("div");
    d.className = "empty";
    d.innerHTML = '<span class="emoji">' + svg + '</span>' +
                  '<span class="et">' + title + '</span>' +
                  '<span class="es">' + sub + '</span>';
    return d;
  }

  App.renderHeader = function () {
    var b = App.state.branding || {};
    var list = App.activeList();
    var titleEl = document.getElementById("appTitle");
    var logoEl = document.getElementById("brandLogo");
    var listPillEl = document.getElementById("listPill");
    var dateEl = document.getElementById("date");

    titleEl.textContent = b.companyName || "Daily Checklist";
    if (b.logo) {
      logoEl.src = b.logo;
      logoEl.style.display = "block";
    } else {
      logoEl.style.display = "none";
    }
    listPillEl.innerHTML = '<span>' + (list.name || "Daily") + '</span>' + ICONS.chev;
    dateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric"
    });
  };

  function buildTaskLi(t) {
    var prio = t.priority || 0;
    var li = document.createElement("li");
    var cls = [];
    if (t.done) cls.push("done");
    if (prio) cls.push("p" + prio);
    li.className = cls.join(" ");

    var row = document.createElement("div");
    row.className = "task-row";

    var check = document.createElement("button");
    check.className = "check";
    check.type = "button";
    check.setAttribute("aria-label", t.done ? "Mark not done" : "Mark done");
    check.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    check.addEventListener("click", function (e) { e.stopPropagation(); App.toggleTask(t.id); App.render(); });

    var flag = document.createElement("button");
    flag.className = "flag" + (prio ? " active p" + prio : "");
    flag.type = "button";
    flag.setAttribute("aria-label", "Set priority");
    flag.innerHTML = ICONS.flag;
    flag.addEventListener("click", function (e) { e.stopPropagation(); App.openPrioSheet(t.id); });

    var textWrap = document.createElement("div");
    textWrap.style.flex = "1";
    textWrap.style.minWidth = "0";

    var span = document.createElement("div");
    span.className = "task-text";
    span.textContent = t.text;
    span.addEventListener("click", function () { App.openTaskDetail(t.id); });
    textWrap.appendChild(span);

    var badges = [];
    if (t.repeats) badges.push('<span class="task-badge">' + ICONS.repeat + t.repeats + '</span>');
    if (t.subtasks && t.subtasks.length) {
      var sd = t.subtasks.filter(function (s) { return s.done; }).length;
      badges.push('<span class="task-badge">' + sd + "/" + t.subtasks.length + ' subtasks</span>');
    }
    if (badges.length) {
      var bwrap = document.createElement("div");
      bwrap.className = "task-badges";
      bwrap.innerHTML = badges.join("");
      textWrap.appendChild(bwrap);
    }

    var media;
    if (t.images && t.images.length) {
      media = document.createElement("button");
      media.className = "thumb-btn";
      media.type = "button";
      media.setAttribute("aria-label", "View photos");
      var im = document.createElement("img");
      im.className = "thumb";
      im.src = t.images[0];
      im.alt = "";
      media.appendChild(im);
      if (t.images.length > 1) {
        var badge = document.createElement("span");
        badge.className = "thumb-badge";
        badge.textContent = t.images.length;
        media.appendChild(badge);
      }
      media.addEventListener("click", function (e) { e.stopPropagation(); App.openLightbox(t.id, 0); });
    } else {
      media = document.createElement("button");
      media.className = "attach";
      media.type = "button";
      media.setAttribute("aria-label", "Add photo");
      media.innerHTML = ICONS.camera;
      media.addEventListener("click", function (e) { e.stopPropagation(); App.pickImage(t.id); });
    }

    var del = document.createElement("button");
    del.className = "del";
    del.type = "button";
    del.setAttribute("aria-label", "Delete task");
    del.textContent = "✕";
    del.addEventListener("click", function (e) { e.stopPropagation(); App.deleteTask(t.id); App.render(); });

    row.appendChild(check);
    row.appendChild(flag);
    row.appendChild(textWrap);
    row.appendChild(media);
    row.appendChild(del);

    li.appendChild(row);
    return li;
  }

  App.render = function () {
    App.renderHeader();
    var listEl = document.getElementById("list");
    listEl.innerHTML = "";

    var dateItems = visibleForList().slice().sort(function (a, b) {
      return (b.priority || 0) - (a.priority || 0);
    });
    var filtered = hasFilter();
    var filterBtn = document.getElementById("filterBtn");
    if (filterBtn) filterBtn.classList.toggle("filter-on", filtered);

    var total = dateItems.length;
    var done = 0;
    dateItems.forEach(function (t) { if (t.done) done++; });

    var segBtns = document.querySelectorAll("#statusSeg button");
    for (var i = 0; i < segBtns.length; i++) {
      segBtns[i].classList.toggle("active", segBtns[i].getAttribute("data-s") === App.statusTab);
    }
    var pc = document.getElementById("pendCount"), dc = document.getElementById("doneCount");
    if (pc) pc.textContent = total - done;
    if (dc) dc.textContent = done;

    var listItems = dateItems.filter(function (t) {
      return App.statusTab === "completed" ? t.done : !t.done;
    });

    if (!listItems.length) {
      var box;
      if (App.statusTab === "completed") box = emptyBox(ICONS.done, "No completed tasks", "Finished tasks show up here.");
      else if (total > 0) box = emptyBox(ICONS.star, "All done!", "You've cleared everything.");
      else if (filtered) box = emptyBox(ICONS.cal, "No tasks in this range", "Try a different date.");
      else box = emptyBox(ICONS.empty, "No tasks yet", "Tap + Add or apply a template.");
      listEl.appendChild(box);
    } else {
      listItems.forEach(function (t) { listEl.appendChild(buildTaskLi(t)); });
    }

    var pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("count").textContent = done + " of " + total + " done";
    document.getElementById("pct").textContent = pct + "%";
    document.getElementById("barFill").style.width = pct + "%";
  };
})();
