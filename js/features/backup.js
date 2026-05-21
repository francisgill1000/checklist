(function () {
  "use strict";

  App.exportJSON = function () {
    var data = JSON.stringify(App.state, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "checklist-backup-" + App.dateKey(new Date()) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    App.toast("Backup saved");
  };

  App.importJSON = function (file, done) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data || !data.lists || !data.tasks) throw new Error("Invalid backup");
        if (!confirm("Restore from backup? This will replace all current data.")) {
          done && done(false);
          return;
        }
        App.state = data;
        if (!App.state.activeListId) App.state.activeListId = data.lists[0].id;
        App.save();
        App.toast("Backup restored");
        done && done(true);
      } catch (err) {
        App.toast("Invalid backup file");
        done && done(false);
      }
    };
    reader.onerror = function () { App.toast("Couldn't read file"); done && done(false); };
    reader.readAsText(file);
  };
})();
