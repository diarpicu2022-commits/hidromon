import { api } from './api.js';
import { ESTADOS, buildWorld } from './model.js';
import { createScene } from './scene.js';
import { iconEl, hydrateIcons } from './icons.js';

const $ = (id) => document.getElementById(id);
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const ETIQUETA = { ok: 'Óptima', bajo: 'Baja', alto: 'Alta', sin: 'Sin datos' };
const NIVEL_ESTADO = { Alta: 'alto', Baja: 'bajo', Media: 'warn' };

let raw = { zonas: [], sensores: [], lecturas: [], alertas: [], usuarios: [], cultivos: [] };
let zonas = [];
let selected = null; // { type, id } en la escena
let tab = 'zona'; // recurso que se gestiona
let editing = null; // { id } del registro que se edita, o null si se crea
let view = 'inicio';
let online = null;
let lastUpdate = null;

const sceneApi = createScene($('scene'), (hit) => select(hit));

function select(hit) {
  selected = hit;
  sceneApi.setSelected(hit ? hit.type + ':' + hit.id : null);
  sceneApi.update(zonas);
  renderDetail();
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
  toastTimer = setTimeout(() => (t.className = ''), 4000);
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

const fecha = (d) => new Date(d).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// ---------- navegación y reloj ----------
function setView(v) {
  view = v;
  document.querySelectorAll('#nav button').forEach((x) => x.classList.toggle('active', x.dataset.view === v));
  ['inicio', 'historial', 'crear'].forEach((n) => ($('view-' + n).hidden = n !== v));
}
$('nav').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-view]');
  if (b) setView(b.dataset.view);
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
    // Si lo seleccionado ya no existe (por ejemplo, se eliminó), se limpia la selección.
    const existe = selected && (selected.type === 'zona' ? zonas.some((z) => z.id === selected.id) : zonas.some((z) => z.sensores.some((s) => s.id === selected.id)));
    if (selected && !existe) {
      selected = null;
      sceneApi.setSelected(null);
    }
    // Lo mismo con el registro que se estaba editando.
    if (editing && !listaDe(tab).some((r) => r.id === editing.id)) editing = null;
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
  renderSystem();
  renderDetail();
  renderTables();
  renderTabs();
  renderGestion();
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
function kpi(icon, label, value, extra, bar, sub) {
  const v = el('div', { className: 'value' }, value);
  if (extra) v.append(extra);
  const box = el('div', { className: 'kpi' }, el('div', { className: 'label' }, iconEl(icon), label), v);
  if (bar !== undefined) box.append(el('div', { className: 'bar' }, el('i', { style: 'width:' + Math.max(0, Math.min(100, bar)) + '%' })));
  if (sub) box.append(el('div', { className: 'label', textContent: sub }));
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

  // Alertas activas = alertas abiertas (sin resolver) que guarda la API
  const abiertas = raw.alertas.filter((a) => !a.resuelta);
  const hayAlta = abiertas.some((a) => a.nivel === 'Alta');
  const hayBaja = abiertas.some((a) => a.nivel === 'Baja');
  const nivelKpi = hayAlta ? ['alto', 'Alta'] : hayBaja ? ['bajo', 'Baja'] : ['warn', 'Media'];
  // Cultivos distintos en las zonas: el principal y los sembrados, sin repetir por nombre.
  const cultivos = new Set(raw.zonas.flatMap((z) => [z.cultivo, ...(z.cultivos ?? []).map((c) => c.nombre)]).map((n) => n.trim().toLowerCase())).size;

  $('kpis').replaceChildren(
    kpi('drop', 'Humedad promedio', prom === null ? '–' : prom.toFixed(0) + ' %', badge(estado, texto), prom ?? 0),
    kpi('sensor', 'Sensores en rango', enRango + '/' + todos.length, undefined, todos.length ? (enRango / todos.length) * 100 : 0),
    kpi('bell', 'Alertas activas', String(abiertas.length), abiertas.length ? badge(...nivelKpi) : badge('ok', 'Todo en rango'), undefined, raw.alertas.length - abiertas.length + ' resueltas'),
    kpi('sprout', 'Zonas', String(raw.zonas.length), el('small', { textContent: cultivos + (cultivos === 1 ? ' cultivo' : ' cultivos') })),
  );
}

