// Cliente mínimo de la API de HidroMon. En desarrollo /api lo reenvía Vite a Nest.
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message || `Error ${res.status}`);
  }
  return body;
}

export const api = {
  zonas: () => request('/zonas'),
  sensores: () => request('/sensores'),
  lecturas: () => request('/lecturas'),
  alertas: () => request('/alertas'),
  usuarios: () => request('/usuarios'),
  cultivos: () => request('/cultivos'),
  resolverAlerta: (id) => request('/alertas/' + id + '/resolver', { method: 'PATCH' }),
  create: (recurso, payload) =>
    request(`/${recurso}`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (recurso, id, payload) =>
    request(`/${recurso}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (recurso, id) => request(`/${recurso}/${id}`, { method: 'DELETE' }),

  // Trae los cuatro recursos y los deja listos para dibujar.
  async snapshot() {
    const [zonas, sensores, lecturas, alertas, usuarios, cultivos] = await Promise.all([
      this.zonas(),
      this.sensores(),
      this.lecturas(),
      this.alertas(),
      this.usuarios(),
      this.cultivos(),
    ]);
    return {
      zonas: zonas.data,
      sensores: sensores.data,
      lecturas: lecturas.data, // vienen de la más reciente a la más antigua
      alertas: alertas.data,
      usuarios: usuarios.data,
      cultivos: cultivos.data, // ya vienen en orden alfabético
    };
  },
};
