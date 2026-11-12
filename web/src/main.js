import { api } from './api.js';
import { ESTADOS, buildWorld } from './model.js';
import { createScene } from './scene.js';

const $ = (id) => document.getElementById(id);
const hex = (n) => '#' + n.toString(16).padStart(6, '0');

let raw = { zonas: [], sensores: [], lecturas: [], alertas: [] };
let zonas = [];
let selected = null; // { type, id }
let tab = 'zona';

const sceneApi = createScene($('scene'), (hit) => {
  selected = hit;
  sceneApi.setSelected(hit ? hit.type + ':' + hit.id : null);
  sceneApi.update(zonas);
  renderDetail();
});

// ---------- utilidades de interfaz ----------
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const c of children) node.append(c);
  return node;
}

let toastTimer;
function toast(text, kind = 'ok') {
  const t = $('toast');
  t.textContent = text;
  t.className = 'show ' + kind;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = ''), 3500);
}

// ---------- datos ----------
async function refresh() {
  try {
    raw = await api.snapshot();
    zonas = buildWorld(raw);
    sceneApi.update(zonas);
    renderStats();
    renderDetail();
    if (!$('form').contains(document.activeElement)) renderForm(true);
    $('empty').hidden = zonas.length > 0;
  } catch (err) {
    toast('No se pudo leer la API: ' + err.message, 'error');
  }
}

function renderStats() {
  const items = [
    ['Zonas', raw.zonas.length],
    ['Sensores', raw.sensores.length],
    ['Lecturas', raw.lecturas.length],
    ['Alertas', raw.alertas.length],
  ];
  $('stats').replaceChildren(
    ...items.map(([name, n]) => el('div', { className: 'stat' }, el('b', { textContent: n }), el('span', { textContent: name }))),
  );
}

function renderLegend() {
  $('legend').replaceChildren(
    ...Object.values(ESTADOS).map((e) =>
      el('li', {}, el('span', { className: 'dot', style: 'background:' + hex(e.color) }), e.label),
    ),
  );
}

// ---------- panel de detalle ----------
function row(a, b) {
  return el('tr', {}, el('td', { textContent: a }), el('td', { textContent: b }));
}

function renderDetail() {
  const box = $('detail');
  if (!selected) {
    box.hidden = true;
    return;
  }
  const close = el('button', { className: 'close', textContent: '×', title: 'Cerrar' });
  close.onclick = () => {
    selected = null;
    sceneApi.setSelected(null);
    sceneApi.update(zonas);
    renderDetail();
  };

  if (selected.type === 'zona') {
    const z = zonas.find((x) => x.id === selected.id);
    if (!z) return void (box.hidden = true);
    const badge = el('span', { className: 'badge', textContent: ESTADOS[z.estado].label });
    badge.style.background = hex(ESTADOS[z.estado].color);
    const table = el('table', {});
    table.append(
      row('Rango permitido', z.humedadMin + '% – ' + z.humedadMax + '%'),
      row('Humedad promedio', z.promedio === null ? 'sin lecturas' : z.promedio.toFixed(1) + '%'),
      row('Sensores', z.sensores.length),
      row('Alertas', z.alertas.length),
    );
    box.replaceChildren(close, el('h3', { textContent: z.nombre }), el('div', { className: 'sub', textContent: 'Zona · ' + z.cultivo + ' ' }, badge), table);
    z.alertas.slice(0, 4).forEach((a) => box.append(el('div', { className: 'hint', textContent: '⚠ ' + a.nivel + ': ' + a.mensaje })));
  } else {
    const z = zonas.find((x) => x.sensores.some((s) => s.id === selected.id));
    const s = z?.sensores.find((x) => x.id === selected.id);
    if (!s) return void (box.hidden = true);
    const badge = el('span', { className: 'badge', textContent: ESTADOS[s.estado].label });
    badge.style.background = hex(ESTADOS[s.estado].color);
    const table = el('table', {});
    table.append(
      row('Zona', z.nombre),
      row('Tipo', s.tipo),
      row('Rango de la zona', z.humedadMin + '% – ' + z.humedadMax + '%'),
    );
    s.lecturas.slice(0, 5).forEach((l) => table.append(row(new Date(l.fecha).toLocaleString(), l.valor + '%')));

    const btn = el('button', { className: 'ghost', textContent: 'Enviar lectura aleatoria' });
    btn.onclick = () => lecturaAleatoria(s, z, btn);
    box.replaceChildren(close, el('h3', { textContent: s.codigo }), el('div', { className: 'sub', textContent: 'Sensor · ' }, badge), table, el('div', { className: 'actions' }, btn));
  }
  box.hidden = false;
}

