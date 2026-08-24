import type { Metadata, Viewport } from "next";
import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

/* Three roles, self-hosted by next/font so there is no render-blocking request to
   Google and no swap flash. Each exposes a CSS variable that globals.css picks up
   as --disp / --body / --mono. */
const disp = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-disp",
  display: "swap",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

/* Resolved, not hardcoded: the canonical URL and the OG image URL both hang off
   this, so pinning a domain in source would make every rename a commit.
   NEXT_PUBLIC_SITE_URL wins when set (the custom domain);
   VERCEL_PROJECT_PRODUCTION_URL is injected by Vercel on every deploy; the
   literal is only the local-dev fallback. */
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Maurício Raposo — Engenheiro de dados",
  description:
    "Engenheiro e analista de dados júnior na BSA Tech. SQL avançado, pipelines em Python e automação em produção na vertical de apostas — onde número errado é dinheiro.",
  keywords: [
    "engenheiro de dados", "analista de dados", "data engineer",
    "SQL", "Python", "PostgreSQL", "SQL Server", "Power BI", "Recife",
  ],
  authors: [{ name: "Maurício Raposo", url: "https://github.com/rapozinho" }],
  creator: "Maurício Raposo",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Maurício Raposo",
    locale: "pt_BR",
    alternateLocale: ["en_US"],
    title: "Maurício Raposo — Engenheiro de dados",
    description:
      "SQL avançado, pipelines em Python e automação em produção. Uma rotina manual de 1–2 dias que hoje leva 5–10 minutos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maurício Raposo — Engenheiro de dados",
    description: "SQL avançado, pipelines em Python e automação em produção.",
  },
  robots: { index: true, follow: true },
};

/* The entry is a full-viewport WebGL scene, so the address bar must not resize
   the canvas mid-flight on mobile. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05070c",
  colorScheme: "dark",
};

/* schema.org Person: what turns a shared link into a result Google can label. */
const PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Maurício Raposo",
  jobTitle: "Engenheiro e analista de dados júnior",
  worksFor: { "@type": "Organization", name: "BSA Tech" },
  address: { "@type": "PostalAddress", addressLocality: "Recife", addressRegion: "PE", addressCountry: "BR" },
  email: "mailto:raposo360@gmail.com",
  url: SITE,
  sameAs: ["https://github.com/rapozinho", "https://www.linkedin.com/in/mauricio-raposo/"],
  knowsAbout: ["SQL", "Python", "PostgreSQL", "Microsoft SQL Server", "Power BI", "ETL", "Docker"],
  alumniOf: { "@type": "CollegeOrUniversity", name: "UNIBRA — Centro Universitário Brasileiro" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${disp.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON) }}
        />
      </body>
    </html>
  );
}
