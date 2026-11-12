# Anexo de diseño · Ficha técnica y ubicación en la web

Fecha 2026-11-12. Rama `feature/ficha-ubicacion`. Es una extensión mínima de la interfaz existente
y no abre una dirección visual nueva.

## Usuarios y tarea

El mismo agricultor o administrador del anexo de cultivos (`2026-11-12-web-cultivos.md`). La tarea es
registrar la marca y el modelo de cada sensor y dónde está cada zona al crearlos, y corregirlos
después. Es lectura obligada, así que el punto de entrada es el formulario.

## Contrato

- Cero formas nuevas, cero tokens nuevos. Los campos usan el `label` + `input` que ya tiene el
  formulario de Gestionar, igual que el perfil del usuario.
- Los campos anidados se declaran con `grupo` (`fichaTecnica` o `ubicacion`) y se envían como objeto
  anidado, como pide el DTO de la Clase 7d.
- Un campo opcional vacío se envía como `null`, porque la API rechaza una fecha vacía.
- En el detalle, «Ficha técnica» (marca y modelo) en el sensor y «Ubicación» (municipio, vereda y
  coordenadas) en la zona, con el mismo `row` de texto. Si el registro es anterior a la relación, dice
  «sin registrar».
- Las tablas de Gestionar no cambian, para no ensanchar la vista en el teléfono.

## Verificación (2026-11-12)

Playwright con Edge contra la API real, con `whitelist` y `forbidNonWhitelisted` activos.

- Crear y editar en las seis pestañas: todos los avisos en verde. El único aviso rojo es el que la web
  muestra a propósito cuando una lectura abre una alerta.
- Un sensor creado desde la web guarda `numeroSerie` y deja `fechaInstalacion` en `null` cuando el
  campo queda vacío.
- Una zona y un sensor creados antes de la relación se editan sin error y reciben su ubicación o su
  ficha.
- Contraste en las tres vistas y en cada pestaña a 390, 768 y 1440 px: 0 pares por debajo de 4,5:1.
  Ninguna tarjeta se sale de la ventana. Consola limpia.
