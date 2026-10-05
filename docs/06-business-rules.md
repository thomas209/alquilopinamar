# 06 — Reglas de negocio

## Propiedades

### Identificación
- Cada publicación tiene un **código** correlativo que se muestra como `AP-0001`. Sirve para buscar y para mencionar por WhatsApp.
- El **slug** se arma con título + código y no cambia una vez publicada.
- **Una publicación = una operación** (alquiler temporario, alquiler anual o venta). Una misma casa en venta y en alquiler son dos publicaciones; el admin tiene "Duplicar".

### Estados

| De | A | Quién | Condición |
|---|---|---|---|
| Borrador | En revisión | Propietario | Cumple los requisitos para publicar |
| Borrador | Publicada | Admin | Cumple los requisitos (carga propia del admin) |
| En revisión | Publicada | Admin | Aprueba |
| En revisión | Rechazada | Admin | Motivo obligatorio |
| Rechazada | Borrador | Propietario | Al editarla para corregir |
| Publicada | Pausada | Propietario o admin | — |
| Pausada | Publicada | Propietario o admin | Ya fue aprobada antes |

| Estado | Visible al público | Quién lo pone |
|---|---|---|
| Borrador | No | Propietario / admin |
| En revisión | No | Propietario al enviar |
| Publicada | Sí | Admin al aprobar |
| Pausada | No (la URL muestra "no disponible" con similares) | Propietario o admin |
| Rechazada | No | Admin, **con motivo obligatorio** |

- **Fase 1:** solo el admin carga, y puede pasar directo de borrador a publicada.
- **Fase 2:** toda publicación de un propietario pasa por revisión la primera vez.
- **Ediciones sobre una publicada:** precio, tarifas, calendario y reglas salen al instante. Cambios en título, descripción o fotos también salen al instante, pero la publicación queda marcada para revisión posterior del admin (no se baja).
- Una rechazada vuelve a borrador cuando el propietario la edita, y puede reenviarla.
- Borrar es baja lógica; nunca se pierden consultas ni reservas.

### Requisitos para publicar
- Título, descripción (mínimo 100 caracteres), zona, tipo, operación.
- Precio base, o marcada como "Consultar".
- **Mínimo 5 fotos** (3 para lotes).
- Alquiler temporario: capacidad de huéspedes obligatoria.

### Ubicación
- La dirección exacta es un dato privado: no aparece en la ficha.
- Por defecto el mapa muestra una **zona aproximada**. El propietario puede elegir mostrar el punto exacto.

### Precios
- Moneda por publicación: **USD o ARS**. No hay conversión.
- Período del precio base según operación:

| Operación | Períodos válidos | Por defecto |
|---|---|---|
| Alquiler temporario | Noche, semana, quincena, mes, temporada | Noche |
| Alquiler anual | Mes (+ expensas opcionales) | Mes |
| Venta | Total | Total |

- El listado muestra el precio base ("desde"). La ficha muestra además la tabla de tarifas.
- El filtro y el orden por precio trabajan sobre una moneda a la vez; las publicaciones "Consultar" van al final.

### Destacadas
- Las marca el admin, con orden y vencimiento opcional. Vencida la fecha, deja de aparecer como destacada sola.
- Hoy es gratis y manual; el campo queda listo para cobrarlo más adelante.

## Consultas

- Cualquier visitante puede consultar, sin cuenta.
- **Formulario:** nombre, mail y mensaje obligatorios; teléfono opcional. Guarda la consulta y avisa por mail al admin (y al propietario desde F2).
- **WhatsApp:** abre el chat con mensaje armado (código, título y link). Destino: el WhatsApp de la publicación; si no tiene, el del sitio. Se cuenta el clic.
- Anti-spam: campo trampa oculto, y máximo 5 consultas por hora desde un mismo mail o IP.
- Estados: nueva → respondida → cerrada. Las maneja quien la recibe.
- El mail y el teléfono de quien consulta solo los ven el admin y el dueño de esa propiedad.

## Usuarios y propietarios (Fase 2)

- Alta y acceso con **link mágico**: vence a los 15 minutos y es de un solo uso. La sesión dura 30 días.
- La respuesta al pedir el link es siempre la misma, exista o no el mail.
- Un usuario pasa a ser anfitrión al crear su primera propiedad. Para enviar a revisión necesita nombre y teléfono/WhatsApp.
- Un propietario solo ve y edita **sus** propiedades y **sus** consultas.
- El admin puede bloquear un usuario: sus publicaciones se pausan.
- Publicar es gratis y sin tope de propiedades (el campo `plan` queda para el futuro).

