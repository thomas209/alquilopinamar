# AlquiloPinamar

Marketplace de alquiler y venta de propiedades en Pinamar y alrededores.

- Objetivo, diseño, stack y fases: `PROMPT.md`
- Reglas para trabajar en el repo (base de datos, ramas): `CLAUDE.md`
- Documentación: `docs/`

## Primera vez

```bash
npm install
cp .env.example .env          # base LOCAL, nunca la de producción
createdb alquilopinamar_dev   # con Postgres corriendo en la Mac
npm run dev
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Sitio local (se bloquea si `.env` no apunta a la base local) |
| `npm run build` | Build de producción (falla si hay errores de tipos) |
| `npm run lint` / `npm run typecheck` | Revisión de código y de tipos |
| `npm run db:migrate -- --name <cambio>` | Crea y aplica una migración en local |
| `npm run db:studio` | Prisma Studio sobre la base local |
| `npm run db:backup` | Backup de producción (solo lectura). Con `-- local`, de la base local |
| `npm run db:copy-to-local` | Carga el último backup de producción en la base local |
| `npm run db:deploy-prod` | Aplica migraciones en producción, con backup y confirmación |

Antes de tocar la base, leer `docs/base-de-datos.md`.
