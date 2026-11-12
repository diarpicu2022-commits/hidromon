import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ESTADOS, alertaMasGrave } from './model.js';

const PARCELA = 6; // lado útil de cada jardinera
const SEPARACION = 10.5;
const ALTO_TUBO = 3.4; // altura que representa el 100 % de humedad en el medidor
const COLOR_NIVEL = { Alta: 0xef4444, Media: 0xf59e0b, Baja: 0xf5c518 };
const hex = (n) => '#' + n.toString(16).padStart(6, '0');

export function createScene(container, onSelect) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9f4f1);
  scene.fog = new THREE.Fog(0xe9f4f1, 55, 130);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
  camera.position.set(16, 14, 20);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const labels = new CSS2DRenderer();
  labels.domElement.className = 'labels';
  container.appendChild(labels.domElement);

  const controls = new OrbitControls(camera, labels.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 6;
  controls.maxDistance = 90;
  controls.target.set(0, 1, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe3dc, 1.35));
  const sun = new THREE.DirectionalLight(0xfff6e5, 2.2);
  sun.position.set(14, 26, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 90 });
  scene.add(sun);

  const suelo = new THREE.Mesh(
    new THREE.CircleGeometry(160, 64),
    new THREE.MeshStandardMaterial({ color: 0xd5e9e1, roughness: 1 }),
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -0.02;
  suelo.receiveShadow = true;
  scene.add(suelo);
  const grid = new THREE.GridHelper(140, 70, 0xbcd7ce, 0xcfe3dc);
  grid.position.y = -0.01;
  scene.add(grid);

  const world = new THREE.Group();
  scene.add(world);

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
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

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

  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra });
  const MADERA = 0xc9985a;
  const MADERA_OSC = 0xa87b43;

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
    add(g, new THREE.Mesh(new THREE.BoxGeometry(L + 0.5, 0.2, L + 0.5), std(0x6a7f78)), [0, 0.1, 0], data);
    // Paredes de madera
    const alto = 1.0;
    const grosor = 0.3;
    [
      [L, alto, grosor, 0, L / 2 - grosor / 2],
      [L, alto, grosor, 0, -L / 2 + grosor / 2],
      [grosor, alto, L, L / 2 - grosor / 2, 0],
      [grosor, alto, L, -L / 2 + grosor / 2, 0],
    ].forEach(([w, h, d, x, z]) => add(g, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(MADERA)), [x, 0.2 + h / 2, z], data));
    // Franja decorativa
    add(g, new THREE.Mesh(new THREE.BoxGeometry(L + 0.02, 0.18, 0.05), std(MADERA_OSC)), [0, 0.55, L / 2 + 0.01], data);
    // Tierra
    add(g, new THREE.Mesh(new THREE.BoxGeometry(L - 0.6, 0.78, L - 0.6), std(0x4a3426, { roughness: 1 })), [0, 0.2 + 0.39, 0], data);

    // Plantas: su color refleja el estado de la zona
    const colorPlanta = { ok: 0x3fae4a, bajo: 0xd6b34a, alto: 0x2f9e8f, sin: 0x7fa37a }[zona.estado];
    const n = 4;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = ((i + 0.5) / n - 0.5) * (L - 1.4) + Math.sin(i * 7 + j) * 0.12;
        const z = ((j + 0.5) / n - 0.5) * (L - 1.4) + Math.cos(i + j * 5) * 0.12;
        const altura = 0.55 + ((i * 3 + j * 5) % 4) * 0.12;
        add(g, new THREE.Mesh(new THREE.ConeGeometry(0.26, altura, 7), std(colorPlanta)), [x, 0.98 + altura / 2, z]);
        add(g, new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), std(colorPlanta, { roughness: 0.6 })), [x + 0.12, 0.98 + altura * 0.45, z - 0.1]);
      }
    }
  }

  // Medidor de humedad: tubo con el nivel actual y marcas de mínimo (blanca) y máximo (amarilla)
  function medidor(g, zona) {
    const x = PARCELA / 2 + 1.5;
    const z = PARCELA / 2 - 0.5;
    const y0 = 0.2;
    const tubo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, ALTO_TUBO, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, roughness: 0.1 }),
    );
    tubo.position.set(x, y0 + ALTO_TUBO / 2, z);
    g.add(tubo);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 24), std(MADERA_OSC)), [x, y0 + 0.06, z]);
    if (zona.promedio !== null) {
      const h = Math.max(0.08, Math.min(1, zona.promedio / 100) * ALTO_TUBO);
      add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, h, 24), std(ESTADOS[zona.estado].color, { transparent: true, opacity: 0.85, roughness: 0.2 })), [x, y0 + 0.12 + h / 2, z]);
    }
    [[zona.humedadMin, 0xffffff], [zona.humedadMax, 0xf5c518]].forEach(([v, color]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 8, 28), new THREE.MeshBasicMaterial({ color }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, y0 + 0.12 + (v / 100) * ALTO_TUBO, z);
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
      const luz = std(color, { emissive: color, emissiveIntensity: esSel ? 1 : 0.45, roughness: 0.3 });

      let bulbo;
      if (s.tipo === 'Ambiental') {
        add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 10), std(0x9aa9ad)), [x, 0.95 + 1.2, z]);
        bulbo = add(g, new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 18), luz), [x, 3.55, z], data);
      } else {
        add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 10), std(0x9aa9ad)), [x, 0.95 + 0.4, z]);
        bulbo = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 24), luz), [x, 2.15, z], data);
      }
      if (esSel) {
        const aro = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 10, 32), new THREE.MeshBasicMaterial({ color: 0x2f7df6 }));
        aro.position.copy(bulbo.position);
        aro.rotation.x = Math.PI / 2;
        g.add(aro);
        pulsing.push(aro);
      }
      const tag = pill(
        '<i style="background:' + hex(color) + '"></i><b>' + esc(s.codigo) + '</b>' + (s.ultima ? '<span>' + s.ultima.valor + '%</span>' : ''),
        'sensor',
      );
      tag.position.set(0, -0.95, 0);
      bulbo.add(tag);
    });
  }

  function alerta(g, zona) {
    const grave = alertaMasGrave(zona.alertas);
    if (!grave) return;
    const color = COLOR_NIVEL[grave.nivel] ?? 0xef4444;
    const cono = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 1.1, 24),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7 }),
    );
    cono.rotation.x = Math.PI;
    cono.position.set(0, 6.4, 0);
    cono.castShadow = true;
    g.add(cono);
    pulsing.push(cono);
    const extra = zona.alertas.length > 1 ? ' · ' + zona.alertas.length : '';
    const tag = pill('<b>⚠ Alerta ' + esc(grave.nivel) + extra + '</b>', 'alerta');
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
      const tag = pill(
        '<i style="background:' + hex(ESTADOS[zona.estado].color) + '"></i><b>' + esc(zona.nombre) + '</b><span>' + esc(zona.cultivo) + ' · ' + promedio + '</span>',
        'zona',
      );
      tag.position.set(0, 0.2, PARCELA / 2 + 1.6);
      g.add(tag);
    });

    // Encuadra la cámara solo cuando cambia la cantidad de zonas
    if (zonas.length !== lastCount && zonas.length > 0) {
      lastCount = zonas.length;
      const span = Math.max(cols, rows) * SEPARACION;
      const d = Math.max(15, span * 0.8 + 5);
      camera.position.set(d * 0.6, d * 0.62, d * 0.82);
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

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
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
