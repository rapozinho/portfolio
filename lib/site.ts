/* One source for the public origin.

   layout.tsx, robots.ts and sitemap.ts all need it, and three copies of the same
   fallback chain is how a canonical URL ends up disagreeing with a sitemap entry.

   Resolution order:
     NEXT_PUBLIC_SITE_URL   an override, for the day a real domain is attached
     PUBLISHED              the domain the portfolio is actually served under
     localhost              dev only, so metadataBase does not claim production

   VERCEL_PROJECT_PRODUCTION_URL used to sit in the middle of that chain and it was
   the wrong source: it returns the domain Vercel generated for the project, not
   the one the site is published under. It produced portfolio-pi-lemon-73.vercel.app
   in the canonical, the og tags and both sitemap entries — and after the domain was
   renamed that host started returning 404, so every one of them pointed at a dead
   URL. A pinned value is not a guess here; it is the address that gets shared. */
const PUBLISHED = "https://mauricio-raposo.vercel.app";

export const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (process.env.NODE_ENV === "production" ? PUBLISHED : "http://localhost:3000");
