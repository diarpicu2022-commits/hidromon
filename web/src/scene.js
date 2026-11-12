import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ESTADOS } from './model.js';

const PARCELA = 6; // lado útil de cada jardinera
const SEPARACION = 10.5;
const ALTO_TUBO = 3.4; // altura que representa el 100 % de humedad en el medidor
const COLOR_NIVEL = { Alta: 0xef4444, Media: 0xf59e0b, Baja: 0xf5c518 };
const ICONO_ALERTA =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5"/><path d="M12 18.5v.01"/></svg>';
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------- texturas procedurales (sin archivos externos) ----------
function canvasTexture(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
}

function texturaMadera() {
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = '#c9985a';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * h;
      g.strokeStyle = Math.random() > 0.5 ? 'rgba(120,76,32,0.22)' : 'rgba(235,200,150,0.18)';
      g.lineWidth = 0.6 + Math.random() * 2;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 8, w * 0.7, y + (Math.random() - 0.5) * 8, w, y + (Math.random() - 0.5) * 4);
      g.stroke();
    }
    for (let k = 0; k < 4; k++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = g.createRadialGradient(x, y, 1, x, y, 14);
      r.addColorStop(0, 'rgba(90,55,25,0.55)');
      r.addColorStop(1, 'rgba(90,55,25,0)');
      g.fillStyle = r;
      g.fillRect(x - 14, y - 14, 28, 28);
    }
  });
}

function texturaTierra() {
  return canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#4a3426';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const l = 22 + Math.random() * 22;
      g.fillStyle = 'hsla(24,' + (25 + Math.random() * 15) + '%,' + l + '%,' + (0.35 + Math.random() * 0.4) + ')';
      g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
  }, [3, 3]);
}

