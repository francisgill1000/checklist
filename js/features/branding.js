(function () {
  "use strict";

  var ACCENT_PRESETS = [
    "#6d5ef6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#0ea5e9"
  ];

  App.accentPresets = ACCENT_PRESETS;

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
        cb(canvas.toDataURL("image/png", quality));
      };
      img.onerror = function () { cb(null); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  App.setLogo = function (file, cb) {
    if (!file) return;
    compressImage(file, 256, 0.9, function (dataUrl) {
      if (!dataUrl) { App.toast("Couldn't read image"); cb && cb(); return; }
      App.state.branding.logo = dataUrl;
      if (!App.save()) {
        App.state.branding.logo = null;
        App.toast("Storage full — couldn't save logo");
      } else {
        App.toast("Logo updated");
      }
      App.applyBranding();
      cb && cb();
    });
  };

  App.removeLogo = function () {
    App.state.branding.logo = null;
    App.save();
    App.applyBranding();
  };

  App.setAccent = function (hex) {
    App.state.branding.accent = hex;
    App.save();
    App.applyBranding();
  };

  App.setCompanyName = function (name) {
    App.state.branding.companyName = name || "";
    App.save();
  };

  App.applyBranding = function () {
    var b = App.state.branding || {};
    var accent = b.accent || "#6d5ef6";
    document.documentElement.style.setProperty("--accent", accent);
    // also update gradient subtly so the hero feels related
    var grad = "linear-gradient(135deg, " + accent + " 0%, " + shift(accent, 20) + " 50%, " + shift(accent, -30) + " 100%)";
    document.documentElement.style.setProperty("--grad", grad);
  };

  function shift(hex, amt) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var r = clamp(parseInt(hex.slice(0,2), 16) + amt);
    var g = clamp(parseInt(hex.slice(2,4), 16) + amt);
    var b = clamp(parseInt(hex.slice(4,6), 16) + amt);
    return "#" + toHex(r) + toHex(g) + toHex(b);
  }
  function clamp(v) { return Math.max(0, Math.min(255, v)); }
  function toHex(v) { var s = v.toString(16); return s.length === 1 ? "0" + s : s; }
})();
