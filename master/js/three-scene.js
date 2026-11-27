/* ============================================================
   ADR SOFTWARE — three-scene.js
   Esfera 3D real e interactiva (Three.js + WebGL).
   - Material físico metal/vidrio con entorno generado por código.
   - Responde al cursor, rota sola, reacciona al desplazamiento.
   - Se pausa si la pestaña no se ve o la portada sale de pantalla.
   - Sin WebGL o con movimiento reducido: respaldo visual CSS.
   ============================================================ */
(function () {
  var contenedor = document.getElementById("escena-3d");
  var hero = document.getElementById("inicio");
  if (!contenedor || !hero) return;

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducido) { hero.classList.add("reducido"); return; }
  if (typeof THREE === "undefined") { hero.classList.add("sin-webgl"); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    hero.classList.add("sin-webgl");
    return;
  }

  var esMovil = Math.min(window.innerWidth, window.screen.width) < 760;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, esMovil ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  contenedor.appendChild(renderer.domElement);

  var escena = new THREE.Scene();
  var camara = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camara.position.set(0, 0, 5.1);

  /* --- Entorno de reflejos generado por código (sin archivos externos) --- */
  function crearEntorno() {
    var env = new THREE.Scene();
    env.background = new THREE.Color(0x05070c);
    function panel(color, intensidad, x, y, z, sx, sy) {
      var m = new THREE.Mesh(
        new THREE.PlaneGeometry(sx, sy),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensidad), side: THREE.DoubleSide })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    }
    panel(0x1677ff, 5.2, -6, 3, 2, 7, 4);    // luz azul principal
    panel(0x70b7ff, 3.4, 6, 1, 3, 6, 3);     // relleno celeste
    panel(0xffffff, 2.6, 0, 7, 1, 6, 3);     // cenital blanca
    panel(0x0e4fd8, 2.2, 2, -6, -2, 7, 3);   // rebote inferior
    panel(0x8ab8ff, 1.4, 0, 0, -8, 10, 6);   // fondo suave
    var pmrem = new THREE.PMREMGenerator(renderer);
    var tex = pmrem.fromScene(env, 0.04).texture;
    pmrem.dispose();
    return tex;
  }
  escena.environment = crearEntorno();

  var grupo = new THREE.Group();
  escena.add(grupo);

  /* --- Esfera principal: metal oscuro con capa de vidrio --- */
  var esfera = new THREE.Mesh(
    new THREE.SphereGeometry(1.28, esMovil ? 64 : 96, esMovil ? 64 : 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x101c33,
      metalness: 0.88,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.3
    })
  );
  grupo.add(esfera);

  /* --- Cáscara de red tecnológica --- */
  var cascara = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.52, 2),
    new THREE.MeshBasicMaterial({ color: 0x70b7ff, wireframe: true, transparent: true, opacity: 0.13 })
  );
  grupo.add(cascara);

  /* --- Anillos orbitales --- */
  function anillo(radio, color, opacidad, inclX, inclY) {
    var a = new THREE.Mesh(
      new THREE.TorusGeometry(radio, 0.006, 8, 180),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacidad })
    );
    a.rotation.set(inclX, inclY, 0);
    grupo.add(a);
    return a;
  }
  var anillo1 = anillo(1.78, 0x1677ff, 0.55, 1.15, 0.25);
  var anillo2 = anillo(1.98, 0x70b7ff, 0.30, 1.45, -0.5);

  /* --- Partículas discretas --- */
  var numParticulas = esMovil ? 110 : 320;
  var posiciones = new Float32Array(numParticulas * 3);
  for (var i = 0; i < numParticulas; i++) {
    var r = 2.1 + Math.random() * 2.3;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    posiciones[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    posiciones[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72;
    posiciones[i * 3 + 2] = r * Math.cos(phi) - 0.6;
  }
  var geoPart = new THREE.BufferGeometry();
  geoPart.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
  var particulas = new THREE.Points(geoPart, new THREE.PointsMaterial({
    color: 0x70b7ff, size: 0.022, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  escena.add(particulas);

  /* --- Luces de escena --- */
  escena.add(new THREE.AmbientLight(0x334466, 0.5));
  var luzAzul = new THREE.PointLight(0x1677ff, 2.1, 30); luzAzul.position.set(-5, 3, 4); escena.add(luzAzul);
  var luzCian = new THREE.PointLight(0x70b7ff, 1.2, 30); luzCian.position.set(5, -2, 3); escena.add(luzCian);

  /* --- Interacción: cursor y desplazamiento --- */
  var destinoX = 0, destinoY = 0, actualX = 0, actualY = 0;
  var progresoScroll = 0;
  hero.addEventListener("pointermove", function (e) {
    var rect = hero.getBoundingClientRect();
    destinoY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.55;
    destinoX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.38;
  });
  hero.addEventListener("pointerleave", function () { destinoX = 0; destinoY = 0; });
  window.addEventListener("scroll", function () {
    var rect = hero.getBoundingClientRect();
    progresoScroll = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
  }, { passive: true });

  function ajustarTamano() {
    var w = contenedor.clientWidth, h = contenedor.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
  }
  ajustarTamano();
  window.addEventListener("resize", ajustarTamano);

  /* --- Bucle eficiente: se pausa fuera de pantalla o con la pestaña oculta --- */
  var visible = true, ejecutando = true, reloj = new THREE.Clock();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entradas) { visible = entradas[0].isIntersecting; }, { threshold: 0.02 }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () { ejecutando = !document.hidden; });

  (function animar() {
    requestAnimationFrame(animar);
    if (!ejecutando || !visible) return;
    var t = reloj.getElapsedTime();
    actualX += (destinoX - actualX) * 0.045;
    actualY += (destinoY - actualY) * 0.045;
    esfera.rotation.y = t * 0.14 + actualY * 1.6;
    esfera.rotation.x = actualX * 1.1 + progresoScroll * 0.5;
    cascara.rotation.y = -t * 0.05 + actualY;
    cascara.rotation.z = t * 0.02;
    anillo1.rotation.z = t * 0.10;
    anillo2.rotation.z = -t * 0.07;
    particulas.rotation.y = t * 0.016;
    grupo.position.y = Math.sin(t * 0.7) * 0.055 - progresoScroll * 0.35;
    var escala = 1 - progresoScroll * 0.12;
    grupo.scale.set(escala, escala, escala);
    renderer.render(escena, camara);
  })();
})();
