import { ImageResponse } from "next/og";

/* Generated at build time instead of shipping a PNG, so the card never drifts out
   of sync with the copy. Next wires this file into the OG and Twitter tags
   automatically — that is why layout.tsx does not name an image. */
/* Required by output: "export": the card is generated at build time instead of
   on request, which is what a static host needs. */
export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Maurício Raposo — Engenheiro de dados";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#05070c",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* The wall, reduced to what survives at card size: red threads on black. */}
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: i % 7 === 3 ? "#37e6ff" : "#ff2f45",
                opacity: 0.06 + (i % 5) * 0.05,
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg,#05070c 0%,rgba(5,7,12,.82) 55%,#05070c 100%)",
          }}
        />

        <div style={{ display: "flex", gap: 28, color: "#8593a8", fontSize: 22, letterSpacing: 4 }}>
          <span style={{ color: "#ff2f45" }}>ICE ATIVO</span>
          <span>CAMADA 03</span>
          <span>RECIFE / BR</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ color: "#e6eaf2", fontSize: 82, fontWeight: 700, lineHeight: 1 }}>
            Maurício Raposo
          </div>
          <div style={{ color: "#fcee0a", fontSize: 30, letterSpacing: 2 }}>
            engenheiro e analista de dados
          </div>
          <div style={{ color: "#8593a8", fontSize: 27, maxWidth: 880, lineHeight: 1.45 }}>
            SQL avançado, pipelines em Python e automação em produção. Uma rotina de
            1–2 dias que hoje leva 5–10 minutos.
          </div>
        </div>

        <div style={{ display: "flex", gap: 44, color: "#8593a8", fontSize: 22, letterSpacing: 3 }}>
          <span>
            <span style={{ color: "#37e6ff" }}>292</span> QUERIES
          </span>
          <span>
            <span style={{ color: "#37e6ff" }}>1.04M</span> LINHAS
          </span>
          <span>
            <span style={{ color: "#37e6ff" }}>2</span> BOTS EM PRODUÇÃO
          </span>
          <span>
            <span style={{ color: "#37e6ff" }}>12</span> CERTIFICAÇÕES
          </span>
        </div>
      </div>
    ),
    size,
  );
}
