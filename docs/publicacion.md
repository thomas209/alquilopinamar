# Publicación — paso a paso

Guía para poner AlquiloPinamar en internet por primera vez. Seguir el orden: cada paso necesita el anterior.
Nada de esto toca Member: proyecto nuevo en Railway, proyecto nuevo en Vercel y claves propias.

Lo que hace Tommy (cuentas, claves, pagos y "OK") está marcado con **Tommy**. El resto lo puede guiar o hacer Claude.

## 0. Antes de empezar

- [ ] Todos los PR unidos a `main` y probados en la Mac.
- [ ] `npm run build` funciona en la Mac sin errores.
- [ ] **Tommy:** clave nueva de Cloudinary (la actual quedó escrita en un chat). Cloudinary → Settings → API Keys → generar una nueva y borrar la vieja.
- [ ] **Tommy:** textos legales revisados (ver al final) y datos del titular definidos.

## 1. Base de datos (Railway)

1. **Tommy:** en Railway, **New Project** → **Database → PostgreSQL**. Nombre del proyecto: `alquilopinamar`. Nunca usar el proyecto de Member.
2. En la base → **Variables**, copiar `DATABASE_PUBLIC_URL` (la que termina en `.proxy.rlwy.net:PUERTO/railway`).
3. En la Mac, crear `.env.prod-db` (no se sube a git):
   ```
   PROD_DATABASE_URL="postgresql://…proxy.rlwy.net:PUERTO/railway"
   ```
4. Crear las tablas (pide confirmación escrita y hace backup antes y después):
   ```bash
   npm run db:deploy-prod
   ```
5. Cargar zonas, amenities y tu usuario del admin (solo agrega, nunca borra):
   ```bash
   npm run db:preparar-prod
   ```
   Usar una contraseña distinta a la de la base local.

## 2. Sitio (Vercel)

1. **Tommy:** en Vercel, **Add New → Project** → importar `thomas209/alquilopinamar`. Framework: Next.js (lo detecta solo). No tocar los comandos de build.
2. **Settings → Build and Deployment → Ignored Build Step**: elegir **Only build production**. Así solo se despliega `main`: las versiones de prueba de otras ramas usarían la misma base de producción, así que quedan apagadas.
3. **Settings → Environment Variables**, solo para **Production** (tipo **Secret** para claves y contraseñas, **Config** para el resto). Al pegar una clave: copiarla con un comando, escribir el nombre a mano en Key y pegar en Value; si se copia el nombre, se pisa la clave copiada:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | La `DATABASE_PUBLIC_URL` de Railway + `?connection_limit=5&pool_timeout=20` al final |
   | `NEXT_PUBLIC_URL` | `https://dominio-definitivo.com.ar` (sin `/` al final). Mientras no haya dominio: la URL `….vercel.app` |
   | `NEXTAUTH_URL` | Igual que `NEXT_PUBLIC_URL` |
   | `NEXTAUTH_SECRET` | Uno **nuevo**: `openssl rand -base64 32` (no reusar el de la Mac) |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dklvmlzds` |
   | `CLOUDINARY_FOLDER` | `alquilopinamar` |
   | `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | La clave **nueva** del paso 0 |
   | `RESEND_API_KEY` / `ADMIN_EMAIL` | De Resend (ver paso 4) |
   | `NEXT_PUBLIC_WHATSAPP` | WhatsApp del sitio, solo números: `549…` |
   | `NEXT_PUBLIC_EMAIL_CONTACTO`, `NEXT_PUBLIC_INSTAGRAM` | Si están definidos |
   | `NEXT_PUBLIC_TITULAR`, `NEXT_PUBLIC_CUIT`, `NEXT_PUBLIC_DOMICILIO` | Datos del responsable (aparecen en términos y privacidad) |

4. **Deploy.** Al terminar, entrar a `/admin/login` con el usuario del paso 1.5 y cargar las primeras propiedades.

## 3. Dominio

1. **Tommy:** comprar el dominio (para `.com.ar`: nic.ar).
2. Vercel → **Settings → Domains** → agregarlo y cargar en nic.ar los DNS que indica Vercel. El certificado HTTPS lo pone Vercel solo.
3. Cambiar `NEXT_PUBLIC_URL` y `NEXTAUTH_URL` al dominio y volver a desplegar (**Deployments → … → Redeploy**).

## 4. Mails (Resend)

1. **Tommy:** cuenta en resend.com → **API Keys → Create** → cargar `RESEND_API_KEY` y `ADMIN_EMAIL` en Vercel.
2. Con dominio: **Domains → Add Domain**, cargar los DNS en nic.ar y, cuando quede verificado, `RESEND_FROM_EMAIL="AlquiloPinamar <avisos@dominio.com.ar>"`. Sin este paso los avisos solo llegan al mail de la cuenta de Resend.

## 5. Backups automáticos

1. **Tommy:** GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**: `PROD_DATABASE_URL` = la misma URL de `.env.prod-db`.
2. **Actions → "Backup de la base" → Run workflow** para probarlo. Tiene que terminar en verde y dejar un artefacto `backup-…`.
3. Desde ahí corre solo todos los días a las 3:00. Restaurar: ver `docs/base-de-datos.md`.

## 6. Google

1. **Tommy:** Google Search Console → agregar el dominio (verificación por DNS en nic.ar).
2. **Sitemaps** → enviar `https://dominio/sitemap.xml`.
3. Probar una ficha en https://search.google.com/test/rich-results y en https://www.opengraph.xyz.

## 7. Prueba final (en el celular y en la compu)

- [ ] Home, listado con filtros, ficha, zona, quiénes somos, contacto, términos, privacidad.
- [ ] Consulta desde una ficha → aparece en `/admin/consultas` → llega el mail.
- [ ] Botón de WhatsApp abre el chat con el mensaje armado.
- [ ] `/robots.txt` en producción **no** dice `Disallow: /` (solo cierra admin, panel, API y sistema).
- [ ] `/sistema` da 404.
- [ ] Compartir una ficha por WhatsApp muestra foto, título y precio.

## Textos legales

Los términos y la política de privacidad están escritos para un sitio de avisos en Argentina (Ley 25.326 de datos personales y Ley 24.240 de defensa del consumidor), pero **no reemplazan la revisión de un abogado**. Antes de publicar:

- Definir quién es el titular (persona o empresa) y completar `NEXT_PUBLIC_TITULAR`, `NEXT_PUBLIC_CUIT` y `NEXT_PUBLIC_DOMICILIO`.
- Hacer revisar `app/(site)/terminos/page.tsx` y `app/(site)/privacidad/page.tsx`.
- Evaluar la inscripción de la base de datos en el Registro Nacional de Bases de Datos (AAIP).
- Si se cambia algo, actualizar `LEGALES_ACTUALIZADOS` en `lib/empresa.ts`.
