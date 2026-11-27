/* ============================================================
   ADR SOFTWARE — animations.js
   Apariciones con GSAP + ScrollTrigger. Si GSAP no carga, el
   contenido queda visible tal cual (los estados ocultos los
   aplica GSAP, nunca el CSS).
   ============================================================ */
(function () {
  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducido || typeof gsap === "undefined") return;

  /* Entrada de la portada */
  var entradaCompleta = false;
  var tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: function () { entradaCompleta = true; } });
  /* Vigilante: si el bucle de animación se detiene por cualquier motivo,
     el contenido de la portada jamás queda a media aparición. */
  setTimeout(function () {
    if (!entradaCompleta) {
      gsap.set(".hero-eyebrow, .hero h1, .hero-sub, .hero-ctas, .hero-nota, .hero-escena, .panel-flotante",
        { clearProps: "all", opacity: 1 });
    }
  }, 2600);
  tl.from(".hero-eyebrow", { y: 18, opacity: 0, duration: 0.7 }, 0.1)
    .from(".hero h1", { y: 34, opacity: 0, duration: 0.9 }, 0.2)
    .from(".hero-sub", { y: 22, opacity: 0, duration: 0.8 }, 0.38)
    .from(".hero-ctas", { y: 18, opacity: 0, duration: 0.7 }, 0.52)
    .from(".hero-nota", { opacity: 0, duration: 0.7 }, 0.66)
    .from(".hero-escena", { opacity: 0, scale: 0.96, duration: 1.1 }, 0.3)
    .from(".panel-flotante", { y: 36, opacity: 0, duration: 0.8, stagger: 0.14, clearProps: "opacity" }, 0.62);

  /* Aparición progresiva por secciones */
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".revelar").forEach(function (el) {
      gsap.from(el, {
        y: 30, opacity: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    /* Parallax moderado de las luces de fondo */
    gsap.to(".hero-luz-1", {
      y: 120, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }
})();
