import { api } from './api.js';
import { ESTADOS, buildWorld } from './model.js';
import { createScene } from './scene.js';
import { drawChart } from './chart.js';

const $ = (id) => document.getElementById(id);
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const ETIQUETA = { ok: 'Óptima', bajo: 'Baja', alto: 'Alta', sin: 'Sin datos' };

let raw = { zonas: [], sensores: [], lecturas: [], alertas: [] };
let zonas = [];
let selected = null; // { type, id }
let tab = 'zona';
let view = 'inicio';
let horas = 24;
let online = null;
let lastUpdate = null;
let hoverX = null;
let puntosGrafica = [];

const sceneApi = createScene($('scene'), (hit) => select(hit));

function select(hit) {
  selected = hit;
  sceneApi.setSelected(hit ? hit.type + ':' + hit.id : null);
  sceneApi.update(zonas);
  renderDetail();
  renderChart();
}

// ---------- utilidades ----------
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

function hace(date) {
  if (!date) return '–';
  const s = Math.max(0, Math.round((Date.now() - date) / 1000));
  if (s < 60) return 'hace ' + s + ' s';
  if (s < 3600) return 'hace ' + Math.round(s / 60) + ' min';
  return 'hace ' + Math.round(s / 3600) + ' h';
}

function badge(estado, texto) {
  return el('span', { className: 'badge ' + estado, textContent: texto ?? ETIQUETA[estado] });
}

// ---------- navegación y reloj ----------
$('nav').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-view]');
  if (!b) return;
  view = b.dataset.view;
  document.querySelectorAll('#nav button').forEach((x) => x.classList.toggle('active', x === b));
  ['inicio', 'historial', 'crear'].forEach((v) => ($('view-' + v).hidden = v !== view));
  if (view === 'inicio') renderChart();
});

function tick() {
  const now = new Date();
  $('clock').textContent =
    now.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) +
    '  ' +
    now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  $('updated').textContent = lastUpdate ? 'Actualizado ' + hace(lastUpdate) : 'sin datos';
}

// ---------- datos ----------
async function refresh() {
  try {
    raw = await api.snapshot();
    zonas = buildWorld(raw);
    online = true;
    lastUpdate = Date.now();
    sceneApi.update(zonas);
    renderAll();
  } catch (err) {
    online = false;
    renderOnline();
    renderSystem();
    toast('No se pudo leer la API: ' + err.message, 'error');
  }
}

function renderAll() {
  renderOnline();
  renderLegend();
  renderKpis();
  renderChart();
  renderSystem();
  renderDetail();
  renderTables();
  if (!$('form').contains(document.activeElement)) renderForm(true);
  $('empty').hidden = zonas.length > 0;
  tick();
}

function renderOnline() {
  const o = $('online');
  o.className = 'online' + (online ? '' : ' off');
  o.lastChild.textContent = online ? 'Sistema en línea' : 'Sin conexión con la API';
}

function renderLegend() {
  $('legend').replaceChildren(
    ...Object.values(ESTADOS).map((e) => el('span', {}, el('i', { className: 'dot', style: 'background:' + hex(e.color) }), e.label)),
  );
}

// ---------- tarjetas ----------
function kpi(icon, label, value, extra, bar) {
  const v = el('div', { className: 'value' }, value);
  if (extra) v.append(extra);
  const box = el('div', { className: 'kpi' }, el('div', { className: 'label', textContent: icon + ' ' + label }), v);
  if (bar !== undefined) box.append(el('div', { className: 'bar' }, el('i', { style: 'width:' + Math.max(0, Math.min(100, bar)) + '%' })));
  return box;
}