// ---------- estado del sistema ----------
function renderSystem() {
  const sensoresConDatos = zonas.flatMap((z) => z.sensores).filter((s) => s.ultima).length;
  const activas = raw.alertas.filter((a) => !a.resuelta).length;
  const filas = [
    ['globe', 'Conexión API (HidroMon)', online ? 'Conectado' : 'Sin conexión', online ? 'ok' : 'alto'],
    ['database', 'Base de datos (Postgres)', online ? 'OK' : 'Sin respuesta', online ? 'ok' : 'alto'],
    ['sensor', 'Sensores con lecturas', sensoresConDatos + ' de ' + raw.sensores.length, sensoresConDatos ? 'ok' : 'sin'],
    ['sprout', 'Zonas registradas', String(raw.zonas.length), raw.zonas.length ? 'ok' : 'sin'],
    ['bell', 'Alertas activas', activas ? activas + (activas === 1 ? ' abierta' : ' abiertas') : 'Ninguna', activas ? 'alto' : 'ok'],
  ];
  const color = { ok: 'var(--green)', alto: 'var(--red)', sin: 'var(--grey)' };
  $('sys').replaceChildren(
    ...filas.map(([ico, nombre, valor, st]) => el('li', {}, el('span', { className: 'sname' }, iconEl(ico), nombre), el('span', { className: 'st' }, el('i', { style: 'background:' + color[st] }), valor))),
  );
  const sb = $('sys-badge');
  sb.className = 'badge ' + (online ? 'ok' : 'alto');
  sb.textContent = online ? 'Funcionando' : 'Sin conexión';
}

// ---------- borrar con confirmación en dos pasos (sin ventanas del navegador) ----------
function deleteButton(recurso, id, nombre, onDone) {
  const b = el('button', { className: 'mini danger', type: 'button', textContent: 'Eliminar' });
  let timer;
  b.onclick = async () => {
    if (!b.classList.contains('confirm')) {
      b.classList.add('confirm');
      b.textContent = '¿Seguro?';
      timer = setTimeout(() => {
        b.classList.remove('confirm');
        b.textContent = 'Eliminar';
      }, 4000);
      return;
    }
    clearTimeout(timer);
    b.disabled = true;
    try {
      const res = await api.remove(recurso, id);
      toast(res.message ?? nombre + ' eliminado');
      onDone?.();
      await refresh();
    } catch (err) {
      toast(err.message, 'error');
      b.disabled = false;
      b.classList.remove('confirm');
      b.textContent = 'Eliminar';
    }
  };
  return b;
}

function resolverButton(id) {
  const b = el('button', { className: 'mini', type: 'button', textContent: 'Resolver' });
  b.onclick = async () => {
    b.disabled = true;
    try {
      const res = await api.resolverAlerta(id);
      toast(res.message);
      await refresh();
    } catch (err) {
      toast(err.message, 'error');
      b.disabled = false;
    }
  };
  return b;
}

function editButton(type, id) {
  const b = el('button', { className: 'mini', type: 'button', textContent: 'Editar' });
  b.onclick = () => startEdit(type, id);
  return b;
}

function startEdit(type, id) {
  tab = type;
  editing = { id };
  setView('crear');
  renderTabs();
  renderGestion();
  renderForm(false);
}

// ---------- panel de detalle (escena) ----------
function row(a, b) {
  return el('tr', {}, el('td', { textContent: a }), el('td', { textContent: b }));
}

