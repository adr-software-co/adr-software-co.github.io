/* ============================================================
   ADR SOFTWARE — interactions.js
   Menú móvil, navegación al bajar, parallax de paneles,
   «Conocer más» con preselección y formulario de cotización
   con envío REAL (éxito solo tras confirmación del servidor).
   ============================================================ */
(function () {
  /* --- Menú móvil --- */
  var burger = document.getElementById("nav-burger");
  var enlaces = document.getElementById("nav-enlaces");
  if (burger && enlaces) {
    burger.addEventListener("click", function () {
      var abierto = enlaces.classList.toggle("abierto");
      burger.classList.toggle("abierto", abierto);
      burger.setAttribute("aria-expanded", abierto);
    });
    enlaces.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        enlaces.classList.remove("abierto");
        burger.classList.remove("abierto");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --- Barra de navegación al bajar --- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("fija", window.scrollY > 24);
  }, { passive: true });

  /* --- Parallax suave de los paneles de cristal (solo puntero fino) --- */
  var hero = document.getElementById("inicio");
  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hero && !reducido && window.matchMedia("(pointer: fine)").matches) {
    var paneles = hero.querySelectorAll(".panel-flotante");
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      var dx = (e.clientX - rect.left) / rect.width - 0.5;
      var dy = (e.clientY - rect.top) / rect.height - 0.5;
      paneles.forEach(function (p) {
        var prof = parseFloat(p.getAttribute("data-profundidad") || "12");
        p.style.translate = (dx * prof) + "px " + (dy * prof) + "px";
      });
    });
    hero.addEventListener("pointerleave", function () {
      paneles.forEach(function (p) { p.style.translate = "0px 0px"; });
    });
  }

  /* --- «Conocer más»: preselecciona el tipo y baja al formulario --- */
  var selectTipo = document.getElementById("c-tipo");
  document.querySelectorAll("[data-tipo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (selectTipo) selectTipo.value = btn.getAttribute("data-tipo");
      var destino = document.getElementById("contacto");
      if (destino) destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth" });
      var nombre = document.getElementById("c-nombre");
      if (nombre) setTimeout(function () { nombre.focus({ preventScroll: true }); }, reducido ? 0 : 650);
    });
  });

  /* --- Formulario de cotización: envío real vía Web3Forms --- */
  var form = document.getElementById("form-cotizacion");
  if (!form) return;
  var estado = document.getElementById("form-estado");
  var boton = document.getElementById("c-enviar");

  function campo(id) { return document.getElementById(id); }
  function marcar(el, malo) { el.classList.toggle("error", malo); return !malo; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nombre = campo("c-nombre"), empresa = campo("c-empresa"),
        contacto = campo("c-contacto"), tipo = campo("c-tipo"),
        descripcion = campo("c-descripcion");
    var ok = true;
    ok = marcar(nombre, !nombre.value.trim()) && ok;
    ok = marcar(contacto, !contacto.value.trim()) && ok;
    ok = marcar(tipo, !tipo.value) && ok;
    ok = marcar(descripcion, !descripcion.value.trim()) && ok;
    if (!ok) {
      estado.className = "form-estado mal";
      estado.textContent = "Revisa los campos marcados: son necesarios para responderte.";
      return;
    }
    var cfg = window.ADR_CONFIG || {};
    if (!cfg.web3formsKey) {
      /* Sin llave configurada jamás se simula un envío (regla del proyecto). */
      estado.className = "form-estado mal";
      estado.textContent = "El formulario está en activación. Escríbenos por WhatsApp con el botón verde y te atendemos de inmediato.";
      return;
    }
    boton.disabled = true;
    boton.textContent = "Enviando…";
    estado.className = "form-estado";
    estado.textContent = "";
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: cfg.web3formsKey,
        subject: "Nueva cotización — Sitio ADR Software",
        from_name: "Sitio ADR Software",
        nombre: nombre.value.trim(),
        empresa: empresa.value.trim(),
        contacto_para_responder: contacto.value.trim(),
        tipo_de_solucion: tipo.value,
        necesidad: descripcion.value.trim(),
        botcheck: campo("c-botcheck").checked
      })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.success) {
        estado.className = "form-estado ok";
        estado.textContent = "✅ ¡Solicitud enviada! La recibimos en nuestro correo y te responderemos en horario laboral.";
        form.reset();
      } else {
        estado.className = "form-estado mal";
        estado.textContent = "No se pudo enviar. Inténtalo de nuevo en un momento o escríbenos por WhatsApp.";
      }
    }).catch(function () {
      estado.className = "form-estado mal";
      estado.textContent = "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.";
    }).finally(function () {
      boton.disabled = false;
      boton.textContent = "Enviar solicitud";
    });
  });
})();
