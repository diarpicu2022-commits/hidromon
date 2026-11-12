# Política de tratamiento de datos personales de HidroMon

**Versión** 0.1 (borrador técnico)
**Fecha** 2026-11-12
**Vigencia** Ninguna todavía. Este texto es un borrador técnico escrito por el equipo de desarrollo y debe revisarlo un abogado antes de publicarse o de usarse con datos de personas reales.

## 1. Alcance y estado del proyecto

HidroMon es un proyecto académico de la asignatura Framework Web (electiva 2, quinto semestre de Ingeniería de Software). Recolecta lecturas de humedad de sensores en zonas de cultivo y genera alertas cuando una lectura sale del rango de la zona.

A la fecha de esta versión, HidroMon solo se ejecuta en los computadores del equipo, con una base de datos PostgreSQL local en Docker. No está publicado en internet ni en tiendas de aplicaciones, y los registros de usuarios que existen son datos de prueba.

Esta política se aplica a los datos de las personas registradas como usuarios en la API de HidroMon y en su interfaz web.

## 2. Responsable del tratamiento

Los responsables son los integrantes del equipo de desarrollo.

- Diego Armando Pinta Cuasquen
- Leider Fabian Chipu Erazo
- Juan José Rueda

**Correo de contacto** pendiente de definir por el equipo. Mientras no exista, esta política no puede publicarse.

## 3. Datos que se recolectan

De cada usuario se guardan los siguientes datos.

| Dato | Obligatorio | Para qué se usa |
|---|---|---|
| Nombre | Sí | Mostrar quién es el responsable de cada zona |
| Correo electrónico | Sí | Identificar al usuario sin repetir registros (el correo es único) |
| Rol (Agricultor o Administrador) | Sí | Distinguir el tipo de usuario |
| Municipio | Sí | Ubicar la finca del usuario |
| Finca | Sí | Asociar al usuario con su predio |
| Apodo (nickname) | No | Nombre corto opcional |
| Avatar | No | Texto opcional con la imagen del perfil. HidroMon no sube ni guarda archivos de imagen |
| Fecha de creación y de actualización | Automático | Control de cambios del registro |

Además, cada zona puede tener un usuario responsable. Ese vínculo también es un dato del usuario.

HidroMon **no** recolecta contraseñas, documentos de identidad, teléfonos, ubicación del dispositivo, datos de salud, biométricos ni financieros. Las lecturas de humedad, las zonas, los sensores, los cultivos y las alertas describen el cultivo y no a la persona.

## 4. Finalidad

Los datos se usan solo para registrar quién usa el sistema y quién responde por cada zona de cultivo. No se usan para publicidad, perfiles comerciales ni decisiones automatizadas sobre la persona.

## 5. Autorización

Según la Ley 1581 de 2012 y el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015), el tratamiento necesita la autorización previa, expresa e informada del titular.

**Estado actual.** HidroMon todavía no pide ni registra esa autorización. Hoy un administrador crea los usuarios desde la vista Gestionar o desde la API. Antes de registrar datos de personas reales hace falta lo siguiente.

1. Mostrar esta política y pedir la autorización antes de crear el usuario.
2. Guardar la versión de la política aceptada y la fecha de la autorización.
3. Volver a pedir la autorización cuando cambie la política.

## 6. Con quién se comparten

Con nadie. HidroMon no envía datos a terceros, no usa servicios externos de análisis y su interfaz web no carga recursos de otros dominios.

## 7. Dónde se guardan y por cuánto tiempo

Los datos se guardan en la base PostgreSQL local de cada integrante del equipo, en las tablas `usuarios` y `perfiles`. Se conservan hasta que se borra el usuario. Al borrarlo, se eliminan el usuario y su perfil en la misma operación.

No hay copias de respaldo automáticas. El plazo de conservación para un despliegue real queda pendiente de definir.

## 8. Seguridad

**Estado actual.** La API de HidroMon no tiene inicio de sesión ni control de acceso. Cualquier persona con acceso a la red del equipo donde corre puede consultar, cambiar o borrar usuarios. Por eso HidroMon no debe recibir datos de personas reales todavía.

Antes de un despliegue se necesita lo siguiente.

1. Inicio de sesión y permisos por rol.
2. Conexión cifrada (HTTPS) entre la interfaz y la API.
3. Credenciales de la base de datos fuera del repositorio y distintas de las de desarrollo.
4. Registro de quién consulta o cambia datos personales.

## 9. Derechos del titular

El titular puede conocer, actualizar y rectificar sus datos, pedir prueba de la autorización, saber cómo se usan, presentar quejas ante la Superintendencia de Industria y Comercio, revocar la autorización y pedir que se borren.

En la versión actual estos derechos se atienden así.

| Derecho | Cómo se hace hoy |
|---|---|
| Conocer sus datos | `GET /usuarios/:id` o la pestaña Usuarios en Gestionar |
| Corregirlos | `PUT /usuarios/:id` o «Editar» en la pestaña Usuarios |
| Borrar todo | `DELETE /usuarios/:id` o «Eliminar» en la pestaña Usuarios. Borra el usuario y su perfil. Si el usuario es responsable de una zona, primero se le quita esa responsabilidad |
| Exportar sus datos | Pendiente. No hay descarga en un formato reutilizable |
| Revocar la autorización | Pendiente, porque todavía no se registra la autorización |

Las solicitudes se reciben en el correo de contacto (pendiente, ver la sección 2). La ley da 10 días hábiles para responder consultas y 15 días hábiles para reclamos.

## 10. Cookies y rastreo

La interfaz web de HidroMon no usa cookies, `localStorage`, `sessionStorage` ni herramientas de rastreo o analítica. Por eso no muestra un aviso de cookies. Si eso cambia, esta política y la interfaz se actualizan antes del cambio.

## 11. Menores de edad

HidroMon está pensado para agricultores y administradores adultos. No está dirigido a menores de edad. Si un despliegue llegara a incluirlos, se necesitaría la autorización de sus padres o representantes según el artículo 7 de la Ley 1581 de 2012.

## 12. Cambios a esta política

Cada cambio sube la versión y la fecha de este documento. Los cambios que afecten la finalidad o los datos recolectados exigen pedir de nuevo la autorización (sección 5).

## Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-11-12 | Primer borrador técnico, sacado del código de la API (entidades `Usuario` y `Perfil`) y de la interfaz web |
