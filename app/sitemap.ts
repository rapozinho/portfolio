import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* Two pages, so this is short by nature — the point is that /blackwall gets
   discovered on its own rather than only through a link on the home page. The
   PDFs are deliberately absent: a certificate ranking above the portfolio would
   be a worse first result than no result. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/blackwall`, changeFrequency: "yearly", priority: 0.8 },
  ];
}
