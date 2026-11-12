// Gráfica de línea sin dependencias: humedad en el tiempo con la banda del rango permitido.

const COLORES = { linea: '#2f7df6', area: 'rgba(47,125,246,0.14)', banda: 'rgba(34,197,94,0.12)', eje: '#8a9aa0', rejilla: '#e3ecea' };

export function drawChart(canvas, puntos, rango, desde, hasta, hover) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const m = { l: 38, r: 12, t: 12, b: 24 };
  const iw = w - m.l - m.r;
  const ih = h - m.t - m.b;
  const x = (t) => m.l + ((t - desde) / Math.max(1, hasta - desde)) * iw;
  const y = (v) => m.t + (1 - v / 100) * ih;

  ctx.font = '11px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  [0, 25, 50, 75, 100].forEach((v) => {
    ctx.strokeStyle = COLORES.rejilla;
    ctx.beginPath();
    ctx.moveTo(m.l, y(v));
    ctx.lineTo(w - m.r, y(v));
    ctx.stroke();
    ctx.fillStyle = COLORES.eje;
    ctx.fillText(v + '%', m.l - 6, y(v));
  });

  if (rango) {
    ctx.fillStyle = COLORES.banda;
    ctx.fillRect(m.l, y(rango.max), iw, y(rango.min) - y(rango.max));
  }

  // Eje de tiempo
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORES.eje;
  const span = hasta - desde;
  for (let i = 0; i <= 4; i++) {
    const t = desde + (span * i) / 4;
    const d = new Date(t);
    const txt = span <= 36 * 3600e3
      ? d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
      : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    ctx.fillText(txt, Math.min(Math.max(x(t), m.l + 14), w - m.r - 14), h - 8);
  }

  const visibles = puntos.filter((p) => p.t >= desde && p.t <= hasta).sort((a, b) => a.t - b.t);
  if (visibles.length === 0) {
    ctx.fillStyle = COLORES.eje;
    ctx.textAlign = 'center';
    ctx.fillText('Sin lecturas en este periodo', m.l + iw / 2, m.t + ih / 2);
    return [];
  }

  if (visibles.length > 1) {
    ctx.beginPath();
    visibles.forEach((p, i) => (i ? ctx.lineTo(x(p.t), y(p.v)) : ctx.moveTo(x(p.t), y(p.v))));
    ctx.strokeStyle = COLORES.linea;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineTo(x(visibles.at(-1).t), y(0));
    ctx.lineTo(x(visibles[0].t), y(0));
    ctx.closePath();
    ctx.fillStyle = COLORES.area;
    ctx.fill();
  }

  const posiciones = visibles.map((p) => ({ ...p, px: x(p.t), py: y(p.v) }));
  posiciones.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.px, p.py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = COLORES.linea;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  if (hover) {
    const p = posiciones.reduce((best, q) => (Math.abs(q.px - hover) < Math.abs(best.px - hover) ? q : best));
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORES.linea;
    ctx.beginPath();
    ctx.moveTo(p.px, m.t);
    ctx.lineTo(p.px, m.t + ih);
    ctx.stroke();
    ctx.setLineDash([]);
    const txt = p.v + '%';
    const bw = ctx.measureText(txt).width + 14;
    const bx = Math.min(Math.max(p.px - bw / 2, m.l), w - m.r - bw);
    ctx.fillStyle = '#12313a';
    ctx.beginPath();
    ctx.roundRect(bx, Math.max(2, p.py - 30), bw, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(txt, bx + bw / 2, Math.max(2, p.py - 30) + 10);
  }
  return posiciones;
}