## Favoritos

- Se guardan en el navegador, sin cuenta.
- La lista se comparte con un link que lleva las propiedades adentro (máximo 40).
- Si una propiedad guardada deja de estar publicada, aparece como "No disponible" y se puede quitar.

## Moderación (admin)

- Cola por orden de llegada.
- Se revisa: fotos reales y suficientes, precio coherente, datos de contacto fuera de la descripción, ubicación dentro de las zonas.
- Aprobar publica y avisa por mail. Rechazar exige motivo y avisa por mail.

## Disponibilidad y reservas (Fase 3)

- El calendario aplica solo a **alquiler temporario**.
- Una noche está ocupada si cae en un bloqueo manual o en una reserva aceptada/confirmada.
- El día de salida de una reserva puede ser el día de entrada de otra.
- **Búsqueda por fechas:** excluye propiedades con alguna noche ocupada en el rango, o que no cumplan la estadía mínima.
- **Cálculo del precio:** para cada noche se toma la tarifa cuyo rango la incluya; si ninguna, el precio base. Las tarifas por quincena/mes se aplican enteras cuando el rango coincide; si no, se prorratean por noche.

### Solicitud de reserva

```
SOLICITADA ──acepta──▶ ACEPTADA ──(F4) paga seña──▶ CONFIRMADA ──pasa el check-out──▶ COMPLETADA
     │                    │
     ├──rechaza──▶ RECHAZADA
     ├──sin respuesta 48 h──▶ VENCIDA
     └──cancela──▶ CANCELADA      (ACEPTADA sin seña en plazo ──▶ VENCIDA, F4)
```

- Requiere cuenta.
- Al solicitar se congelan fechas, huéspedes y total. **No** bloquea el calendario.
- El propietario tiene **48 h** para aceptar o rechazar; si no, vence.
- Al **aceptar** se bloquean las fechas. Si otra solicitud pisa esas fechas, no se puede aceptar.
- En Fase 3, aceptada = acordada: el pago se coordina por fuera (WhatsApp).
- Cancelar libera las fechas.

## Seña, reseñas y perfiles (Fase 4)

- **Seña:** al aceptar, el huésped tiene un plazo para pagarla por Mercado Pago (propuesta: 30 % del total, 24 h). Si no paga, la reserva vence y se liberan las fechas.
- La reserva pasa a confirmada **solo** cuando el webhook de Mercado Pago informa el pago aprobado (no por la página de retorno).
- Un pago se procesa una sola vez (el id de pago es único).
- **Reseñas:** solo de reservas completadas, una por reserva, hasta 30 días después del check-out. Puntaje 1–5 y comentario. El propietario puede responder una vez. El admin puede ocultarlas.
- **Perfil de anfitrión:** nombre, foto, bio, antigüedad, propiedades publicadas y promedio de reseñas.
- **Comisión:** hoy 0. El campo existe en la reserva para cuando se monetice.

## Mails

| Evento | A quién | Fase |
|---|---|---|
| Consulta nueva | Admin (y propietario desde F2) | 1 |
| Link de acceso | Usuario | 2 |
| Publicación aprobada / rechazada | Propietario | 2 |
| Solicitud de reserva nueva | Propietario | 3 |
| Solicitud aceptada / rechazada / vencida | Huésped | 3 |
| Seña recibida | Huésped y propietario | 4 |
| Invitación a reseñar | Huésped | 4 |

Remitente configurable por `RESEND_FROM_EMAIL`; requiere dominio verificado en Resend para entregar a terceros.

## Contenido y SEO

- Cada zona tiene texto propio editable desde el admin.
- Solo las publicadas entran al sitemap; las pausadas o borradas salen.
- Las descripciones no pueden incluir teléfonos, mails ni links (se validan al guardar).

## Parámetros configurables

| Parámetro | Valor inicial |
|---|---|
| Mínimo de fotos | 5 (3 en lotes) |
| Vigencia del link de acceso | 15 min |
| Duración de la sesión | 30 días |
| Plazo para responder una solicitud | 48 h |
| Seña | 30 % (a confirmar) |
| Plazo para pagar la seña | 24 h (a confirmar) |
| Ventana para reseñar | 30 días |
| Máximo de consultas por hora (mail / IP) | 5 |
