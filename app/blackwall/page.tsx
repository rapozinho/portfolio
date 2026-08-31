import type { Metadata } from "next";
import Link from "next/link";
import "./case.css";

/* The case study the portfolio was linking at and did not have.

   Written as an engineering write-up rather than a brochure: the constraint that
   forced each decision, what it cost, and what I would do differently. Every
   number here is one the portfolio already claims — nothing is rounded up for
   the page.

   It is laid out as an after-action report because that is what the content
   already is: a header block, a fact sheet, findings in the order they
   constrained each other, and open items. The one loud element is the cost of
   each decision, since that is the half of an engineering write-up that
   normally goes missing, and this page exists to show judgement rather than
   features. */

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

const FACTS = [
  { k: "linhas consultadas", v: "1.04M" },
  { k: "queries no catálogo", v: "292" },
  { k: "bases atendidas", v: "8" },
  { k: "idiomas", v: "3" },
];

const DECISIONS = [
  {
    n: "01",
    title: "Traduzir no nível da query, não só na interface",
    problem:
      "Três idiomas. Traduzir só os rótulos da UI deixaria os dados em português dentro de um relatório em inglês: nome de produto, status de aposta, categoria.",
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

const STACK = [
  "Python · FastAPI",
  "PostgreSQL · SQL Server",
  "Chart.js",
  "Docker Compose · nginx",
];

const NEXT = [
  "Testes no catálogo de queries. Hoje uma query errada só aparece quando alguém lê um número estranho, que é a pior forma de descobrir.",
  "Cache dos resultados por parâmetro. Muita consulta é repetida com os mesmos filtros e paga o custo inteiro de novo.",
  "Orquestração por Airflow em vez da fila caseira. Certificado, ainda não em produção pelas minhas mãos, então ficou como próximo passo honesto, não como stack de vitrine.",
];

/* The label sits in its own column so the three lines of a decision read as a
   table rather than three paragraphs that happen to start in bold. */
function Row({ k, children, cost }: { k: string; children: string; cost?: boolean }) {
  return (
    <div className={cost ? "dec__row dec__row--cost" : "dec__row"}>
      <span className="dec__k">{k}</span>
      <p>{children}</p>
    </div>
  );
}

function SecHead({ label }: { label: string }) {
  return (
    <div className="case__sh">
      <h2>{label}</h2>
      <span className="case__rule" />
    </div>
  );
}

export default function BlackWallCase() {
  return (
    <>
      <div id="grain" aria-hidden="true" />

      {/* Fixed so the way back is reachable from anywhere in a long read, not
          only after scrolling to the end of it. */}
      <div className="case-rail">
        <div className="wrap">
          <span className="brand">Maurício Raposo</span>
          <Link className="case-rail__back" href="/#projetos">
            ← projetos
          </Link>
        </div>
      </div>

      <main id="case">
        <div className="wrap">
          <header className="case__hd">
            <span className="case__eyebrow">estudo de caso · 2025—2026</span>
            <h1 className="case__t">
              BlackWall <span>Analytics</span>
            </h1>
            <p className="case__lede">
              Dashboard de BI que disponibiliza dados de forma inteligente, com gráficos
              interativos sobre oito bases. O que segue é a engenharia: a restrição que
              forçou cada decisão, o que ela custou, e o que eu faria diferente.
            </p>
            <p className="case__go">
              <a
                href="https://rapozinho.github.io/blackwall-analytics/"
                target="_blank"
                rel="noopener"
              >
                abrir demo →
              </a>
              <a
                className="case__go--quiet"
                href="https://github.com/rapozinho/blackwall-analytics"
                target="_blank"
                rel="noopener"
              >
                repo →
              </a>
            </p>
          </header>

          <dl className="case__figs">
            {FACTS.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>

          <section className="case__s">
            <SecHead label="O problema" />
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
            <SecHead label="Decisões" />
            {/* Numbered because these are a sequence: each one narrows the next. */}
            <ol className="dec">
              {DECISIONS.map((d) => (
                <li key={d.n}>
                  <div className="dec__hd">
                    <span className="dec__n">{d.n}</span>
                    <h3>{d.title}</h3>
                  </div>
                  <Row k="Restrição">{d.problem}</Row>
                  <Row k="Escolha">{d.choice}</Row>
                  <Row k="Custo" cost>
                    {d.cost}
                  </Row>
                </li>
              ))}
            </ol>
          </section>

          <section className="case__s">
            <SecHead label="Stack" />
            <p className="case__stack">
              {STACK.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </p>
          </section>

          <section className="case__s">
            <SecHead label="O que eu faria diferente" />
            <ul className="nxt">
              {NEXT.map((n) => (
                <li key={n.slice(0, 24)}>{n}</li>
              ))}
            </ul>
          </section>

          <footer className="case__foot">
            <Link href="/#projetos">← voltar aos projetos</Link>
            <span>© 2026 Maurício Raposo</span>
          </footer>
        </div>
      </main>
    </>
  );
}