// Fila sin dato: el valor va en gris (anexo de cultivos, §5).
function rowVacio(a, b) {
  return el('tr', {}, el('td', { textContent: a }), el('td', { className: 'vacio', textContent: b }));
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
      row('Cultivo principal', z.cultivo),
      nombresCultivos(z) ? row('Cultivos sembrados', nombresCultivos(z)) : rowVacio('Cultivos sembrados', 'ninguno'),
      row('Rango permitido', z.humedadMin + '% – ' + z.humedadMax + '%'),
      row('Humedad promedio', z.promedio === null ? 'sin lecturas' : z.promedio.toFixed(1) + '%'),
      row('Sensores', z.sensores.length),
      row('Alertas activas', z.alertaActual ? z.alertaActual.nivel + ' · ' + z.alertaActual.count : 'ninguna'),
      row('Alertas resueltas', z.alertas.length - z.abiertas.length),
      row('Responsable', z.usuario?.nombre ?? 'sin asignar'),
    );
    box.replaceChildren(
      close,
      el('h3', { textContent: z.nombre }),
      el('div', { className: 'sub' }, 'Zona ', badge(z.estado, ESTADOS[z.estado].label)),
      table,
      el('div', { className: 'actions' }, el('div', { className: 'row-actions' }, editButton('zona', z.id), deleteButton('zonas', z.id, 'Zona', () => select(null)))),
    );
  } else {
    const z = zonas.find((x) => x.sensores.some((s) => s.id === selected.id));
    const s = z?.sensores.find((x) => x.id === selected.id);
    if (!s) return void (box.hidden = true);
    const table = el('table', {});
    table.append(row('Zona', z.nombre), row('Tipo', s.tipo), row('Rango de la zona', z.humedadMin + '% – ' + z.humedadMax + '%'));
    s.lecturas.slice(0, 5).forEach((l) => table.append(row(fecha(l.fecha), l.valor + '%')));
    const btn = el('button', { className: 'ghost', textContent: 'Enviar lectura aleatoria' });
    btn.onclick = () => lecturaAleatoria(s, z, btn);
    box.replaceChildren(
      close,
      el('h3', { textContent: s.codigo }),
      el('div', { className: 'sub' }, 'Sensor ', badge(s.estado, ESTADOS[s.estado].label)),
      table,
      el('div', { className: 'actions' }, btn, el('div', { className: 'row-actions' }, editButton('sensor', s.id), deleteButton('sensores', s.id, 'Sensor', () => select(null)))),
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
    avisoLectura(res);
    await refresh();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

// La API decide si hay que abrir o cerrar alertas; aquí solo se avisa al usuario.
function avisoLectura(res) {
  if (res.alerta) toast('Lectura fuera de rango: la API abrió una alerta ' + res.alerta.nivel, 'error');
  else if (res.alertasResueltas) toast('Lectura en rango: se resolvieron ' + res.alertasResueltas + ' alerta(s) del sensor');
  else toast('Lectura creada: ' + res.data.valor + '%');
}

// ---------- historial (solo lectura) ----------
function tabla(id, cabeceras, filas) {
  $(id).replaceChildren(
    el('thead', {}, el('tr', {}, ...cabeceras.map((c) => el('th', { textContent: c })))),
    el('tbody', {}, ...(filas.length ? filas : [el('tr', {}, el('td', { colSpan: cabeceras.length, textContent: 'Sin registros todavía' }))])),
  );
}

function estadoAlerta(a) {
  return a.resuelta ? badge('ok', 'Resuelta') : badge('alto', 'Activa');
}

function estadoLectura(l) {
  const z = zonas.find((x) => x.sensores.some((s) => s.id === l.sensor?.id));
  if (!z) return 'sin';
  return l.valor < z.humedadMin ? 'bajo' : l.valor > z.humedadMax ? 'alto' : 'ok';
}

function renderTables() {
  const sensorInfo = new Map();
  zonas.forEach((z) => z.sensores.forEach((s) => sensorInfo.set(s.id, { s, z })));
  tabla(
    'tbl-lecturas',
    ['Fecha', 'Sensor', 'Zona', 'Humedad', 'Estado'],
    raw.lecturas.slice(0, 25).map((l) => {
      const info = sensorInfo.get(l.sensor?.id);
      const estado = estadoLectura(l);
      return el(
        'tr',
        {},
        el('td', { textContent: fecha(l.fecha) }),
        el('td', { textContent: info?.s.codigo ?? '#' + l.sensor?.id }),
        el('td', { textContent: info?.z.nombre ?? '–' }),
        el('td', { textContent: l.valor + '%' }),
        el('td', {}, badge(estado, estado === 'ok' ? 'En rango' : ESTADOS[estado].label)),
      );
    }),
  );
  tabla(
    'tbl-alertas',
    ['Fecha', 'Nivel', 'Zona', 'Estado', 'Mensaje'],
    raw.alertas.slice(0, 25).map((a) =>
      el('tr', {}, el('td', { textContent: fecha(a.createdAt) }), el('td', {}, badge(NIVEL_ESTADO[a.nivel] ?? 'warn', a.nivel)), el('td', { textContent: a.zona?.nombre ?? '–' }), el('td', {}, estadoAlerta(a)), el('td', { textContent: a.mensaje })),
    ),
  );
}

// ---------- gestionar: crear, editar y eliminar ----------
const nombreSensor = (s) => s.codigo + ' · ' + s.tipo;
// Cultivos de una zona en texto, en orden alfabético.
const nombresCultivos = (z) => (z.cultivos ?? []).map((c) => c.nombre).sort((a, b) => a.localeCompare(b, 'es')).join(', ');
// Nombres de las zonas que tienen sembrado el cultivo, o «–» si ninguna.
const zonasDeCultivo = (id) => raw.zonas.filter((z) => (z.cultivos ?? []).some((c) => c.id === id)).map((z) => z.nombre).join(', ') || '–';

const RES = {
  zona: {
    title: 'Zona',
    plural: 'Zonas',
    recurso: 'zonas',
    hint: 'Una zona es un área de cultivo con su rango de humedad.',
    lista: () => raw.zonas,
    cabeceras: ['ID', 'Nombre', 'Cultivo principal', 'Cultivos sembrados', 'Rango', 'Responsable'],
    celdas: (z) => [z.id, z.nombre, z.cultivo, nombresCultivos(z) || '–', z.humedadMin + '–' + z.humedadMax + '%', z.usuario?.nombre ?? '–'],
    valores: (z) => ({ nombre: z.nombre, cultivo: z.cultivo, humedadMin: z.humedadMin, humedadMax: z.humedadMax, usuarioId: z.usuario?.id ?? '', cultivoIds: (z.cultivos ?? []).map((c) => c.id) }),
    campos: () => [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'cultivo', label: 'Cultivo principal', type: 'text', required: true },
      { name: 'cultivoIds', label: 'Cultivos sembrados', type: 'multi', hint: 'Marca todos los que apliquen', options: raw.cultivos.map((c) => [c.id, c.nombre]) },
      { name: 'humedadMin', label: 'Humedad mínima (%)', type: 'number', required: true, value: 60 },
      { name: 'humedadMax', label: 'Humedad máxima (%)', type: 'number', required: true, value: 80 },
      { name: 'usuarioId', label: 'Responsable (opcional)', type: 'select', options: [['', 'Sin responsable'], ...raw.usuarios.map((u) => [u.id, u.nombre + ' · ' + u.rol])] },
    ],
  },
  sensor: {
    title: 'Sensor',
    plural: 'Sensores',
    recurso: 'sensores',
    nuevo: 'Nuevo sensor',
    hint: 'Un sensor pertenece a una zona que ya exista.',
    lista: () => raw.sensores,
    cabeceras: ['ID', 'Código', 'Tipo', 'Zona'],
    celdas: (s) => [s.id, s.codigo, s.tipo, s.zona?.nombre ?? '–'],
    valores: (s) => ({ codigo: s.codigo, tipo: s.tipo, zonaId: s.zona?.id }),
    campos: () => [
      { name: 'codigo', label: 'Código', type: 'text', required: true },
      { name: 'tipo', label: 'Tipo', type: 'select', options: ['Suelo', 'Ambiental'].map((t) => [t, t]) },
      { name: 'zonaId', label: 'Zona', type: 'select', options: raw.zonas.map((z) => [z.id, z.nombre + ' (' + z.cultivo + ')']) },
    ],
  },
  lectura: {
    title: 'Lectura',
    plural: 'Lecturas',
    recurso: 'lecturas',
    hint: 'Una lectura es una medición de humedad de un sensor que ya exista.',
    lista: () => raw.lecturas,
    cabeceras: ['ID', 'Fecha', 'Sensor', 'Humedad'],
    celdas: (l) => [l.id, fecha(l.fecha), raw.sensores.find((s) => s.id === l.sensor?.id)?.codigo ?? '#' + l.sensor?.id, l.valor + '%'],
    valores: (l) => ({ sensorId: l.sensor?.id, valor: l.valor }),
    campos: () => [
      { name: 'sensorId', label: 'Sensor', type: 'select', options: raw.sensores.map((s) => [s.id, nombreSensor(s)]) },
      { name: 'valor', label: 'Valor de humedad (%)', type: 'number', required: true, value: 70 },
    ],
  },
  alerta: {
    title: 'Alerta',
    plural: 'Alertas',
    recurso: 'alertas',
    hint: 'Una alerta se asocia a una lectura y a una zona que ya existan.',
    lista: () => raw.alertas,
    cabeceras: ['ID', 'Nivel', 'Zona', 'Estado', 'Mensaje'],
    celdas: (a) => [a.id, a.nivel, a.zona?.nombre ?? '–', a.resuelta ? 'Resuelta' : 'Activa', a.mensaje],
    extra: (a) => (a.resuelta ? [] : [resolverButton(a.id)]),
    valores: (a) => ({ lecturaId: a.lectura?.id, zonaId: a.zona?.id, nivel: a.nivel, mensaje: a.mensaje }),
    campos: () => {
      const actual = editing ? raw.alertas.find((a) => a.id === editing.id)?.lectura : null;
      const lecturas = raw.lecturas.slice(0, 30);
      if (actual && !lecturas.some((l) => l.id === actual.id)) lecturas.push(actual);
      return [
        { name: 'lecturaId', label: 'Lectura', type: 'select', options: lecturas.map((l) => [l.id, '#' + l.id + ' · ' + l.valor + '%']) },
        { name: 'zonaId', label: 'Zona', type: 'select', options: raw.zonas.map((z) => [z.id, z.nombre]) },
        { name: 'nivel', label: 'Nivel', type: 'select', options: ['Alta', 'Media', 'Baja'].map((t) => [t, t]) },
        { name: 'mensaje', label: 'Mensaje', type: 'text', required: true },
      ];
    },
  },
  cultivo: {
    title: 'Cultivo',
    nuevo: 'Nuevo cultivo',
    plural: 'Cultivos',
    recurso: 'cultivos',
    hint: 'Catálogo de cultivos. Se asignan a las zonas desde el formulario de cada zona.',
    lista: () => raw.cultivos,
    cabeceras: ['ID', 'Nombre', 'Zonas'],
    celdas: (c) => [c.id, c.nombre, zonasDeCultivo(c.id)],
    valores: (c) => ({ nombre: c.nombre, descripcion: c.descripcion ?? '' }),
    campos: () => [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción (opcional)', type: 'text' },
    ],
  },
  usuario: {
    title: 'Usuario',
    plural: 'Usuarios',
    recurso: 'usuarios',
    nuevo: 'Nuevo usuario',
    hint: 'Un usuario puede ser responsable de zonas. Su perfil (municipio y finca) se guarda y se corrige junto con él.',
    lista: () => raw.usuarios,
    cabeceras: ['ID', 'Nombre', 'Correo', 'Rol'],
    celdas: (u) => [u.id, u.nombre, u.email, u.rol],
    valores: (u) => ({ nombre: u.nombre, email: u.email, rol: u.rol, municipio: u.perfil?.municipio ?? '', finca: u.perfil?.finca ?? '' }),
    campos: () => [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'email', label: 'Correo', type: 'email', required: true },
      { name: 'rol', label: 'Rol', type: 'select', options: ['Agricultor', 'Administrador'].map((t) => [t, t]) },
      { name: 'municipio', label: 'Municipio', type: 'text', required: true, perfil: true },
      { name: 'finca', label: 'Finca', type: 'text', required: true, perfil: true },
    ],
  },
};

