import type { MetadataRoute } from "next";
import { SE_INDEXA, SITE_URL } from "@/lib/seo";

// Produccion: todo abierto menos el backoffice. Local y previews: todo cerrado.
export default function robots(): MetadataRoute.Robots {
  if (!SE_INDEXA) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/panel", "/api/", "/sistema", "/cuenta", "/ingresar", "/favoritos", "/lista"] },
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL,
  };
}
