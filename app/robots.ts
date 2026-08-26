import type { MetadataRoute } from "next";

/* Required by output: "export" -- a route handler is dynamic by default and a
   static export has nothing to run it. */
export const dynamic = "force-static";
import { SITE } from "@/lib/site";

/* The certificates and the résumé are linked from the page and open fine; they
   are just kept out of the index, so a search for the name returns the portfolio
   rather than a stack of PDFs. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/certificados/", "/cv/"] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