const listaDe = (t) => RES[t].lista();

function renderTabs() {
  $('tabs').replaceChildren(
    ...Object.entries(RES).map(([key, r]) => {
      const b = el('button', { type: 'button', textContent: r.plural + ' (' + r.lista().length + ')', className: key === tab ? 'active' : '' });
      b.onclick = () => {
        tab = key;
        editing = null;
        renderTabs();
        renderGestion();
        renderForm(false);
      };
      return b;
    }),
  );
}

function renderGestion() {
  const def = RES[tab];
  const filas = def.lista().slice(0, 100).map((item) => {
    const tr = el('tr', { className: editing?.id === item.id ? 'editing' : '' });
    def.celdas(item).forEach((c) => tr.append(el('td', { textContent: c })));
    tr.append(el('td', {}, el('div', { className: 'row-actions' }, ...(def.extra?.(item) ?? []), editButton(tab, item.id), deleteButton(def.recurso, item.id, def.title, () => editing?.id === item.id && (editing = null)))));
    return tr;
  });
  $('tbl-gestion').replaceChildren(
    el('thead', {}, el('tr', {}, ...def.cabeceras.map((c) => el('th', { textContent: c })), el('th', {}))),
    el('tbody', {}, ...(filas.length ? filas : [el('tr', {}, el('td', { colSpan: def.cabeceras.length + 1, textContent: 'Aún no hay registros. Crea el primero con «Nuevo».' }))])),
  );
}