// Simula que el sensor mide algo: a veces dentro del rango, a veces fuera.
async function lecturaAleatoria(sensor, zona, btn) {
  const span = zona.humedadMax - zona.humedadMin;
  const valor = Math.round((zona.humedadMin - span * 0.5 + Math.random() * span * 2) * 10) / 10;
  btn.disabled = true;
  try {
    const res = await api.create('lecturas', { sensorId: sensor.id, valor: Math.max(0, Math.min(100, valor)) });
    toast('Lectura creada: ' + res.data.valor + '%');
    await alertaAutomatica(res.data, zona);
    await refresh();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function alertaAutomatica(lectura, zona) {
  const nivel = lectura.valor > zona.humedadMax ? 'Alta' : lectura.valor < zona.humedadMin ? 'Baja' : null;
  if (!nivel) return;
  await api.create('alertas', {
    lecturaId: lectura.id,
    zonaId: zona.id,
    nivel,
    mensaje: 'Humedad ' + lectura.valor + '% fuera del rango ' + zona.humedadMin + '–' + zona.humedadMax + '%',
  });
  toast('Lectura fuera de rango: se creó una alerta ' + nivel, 'error');
}

// ---------- formularios ----------
const FORMS = {
  zona: {
    title: 'Zona',
    recurso: 'zonas',
    fields: () => [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'cultivo', label: 'Cultivo', type: 'text', required: true },
      { name: 'humedadMin', label: 'Humedad mínima (%)', type: 'number', required: true, value: 60 },
      { name: 'humedadMax', label: 'Humedad máxima (%)', type: 'number', required: true, value: 80 },
    ],
  },
  sensor: {
    title: 'Sensor',
    recurso: 'sensores',
    fields: () => [
      { name: 'codigo', label: 'Código', type: 'text', required: true },
      { name: 'tipo', label: 'Tipo', type: 'select', options: ['Suelo', 'Ambiental'].map((t) => [t, t]) },
      { name: 'zonaId', label: 'Zona', type: 'select', options: raw.zonas.map((z) => [z.id, z.nombre + ' (' + z.cultivo + ')']) },
    ],
  },
  lectura: {
    title: 'Lectura',
    recurso: 'lecturas',
    fields: () => [
      { name: 'sensorId', label: 'Sensor', type: 'select', options: raw.sensores.map((s) => [s.id, s.codigo + ' · ' + s.tipo]) },
      { name: 'valor', label: 'Valor de humedad (%)', type: 'number', required: true, value: 70 },
      { name: 'auto', label: 'Crear alerta si sale del rango', type: 'check', value: true },
    ],
  },
  alerta: {
    title: 'Alerta',
    recurso: 'alertas',
    fields: () => [
      { name: 'lecturaId', label: 'Lectura', type: 'select', options: raw.lecturas.slice(0, 30).map((l) => [l.id, '#' + l.id + ' · ' + (l.sensor?.codigo ?? 'sensor ' + l.sensor?.id) + ' · ' + l.valor + '%']) },
      { name: 'zonaId', label: 'Zona', type: 'select', options: raw.zonas.map((z) => [z.id, z.nombre]) },
      { name: 'nivel', label: 'Nivel', type: 'select', options: ['Alta', 'Media', 'Baja'].map((t) => [t, t]) },
      { name: 'mensaje', label: 'Mensaje', type: 'text', required: true },
    ],
  },
};

function renderTabs() {
  $('tabs').replaceChildren(
    ...Object.entries(FORMS).map(([key, f]) => {
      const b = el('button', { type: 'button', textContent: f.title, className: key === tab ? 'active' : '' });
      b.onclick = () => {
        tab = key;
        renderTabs();
        renderForm();
      };
      return b;
    }),
  );
}

// Conserva lo que el usuario ya escribió cuando el refresco automático redibuja el formulario.
function renderForm(keepValues = false) {
  const form = $('form');
  const kept = keepValues ? Object.fromEntries(new FormData(form)) : {};
  const def = FORMS[tab];
  const nodes = def.fields().map((f) => {
    let input;
    if (f.type === 'select') {
      input = el('select', { name: f.name });
      f.options.forEach(([v, text]) => input.append(el('option', { value: v, textContent: text })));
    } else if (f.type === 'check') {
      input = el('input', { name: f.name, type: 'checkbox', checked: f.value });
      return el('label', { className: 'check' }, input, f.label);
    } else {
      input = el('input', { name: f.name, type: f.type, required: !!f.required, value: f.value ?? '' });
      if (f.type === 'number') input.step = 'any';
    }
    if (kept[f.name] !== undefined && (f.type !== 'select' || [...input.options].some((o) => o.value === kept[f.name]))) input.value = kept[f.name];
    return el('label', {}, f.label, input);
  });
  const submit = el('button', { className: 'primary', type: 'submit', textContent: 'Crear ' + def.title.toLowerCase() });
  form.replaceChildren(...nodes, submit);
}

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const def = FORMS[tab];
  const data = new FormData(e.target);
  const payload = {};
  for (const f of def.fields()) {
    if (f.type === 'check') continue;
    const v = data.get(f.name);
    const numeric = f.type === 'number' || (f.type === 'select' && f.name.endsWith('Id'));
    payload[f.name] = numeric ? Number(v) : v;
  }
  const submit = e.target.querySelector('button[type=submit]');
  submit.disabled = true;
  try {
    const res = await api.create(def.recurso, payload);
    toast(res.message ?? def.title + ' creada');
    if (tab === 'lectura' && data.get('auto')) {
      const sensor = raw.sensores.find((s) => s.id === payload.sensorId);
      const zona = raw.zonas.find((z) => z.id === sensor?.zona?.id);
      if (zona) await alertaAutomatica(res.data, zona);
    }
    e.target.reset();
    await refresh();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    submit.disabled = false;
  }
});

// ---------- arranque ----------
renderLegend();
renderTabs();
renderForm();
refresh();
setInterval(refresh, 5000);
