# 04 — UX / UI

> Sensación de app (Apple, Airbnb) con estética Zara / AllSaints. Mobile first. Las medidas y estilos exactos están en `05-design-system.md`.

## Principios

1. **La foto manda.** Grande, en máxima calidad, de borde a borde en el celular.
2. **Buscar en tres toques.** Operación → zona → ver resultados. Fechas y huéspedes son opcionales.
3. **El CTA siempre a mano.** En la ficha, barra fija abajo con Consultar / WhatsApp (Reservar desde F3).
4. **Nada recarga.** Cambiar de sección o de filtro atenúa lo actual mientras llega lo nuevo.
5. **Paneles, no páginas.** Filtros, favoritos, consulta y calendario se abren en hojas de vidrio: bottom sheet en celular, panel flotante a la derecha en desktop.
6. **Poco texto, bien jerarquizado.** Rótulos en mono mayúscula, títulos y precios en Instrument Sans, lectura en Inter.

## Mapa del sitio

```
/                              Home
/propiedades                   Listado (filtros por query string; ?vista=mapa en F2)
/propiedad/[slug]              Ficha
/zonas/[slug]                  Página de zona
/favoritos                     Mis favoritos
/lista?p=…                     Lista compartida
/publicar                      Landing para dueños
/cuenta  /cuenta/ingresar      Cuenta y acceso con link mágico (F2)
/novedades  /novedades/[slug]  Blog (F2)
/nosotros  /contacto  /terminos

/panel                         Resumen del propietario (F2)
/panel/propiedades             Mis propiedades
/panel/propiedades/nueva       Publicar en pasos
/panel/propiedades/[id]        Editar
/panel/propiedades/[id]/calendario   (F3)
/panel/consultas               Bandeja
/panel/reservas                Solicitudes (F3)

/admin                         Métricas
/admin/login
/admin/propiedades  /nueva  /[id]
/admin/moderacion              (F2)
/admin/consultas
/admin/zonas  /admin/amenities
/admin/usuarios                (F2)
/admin/reservas                (F3)
/admin/contenido               Home, destacados, novedades
```

## Estructura común (parte pública)

- **Header fijo translúcido** con blur: logo, menú en pastilla (Alquilar · Comprar · Zonas · Publicar), favoritos y cuenta.
- **Celular:** logo centrado, corazón a la izquierda, menú a la derecha; debajo, el menú de secciones en pastilla que flota, se esconde al bajar y vuelve al subir.
- **Pastilla deslizante:** el indicador negro se desliza a la sección tocada al instante; el contenido cambia sin recargar.
- **Footer** simple: zonas, enlaces institucionales, contacto.

## Home

Orden en el celular:

1. **Hero** con foto a pantalla y el **buscador** encima.
2. **Buscador:**
   - Selector segmentado de operación: Alquilar (temporario) · Anual · Comprar.
   - Zona (autocompletar con las zonas cargadas).
   - Tipo de propiedad (segmentado con scroll horizontal).
   - Fechas y huéspedes: solo si la operación es alquiler temporario.
   - Botón Buscar (pastilla negra, ancho completo).
3. **Destacadas:** carrusel que sigue de largo hacia la derecha.
4. **Zonas:** cards grandes con foto que llevan a `/zonas/[slug]`.
5. **Recién publicadas:** grilla.
6. **Bloque para dueños:** "Publicá tu propiedad gratis" → `/publicar`.

En desktop el buscador es una barra horizontal en pastilla dentro del hero.

**Fase 1:** las fechas no filtran disponibilidad (todavía no hay calendario). Viajan a la ficha y precargan el formulario de consulta. El filtro real por fechas llega en Fase 3.

## Listado (`/propiedades`)

- **Barra superior:** resumen de la búsqueda (toca y reabre el buscador), botón **Filtrar** con contador de filtros activos y **Ordenar**.
- **Filtros:** en celular, hoja que sube desde abajo; en desktop, columna a la izquierda siempre visible.
  - Precio (mín–máx) con selector de moneda, ambientes, dormitorios, baños, cocheras, pileta, mascotas, distancia al mar, amenities.
  - Botones al pie de la hoja: Limpiar · Ver N propiedades.
- **Orden:** destacadas primero (por defecto), más nuevas, precio menor, precio mayor.
- **Grilla:** 1 columna (celular, foto de borde a borde), 2 (tablet), 3–4 (desktop).
- **Card:** foto 4:3 con carrusel deslizable, corazón en círculo de vidrio arriba a la derecha, rótulo `ZONA · TIPO`, título, datos clave (huéspedes · dormitorios · baños), precio con período.
- **Sin resultados:** mensaje corto + botón para limpiar filtros + sugerencia de otras zonas.
- **Vista mapa (F2):** en celular, botón flotante "Mapa" que alterna; en desktop, mapa fijo a la derecha con la lista a la izquierda. Los pines muestran el precio.
- **Paginación:** botón "Ver más" que suma resultados, manteniendo la URL actualizada.

Todos los filtros viven en la URL (se puede compartir y volver atrás).

## Ficha (`/propiedad/[slug]`)

Orden en el celular:

