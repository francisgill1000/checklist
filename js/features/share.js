(function () {
  "use strict";

  function buildSummary() {
    var list = App.activeList();
    var tasks = App.activeTasks();
    var done = tasks.filter(function (t) { return t.done; });
    var pending = tasks.filter(function (t) { return !t.done; });
    var brand = App.state.branding || {};
    var header = (brand.companyName ? brand.companyName + " — " : "") + list.name;
    var lines = [];
    lines.push("*" + header + "*");
    lines.push(new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    lines.push("");
    lines.push("Progress: " + done.length + " / " + tasks.length);
    lines.push("");
    if (done.length) {
      lines.push("✅ *Completed*");
      done.forEach(function (t) { lines.push("• " + t.text); });
      lines.push("");
    }
    if (pending.length) {
      lines.push("⏳ *Pending*");
      pending.forEach(function (t) {
        var p = "";
        if (t.priority === 3) p = " 🔴";
        else if (t.priority === 2) p = " 🟠";
        else if (t.priority === 1) p = " 🔵";
        lines.push("• " + t.text + p);
      });
    }
    return lines.join("\n");
  }

  App.shareWhatsApp = function () {
    if (!App.activeTasks().length) { App.toast("No tasks to share"); return; }
    var text = encodeURIComponent(buildSummary());
    var url = "https://wa.me/?text=" + text;
    window.open(url, "_blank");
  };

  App.shareGeneric = function () {
    var summary = buildSummary();
    if (navigator.share) {
      navigator.share({ title: App.activeList().name, text: summary }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(function () { App.toast("Copied to clipboard"); });
    } else {
      App.toast("Sharing not supported");
    }
  };
})();
