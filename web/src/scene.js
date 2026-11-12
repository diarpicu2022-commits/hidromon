import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ESTADOS, alertaMasGrave } from './model.js';

const PARCELA = 6; // lado de cada parcela
const SEPARACION = 8.5;
const ALTO_MAX = 3.4; // altura que representa el 100 % de humedad
const COLOR_NIVEL = { Alta: 0xef4444, Media: 0xf59e0b, Baja: 0xfacc15 };

export function createScene(container, onSelect) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1a1f);
  scene.fog = new THREE.Fog(0x0a1a1f, 40, 90);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(14, 13, 18);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const labels = new CSS2DRenderer();
  labels.domElement.className = 'labels';
  container.appendChild(labels.domElement);

  const controls = new OrbitControls(camera, labels.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.target.set(0, 1, 0);

  scene.add(new THREE.HemisphereLight(0xcfeeea, 0x0a1a1f, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(10, 20, 8);
  scene.add(sun);

  const grid = new THREE.GridHelper(80, 40, 0x1f4a4a, 0x14323a);
  grid.position.y = -0.01;
  scene.add(grid);

  const world = new THREE.Group();
  scene.add(world);

  const clickable = [];
  const pulsing = [];
  let selected = null;

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setSize(w, h);
    labels.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  function label(text, className = 'label') {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    return new CSS2DObject(el);
  }

  function colorCultivo(cultivo) {
    let h = 0;
    for (const c of cultivo) h = (h * 31 + c.charCodeAt(0)) % 360;
    return new THREE.Color().setHSL(h / 360, 0.35, 0.28);
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

  function marcoRango(group, y, color) {
    const half = PARCELA / 2 - 0.1;
    const pts = [
      new THREE.Vector3(-half, y, -half),
      new THREE.Vector3(half, y, -half),
      new THREE.Vector3(half, y, half),
      new THREE.Vector3(-half, y, half),
    ];
    group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color })));
  }

  function update(zonas) {
    clear();
    const cols = Math.max(1, Math.ceil(Math.sqrt(zonas.length)));
    const rows = Math.ceil(zonas.length / cols);

    zonas.forEach((zona, i) => {
      const g = new THREE.Group();
      g.position.set(
        ((i % cols) - (cols - 1) / 2) * SEPARACION,
        0,
        (Math.floor(i / cols) - (rows - 1) / 2) * SEPARACION,
      );
      world.add(g);

      // Parcela
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(PARCELA, 0.3, PARCELA),
        new THREE.MeshStandardMaterial({ color: colorCultivo(zona.cultivo), roughness: 0.9 }),
      );
      base.position.y = 0.15;
      base.userData = { type: 'zona', id: zona.id };
      g.add(base);
      clickable.push(base);

      // Nivel de agua = humedad promedio de los sensores de la zona
      if (zona.promedio !== null) {
        const alto = Math.max(0.05, Math.min(1, zona.promedio / 100) * ALTO_MAX);
        const agua = new THREE.Mesh(
          new THREE.BoxGeometry(PARCELA - 0.4, alto, PARCELA - 0.4),
          new THREE.MeshStandardMaterial({
            color: ESTADOS[zona.estado].color,
            transparent: true,
            opacity: 0.28,
            roughness: 0.2,
          }),
        );
        agua.position.y = 0.3 + alto / 2;
        g.add(agua);
      }

      // Rango permitido: marco blanco = mínimo, marco amarillo = máximo
      marcoRango(g, 0.3 + (zona.humedadMin / 100) * ALTO_MAX, 0xffffff);
      marcoRango(g, 0.3 + (zona.humedadMax / 100) * ALTO_MAX, 0xfacc15);

      // Sensores
      const n = zona.sensores.length;
      zona.sensores.forEach((s, k) => {
        const ang = (k / Math.max(n, 1)) * Math.PI * 2;
        const r = n > 1 ? 1.9 : 0;
        const x = Math.cos(ang) * r;
        const z = Math.sin(ang) * r;
        const color = ESTADOS[s.estado].color;
        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: selected === 'sensor:' + s.id ? 0.9 : 0.35,
        });

        let mesh;
        if (s.tipo === 'Ambiental') {
          const palo = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 2, 8),
            new THREE.MeshStandardMaterial({ color: 0x9fb4b8 }),
          );
          palo.position.set(x, 1.3, z);
          g.add(palo);
          mesh = new THREE.Mesh(new THREE.SphereGeometry(0.33, 24, 16), mat);
          mesh.position.set(x, 2.45, z);
        } else {
          mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.7, 20), mat);
          mesh.position.set(x, 0.65, z);
        }
        mesh.userData = { type: 'sensor', id: s.id };
        g.add(mesh);
        clickable.push(mesh);

        const tag = label(s.ultima ? s.codigo + ' · ' + s.ultima.valor + '%' : s.codigo, 'label sensor');
        tag.position.set(0, 0.6, 0);
        mesh.add(tag);
      });

      // Alerta más grave de la zona
      const grave = alertaMasGrave(zona.alertas);
      if (grave) {
        const color = COLOR_NIVEL[grave.nivel] ?? 0xef4444;
        const cono = new THREE.Mesh(
          new THREE.ConeGeometry(0.45, 0.9, 20),
          new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 }),
        );
        cono.rotation.x = Math.PI;
        cono.position.set(0, 4.8, 0);
        g.add(cono);
        pulsing.push(cono);
        const extra = zona.alertas.length > 1 ? ' (' + zona.alertas.length + ')' : '';
        const tag = label('⚠ ' + grave.nivel + extra, 'label alerta');
        tag.position.set(0, 0.8, 0);
        cono.add(tag);
      }

      // Nombre de la zona
      const nombre = label(zona.nombre + ' · ' + zona.cultivo, 'label zona');
      nombre.position.set(0, 0.2, PARCELA / 2 + 0.7);
      g.add(nombre);
    });
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
      c.position.y = 4.8 + Math.sin(t * 3) * 0.18;
      c.rotation.y = t * 1.5;
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