$('btn-nuevo').onclick = () => {
  editing = null;
  renderGestion();
  renderForm(false);
  $('form').querySelector('input, select')?.focus();
};

// Grupo de casillas con forma de píldora (anexo docs/ux/anexos/2026-11-12-web-cultivos.md).
function multiField(f, marcados) {
  const set = new Set(marcados.map(Number));
  const fs = el('fieldset', { className: 'multi' }, el('legend', { textContent: f.label }));
  if (!f.options.length) {
    const ir = el('button', { type: 'button', className: 'link', textContent: 'Ir a Cultivos' });
    ir.onclick = () => {
      tab = 'cultivo';
      editing = null;
      renderTabs();
      renderGestion();
      renderForm(false);
    };
    fs.append(el('p', { className: 'multi-empty' }, 'Aún no hay cultivos. Créalos en la pestaña Cultivos. ', ...(RES.cultivo ? [ir] : [])));
    return fs;
  }
  fs.append(el('p', { className: 'multi-hint', textContent: f.hint }));
  const choices = el('div', { className: 'choices' });
  f.options.forEach(([v, text]) => {
    const input = el('input', { type: 'checkbox', name: f.name, value: v, checked: set.has(Number(v)) });
    choices.append(el('label', { className: 'choice' }, input, el('span', { textContent: text })));
  });
  fs.append(choices);
  return fs;
}

