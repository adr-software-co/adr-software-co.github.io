/* ============================================================
   ADR SOFTWARE — main.js
   Aplica la configuración central (config.js) y detalles
   generales: enlaces de WhatsApp, correo visible y año.
   ============================================================ */
(function () {
  var cfg = window.ADR_CONFIG || {};
  if (cfg.whatsapp) {
    var texto = encodeURIComponent(cfg.mensajeWhatsapp || "Hola ADR Software");
    document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
      a.href = "https://wa.me/" + cfg.whatsapp + "?text=" + texto;
    });
  }
  if (cfg.correo) {
    document.querySelectorAll("[data-correo]").forEach(function (a) {
      a.href = "mailto:" + cfg.correo;
      a.textContent = cfg.correo;
    });
  }
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();
})();
