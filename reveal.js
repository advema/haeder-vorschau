/* =====================================================================
 *  Scroll-Reveal – dezente, funktionale Mikro-Animation (Trend 2026).
 *  Elemente mit [data-reveal] faden beim Scrollen sanft ein.
 *  Nutzt IntersectionObserver (performant) und respektiert
 *  prefers-reduced-motion (dann sofort sichtbar, keine Animation).
 * ===================================================================== */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window) || !els.length) {
    els.forEach((el) => el.classList.add("is-revealed"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
})();
