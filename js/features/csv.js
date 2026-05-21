(function () {
  "use strict";

  function csvCell(v) {
    v = String(v == null ? "" : v);
    if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  App.exportCSV = function () {
    var list = App.activeList();
    var tasks = App.activeTasks();
    if (!tasks.length) { App.toast("No tasks to export"); return; }
    var rows = [["List", "Task", "Priority", "Status", "Repeats", "Photos", "Subtasks (done/total)", "Created", "Completed"]];
    var pName = { 3: "High", 2: "Medium", 1: "Low" };
    tasks.forEach(function (t) {
      var created = "", completed = "";
      try { created = new Date(t.createdAt).toLocaleString(); } catch (e) {}
      try { if (t.completedAt) completed = new Date(t.completedAt).toLocaleString(); } catch (e) {}
      var sd = 0, st = 0;
      if (t.subtasks && t.subtasks.length) {
        st = t.subtasks.length;
        sd = t.subtasks.filter(function (s) { return s.done; }).length;
      }
      rows.push([
        list.name,
        t.text,
        pName[t.priority] || "",
        t.done ? "Done" : "Pending",
        t.repeats || "",
        t.images ? t.images.length : 0,
        st ? (sd + "/" + st) : "",
        created,
        completed
      ]);
    });
    var csv = rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = (list.name || "checklist").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() + "-" + App.dateKey(new Date()) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    App.toast("CSV exported");
  };
})();