function renderKpis() {
  const todos = zonas.flatMap((z) => z.sensores);
  const conDatos = todos.filter((s) => s.ultima);
  const enRango = conDatos.filter((s) => s.estado === 'ok').length;
  const bajos = conDatos.filter((s) => s.estado === 'bajo').length;
  const altos = conDatos.filter((s) => s.estado === 'alto').length;
  const valores = conDatos.map((s) => s.ultima.valor);
  const prom = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;

  let estado = 'sin';
  let texto = 'Sin datos';
  if (conDatos.length) {
    if (!bajos && !altos) [estado, texto] = ['ok', 'Óptima'];
    else if (bajos && !altos) [estado, texto] = ['bajo', 'Baja'];
    else if (altos && !bajos) [estado, texto] = ['alto', 'Alta'];
    else [estado, texto] = ['warn', 'Atención'];
  }

  const graves = [...raw.alertas].sort((a, b) => ({ Alta: 3, Media: 2, Baja: 1 }[b.nivel] ?? 0) - ({ Alta: 3, Media: 2, Baja: 1 }[a.nivel] ?? 0));
  const nivelAlerta = graves[0]?.nivel;
  const cultivos = new Set(raw.zonas.map((z) => z.cultivo)).size;

  $('kpis').replaceChildren(
    kpi('💧', 'Humedad promedio', prom === null ? '–' : prom.toFixed(0) + ' %', badge(estado, texto), prom ?? 0),
    kpi('📡', 'Sensores en rango', enRango + '/' + todos.length, undefined, todos.length ? (enRango / todos.length) * 100 : 0),
    kpi('🚨', 'Alertas', String(raw.alertas.length), nivelAlerta ? badge(nivelAlerta === 'Alta' ? 'alto' : nivelAlerta === 'Baja' ? 'bajo' : 'warn', nivelAlerta) : badge('ok', 'Sin alertas')),
    kpi('🌱', 'Zonas', String(raw.zonas.length), el('small', { textContent: cultivos + (cultivos === 1 ? ' cultivo' : ' cultivos') })),
  );
}

// ---------- gráfica ----------
function puntosDeAlcance() {
  const sensorZona = new Map();
  zonas.forEach((z) => z.sensores.forEach((s) => sensorZona.set(s.id, z)));
  let lecturas = raw.lecturas.filter((l) => sensorZona.has(l.sensor?.id));
  let rango = null;
  let alcance = 'Todas las zonas';

  if (selected?.type === 'zona') {
    const z = zonas.find((x) => x.id === selected.id);
    if (z) {
      lecturas = lecturas.filter((l) => sensorZona.get(l.sensor.id) === z);
      rango = { min: z.humedadMin, max: z.humedadMax };
      alcance = 'Zona ' + z.nombre + ' · rango ' + z.humedadMin + '–' + z.humedadMax + '%';
    }
  } else if (selected?.type === 'sensor') {
    const z = sensorZona.get(selected.id);
    const s = z?.sensores.find((x) => x.id === selected.id);
    if (s) {
      lecturas = lecturas.filter((l) => l.sensor.id === s.id);
      rango = { min: z.humedadMin, max: z.humedadMax };
      alcance = 'Sensor ' + s.codigo + ' · ' + z.nombre;
    }
  }
  return { puntos: lecturas.map((l) => ({ t: new Date(l.fecha).getTime(), v: l.valor })), rango, alcance };
}

function renderChart() {
  if (view !== 'inicio') return;
  const { puntos, rango, alcance } = puntosDeAlcance();
  $('chart-scope').textContent = alcance;
  const hasta = Date.now();
  puntosGrafica = drawChart($('chart'), puntos, rango, hasta - horas * 3600e3, hasta, hoverX);
}

$('chips').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-h]');
  if (!b) return;
  horas = Number(b.dataset.h);
  document.querySelectorAll('#chips button').forEach((x) => x.classList.toggle('active', x === b));
  renderChart();
});
$('chart').addEventListener('mousemove', (e) => {
  hoverX = e.offsetX;
  renderChart();
});
$('chart').addEventListener('mouseleave', () => {
  hoverX = null;
  renderChart();
});
new ResizeObserver(() => renderChart()).observe($('chart'));

