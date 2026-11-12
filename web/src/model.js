// Lógica de datos: relaciona zonas, sensores, lecturas y alertas.

export const ESTADOS = {
  ok: { label: 'Dentro del rango', color: 0x22c55e },
  bajo: { label: 'Por debajo', color: 0x3b82f6 },
  alto: { label: 'Por encima', color: 0xef4444 },
  sin: { label: 'Sin lecturas', color: 0x8b9aa0 },
};

export function estadoDe(valor, zona) {
  if (valor === undefined || valor === null) return 'sin';
  if (valor < zona.humedadMin) return 'bajo';
  if (valor > zona.humedadMax) return 'alto';
  return 'ok';
}

// Une todo en una estructura por zona. `lecturas` llega ordenada de la más reciente a la más antigua.
export function buildWorld({ zonas, sensores, lecturas, alertas }) {
  const ultimaPorSensor = new Map();
  const lecturasPorSensor = new Map();
  for (const l of lecturas) {
    const sid = l.sensor?.id;
    if (sid === undefined) continue;
    if (!ultimaPorSensor.has(sid)) ultimaPorSensor.set(sid, l);
    if (!lecturasPorSensor.has(sid)) lecturasPorSensor.set(sid, []);
    lecturasPorSensor.get(sid).push(l);
  }

  return zonas.map((zona) => {
    const sensoresZona = sensores
      .filter((s) => s.zona?.id === zona.id)
      .map((s) => {
        const ultima = ultimaPorSensor.get(s.id);
        return {
          ...s,
          ultima,
          lecturas: lecturasPorSensor.get(s.id) ?? [],
          estado: estadoDe(ultima?.valor, zona),
        };
      });
    const valores = sensoresZona.filter((s) => s.ultima).map((s) => s.ultima.valor);
    const promedio = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    // Alertas abiertas (sin resolver) de la zona: así lo decide la API, no el navegador.
    const abiertas = alertas.filter((a) => a.zona?.id === zona.id && !a.resuelta);
    const alertaActual = abiertas.length ? { nivel: alertaMasGrave(abiertas).nivel, count: abiertas.length } : null;
    return {
      ...zona,
      alertaActual,
      sensores: sensoresZona,
      alertas: alertas.filter((a) => a.zona?.id === zona.id),
      abiertas,
      promedio,
      estado: estadoDe(promedio, zona),
    };
  });
}

const GRAVEDAD = { Alta: 3, Media: 2, Baja: 1 };
export function alertaMasGrave(alertas) {
  return [...alertas].sort((a, b) => (GRAVEDAD[b.nivel] ?? 0) - (GRAVEDAD[a.nivel] ?? 0))[0];
}
