/* One source for the public origin.

   layout.tsx, robots.ts and sitemap.ts all need it, and three copies of the same
   fallback chain is how a canonical URL ends up disagreeing with a sitemap entry.

   Resolution order:
     NEXT_PUBLIC_SITE_URL            the custom domain, set in the Vercel dashboard
     VERCEL_PROJECT_PRODUCTION_URL   injected by Vercel on every deploy
     localhost                       local dev only

   .dev is HSTS-preloaded at the TLD, so the scheme is never http in production. */
export const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
