# Anexo de diseño · Cultivos en la web de HidroMon

Fecha 2026-11-12. Rama `feature/web-cultivos`, sobre la API de `feature/cultivos-manytomany` (PR #25).
Es una extensión de la interfaz que hizo Leider (PR #20 y #23), no un rediseño.

## 1. Usuarios

Agricultor o administrador que configura sus zonas desde un computador, sin prisa, en la vista
Gestionar. Conoce sus cultivos por nombre común (Tomate, Lechuga, Papa). Experiencia técnica baja o
media. La tarea es de lectura obligada: entra a asignar cultivos y sale.

## 2. Comunicación

- Lo que tiene que decir la pantalla: qué cultivos hay en cada zona y cuáles faltan por asignar.
- Lo que no puede decir: que un cultivo es un estado. El color en esta interfaz ya significa humedad
  (verde en rango, azul bajo, rojo alto, ámbar aviso).
- Tarea dominante: marcar varios cultivos en el formulario de la zona sin salir de él.

## 3. Referentes

| Fuente | Observación | Decisión | Lo que no copio |
|---|---|---|---|
| GOV.UK Design System, Checkboxes (design-system.service.gov.uk/components/checkboxes), consultado 2026-11-12 | Varias opciones van en `fieldset` con `legend`, con pista «selecciona todas las que apliquen», orden alfabético y sin opciones marcadas de antemano | `fieldset` + `legend` «Cultivos sembrados», pista corta, cultivos en orden alfabético, nada marcado al crear | Su estética de casilla cuadrada grande |
| Carbon Design System, Tag usage (carbondesignsystem.com/components/tag/usage), consultado 2026-11-12 | Las etiquetas seleccionables necesitan alto contraste entre marcado y no marcado, borde que anuncie interacción, y solo reemplazan controles de formulario si todo el formulario usa etiquetas | La píldora conserva la casilla nativa visible dentro, así sigue siendo un control de formulario y no una etiqueta. Marcado con fondo `--primary-soft`, borde y texto `--primary` | El color de las etiquetas de Carbon y su uso como filtro |
| Nielsen Norman Group, Checkboxes vs. radio buttons (nngroup.com/articles/checkboxes-vs-radio-buttons), consultado 2026-11-12 | La etiqueta entera debe ser clicable, y si las opciones van en horizontal necesitan separación clara | Cada píldora es un `label` que envuelve su casilla. Separación de 8 px entre píldoras | La recomendación de apilar en vertical: con 3 a 10 cultivos cortos la fila con salto de línea ahorra alto y sigue legible |
| WCAG 2.2, 2.5.8 Target size minimum (w3.org/WAI/WCAG22/Understanding/target-size-minimum), consultado 2026-11-12 | Objetivo mínimo de 24×24 px | Píldoras de 44 px de alto, que también cumplen el piso de 44 px de las reglas del proyecto | Nada |
| Emil Kowalski, Great animations (emilkowal.ski/ui/great-animations), consultado 2026-11-12 | Menos de 300 ms, solo `transform` y `opacity`, nada de animación en acciones repetidas de teclado | Sin animación al marcar. Solo el cambio de color, sin transición | Cualquier rebote o escala en la píldora |
| Interfaz actual de HidroMon (`web/src/style.css`, captura de Gestionar del 2026-11-12) | Tokens `--primary`, `--primary-soft`, `--line`, `--muted`, radios de 10 px, `badge` solo para estados | Se reutilizan los tokens sin agregar ninguno | Usar `badge` para cultivos |

Fuentes no accesibles el 2026-11-12, que no cuentan: m3.material.io (Chips, la página no entrega
contenido sin JavaScript) y mobbin.com (403).

## 4. Direcciones

1. **Píldoras marcables** (elegida por Diego el 2026-11-12).
2. Select múltiple nativo. Descartada porque pide Ctrl+clic y oculta lo marcado.
3. El catálogo reemplaza el texto `cultivo`. Descartada porque rompe la búsqueda y las etiquetas 3D.

## 5. Contrato de diseño

Nada fuera de esto sin permiso fechado.

- **Tokens.** Solo los existentes: `--primary`, `--primary-soft`, `--line`, `--text`, `--muted`,
  `--card`, `--bg`. Cero tokens nuevos.
- **Tipografía.** La de la interfaz (`font: inherit`), 13 px para la `legend` como los `label`
  actuales, 14 px en las píldoras.
- **Repertorio** (cada forma, un solo trabajo):
  - Píldora marcable: marcar un cultivo en el formulario de zona. Solo existe ahí.
  - Texto separado por comas: mostrar cultivos en la tabla de zonas y en el detalle.
  - `badge`: sigue siendo solo estado de humedad o de alerta. No se usa para cultivos.
- **Píldora.** Alto mínimo 44 px, radio 99 px, borde 1 px `--line`, fondo `#fbfdfc` como los
  `input`. Marcada: fondo `--primary-soft`, borde `--primary`, texto `--text` (enmienda 1), peso 600. La casilla nativa
  queda visible a la izquierda con `accent-color: var(--primary)`. Foco: `outline` 2 px
  `--primary` como los `input` actuales. Sin transición.
- **Espaciado.** 8 px entre píldoras, con salto de línea.
- **Campos de zona.** «Cultivo» pasa a llamarse «Cultivo principal». Debajo va el `fieldset`
  «Cultivos sembrados» con la pista «Marca todos los que apliquen».
- **Pestaña Cultivos.** Usa el mismo motor de tablas y formularios: columnas ID, Nombre, Zonas.
  Formulario con Nombre y Descripción (opcional).
- **Detalle de zona.** Fila «Cultivos sembrados» con la lista en texto, o «ninguno» en gris.

### Enmiendas

1. **2026-11-12, aprobada por Diego.** El texto de la píldora marcada pasa de `--primary` a `--text`.
   Motivo: `--primary` sobre `--primary-soft` midió 3,39:1, por debajo de AA. El borde, el fondo y la
   casilla marcada siguen señalando la selección. No se agregan tokens.

## 6. Estados

| Estado | Qué se ve |
|---|---|
| Catálogo vacío | En el `fieldset`, texto «Aún no hay cultivos. Créalos en la pestaña Cultivos.» con un botón que abre esa pestaña |
| Zona sin cultivos | Tabla «–», detalle «ninguno» |
| Error de la API (cultivo borrado mientras se edita) | El aviso rojo actual (`toast` de error) con el mensaje de la API |
| Nombre repetido | El mensaje 409 de la API en el aviso rojo |
| Cargando o sin conexión | Los que ya maneja la interfaz con el refresco cada 5 s |

## 7. Implementación por pasos

1. Componente clave: píldoras en el formulario de zona y su envío como `cultivoIds`.
2. Pestaña Cultivos en Gestionar.
3. Tabla de zonas y detalle de zona.
4. Estados y verificación.

## 8. Verificación

Se llena al terminar cada paso.

**Paso 1 (2026-11-12), medido en Chrome sobre `localhost:5173` con la API real.**

- Alto de cada píldora: 44 px en las cuatro. Cumple.
- Foco por teclado: el contorno de 2 px `--primary` se ve en la píldora enfocada. Cumple.
- Envío: marcar Lechuga en la zona 3 y guardar deja `cultivos: [Tomate, Lechuga]` en `GET /zonas`. Cumple.
- Choque encontrado y corregido: la clase `.pill` ya la usaban las etiquetas 3D (`scene.js`). La píldora del formulario pasó a `.choice`.
- **Falla:** contraste del texto marcado (`--primary` sobre `--primary-soft`) 3,39:1, por debajo de 4,5:1 (AA). El texto sin marcar da 13,47:1. Pendiente de decisión, porque corregirlo cambia el contrato. Resuelto con la enmienda 1: tras el cambio mide 11,97:1.

**Paso 2 (2026-11-12), pestaña Cultivos, medido en Chrome con la API real.**

- Seis pestañas sin desborde horizontal a 1536 px.
- Tabla con ID, Nombre y Zonas. Lechuga y Tomate muestran «Invernadero A», y Fresa y Papa muestran «–».
- Crear «Maíz» con descripción: aviso «Cultivo creado correctamente» y queda en `GET /cultivos`.
- Repetir «Papa»: aviso de error con el mensaje 409 de la API, «Ya existe un cultivo llamado Papa».
- Editar carga la descripción guardada y guarda el cambio. Eliminar pide «¿Seguro?» en el primer clic y borra en el segundo.
- El título del formulario dice «Nuevo cultivo» gracias a un campo `nuevo` en la definición.

## 9. Privacidad

Los cultivos no son datos personales. No agregan cookies, rastreo ni datos nuevos de personas. La
deuda legal del proyecto (política de tratamiento de datos de usuarios y perfiles en `docs/legal/`)
sigue pendiente y no la cubre este cambio.
