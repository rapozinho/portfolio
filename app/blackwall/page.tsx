import type { Metadata } from "next";
import Link from "next/link";
import "./case.css";

/* The case study the portfolio was linking at and did not have.

   Written as an engineering write-up rather than a brochure: the constraint that
   forced each decision, what it cost, and what I would do differently. Every
   number here is one the portfolio already claims — nothing is rounded up for
   the page. */

export const metadata: Metadata = {
  title: "BlackWall Analytics: case study",
  description:
    "Portal de BI servindo duas verticais de um só código: 292 queries, 1.04M linhas, 8 bases. Fila de jobs com cancelamento e tradução em nível de query.",
  alternates: { canonical: "/blackwall" },
  openGraph: {
    title: "BlackWall Analytics: case study",
    description:
      "Portal de BI servindo duas verticais de um só código: 292 queries, 1.04M linhas, 8 bases.",
  },
};

const FACTS = [
  { k: "queries no catálogo", v: "292" },
  { k: "linhas consultadas", v: "1.04M" },
  { k: "bases atendidas", v: "8" },
  { k: "verticais", v: "2" },
  { k: "idiomas", v: "3" },
];

const DECISIONS = [
  {
    n: "01",
    title: "Traduzir no nível da query, não só na interface",
    problem:
      "Duas verticais, três idiomas. Traduzir só os rótulos da UI deixaria os dados em português dentro de um relatório em inglês: nome de produto, status de aposta, categoria.",
    choice:
      "A camada de idioma desce até a query: o catálogo devolve o rótulo já na língua pedida, então o relatório sai inteiro coerente.",
    cost:
      "Cada query nova precisa das três variantes de rótulo. É trabalho a mais na escrita e disciplina no catálogo. É o tipo de dívida que aparece na décima query, não na primeira.",
  },
  {
    n: "02",
    title: "Fila de jobs com polling e cancelamento",
    problem:
      "Uma consulta sobre 1.04M linhas não responde dentro de um request HTTP. Sem fila, o navegador espera e estoura; com fila mas sem cancelamento, quem clicou errado ocupa o worker até o fim.",
    choice:
      "Job assíncrono, polling de status pelo front, e cancelamento de verdade: o job morre e o worker libera.",
    cost:
      "Mais partes móveis que um endpoint síncrono: estado do job, timeout, e o caso de o cliente desistir sem avisar.",
  },
  {
    n: "03",
    title: "Um só código para as duas verticais",
    problem:
      "Apostas e e-commerce têm métricas diferentes, já que GGR e turnover não existem no segundo. O caminho fácil é dois portais.",
    choice:
      "Um código, com o catálogo de queries parametrizado por vertical. Correção de bug vale para as duas.",
    cost:
      "O catálogo carrega condicionais por vertical. Compensa em duas; numa terceira bem diferente eu revisaria a decisão.",
  },
  {
    n: "04",
    title: "Docker Compose e nginx, não uma plataforma gerenciada",
    problem: "Precisava rodar em qualquer máquina, inclusive na minha, sem custo fixo.",
    choice: "Compose para subir tudo junto, nginx na frente do FastAPI.",
    cost:
      "Nada de escala automática nem deploy sem downtime. Para o volume atual não faz diferença; num tráfego maior faria.",
  },
];

const NEXT = [
  "Testes no catálogo de queries. Hoje uma query errada só aparece quando alguém lê um número estranho, que é a pior forma de descobrir.",
  "Cache dos resultados por parâmetro. Muita consulta é repetida com os mesmos filtros e paga o custo inteiro de novo.",
  "Orquestração por Airflow em vez da fila caseira. Certificado, ainda não em produção pelas minhas mãos, então ficou como próximo passo honesto, não como stack de vitrine.",
];

export default function BlackWallCase() {
  return (
    <main id="case" className="case">
      <div className="wrap">
        <p className="case__back">
          <Link href="/">← Maurício Raposo</Link>
        </p>

        <header className="case__hd">
          <span className="case__eyebrow">case study · 2025–2026</span>
          <h1 className="case__t">BlackWall Analytics</h1>
          <p className="case__lede">
            Portal de BI que atende duas verticais, apostas e e-commerce, a partir de
            um só código. O que segue é a engenharia: a restrição que forçou cada
            decisão, o que ela custou, e o que eu faria diferente.
          </p>
          <p className="case__go">
            <a href="https://rapozinho.github.io/blackwall-analytics/" target="_blank" rel="noopener">
              abrir demo →
            </a>
            <a href="https://github.com/rapozinho/blackwall-analytics" target="_blank" rel="noopener">
              repo →
            </a>
          </p>
        </header>

        <dl className="figs case__figs">
          {FACTS.map((f) => (
            <div key={f.k}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>

        <section className="case__s">
          <h2>O problema</h2>
          <p>
            Números operacionais chegavam a quem decide por caminhos diferentes: uma
            planilha aqui, um print de dashboard ali, um relatório que alguém montou à
            mão na semana passada. Quando dois desses discordavam, e discordavam,
            ninguém sabia qual estava certo, porque não havia uma fonte que se pudesse
            reexecutar.
          </p>
          <p>
            A vertical de apostas piora isso: número errado é dinheiro, não erro de
            arredondamento. O portal existe para que a resposta seja sempre a mesma
            query rodando sobre a mesma base, e para que qualquer pessoa consiga
            reproduzi-la.
          </p>
        </section>

        <section className="case__s">
          <h2>Decisões</h2>
          <ol className="dec">
            {DECISIONS.map((d) => (
              <li key={d.n}>
                <span className="dec__n">{d.n}</span>
                <h3>{d.title}</h3>
                <p className="dec__l">
                  <b>Restrição.</b> {d.problem}
                </p>
                <p className="dec__l">
                  <b>Escolha.</b> {d.choice}
                </p>
                <p className="dec__l dec__cost">
                  <b>Custo.</b> {d.cost}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="case__s">
          <h2>Stack</h2>
          <p className="case__stack">
            <span>Python · FastAPI</span>
            <span>PostgreSQL · SQL Server</span>
            <span>Chart.js</span>
            <span>Docker Compose · nginx</span>
          </p>
        </section>

        <section className="case__s">
          <h2>O que eu faria diferente</h2>
          <ul className="nxt">
            {NEXT.map((n) => (
              <li key={n.slice(0, 24)}>{n}</li>
            ))}
          </ul>
        </section>

        <p className="foot">
          © 2026 Maurício Raposo · <Link href="/">voltar ao portfólio</Link>
        </p>
      </div>
    </main>
  );
}
