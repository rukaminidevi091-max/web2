// Theme loader and custom properties synchronizer
(function() {
  var root = document.documentElement;

  // 1. Dark Mode initialization
  var storedTheme = localStorage.getItem("theme");
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var activeTheme = storedTheme || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", activeTheme);

  window.toggleTheme = function() {
    var curr = root.getAttribute("data-theme");
    var next = curr === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // 2. Fetch runtime settings to dynamically inject colors and text
  fetch("/api/settings")
    .then(function(res) {
      if (!res.ok) {
        throw new Error("Settings fetch failed");
      }
      return res.json();
    })
    .then(function(s) {
      if (s.color_primary) {
        root.style.setProperty("--primary", s.color_primary);
      }
      if (s.color_accent) {
        root.style.setProperty("--accent", s.color_accent);
      }
      // Populate site title elements if available
      var brandEls = document.querySelectorAll(".site-brand-text");
      for (var i = 0; i < brandEls.length; i++) {
        brandEls[i].textContent = s.site_name || "Content & Catalog Hub";
      }
      var footEls = document.querySelectorAll(".footer-copy-text");
      for (var j = 0; j < footEls.length; j++) {
        footEls[j].textContent = s.footer_text || "\u00a9 2026 All rights reserved.";
      }
      if (s.announcement_active && s.announcement_text) {
        var bar = document.getElementById("announcement-bar");
        if (bar) {
          bar.textContent = s.announcement_text;
          bar.style.display = "block";
        }
      }
    })
    .catch(function(err) {
      console.warn("Theme settings fallback active:", err);
    });
})();
