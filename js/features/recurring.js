(function () {
  "use strict";

  function daysBetween(a, b) {
    var d1 = new Date(a), d2 = new Date(b);
    d1.setHours(0,0,0,0); d2.setHours(0,0,0,0);
    return Math.floor((d2 - d1) / 86400000);
  }

  function shouldRegen(task, today) {
    if (!task.repeats) return false;
    var last = task.lastRegen || App.dateKey(task.createdAt);
    var lastDate = new Date(last + "T00:00:00");
    var nowDate = new Date(today + "T00:00:00");
    var d = daysBetween(lastDate, nowDate);
    if (task.repeats === "daily") return d >= 1;
    if (task.repeats === "weekly") return d >= 7;
    if (task.repeats === "monthly") {
      return (nowDate.getFullYear() > lastDate.getFullYear()) ||
             (nowDate.getMonth() > lastDate.getMonth() && nowDate.getFullYear() === lastDate.getFullYear());
    }
    return false;
  }

  App.processRecurring = function () {
    var today = App.dateKey(new Date());
    var regenerated = 0;
    App.state.tasks.forEach(function (t) {
      if (t.repeats && shouldRegen(t, today)) {
        t.done = false;
        delete t.completedAt;
        t.lastRegen = today;
        regenerated++;
      }
    });
    if (regenerated) App.save();
    return regenerated;
  };
})();
