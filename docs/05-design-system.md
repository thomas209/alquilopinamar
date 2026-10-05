# 05 — Design system

> Fuente de verdad: el **código** de `referencia-member/` (`app/globals.css`, `app/layout.tsx`, `components/store/`), no sus docs (dicen bordes rectos y sin vidrio: están viejos). Los valores de abajo salen del CSS real de Member, ordenados como tokens.
> Se define **una vez** (tokens en `@theme` + componentes base) y se reutiliza. Nada de estilos sueltos por pantalla.

## Qué se corrige respecto de Member

| En Member | Acá |
|---|---|
| `* { margin: 0; padding: 0 }` en globals.css, que anula los espacios de Tailwind y obligó a crear decenas de clases a mano (`.pdp-*`, `.sec-*`, `.co-*`) | **No se pone.** Los espacios se manejan con utilidades de Tailwind |
| `--color-accent: #C8A96E` (dorado) y `--radius: 0px` en `@theme` | Sin dorado ni color de acento. Radios definidos como tokens |
| Estilos en línea en casi todos los componentes | Componentes base con clases; estilos en línea solo para valores calculados (posición de la pastilla) |
| Regla que fuerza la letra mono sobre cualquier cosa en mayúsculas dentro de `.store-root` | Componente/clase `Rotulo` explícito |
| Georgia en el menú del celular, ícono PNG de cuenta, SVG de estilos distintos | Tres tipografías con rol fijo; un solo set de íconos |
| `ignoreBuildErrors` / `ignoreDuringBuilds` | No se activan |

## Tokens (`app/globals.css`)

```css
@import "tailwindcss";
@source not "../referencia-member";

@theme {
  /* Color */
  --color-negro: #0A0A0A;
  --color-blanco: #FFFFFF;
  --color-gris-50: #F5F5F7;   /* campos, bloques suaves */
  --color-gris-100: #F4F4F4;  /* fondo de fotos, pastillas claras */
  --color-gris-200: #EDEDED;  /* líneas */
  --color-gris-400: #A3A3A3;  /* deshabilitado, placeholder */
  --color-texto-2: #6E6E73;   /* texto secundario */
  --color-link: #0066CC;
  --color-ok: #16A34A;        /* solo estados */
  --color-error: #DC2626;     /* solo estados y favorito activo */

  /* Tipografía (variables cargadas con next/font en layout.tsx) */
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-titulo: var(--font-instrument), "Helvetica Neue", Arial, sans-serif;
  --font-rotulo: var(--font-dm-mono), ui-monospace, "SF Mono", Menlo, monospace;

  /* Radios */
  --radius-campo: 14px;
  --radius-card: 18px;
  --radius-hoja: 28px;
  --radius-pastilla: 999px;

  /* Movimiento */
  --ease-app: cubic-bezier(0.32, 0.72, 0, 1);

  /* Sombras (solo en hojas y elementos flotantes, nunca en cards) */
  --shadow-hoja: 0 30px 80px rgba(0, 0, 0, 0.25);
  --shadow-flotante: 0 8px 28px rgba(0, 0, 0, 0.10);
  --shadow-vidrio: 0 2px 10px rgba(0, 0, 0, 0.08);
}
```

Evitar siempre: gradientes, colores saturados, sombras pesadas en cards, íconos de estilos mezclados.

## Color: uso

| Token | Uso |
|---|---|
| Negro `#0A0A0A` | Texto, botón principal, pastilla activa |
| Blanco | Fondo de página, texto sobre negro |
| `#F5F5F7` | Fondo de campos y bloques de resumen |
| `#F4F4F4` | Fondo detrás de las fotos, pastillas secundarias |
| `#EDEDED` | Líneas divisorias |
| `#A3A3A3` | Deshabilitado, placeholder |
| `#6E6E73` | Texto secundario |
| Azul `#0066CC` | Links de texto ("Ver más", "Quitar") |
| Verde `#16A34A` | Disponible, confirmado, éxito |
| Rojo `#DC2626` | Error, corazón activo, rechazado |

## Tipografía

