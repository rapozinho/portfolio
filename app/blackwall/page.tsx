import type { Metadata } from "next";
import CaseStudy from "@/components/CaseStudy";
import "./case.css";

/* The case study the portfolio was linking at and did not have.

   Written as an engineering write-up rather than a brochure: the constraint that
   forced each decision, what it cost, and what I would do differently. Every
   number here is one the portfolio already claims, nothing is rounded up for
   the page.

   The page stays a server component so it can keep exporting metadata; the body
   reads the language from context and lives in components/CaseStudy.tsx. The
   metadata below cannot follow the toggle, since it is resolved on the server
   before there is a reader to have a preference, so it stays in the language the
   document itself is served in. */

export const metadata: Metadata = {
  title: "BlackWall Analytics: case study",
  description:
    "Dashboard de BI que disponibiliza dados de forma inteligente com gráficos interativos, sobre 8 bases e 1.04M linhas. Fila de jobs com polling e cancelamento.",
  alternates: { canonical: "/blackwall" },
  openGraph: {
    title: "BlackWall Analytics: case study",
    description:
      "Dashboard de BI sobre 8 bases e 1.04M linhas, com fila de jobs, polling e cancelamento.",
  },
};

export default function BlackWallCase() {
  return <CaseStudy />;
}