// ---------- estado del sistema ----------
function renderSystem() {
  const sensoresConDatos = zonas.flatMap((z) => z.sensores).filter((s) => s.ultima).length;
  const filas = [
    ['🌐 Conexión API (HidroMon)', online ? 'Conectado' : 'Sin conexión', online ? 'ok' : 'alto'],
    ['🗄️ Base de datos (Postgres)', online ? 'OK' : 'Sin respuesta', online ? 'ok' : 'alto'],
    ['📡 Sensores con lecturas', sensoresConDatos + ' de ' + raw.sensores.length, sensoresConDatos ? 'ok' : 'sin'],
    ['🌱 Zonas registradas', String(raw.zonas.length), raw.zonas.length ? 'ok' : 'sin'],
    ['🚨 Alertas', raw.alertas.length ? raw.alertas.length + ' registradas' : 'Ninguna', raw.alertas.length ? 'alto' : 'ok'],
  ];
  const color = { ok: 'var(--green)', alto: 'var(--red)', sin: 'var(--grey)' };
  $('sys').replaceChildren(
    ...filas.map(([nombre, valor, st]) =>
      el('li', {}, nombre, el('span', { className: 'st' }, el('i', { style: 'background:' + color[st] }), valor)),
    ),
  );
  const sb = $('sys-badge');
  sb.className = 'badge ' + (online ? 'ok' : 'alto');
  sb.textContent = online ? 'Funcionando' : 'Sin conexión';
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
  close.onclick = () => select(null);

  if (selected.type === 'zona') {
    const z = zonas.find((x) => x.id === selected.id);
    if (!z) return void (box.hidden = true);
    const table = el('table', {});
    table.append(
      row('Cultivo', z.cultivo),
      row('Rango permitido', z.humedadMin + '% – ' + z.humedadMax + '%'),
      row('Humedad promedio', z.promedio === null ? 'sin lecturas' : z.promedio.toFixed(1) + '%'),
      row('Sensores', z.sensores.length),
      row('Alertas', z.alertas.length),
    );
    box.replaceChildren(close, el('h3', { textContent: z.nombre }), el('div', { className: 'sub' }, 'Zona ', badge(z.estado, ESTADOS[z.estado].label)), table);
    z.alertas.slice(0, 3).forEach((a) => box.append(el('div', { className: 'alert-line', textContent: '⚠ ' + a.nivel + ': ' + a.mensaje })));
  } else {
    const z = zonas.find((x) => x.sensores.some((s) => s.id === selected.id));
    const s = z?.sensores.find((x) => x.id === selected.id);
    if (!s) return void (box.hidden = true);
    const table = el('table', {});
    table.append(row('Zona', z.nombre), row('Tipo', s.tipo), row('Rango de la zona', z.humedadMin + '% – ' + z.humedadMax + '%'));
    s.lecturas.slice(0, 5).forEach((l) => table.append(row(new Date(l.fecha).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), l.valor + '%')));
    const btn = el('button', { className: 'ghost', textContent: 'Enviar lectura aleatoria' });
    btn.onclick = () => lecturaAleatoria(s, z, btn);
    box.replaceChildren(
      close,
      el('h3', { textContent: s.codigo }),
      el('div', { className: 'sub' }, 'Sensor ', badge(s.estado, ESTADOS[s.estado].label)),
      table,
      el('div', { className: 'actions' }, btn),
    );
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

// ---------- historial ----------
function tabla(id, cabeceras, filas) {
  const t = $(id);
  t.replaceChildren(
    el('thead', {}, el('tr', {}, ...cabeceras.map((c) => el('th', { textContent: c })))),
    el('tbody', {}, ...(filas.length ? filas : [el('tr', {}, el('td', { colSpan: cabeceras.length, textContent: 'Sin registros todavía' }))])),
  );
}

function renderTables() {
  const sensorInfo = new Map();
  zonas.forEach((z) => z.sensores.forEach((s) => sensorInfo.set(s.id, { s, z })));
  tabla(
    'tbl-lecturas',
    ['Fecha', 'Sensor', 'Zona', 'Humedad', 'Estado'],
    raw.lecturas.slice(0, 25).map((l) => {
      const info = sensorInfo.get(l.sensor?.id);
      const estado = info ? (l.valor < info.z.humedadMin ? 'bajo' : l.valor > info.z.humedadMax ? 'alto' : 'ok') : 'sin';
      return el(
        'tr',
        {},
        el('td', { textContent: new Date(l.fecha).toLocaleString('es-CO') }),
        el('td', { textContent: info?.s.codigo ?? '#' + l.sensor?.id }),
        el('td', { textContent: info?.z.nombre ?? '–' }),
        el('td', { textContent: l.valor + '%' }),
        el('td', {}, badge(estado, estado === 'ok' ? 'En rango' : ESTADOS[estado].label)),
      );
    }),
  );
  tabla(
    'tbl-alertas',
    ['Fecha', 'Nivel', 'Zona', 'Mensaje'],
    raw.alertas.slice(0, 25).map((a) =>
      el(
        'tr',
        {},
        el('td', { textContent: new Date(a.createdAt).toLocaleString('es-CO') }),
        el('td', {}, badge(a.nivel === 'Alta' ? 'alto' : a.nivel === 'Baja' ? 'bajo' : 'warn', a.nivel)),
        el('td', { textContent: a.zona?.nombre ?? '–' }),
        el('td', { textContent: a.mensaje }),
      ),
    ),
  );
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
  form.replaceChildren(...nodes, el('button', { className: 'primary', type: 'submit', textContent: 'Crear ' + def.title.toLowerCase() }));
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
renderOnline();
tick();
refresh();
setInterval(refresh, 5000);
setInterval(tick, 1000);