| Familia | Rol | Detalle |
|---|---|---|
| **Inter** | Lectura, formularios, menú | 400/500. Cuerpo 15–16 px, secundario 13–14 px |
| **Instrument Sans** | Títulos y precios | 500/600, tracking -0.02em, `font-variant-numeric: tabular-nums` |
| **DM Mono** | Rótulos en MAYÚSCULAS: zona, tipo, código, etiquetas, labels de formulario | 400/500, 10–11 px, letter-spacing 0.06–0.1em. Nunca más de 500 de peso |

Escala:

| Estilo | Familia | Tamaño celular → desktop | Peso |
|---|---|---|---|
| Título de página | Instrument Sans | 34 → 44 px, line-height 1.08 | 600 |
| Título de sección / hoja | Instrument Sans | 21–22 px | 600 |
| Precio en ficha | Instrument Sans | 22–28 px | 500 |
| Precio en card | Instrument Sans | 15–16 px | 500 |
| Título de card | Inter | 15 px | 500 |
| Cuerpo | Inter | 15–16 px, line-height 1.5 | 400 |
| Secundario | Inter | 13–14 px | 400 |
| Rótulo | DM Mono mayúsculas | 10–11 px | 400–500 |

Precios: `USD 1.200` / `$ 850.000` con separador de miles es-AR, y el período como secundario (`/ noche`, `/ quincena`, `/ mes`).

## Formas y medidas

| Elemento | Medida |
|---|---|
| Botones y filtros | Pastilla (999 px). Alto 44 (chico), 52 (normal), 54 (CTA principal) |
| Fotos y cards | Radio 14–18 px |
| Hojas y paneles | Radio 22–30 px (28 por defecto) |
| Campos | Alto 52 px, radio 14 px, fondo `#F5F5F7`; en foco: fondo blanco + borde negro 1 px |
| Corazón sobre foto | Círculo de 38 px (32 en versión chica) |
| Área táctil mínima | 44 px |

## Vidrio

| Pieza | Fondo | Filtro |
|---|---|---|
| Header | `rgba(255,255,255,0.88)` | `saturate(180%) blur(14px)` |
| Hoja | `rgba(255,255,255,0.88–0.92)` + borde `rgba(255,255,255,0.7)` | `blur(26px) saturate(1.5)` |
| Barra fija inferior | `rgba(255,255,255,0.72)` + línea superior `rgba(10,10,10,0.06)` | `blur(22px) saturate(1.5)` |
| Círculo del corazón | `rgba(255,255,255,0.72)` | `blur(14px)` |
| Menú flotante (celular) | `rgba(255,255,255,0.42)` + sombra flotante | `blur(22px) saturate(180%)` |
| Velo detrás de una hoja | `rgba(10,10,10,0.28–0.32)` | — |

Siempre con el prefijo `-webkit-backdrop-filter` además del estándar.

## Layout

- Ancho máximo 1440 px. Márgenes: 16 px celular, 48 px desktop.
- Grilla de propiedades: 1 columna (< 640), 2 (640–1024), 3 (1024–1280), 4 (> 1280). Separación 12–24 px.
- En celular las fotos de card y de ficha van de borde a borde; el texto lleva el margen.
- Secciones: 40 px de aire vertical en celular, 72 px en desktop.
- Proporción de foto: 4:3 en cards, 3:2 en galería (celular), mosaico 1 + 4 en desktop.

## Movimiento

| Qué | Cómo |
|---|---|
| Curva | `cubic-bezier(0.32, 0.72, 0, 1)` para todo |
| Duración | 0.2 s (press, hover), 0.3 s (pastilla deslizante), 0.45 s (hojas, entradas) |
| Entrada de contenido | fade + 10–12 px hacia arriba |
| Hoja en celular | sube desde abajo (`translateY(100%)` → 0) |
| Hoja en desktop | entra desde la derecha |
| Press | `scale(0.97)` (corazón: 0.9) |
| Corazón al guardar | "pop": 0.6 → 1.28 → 1 |
| Éxito | círculo verde suave + tilde que se dibuja |
| Navegación | el contenido actual baja a 0.4 de opacidad mientras llega el nuevo |

`@media (prefers-reduced-motion: reduce)` apaga todas las animaciones.

## Componentes base (`components/ui`)

