# AlquiloPinamar — reglas para cualquier agente de IA o desarrollador

Leer `PROMPT.md` antes de empezar: ahí está el objetivo, el diseño, el stack y las fases.

## Referencia de Member

- `referencia-member/` es una copia de solo lectura del código de Member Club. No editarla, no importarla desde el proyecto, no desplegarla.
- Usarla para replicar el estilo visual y copiar/adaptar scripts y utilidades.
- Excluirla de TypeScript, ESLint y Tailwind (`exclude` en tsconfig, `ignores` en eslint, `@source not` en globals.css) y sacarla del repo cuando el design system propio esté armado.

## Base de datos (CRITICO)

- En Member la base de producción se borró una vez por correr `prisma migrate dev` contra ella. Acá no puede pasar.
- NUNCA correr contra producción: `prisma migrate dev`, `prisma migrate reset`, `prisma db push`, ni SQL con DROP/DELETE/TRUNCATE.
- `.env` = base LOCAL. `.env.prod-db` = producción. Nunca poner la URL de producción en `.env`.
- Cambios de schema: `npm run db:migrate` en local, y a producción SOLO con `npm run db:deploy-prod`, y solo con OK explícito de Tommy.
- Antes de cualquier cosa que escriba en producción: `npm run db:backup` y OK explícito de Tommy.
- No borrar ni editar migraciones ya aplicadas. No borrar modelos del schema sin revisar la migración que genera.
- Todo modelo/columna nueva DEBE tener su migración en `prisma/migrations/` (nada de `db push`).
- Los scripts `db-guard`, `db-backup`, `db-deploy-prod` y `db-copy-prod-to-local` se copian de `referencia-member/scripts/` desde el primer día.

## Forma de trabajo

- Paso por paso, sin romper lo que ya funciona.
- Cambios nuevos en rama aparte creada desde `origin/main`; nunca push directo a main. Antes de un push, revisar qué commits viajan (`git log origin/main..HEAD`).
- Mobile first. Fotos siempre en máxima calidad.
- Respuestas cortas y directas, en español rioplatense.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