function texturaFondo() {
  const t = canvasTexture(2, 512, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#cde6f4');
    grad.addColorStop(0.55, '#e4f1ee');
    grad.addColorStop(1, '#e9f4f1');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

function texturaSombra() {
  return canvasTexture(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(20,40,40,0.38)');
    r.addColorStop(0.6, 'rgba(20,40,40,0.16)');
    r.addColorStop(1, 'rgba(20,40,40,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
  });
}

export function createScene(container, onSelect) {
  const scene = new THREE.Scene();
  scene.background = texturaFondo();
  scene.fog = new THREE.Fog(0xe9f4f1, 60, 140);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300);
  camera.position.set(16, 14, 20);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap ya no existe en three 0.187
  container.appendChild(renderer.domElement);

  // Reflejos suaves de un entorno de estudio: da volumen a los materiales
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;

  const labels = new CSS2DRenderer();
  labels.domElement.className = 'labels';
  container.appendChild(labels.domElement);

  const controls = new OrbitControls(camera, labels.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 6;
  controls.maxDistance = 90;
  controls.target.set(0, 1, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe3dc, 0.55));
  const sun = new THREE.DirectionalLight(0xfff3df, 2.4);
  sun.position.set(14, 26, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 100 });
  scene.add(sun);
  const relleno = new THREE.DirectionalLight(0xdbeafe, 0.5);
  relleno.position.set(-16, 10, -12);
  scene.add(relleno);

  const suelo = new THREE.Mesh(new THREE.CircleGeometry(160, 64), new THREE.MeshStandardMaterial({ color: 0xd3e8df, roughness: 1 }));
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -0.02;
  suelo.receiveShadow = true;
  scene.add(suelo);
  const grid = new THREE.GridHelper(140, 70, 0xbdd8cf, 0xcde2da);
  grid.position.y = -0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.7;
  scene.add(grid);

  const world = new THREE.Group();
  scene.add(world);

  const maderaTex = texturaMadera();
  const tierraTex = texturaTierra();
  const sombraTex = texturaSombra();

  const clickable = [];
  const pulsing = [];
  let selected = null;
  let lastCount = -1;

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h);
    labels.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  function pill(html, className) {
    const el = document.createElement('div');
    el.className = 'pill ' + className;
    el.innerHTML = html;
    return new CSS2DObject(el);
  }

  function clear() {
    for (const child of [...world.children]) {
      world.remove(child);
      child.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
        if (o.element) o.element.remove();
      });
    }
    clickable.length = 0;
    pulsing.length = 0;
  }

  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...extra });
  const madera = () => std(0xffffff, { map: maderaTex, roughness: 0.85 });

  function add(g, mesh, pos, userData) {
    mesh.position.set(...pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (userData) {
      mesh.userData = userData;
      clickable.push(mesh);
    }
    g.add(mesh);
    return mesh;
  }

  function jardinera(g, zona) {
    const data = { type: 'zona', id: zona.id };
    const L = PARCELA + 0.6;

    // Sombra de contacto suave bajo la jardinera
    const sombra = new THREE.Mesh(new THREE.PlaneGeometry(L * 2, L * 2), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = 0.01;
    g.add(sombra);

    // Base de concreto
    add(g, new THREE.Mesh(new THREE.BoxGeometry(L + 0.5, 0.2, L + 0.5), std(0x6f8279, { roughness: 0.95 })), [0, 0.1, 0], data);

    // Paredes de madera con vetas
    const alto = 1.0;
    const grosor = 0.3;
    [
      [L, alto, grosor, 0, L / 2 - grosor / 2],
      [L, alto, grosor, 0, -L / 2 + grosor / 2],
      [grosor, alto, L - 2 * grosor, L / 2 - grosor / 2, 0],
      [grosor, alto, L - 2 * grosor, -L / 2 + grosor / 2, 0],
    ].forEach(([w, h, d, x, z]) => add(g, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), madera()), [x, 0.2 + h / 2, z], data));

    // Remate superior más oscuro
    const remate = std(0xa87b43, { roughness: 0.8 });
    [
      [L + 0.1, 0.08, grosor + 0.1, 0, L / 2 - grosor / 2],
      [L + 0.1, 0.08, grosor + 0.1, 0, -L / 2 + grosor / 2],
      [grosor + 0.1, 0.08, L - 2 * grosor, L / 2 - grosor / 2, 0],
      [grosor + 0.1, 0.08, L - 2 * grosor, -L / 2 + grosor / 2, 0],
    ].forEach(([w, h, d, x, z]) => add(g, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), remate), [x, 0.2 + alto + 0.04, z], data));

    // Tierra con textura
    const tierra = std(0xffffff, { map: tierraTex, roughness: 1 });
    add(g, new THREE.Mesh(new THREE.BoxGeometry(L - 0.6, 0.78, L - 0.6), tierra), [0, 0.2 + 0.39, 0], data);

    plantas(g, zona, L);
  }

  // Plantas con tallo y hojas (instanciadas para que sea liviano)
  function plantas(g, zona, L) {
    const verde = { ok: 0x3a9d46, bajo: 0xc9a63f, alto: 0x2b8f82, sin: 0x7a9e76 }[zona.estado];
    const n = 4;
    const porPlanta = 6;
    const hojas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 12, 8), std(0xffffff, { roughness: 0.55, side: THREE.DoubleSide }), n * n * porPlanta);
    const tallos = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.05, 1, 6), std(0x3f7a3a), n * n);
    hojas.castShadow = tallos.castShadow = true;
    hojas.receiveShadow = true;
    const d = new THREE.Object3D();
    d.rotation.order = 'YZX';
    const color = new THREE.Color();
    let h = 0;
    let t = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = ((i + 0.5) / n - 0.5) * (L - 1.5) + Math.sin(i * 7 + j) * 0.14;
        const z = ((j + 0.5) / n - 0.5) * (L - 1.5) + Math.cos(i + j * 5) * 0.14;
        const altura = 0.55 + ((i * 3 + j * 5) % 4) * 0.14;
        d.rotation.set(0, 0, 0);
        d.scale.set(1, altura, 1);
        d.position.set(x, 0.98 + altura / 2, z);
        d.updateMatrix();
        tallos.setMatrixAt(t++, d.matrix);
        for (let k = 0; k < porPlanta; k++) {
          const a = (k / porPlanta) * Math.PI * 2 + i + j;
          const nivel = 0.35 + (k % 3) * 0.3;
          d.rotation.set(0, -a, 0.35 + (k % 2) * 0.25);
          d.scale.set(0.42, 0.07, 0.2);
          d.position.set(x + Math.cos(a) * 0.2, 0.98 + altura * nivel + 0.1, z + Math.sin(a) * 0.2);
          d.updateMatrix();
          hojas.setMatrixAt(h, d.matrix);
          color.setHex(verde).offsetHSL(((k % 3) - 1) * 0.015, 0, ((k + i) % 3) * 0.035 - 0.03);
          hojas.setColorAt(h, color);
          h++;
        }
      }
    }
    g.add(tallos, hojas);
  }

  // Medidor de humedad: tubo con el nivel actual y marcas de mínimo (blanca) y máximo (amarilla)
  function medidor(g, zona) {
    const x = PARCELA / 2 + 1.5;
    const z = PARCELA / 2 - 0.5;
    const y0 = 0.2;
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.16, 28), madera()), [x, y0 + 0.08, z]);
    if (zona.promedio !== null) {
      const alto = Math.max(0.08, Math.min(1, zona.promedio / 100) * ALTO_TUBO);
      add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, alto, 28), std(ESTADOS[zona.estado].color, { transparent: true, opacity: 0.9, roughness: 0.15, emissive: ESTADOS[zona.estado].color, emissiveIntensity: 0.18 })), [x, y0 + 0.16 + alto / 2, z]);
    }
    const tubo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.31, ALTO_TUBO + 0.1, 32, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    );
    tubo.position.set(x, y0 + 0.16 + (ALTO_TUBO + 0.1) / 2, z);
    g.add(tubo);
    [[zona.humedadMin, 0xffffff], [zona.humedadMax, 0xf5c518]].forEach(([v, color]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 10, 32), new THREE.MeshBasicMaterial({ color }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, y0 + 0.16 + (v / 100) * ALTO_TUBO, z);
      g.add(ring);
    });
  }

  function sensores(g, zona) {
    const n = zona.sensores.length;
    zona.sensores.forEach((s, k) => {
      const ang = (k / Math.max(n, 1)) * Math.PI * 2 + 0.6;
      const r = n > 1 ? 1.9 : 0;
      const x = Math.cos(ang) * r;
      const z = Math.sin(ang) * r;
      const color = ESTADOS[s.estado].color;
      const esSel = selected === 'sensor:' + s.id;
      const data = { type: 'sensor', id: s.id };
      const carcasa = std(0xf3f6f7, { roughness: 0.35, metalness: 0.1 });
      const metal = std(0x8e9ba0, { roughness: 0.35, metalness: 0.7 });
      const led = std(color, { emissive: color, emissiveIntensity: esSel ? 1.4 : 0.8, roughness: 0.25 });

      let ancla;
      if (s.tipo === 'Ambiental') {
        add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.5, 12), metal), [x, 0.98 + 1.25, z]);
        ancla = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 28), carcasa), [x, 3.75, z], data);
        for (let i = 0; i < 3; i++) add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.04, 28), metal), [x, 3.58 + i * 0.16, z]);
        add(g, new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), led), [x, 4.0, z], data);
      } else {
        add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), metal), [x - 0.1, 0.98 + 0.05, z]);
        add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), metal), [x + 0.1, 0.98 + 0.05, z]);
        ancla = add(g, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.26), carcasa), [x, 1.62, z], data);
        add(g, new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 12), led), [x, 1.88, z], data);
        add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6), metal), [x + 0.16, 1.95, z]);
      }

      if (esSel) {
        const aro = new THREE.Mesh(new THREE.TorusGeometry(s.tipo === 'Ambiental' ? 0.7 : 0.55, 0.045, 12, 40), new THREE.MeshBasicMaterial({ color: 0x2f7df6 }));
        aro.position.copy(ancla.position);
        aro.rotation.x = Math.PI / 2;
        g.add(aro);
        pulsing.push(aro);
      }
      const tag = pill('<i style="background:' + hex(color) + '"></i><b>' + esc(s.codigo) + '</b>' + (s.ultima ? '<span>' + s.ultima.valor + '%</span>' : ''), 'sensor');
      tag.position.set(0, s.tipo === 'Ambiental' ? -0.85 : -0.75, 0);
      ancla.add(tag);
    });
  }

  // Cono de alerta: solo aparece si algún sensor de la zona está fuera de rango AHORA.
  function alerta(g, zona) {
    const actual = zona.alertaActual;
    if (!actual) return;
    const color = COLOR_NIVEL[actual.nivel] ?? 0xef4444;
    const cono = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 28), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.65, roughness: 0.3 }));
    cono.rotation.x = Math.PI;
    cono.position.set(0, 6.4, 0);
    cono.castShadow = true;
    g.add(cono);
    pulsing.push(cono);
    const extra = actual.count > 1 ? ' · ' + actual.count + (actual.count === 1 ? ' alerta' : ' alertas') : '';
    const tag = pill(ICONO_ALERTA + '<b>' + esc(actual.nivel) + extra + '</b>', 'alerta');
    tag.position.set(0, 1, 0);
    cono.add(tag);
  }

  function update(zonas) {
    clear();
    const cols = Math.max(1, Math.ceil(Math.sqrt(zonas.length)));
    const rows = Math.ceil(zonas.length / cols);

    zonas.forEach((zona, i) => {
      const g = new THREE.Group();
      g.position.set(((i % cols) - (cols - 1) / 2) * SEPARACION, 0, (Math.floor(i / cols) - (rows - 1) / 2) * SEPARACION);
      world.add(g);
      jardinera(g, zona);
      medidor(g, zona);
      sensores(g, zona);
      alerta(g, zona);

      const promedio = zona.promedio === null ? 'sin lecturas' : zona.promedio.toFixed(0) + '%';
      const tag = pill('<i style="background:' + hex(ESTADOS[zona.estado].color) + '"></i><b>' + esc(zona.nombre) + '</b><span>' + esc(zona.cultivo) + ' · ' + promedio + '</span>', 'zona');
      tag.position.set(0, 0.2, PARCELA / 2 + 1.6);
      g.add(tag);
    });

    // Encuadra la cámara solo cuando cambia la cantidad de zonas
    if (zonas.length !== lastCount && zonas.length > 0) {
      lastCount = zonas.length;
      const span = Math.max(cols, rows) * SEPARACION;
      const dist = Math.max(15, span * 0.8 + 5);
      camera.position.set(dist * 0.6, dist * 0.62, dist * 0.82);
      controls.target.set(0, 1.2, 0);
    }
  }

  // Selección por clic (se ignora si fue un arrastre de cámara)
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let down = null;
  labels.domElement.addEventListener('pointerdown', (e) => (down = [e.clientX, e.clientY]));
  labels.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    const rect = labels.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(clickable, false)[0];
    onSelect(hit ? hit.object.userData : null);
  });
  // Cursor de mano sobre lo que se puede seleccionar
  labels.domElement.addEventListener('pointermove', (e) => {
    const rect = labels.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    labels.domElement.style.cursor = ray.intersectObjects(clickable, false).length ? 'pointer' : 'grab';
  });

  // THREE.Clock quedó obsoleto: Timer se actualiza con el tiempo que entrega el bucle.
  const timer = new THREE.Timer();
  timer.connect(document);
  // Con «reducir movimiento» el cono de alerta y los sensores se quedan quietos.
  const quieto = matchMedia('(prefers-reduced-motion: reduce)');
  renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    const t = quieto.matches ? 0 : timer.getElapsed();
    for (const c of pulsing) {
      if (c.geometry.type === 'ConeGeometry') {
        c.position.y = 6.4 + Math.sin(t * 3) * 0.2;
        c.rotation.y = t * 1.5;
      } else {
        c.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
      }
    }
    controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
  });

  return {
    update,
    setSelected(key) {
      selected = key;
    },
  };
}
