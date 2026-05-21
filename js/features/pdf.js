(function () {
  "use strict";

  App.exportPDF = function () {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      App.toast("PDF library not loaded");
      return;
    }
    var jsPDF = window.jspdf.jsPDF;
    var list = App.activeList();
    var tasks = App.activeTasks();
    if (!tasks.length) { App.toast("No tasks to export"); return; }

    var doc = new jsPDF({ unit: "mm", format: "a4" });
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var margin = 14;
    var y = margin;

    var b = App.state.branding || {};
    var accent = b.accent || "#6d5ef6";

    function hexToRgb(hex) {
      hex = (hex || "#6d5ef6").replace("#", "");
      if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
      return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
    }
    var rgb = hexToRgb(accent);

    // header band
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(0, 0, pageW, 28, "F");

    // logo if present
    if (b.logo) {
      try { doc.addImage(b.logo, "PNG", margin, 6, 16, 16); } catch (e) {}
    }
    var titleX = b.logo ? (margin + 20) : margin;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(b.companyName || "Daily Checklist", titleX, 13);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(list.name + " — " + new Date().toLocaleDateString(), titleX, 20);

    // counters
    var doneN = tasks.filter(function (t) { return t.done; }).length;
    var totalN = tasks.length;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(doneN + " / " + totalN + " done", pageW - margin, 16, { align: "right" });

    y = 38;
    doc.setTextColor(30, 30, 30);

    function ensureSpace(h) {
      if (y + h > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    }

    var pName = { 3: "HIGH", 2: "MED", 1: "LOW" };
    var pColor = { 3: [239, 68, 68], 2: [245, 158, 11], 1: [59, 130, 246] };

    tasks.forEach(function (t, idx) {
      var rowH = 12;
      var hasImg = t.images && t.images.length;
      var hasSubs = t.subtasks && t.subtasks.length;
      var subH = hasSubs ? (t.subtasks.length * 5 + 2) : 0;
      ensureSpace(rowH + subH + (hasImg ? 22 : 0));

      // box
      doc.setDrawColor(220, 222, 230);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, pageW - margin * 2, rowH, 1.5, 1.5, "S");

      // checkbox
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.3);
      doc.rect(margin + 3, y + 3.5, 5, 5);
      if (t.done) {
        doc.setLineWidth(0.6);
        doc.line(margin + 3.6, y + 6, margin + 5, y + 7.3);
        doc.line(margin + 5, y + 7.3, margin + 7.4, y + 4.4);
        doc.setLineWidth(0.2);
      }

      // priority pill
      var px = margin + 11;
      if (t.priority && pColor[t.priority]) {
        var c = pColor[t.priority];
        doc.setFillColor(c[0], c[1], c[2]);
        doc.roundedRect(px, y + 3.2, 12, 5.5, 1.2, 1.2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(pName[t.priority], px + 6, y + 6.9, { align: "center" });
        px += 14;
      }

      // task text
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont("helvetica", t.done ? "italic" : "normal");
      var textMax = pageW - margin - px - 30;
      var txt = doc.splitTextToSize(t.text, textMax);
      doc.text(txt[0] || "", px, y + 7.5);

      // repeats badge
      if (t.repeats) {
        doc.setTextColor(120, 120, 130);
        doc.setFontSize(7);
        doc.text("↻ " + t.repeats, pageW - margin - 4, y + 7.5, { align: "right" });
      }

      y += rowH;

      // subtasks
      if (hasSubs) {
        doc.setTextColor(60, 60, 70);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        t.subtasks.forEach(function (s) {
          ensureSpace(5);
          doc.setDrawColor(140, 140, 150);
          doc.rect(margin + 14, y + 0.8, 3, 3);
          if (s.done) {
            doc.setLineWidth(0.4);
            doc.line(margin + 14.3, y + 2.3, margin + 15.2, y + 3.1);
            doc.line(margin + 15.2, y + 3.1, margin + 16.7, y + 1.3);
            doc.setLineWidth(0.2);
          }
          var stxt = doc.splitTextToSize(s.text, pageW - margin * 2 - 22);
          doc.text(stxt[0] || "", margin + 20, y + 3.3);
          y += 5;
        });
        y += 2;
      }

      // photo
      if (hasImg) {
        try {
          ensureSpace(22);
          var img = t.images[0];
          doc.addImage(img, "JPEG", margin + 4, y, 18, 18);
          if (t.images.length > 1) {
            doc.setTextColor(120, 120, 130);
            doc.setFontSize(8);
            doc.text("+" + (t.images.length - 1) + " more photo(s)", margin + 26, y + 10);
          }
          y += 22;
        } catch (e) { y += 2; }
      }

      y += 3;
    });

    // footer
    var pages = doc.internal.getNumberOfPages();
    for (var i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 150);
      doc.text("Generated " + new Date().toLocaleString(), margin, pageH - 6);
      doc.text(i + " / " + pages, pageW - margin, pageH - 6, { align: "right" });
    }

    var fname = (list.name || "checklist").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() + "-" + App.dateKey(new Date()) + ".pdf";
    doc.save(fname);
    App.toast("PDF exported");
  };
})();