| Componente | Variantes | Notas |
|---|---|---|
| `Boton` | `primario` (negro), `secundario` (`#F4F4F4`), `texto` (link azul o gris); tamaños `chico` 44 / `normal` 52 / `grande` 54; `ancho` completo | Pastilla. Deshabilitado: opacidad 0.45. Acepta `href` |
| `Pastilla` | `filtro` (seleccionable), `estado` (ok / error / neutro), `contador` | Filtro activo: negra con texto blanco. Estado: fondo del color al 10 % |
| `Segmentado` | — | Selector con pastilla negra que se desliza (operación, tipo). Fondo `rgba(10,10,10,0.06)`, relleno 4–5 px |
| `Campo` | texto, área, select, con sugerencias | Label en `Rotulo` arriba; error en rojo abajo |
| `Hoja` | `inferior` (por defecto en celular), `lateral` (desktop, 420 px, separada 12 px de los bordes), `centrada` (confirmaciones, máx. 400 px) | Velo, cierre con Escape y toque afuera, foco atrapado, safe-area |
| `Card` | `foto` (propiedad), `bloque` (resumen sobre `#F5F5F7`, radio 22) | Sin sombra |
| `Rotulo` | normal, `rojo` | DM Mono mayúsculas |
| `Precio` | tamaños card / ficha | Instrument Sans tabular, con período |
| `Icono` | — | Un solo set: trazo, 24 px de caja, grosor 1.8, puntas redondeadas (el estilo de los SVG que ya usa Member) |
| `Esqueleto` | — | Bloques `#F4F4F4` con la forma del contenido |

## Componentes del sitio (`components/site`) y de dónde salen

| Componente | Base en Member | Adaptación |
|---|---|---|
| `PropertyCard` | `ProductCard` | Foto 4:3 con radio 18 siempre, carrusel de fotos, rótulo `ZONA · TIPO`, datos clave, precio con período. Se elimina la detección de fondo blanco |
| `Galeria` | `ProductGallery` | Mismo carrusel nativo con snap; suma visor a pantalla completa y mosaico en desktop |
| `FavHeart` | `FavHeart` | Igual, sin selector de talle: un toque guarda |
| `FavSheet` | `FavSheet` | Pasa a ser la hoja genérica de confirmación / compartir lista |
| `HojaConsulta`, `HojaFiltros` | `CartDrawer` | Misma hoja de vidrio: bottom sheet en celular, panel a la derecha en desktop |
| `NavPill`, `MobileNav` | `NavPill`, `MobileNav` | Secciones: Alquilar · Comprar · Zonas · Publicar. Sin la variante roja |
| `Filtros` | `FiltrosPlegables` | Botón "Filtrar" con contador; en celular abre hoja en vez de desplegar en el lugar |
| `BuscadorZona` | `Autocomplete` | Sugerencias de zonas; en el panel, localidades de Georef |
| `BarraCTA` | `.pdp-cta-bar` / `.fav-barra` | Barra fija inferior de vidrio con precio y CTA |
| `Buscador` | — (nuevo) | Segmentado de operación + zona + tipo + fechas + huéspedes |
| `Calendario` | — (nuevo, F3) | Mes a mes, rango, días ocupados tachados |

## Header y navegación

- Header `sticky`, 56 px de alto, vidrio, línea inferior `#EDEDED` (sin línea en celular: se une con el menú flotante).
- Menú de secciones en pastilla con indicador deslizante (0.3 s). Precarga las secciones para que el cambio sea inmediato.
- En celular el menú flota bajo el header, se oculta al bajar (después de 160 px) y vuelve al subir.

## Estados de publicación (pastillas)

| Estado | Estilo |
|---|---|
| Publicada / Disponible | Verde al 10 % + punto verde |
| En revisión | Neutro `#F4F4F4` |
| Borrador / Pausada | Neutro, texto `#6E6E73` |
| Rechazada | Rojo al 9 % |
| Destacada | Negro con texto blanco |

## Accesibilidad

- `:focus-visible` con contorno negro de 2 px y separación de 2 px.
- Contraste AA: el gris `#A3A3A3` no se usa para texto que haya que leer.
- Texto de campos 16 px.

## Reglas que no se rompen

1. Ningún color fuera de los tokens.
2. Ninguna tipografía fuera de las tres, cada una en su rol.
3. Todo botón es pastilla; toda foto tiene radio.
4. Sombras solo en hojas y flotantes.
5. Si un patrón se repite dos veces, va a `components/ui`.
6. Nada de reset global de márgenes.