// Conserva lo que el usuario ya escribió cuando el refresco automático redibuja el formulario.
function renderForm(keepValues = false) {
  const form = $('form');
  const def = RES[tab];
  const item = editing ? def.lista().find((r) => r.id === editing.id) : null;
  const inicial = item ? def.valores(item) : {};
  const kept = {};
  if (keepValues) {
    const data = new FormData(form);
    def.campos().forEach((f) => {
      if (f.type === 'multi') kept[f.name] = data.getAll(f.name).map(Number);
      else if (data.has(f.name)) kept[f.name] = data.get(f.name);
    });
  }

  $('form-title').textContent = item ? 'Editar ' + def.title.toLowerCase() + ' #' + item.id : def.nuevo ?? 'Nueva ' + def.title.toLowerCase();
  $('form-hint').textContent = def.hint;

  const nodes = def.campos().map((f) => {
    let input;
    if (f.type === 'select') {
      input = el('select', { name: f.name });
      f.options.forEach(([v, text]) => input.append(el('option', { value: v, textContent: text })));
    } else if (f.type === 'multi') {
      return multiField(f, kept[f.name] ?? inicial[f.name] ?? []);
    } else if (f.type === 'check') {
      input = el('input', { name: f.name, type: 'checkbox', checked: f.value });
      return el('label', { className: 'check' }, input, f.label);
    } else {
      input = el('input', { name: f.name, type: f.type, required: !!f.required });
      if (f.type === 'number') input.step = 'any';
    }
    const candidato = kept[f.name] !== undefined ? kept[f.name] : inicial[f.name] !== undefined ? inicial[f.name] : f.value ?? '';
    if (f.type !== 'select' || [...input.options].some((o) => o.value === String(candidato))) input.value = candidato;
    return el('label', {}, f.label, input);
  });

  const acciones = el('div', { className: 'form-actions' }, el('button', { className: 'primary', type: 'submit', textContent: item ? 'Guardar cambios' : 'Crear ' + def.title.toLowerCase() }));
  if (item) {
    const cancel = el('button', { className: 'cancel', type: 'button', textContent: 'Cancelar' });
    cancel.onclick = () => {
      editing = null;
      renderGestion();
      renderForm(false);
    };
    acciones.append(cancel);
  }
  form.replaceChildren(...nodes, acciones);
}

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const def = RES[tab];
  const data = new FormData(e.target);
  const payload = {};
  for (const f of def.campos()) {
    if (f.type === 'check') continue;
    if (f.type === 'multi') {
      if (f.options.length) payload[f.name] = data.getAll(f.name).map(Number);
      continue;
    }
    const v = data.get(f.name);
    const numeric = f.type === 'number' || (f.type === 'select' && f.name.endsWith('Id'));
    const valor = numeric ? (v === '' ? null : Number(v)) : v;
    if (f.perfil) (payload.perfil ??= {})[f.name] = valor;
    else payload[f.name] = valor;
  }
  const submit = e.target.querySelector('button[type=submit]');
  submit.disabled = true;
  try {
    if (editing) {
      const res = await api.update(def.recurso, editing.id, payload);
      toast(res.message ?? def.title + ' actualizado correctamente');
      editing = null;
    } else {
      const res = await api.create(def.recurso, payload);
      toast(res.message ?? def.title + ' guardado correctamente');
      if (tab === 'lectura') avisoLectura(res);
    }
    e.target.reset();
    await refresh();
    renderForm(false);
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    submit.disabled = false;
  }
});

// ---------- arranque ----------
hydrateIcons();
renderLegend();
renderTabs();
renderGestion();
renderForm();
renderOnline();
tick();
refresh();
setInterval(refresh, 5000);
setInterval(tick, 1000);
