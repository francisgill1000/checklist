(function () {
  "use strict";

  var KEY_THEME = "daily-checklist-theme";

  function isDark() { return document.documentElement.getAttribute("data-theme") === "dark"; }
  function syncThemeUI() {
    document.getElementById("themeToggle").innerHTML = isDark() ? App.ICONS.sun : App.ICONS.moon;
  }

  /* ---------------- photo attachment + lightbox ---------------- */
  var fileInput, lightbox, lightboxImg, lbCounter, lbPrev, lbNext;
  var attachId = null, viewId = null, viewIndex = 0;

  function compressImage(file, maxDim, quality, cb) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = function () { cb(null); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  App.pickImage = function (id) {
    attachId = id;
    fileInput.value = "";
    fileInput.click();
  };
  App.openLightbox = function (id, index) {
    var t = App.findTask(id);
    if (!t || !t.images || !t.images.length) return;
    viewId = id; viewIndex = index || 0;
    renderLightbox();
    lightbox.classList.add("open");
  };
  function renderLightbox() {
    var t = App.findTask(viewId);
    if (!t || !t.images || !t.images.length) { closeLightbox(); return; }
    if (viewIndex < 0) viewIndex = 0;
    if (viewIndex > t.images.length - 1) viewIndex = t.images.length - 1;
    lightboxImg.src = t.images[viewIndex];
    lbCounter.textContent = (viewIndex + 1) + " / " + t.images.length;
    var multi = t.images.length > 1;
    lbPrev.style.display = multi ? "" : "none";
    lbNext.style.display = multi ? "" : "none";
  }
  function closeLightbox() { lightbox.classList.remove("open"); viewId = null; }
  function step(dir) {
    var t = App.findTask(viewId);
    if (!t || !t.images) return;
    var n = t.images.length;
    viewIndex = (viewIndex + dir + n) % n;
    renderLightbox();
  }

  /* ---------------- wiring ---------------- */
  function wire() {
    fileInput = document.getElementById("fileInput");
    lightbox = document.getElementById("lightbox");
    lightboxImg = document.getElementById("lightboxImg");
    lbCounter = document.getElementById("lbCounter");
    lbPrev = document.getElementById("lbPrev");
    lbNext = document.getElementById("lbNext");

    /* theme */
    var toggleEl = document.getElementById("themeToggle");
    toggleEl.addEventListener("click", function () {
      var dark = !isDark();
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
      try { localStorage.setItem(KEY_THEME, dark ? "dark" : "light"); } catch (e) {}
      syncThemeUI();
    });

    /* footer */
    document.getElementById("exportBtn").addEventListener("click", App.openExportSheet);
    document.getElementById("filterBtn").addEventListener("click", App.openFilterSheet);
    document.getElementById("addBtn").addEventListener("click", App.openAddSheet);

    /* hero */
    document.getElementById("listPill").addEventListener("click", App.openListsSheet);
    document.getElementById("menuBtn").addEventListener("click", App.openSettingsSheet);

    /* add form */
    document.getElementById("addForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var text = document.getElementById("taskInput").value;
      var p = +document.getElementById("addPriority").getAttribute("data-value") || 0;
      var r = document.getElementById("addRepeats").getAttribute("data-value") || null;
      var task = App.addTask(text, { priority: p, repeats: r });
      if (task) {
        App.statusTab = "pending";
        document.getElementById("taskInput").value = "";
        App.closeSheet("addSheet");
        App.render();
      }
    });

    /* priority sheet */
    document.getElementById("prioSheet").addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest(".prio-opt");
      if (btn && App.prioTaskId != null) {
        App.setPriority(App.prioTaskId, +btn.getAttribute("data-p"));
        App.closeSheet("prioSheet");
        App.render();
      }
    });

    /* filter / status segmented */
    document.getElementById("fromDate").addEventListener("change", function (e) {
      App.filter.from = e.target.value;
    });
    document.getElementById("toDate").addEventListener("change", function (e) {
      App.filter.to = e.target.value;
    });
    document.getElementById("allBtn").addEventListener("click", function () {
      App.filter.from = ""; App.filter.to = "";
      document.getElementById("fromDate").value = "";
      document.getElementById("toDate").value = "";
      App.render();
      App.closeSheet("dateSheet");
    });
    document.getElementById("applyDateBtn").addEventListener("click", function () {
      App.render(); App.closeSheet("dateSheet");
    });
    document.getElementById("statusSeg").addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("button[data-s]");
      if (!btn) return;
      App.statusTab = btn.getAttribute("data-s");
      App.render();
    });

    /* export sheet options */
    document.getElementById("expPDF").addEventListener("click", function () { App.closeSheet("exportSheet"); setTimeout(App.exportPDF, 60); });
    document.getElementById("expCSV").addEventListener("click", function () { App.closeSheet("exportSheet"); setTimeout(App.exportCSV, 60); });
    document.getElementById("expWA").addEventListener("click", function () { App.closeSheet("exportSheet"); setTimeout(App.shareWhatsApp, 60); });
    document.getElementById("expShare").addEventListener("click", function () { App.closeSheet("exportSheet"); setTimeout(App.shareGeneric, 60); });
    document.getElementById("expPrint").addEventListener("click", function () { App.closeSheet("exportSheet"); setTimeout(function () { window.print(); }, 100); });
    document.getElementById("expJSON").addEventListener("click", function () { App.closeSheet("exportSheet"); setTimeout(App.exportJSON, 60); });
    document.getElementById("expRestore").addEventListener("click", function () {
      var inp = document.getElementById("restoreInput");
      inp.value = "";
      inp.click();
    });
    document.getElementById("restoreInput").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) App.importJSON(f, function (ok) { if (ok) { App.closeSheet("exportSheet"); App.applyBranding(); App.render(); } });
    });

    /* lists sheet */
    document.getElementById("createListBtn").addEventListener("click", function () {
      var name = document.getElementById("newListName").value;
      if (name && name.trim()) {
        App.createList(name.trim());
        document.getElementById("newListName").value = "";
        App.closeSheet("listsSheet");
        App.render();
      }
    });
    document.getElementById("newListName").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); document.getElementById("createListBtn").click(); }
    });

    /* settings sheet */
    document.getElementById("logoUpload").addEventListener("click", function () {
      document.getElementById("logoFile").click();
    });
    document.getElementById("logoRemove").addEventListener("click", function () {
      App.removeLogo(); App.openSettingsSheet();
    });
    document.getElementById("logoFile").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) App.setLogo(f, function () { App.openSettingsSheet(); App.render(); });
    });
    document.getElementById("companyName").addEventListener("input", function (e) {
      App.setCompanyName(e.target.value);
      App.renderHeader();
    });
    document.getElementById("openTemplatesBtn").addEventListener("click", function () {
      App.closeSheet("settingsSheet"); setTimeout(App.openTemplatesSheet, 100);
    });
    document.getElementById("saveTemplateBtn").addEventListener("click", function () {
      var name = prompt("Save current list as template — name:");
      if (name && name.trim()) App.saveCurrentAsTemplate(name.trim());
    });

    /* task detail sheet */
    document.getElementById("dtText").addEventListener("input", function (e) {
      App.updateTaskText(App.detailTaskId, e.target.value);
    });
    document.getElementById("dtText").addEventListener("blur", function () { App.render(); });
    document.getElementById("dtAddPhoto").addEventListener("click", function () {
      App.pickImage(App.detailTaskId);
    });
    document.getElementById("dtDelete").addEventListener("click", function () {
      if (confirm("Delete this task?")) {
        App.deleteTask(App.detailTaskId);
        App.closeSheet("taskDetailSheet");
        App.render();
      }
    });

    /* file input for photos */
    fileInput.addEventListener("change", function () {
      var files = fileInput.files;
      if (!files || !files.length || attachId == null) return;
      var id = attachId;
      attachId = null;
      var list = Array.prototype.slice.call(files);
      (function next(i) {
        if (i >= list.length) {
          App.render();
          if (lightbox.classList.contains("open")) renderLightbox();
          var dtSheet = document.getElementById("taskDetailSheet");
          if (dtSheet.classList.contains("open")) {
            // no-op: detail sheet doesn't show photos directly
          }
          return;
        }
        compressImage(list[i], 1000, 0.7, function (dataUrl) {
          if (dataUrl) { if (!App.addImageToTask(id, dataUrl)) { App.render(); return; } }
          next(i + 1);
        });
      })(0);
    });

    /* lightbox */
    lbPrev.addEventListener("click", function () { step(-1); });
    lbNext.addEventListener("click", function () { step(1); });
    document.getElementById("lbAdd").addEventListener("click", function () { if (viewId != null) App.pickImage(viewId); });
    document.getElementById("lbClose").addEventListener("click", closeLightbox);
    document.getElementById("lbRemove").addEventListener("click", function () {
      App.removeImageAt(viewId, viewIndex);
      App.render();
      var t = App.findTask(viewId);
      if (!t || !t.images || !t.images.length) closeLightbox(); else renderLightbox();
    });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
  }

  /* boot */
  document.addEventListener("DOMContentLoaded", function () {
    App.load();
    App.applyBranding();
    var regenerated = App.processRecurring();
    syncThemeUI();
    wire();
    App.render();
    if (regenerated) App.toast(regenerated + " recurring task" + (regenerated === 1 ? "" : "s") + " reset");
  });
})();
