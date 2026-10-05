# Base de datos: reglas y flujo de trabajo

> En Member la base de producción se borró una vez por correr `prisma migrate dev` con el `.env` apuntando a producción. Este flujo existe desde el día uno para que acá no pueda pasar.

## Las dos bases

| Base | Dónde | Archivo | Para qué |
|---|---|---|---|
| **Local (desarrollo)** | Postgres en la Mac, base `alquilopinamar_dev` | `.env` → `DATABASE_URL` | Probar todo. Se puede romper sin problema |
| **Producción** | Railway | `.env.prod-db` → `PROD_DATABASE_URL` + Vercel | El sitio real. Nunca se toca a mano |

- La URL de producción **nunca** va en `.env`. Así cualquier comando de Prisma en la Mac solo puede afectar la base local.
- `.env`, `.env.prod-db` y `backups/` están fuera de git.

## Prohibido contra producción

- `prisma migrate dev`
- `prisma migrate reset`
- `prisma db push`
- SQL con `DROP`, `DELETE` o `TRUNCATE`
- Borrar o editar archivos de `prisma/migrations/` ya aplicados
- Borrar modelos de `schema.prisma` sin revisar la migración que genera

Todo modelo o columna nueva **debe** tener su migración en `prisma/migrations/`.

## Scripts (`scripts/`)

| Script | Qué hace |
|---|---|
| `db-guard` | Se ejecuta antes de `dev`, `db:migrate` y `db:studio`. Lee `DATABASE_URL` y **corta** si el host no es `localhost` / `127.0.0.1` |
| `db-backup` | Copia todas las tablas a `backups/<fecha>/<Tabla>.json` dentro de una transacción `READ ONLY` (Postgres rechaza cualquier escritura). Muestra filas por tabla |
| `db-deploy-prod` | Muestra migraciones pendientes, avisa si alguna tiene `DROP`/`DELETE`/`TRUNCATE`, hace backup, pide escribir `APLICAR EN PRODUCCION`, corre `prisma migrate deploy`, hace backup de nuevo y compara filas |
| `db-copy-prod-to-local` | Carga el último backup de producción en la base local. Nunca escribe en producción |

Los cuatro están escritos en `scripts/` (comparten `scripts/_env.mjs`). `db-backup` venía de Member; los otros tres no estaban en la copia de referencia y se escribieron para este proyecto con el comportamiento de esta tabla.

## Comandos

| Comando | Qué hace | ¿Toca producción? |
|---|---|---|
| `npm run dev` | Levanta el sitio local (pasa por `db-guard`) | No |
| `npm run db:migrate -- --name <cambio>` | Crea y aplica una migración en local | No (bloqueado) |
| `npm run db:studio` | Prisma Studio sobre la base local | No (bloqueado) |
| `npm run db:backup` | Backup de producción a `backups/` | Solo lectura |
| `npm run db:backup -- local` | Backup de la base local | No |
| `npm run db:copy-to-local` | Último backup de producción → base local | No |
| `npm run db:deploy-prod` | Aplica migraciones pendientes a producción | **Sí, con backup y confirmación** |

## Cómo hacer un cambio de schema

1. Editar `prisma/schema.prisma`.
2. `npm run db:migrate -- --name descripcion-del-cambio`.
3. Revisar el `migration.sql` generado. Si tiene `DROP`, `DELETE` o `TRUNCATE`, frenar y revisar.
4. Probar en local.
5. Commit del código **y** de la migración, en rama aparte.
6. Con **OK explícito de Tommy**: `npm run db:backup` y después `npm run db:deploy-prod`.

Orden: la migración se aplica a producción **antes** de que Vercel despliegue código que use columnas nuevas.

## Backups

- **Manual:** `npm run db:backup` antes de cualquier cosa que escriba en producción.
- **Automático:** GitHub Actions diario (03:00 ARG) con `pg_dump`, retención 90 días, usando el secret `PROD_DATABASE_URL`. Se configura junto con la base de producción.
- Railway Hobby no incluye backups propios: no confiar en eso.

## Restaurar (emergencia)

1. Descargar el `.dump` desde GitHub Actions.
2. Restaurarlo **primero en la base local** y revisarlo:
   ```
   pg_restore --clean --if-exists --no-owner -d postgresql://localhost:5432/alquilopinamar_dev archivo.dump
   ```
3. Restaurar sobre producción solo después de verificarlo, con backup previo y OK explícito.

## Checklist antes de tocar producción

- [ ] La migración está commiteada y probada en local.
- [ ] Revisé el SQL: sin `DROP` / `DELETE` / `TRUNCATE` inesperados.
- [ ] Corrí `npm run db:backup` y vi el conteo de filas.
- [ ] Tommy dio el OK explícito.
- [ ] Uso `npm run db:deploy-prod`, no un comando de Prisma a mano.