1. **Galería** de borde a borde, deslizable, con puntitos y contador. Al tocar abre visor a pantalla completa. Corazón y compartir en círculos de vidrio sobre la foto.
2. **Encabezado:** rótulo `AP-0123 · CARILÓ · CASA`, título, datos clave.
3. **Precio** con período, y tabla de tarifas si tiene (quincenas, temporada).
4. **Descripción** (plegada después de unas líneas, "Leer más").
5. **Características:** ambientes, dormitorios, baños, cocheras, m² cubiertos y de lote, distancia al mar.
6. **Amenities** con íconos del set único.
7. **Ubicación:** mapa con zona aproximada (círculo) salvo que la publicación muestre el punto exacto.
8. **Calendario de disponibilidad** (F3).
9. **Reglas de la casa:** horarios, mascotas, estadía mínima.
10. **Anfitrión** (F4: perfil con foto, bio y otras propiedades).
11. **Reseñas** (F4).
12. **Propiedades similares** (misma zona y operación).

**Barra fija inferior (celular):** precio a la izquierda; a la derecha **WhatsApp** (secundario) y **Consultar** (principal). Respeta safe-area y deja espacio al final de la página para no tapar contenido. En F3, para alquiler temporario el principal pasa a ser **Reservar**.

**Desktop:** dos columnas. Izquierda: galería en mosaico (1 grande + 4) y contenido. Derecha: tarjeta fija con precio, fechas, huéspedes y los CTA.

### Consulta

- **Formulario** en hoja de vidrio: nombre, mail, teléfono, mensaje (precargado con el código y, si hay, fechas y huéspedes). Al enviar: tilde animado y cierre.
- **WhatsApp:** abre el chat con mensaje armado: "Hola, consulto por AP-0123 – Casa en Cariló (link)".

## Página de zona (`/zonas/[slug]`)

Foto de portada, título `Alquileres y propiedades en Cariló`, texto editable, accesos rápidos por operación y tipo, grilla de propiedades y enlaces a las otras zonas. Es la pieza principal de SEO local.

## Favoritos

- Tocar el corazón guarda al instante (animación de "pop"), sin pedir cuenta.
- `/favoritos`: cards grandes, quitar, y **Compartir lista** (link con las propiedades adentro; imagen OG propia).
- `/lista?p=…`: la lista que ve quien recibe el link.

## Acceso (F2)

`/cuenta/ingresar`: un campo de mail y un botón. Pantalla "Revisá tu mail". El link entra directo a `/cuenta` o a donde quería ir el usuario.

## Panel del propietario (F2+)

**Publicar en pasos**, una decisión por pantalla, barra de progreso arriba y botones fijos abajo (Atrás · Siguiente). Se guarda como borrador en cada paso.

| Paso | Contenido |
|---|---|
| 1. Qué publicás | Operación y tipo |
| 2. Datos | Título, descripción, ambientes, dormitorios, baños, cocheras, huéspedes, m² |
| 3. Ubicación | Zona, dirección (Georef) y pin en el mapa. Opción de mostrar punto exacto o zona aproximada |
| 4. Fotos | Subir varias, arrastrar para ordenar, la primera es la portada |
| 5. Amenities | Selección en pastillas |
| 6. Precios | Precio base + tarifas por período |
| 7. Calendario | Bloquear fechas (F3) |
| 8. Reglas | Horarios, mascotas, estadía mínima |
| 9. Revisión | Vista previa de la ficha y "Enviar a revisión" |

- **Mis propiedades:** lista con estado en pastilla (borrador, en revisión, publicada, pausada, rechazada con motivo) y acciones según estado.
- **Consultas:** bandeja por propiedad; botón para responder por WhatsApp o mail; marcar como respondida.
- **Calendario (F3):** mes a mes; tocar un rango para bloquear o poner precio.

## Admin

Funcional antes que lindo, pero con el mismo design system (campos, botones, pastillas, hojas).

- **Inicio:** propiedades activas, consultas de la semana, pendientes de moderación, fichas más vistas.
- **Propiedades:** tabla con buscador por código/título, filtros por estado/zona/operación, acciones rápidas (publicar, pausar, destacar, duplicar).
- **Formulario de propiedad:** el mismo contenido que los pasos del panel, pero en una sola pantalla con secciones.
- **Moderación (F2):** cola de "en revisión" con vista previa; Aprobar o Rechazar con motivo.
- **Consultas:** lista con estado y notas internas.
- **Zonas y amenities:** ABM simple.
- **Contenido:** hero de la home, destacadas y su orden, novedades.

## Estados que toda pantalla contempla

| Estado | Cómo se ve |
|---|---|
| Cargando | Esqueleto con la forma del contenido (nunca pantalla en blanco) |
| Vacío | Mensaje corto + una acción |
| Error | Texto en rojo junto al campo o aviso arriba; el botón vuelve a quedar activo |
| Éxito | Tilde animado o aviso breve; sin páginas de "gracias" innecesarias |

## Requisitos mobile

- Áreas táctiles de 44 px mínimo.
- Campos con texto de 16 px (evita el zoom de iOS).
- Safe-area en barras fijas y hojas.
- Carruseles con scroll nativo y snap.
- Probar en 360, 390 y 430 px de ancho antes de dar algo por terminado.

## Accesibilidad

- Foco visible en todo lo interactivo.
- Hojas con `role="dialog"`, cierre con Escape y con toque fuera, foco atrapado adentro.
- `aria-label` en botones de ícono; `aria-pressed` en el corazón.
- `prefers-reduced-motion` apaga animaciones.
- Contraste AA en texto.
