/* =====================================================================
 *  Interaktion & Bewegung – Count-up-Zahlen + sanftes Parallax.
 *  Performant (IntersectionObserver + rAF) und respektiert
 *  prefers-reduced-motion (dann keine Bewegung, Endwerte direkt sichtbar).
 * ===================================================================== */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Count-up ---- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    if (reduce || isNaN(target)) {
      el.textContent = (isNaN(target) ? el.getAttribute("data-count") : target) + suffix;
      return;
    }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---- Wort-für-Wort-Reveal der Überschriften beim Scrollen ---- */
  var heads = document.querySelectorAll(".section-head h2, .page-head h1");
  if (heads.length && !reduce && "IntersectionObserver" in window) {
    heads.forEach(function (h) {
      if (h.childElementCount !== 0) return; // nur reiner Text
      var words = h.textContent.split(/\s+/).filter(Boolean);
      h.textContent = "";
      h.classList.add("reveal-words");
      words.forEach(function (w, i) {
        var outer = document.createElement("span");
        outer.className = "rw";
        var inner = document.createElement("span");
        inner.textContent = w;
        inner.style.transitionDelay = (i * 0.05).toFixed(2) + "s";
        outer.appendChild(inner);
        h.appendChild(outer);
        if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
      });
    });
    var ho = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); ho.unobserve(e.target); }
      });
    }, { threshold: 0.3, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal-words").forEach(function (h) { ho.observe(h); });
  }

  /* ---- Parallax ---- */
  var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!reduce && layers.length) {
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        var offset = (rect.top + rect.height / 2 - vh / 2) * speed * -1;
        el.style.setProperty("--py", offset.toFixed(1) + "px");
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---- Keine Einzelwörter in der letzten Zeile (alle Browser) ----
     Letztes Leerzeichen eines Absatzes wird zum geschützten Leerzeichen,
     die letzten zwei Wörter brechen also nur gemeinsam um.
     ponytail: nur wenn beide Wörter zusammen ≤ 22 Zeichen – längere Paare
     (z. B. „Telefonische Erreichbarkeit“) würden auf schmalen Spalten überlaufen. */
  document.querySelectorAll("main p, main li, main h2, main h3, main dd, main dt, main blockquote, footer p").forEach(function (el) {
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, last = null;
    while ((n = walk.nextNode())) if (n.textContent.trim()) last = n;
    if (last) last.textContent = last.textContent.replace(/(\S+) (\S+)\s*$/, function (m, a, b) {
      return a.length + b.length <= 22 ? a + "\u00a0" + b : m;
    });
  });
})();
