/* Every word of the site, in both languages, in one file.

   The prototype kept the English copy in data-en attributes and swapped
   innerHTML on toggle. That worked but it scattered the copy across the markup
   and made the two languages easy to drift apart. Here each string is a pair, so
   a missing translation is a type error rather than a silently untranslated
   paragraph.

   Prose that needs emphasis carries inline HTML and is rendered through
   dangerouslySetInnerHTML. The strings are authored in this file and never come
   from user input, so there is nothing to sanitise. */

export type Lang = "pt" | "en";
export type Bi = { pt: string; en: string };

export const t = (v: Bi, l: Lang) => v[l];

/* ── navigation ─────────────────────────────────────────────────────── */
export const NAV: Array<{ id: string; label: Bi }> = [
  { id: "ident", label: { pt: "identificação", en: "identity" } },
  { id: "projetos", label: { pt: "projetos", en: "projects" } },
  { id: "traj", label: { pt: "trajetória", en: "career" } },
  { id: "competencias", label: { pt: "competências", en: "skills" } },
  { id: "stack", label: { pt: "stack", en: "stack" } },
  { id: "shards", label: { pt: "certificados", en: "certificates" } },
  { id: "net", label: { pt: "contato", en: "contact" } },
];

/* ── Act I ──────────────────────────────────────────────────────────── */
export const GATE = {
  readout: [
    { dt: { pt: "ICE", en: "ICE" }, dd: { pt: "ativo", en: "active" }, em: true, ok: false },
    { dt: { pt: "camada", en: "layer" }, dd: { pt: "03", en: "03" }, em: false, ok: false },
    { dt: { pt: "assinatura", en: "signature" }, dd: { pt: "RAPOSO, M.", en: "RAPOSO, M." }, em: true, ok: true },
    { dt: { pt: "nó", en: "node" }, dd: { pt: "RECIFE / BR", en: "RECIFE / BR" }, em: false, ok: false },
  ],
  cue: { pt: "role para atravessar", en: "scroll to cross" },
  handshake: { pt: "handshake", en: "handshake" },
  meter: { pt: "distância vencida", en: "distance closed" },
  breach: { pt: "aproximar", en: "close in" },
  skip: { pt: "pular a travessia", en: "skip the crossing" },
};

/* The handshake log. Each entry is [prefix, html]; the engine types the plain
   text and swaps in the markup once the line lands. */
export const TERM: Record<Lang, Array<[string, string]>> = {
  pt: [
    ["> ", "sondando perímetro blackwall"],
    ["> ", 'ICE <span class="w">ativo</span> · camada 3'],
    ["> ", '<span class="w">[!]</span> presença detectada do outro lado'],
    ["> ", 'forma <span class="k">humanoide</span> · sinal fraco'],
    ["> ", 'aproxime-se para identificar <span class="a">› role</span>'],
  ],
  en: [
    ["> ", "probing blackwall perimeter"],
    ["> ", 'ICE <span class="w">active</span> · layer 3'],
    ["> ", '<span class="w">[!]</span> presence detected on the far side'],
    ["> ", '<span class="k">humanoid</span> shape · weak signal'],
    ["> ", 'close in to identify <span class="a">› scroll</span>'],
  ],
};

/* ── 01 identity ────────────────────────────────────────────────────── */
export const IDENT = {
  title: { pt: "Identificação", en: "Identity" },
  name: "Maurício Raposo",
  role: {
    pt: "engenheiro e analista de dados",
    en: "data engineer & analyst",
  },
  /* The visitor's own text, verbatim. The English is a translation, not his
     wording. Split after the second sentence because four run to seven unbroken
     lines at 58ch beside a photograph; nothing else about it is changed. */
  bio: [
    {
      pt: "Profissional apaixonado por transformar ideias em soluções reais, unindo técnica, criatividade e visão estratégica. Acredito que os melhores resultados surgem do alinhamento entre funcionalidade, boa comunicação e foco nas pessoas.",
      en: "A professional driven by turning ideas into real solutions, bringing together craft, creativity and strategic vision. I believe the best results come from the alignment of functionality, good communication and a focus on people.",
    },
    {
      pt: "Tenho perfil dinâmico e colaborativo, me adapto com facilidade a novos desafios, e busco sempre aprender e evoluir a cada projeto. Meu objetivo é entregar experiências de alto impacto, combinando eficiência e um toque humano em tudo o que faço, criando conexões genuínas e entregas que realmente geram valor.",
      en: "I am dynamic and collaborative, and I adapt easily to new challenges, always looking to learn and grow with every project. My goal is to deliver high-impact experiences, combining efficiency with a human touch in everything I do, building genuine connections and work that truly creates value.",
    },
  ],
  figs: [
    { dt: { pt: "em dados desde", en: "in data since" }, dd: "2024", em: ".08" },
    /* The label carries the before and the value carries the after, so the row
       means something on its own rather than needing the projects card to
       explain it. It replaces "tempo de ciclo / cycle time cut ~99%", where the
       two languages claimed opposite things: the English read as a 99% cut and
       the Portuguese as a cycle time that IS 99%. */
    { dt: { pt: "rotina de 1–2 dias", en: "a 1–2 day routine" }, dd: "5–10", em: " min" },
    { dt: { pt: "bots em produção", en: "bots in production" }, dd: "3", em: "" },
    { dt: { pt: "certificações", en: "certifications" }, dd: "12", em: "" },
  ],
};

/* ── 02 portals ─────────────────────────────────────────────────────── */
export type Portal = {
  lead?: boolean;
  label: Bi;
  note: Bi;
  kv?: Bi[];
  status: { kind: "ok" | "warn" | "off"; label: Bi };
  links?: Array<{ href: string; label: Bi; internal?: boolean }>;
};

export const PORTALS: Portal[] = [
  {
    lead: true,
    label: { pt: "BlackWall Analytics", en: "BlackWall Analytics" },
    note: {
      pt: "Dashboard de BI que disponibiliza dados de forma inteligente com gráficos interativos, unificando <b>8 bases de dados</b> numa fonte única da verdade. Fila de jobs com polling e cancelamento.",
      en: "A BI dashboard delivering data intelligently with interactive charts, unifying <b>8 databases</b> into a single source of truth. Job queue with polling and cancellation.",
    },
    kv: [
      { pt: "queries <b>292</b>", en: "queries <b>292</b>" },
      { pt: "linhas <b>1,04M</b>", en: "rows <b>1.04M</b>" },
      { pt: "bases <b>8</b>", en: "databases <b>8</b>" },
      { pt: "idiomas <b>3</b>", en: "languages <b>3</b>" },
    ],
    status: { kind: "ok", label: { pt: "online · público", en: "online · public" } },
    links: [
      { href: "/blackwall", label: { pt: "estudo de caso →", en: "case study →" }, internal: true },
      { href: "https://rapozinho.github.io/blackwall-analytics/", label: { pt: "abrir demo →", en: "open demo →" } },
      { href: "https://github.com/rapozinho/blackwall-analytics", label: { pt: "repo →", en: "repo →" } },
    ],
  },
  {
    label: { pt: "Automação de rotina", en: "Routine automation" },
    note: {
      /* The bots are named here because they are how anyone actually reaches
         this: without that, two cards claimed the same saving and neither said
         they were halves of one thing. */
      pt: "Um processo que comia <b>um a dois dias</b> de trabalho manual: reconstruído em Python com extração SQL e coleta via Microsoft Graph API, e entregue pelos bots do Telegram. Agora 5 a 10 minutos.",
      en: "A process that ate <b>one to two days</b> of manual work: rebuilt in Python with SQL extraction and Microsoft Graph API collection, delivered through the Telegram bots. Now 5 to 10 minutes.",
    },
    kv: [
      { pt: "antes <b>1–2 d</b>", en: "before <b>1–2 d</b>" },
      { pt: "depois <b>5–10 min</b>", en: "after <b>5–10 min</b>" },
    ],
    status: { kind: "warn", label: { pt: "interno · NDA", en: "internal · NDA" } },
  },
  {
    /* "consultas", to agree with the note under it: the card called them report
       bots while the text described query bots. */
    label: { pt: "Bots de consultas", en: "Telegram query bots" },
    /* The visitor's own text. Two mechanical corrections to it: Telegram in its
       real casing, like every other product name here, and "Permitem" to agree
       with the plural subject. */
    note: {
      pt: "Bots de consultas no Telegram que simplificam a distribuição de dados para as equipes de KPI e Produto. Permitem consultas rápidas via chat, reduzindo gargalos na extração de dados e aumentando a produtividade dos times.",
      en: "Telegram query bots that simplify how data reaches the KPI and Product teams. They answer queries straight from chat, reducing bottlenecks in data extraction and raising the productivity of both teams.",
    },
    kv: [
      { pt: "bots <b>3</b>", en: "bots <b>3</b>" },
      { pt: "times <b>2</b>", en: "teams <b>2</b>" },
      { pt: "KPIs <b>GGR +2</b>", en: "KPIs <b>GGR +2</b>" },
    ],
    status: { kind: "warn", label: { pt: "interno · NDA", en: "internal · NDA" } },
  },
];

/* ── the BlackWall case study ────────────────────────────────────────
   Here rather than in the page, for the reason every other string is here: the
   page was written in Portuguese only, while the card that links to it offers
   "case study" in both languages, so an English reader clicking the lead
   project landed in a wall of Portuguese. */
export const CASE = {
  eyebrow: { pt: "estudo de caso · 2025–2026", en: "case study · 2025–2026" },
  back: { pt: "← projetos", en: "← projects" },
  backFoot: { pt: "← voltar aos projetos", en: "← back to projects" },
  lede: {
    pt: "Dashboard de BI que disponibiliza dados de forma inteligente, com gráficos interativos sobre oito bases. O que segue é a engenharia: a restrição que forçou cada decisão, o que ela custou, e o que eu faria diferente.",
    en: "A BI dashboard that delivers data intelligently, with interactive charts over eight databases. What follows is the engineering: the constraint that forced each decision, what it cost, and what I would do differently.",
  },
  demo: { pt: "abrir demo →", en: "open demo →" },
  repo: { pt: "repo →", en: "repo →" },
  /* All four values are pairs even though only the first differs, so the shape
     is one thing rather than a string here and a pair there: Portuguese takes
     the comma as its decimal separator, English the point. */
  facts: [
    { k: { pt: "linhas consultadas", en: "rows queried" }, v: { pt: "1,04M", en: "1.04M" } },
    { k: { pt: "queries no catálogo", en: "queries in the catalogue" }, v: { pt: "292", en: "292" } },
    { k: { pt: "bases atendidas", en: "databases served" }, v: { pt: "8", en: "8" } },
    { k: { pt: "idiomas", en: "languages" }, v: { pt: "3", en: "3" } },
  ],
  /* Captured from the demo build, which is the real front end reading recorded
     API payloads. A case study about a dashboard that never shows the dashboard
     asks the reader to take every claim on faith. */
  shots: [
    {
      src: "painel",
      w: 1400,
      h: 826,
      cap: {
        pt: "Um painel depois de rodar: doze indicadores contra a janela anterior, o aviso de que a margem da loja própria vem zerada nesta base, e o gráfico trocando de métrica e de granularidade.",
        en: "A panel after it runs: twelve indicators against the previous window, the warning that one store's margin arrives at zero for this database, and the chart switching metric and granularity.",
      },
    },
    {
      src: "portais",
      w: 1400,
      h: 831,
      cap: {
        pt: "A entrada: cada operação atrás da parede, com o estado da conexão à vista.",
        en: "The way in: each operation behind the wall, its connection state in the open.",
      },
    },
    {
      src: "base",
      w: 1400,
      h: 729,
      cap: {
        pt: "Dentro de uma base: painéis para ler na tela, e extrações que devolvem o mesmo SQL em CSV.",
        en: "Inside one database: panels to read on screen, and extractions returning the same SQL as CSV.",
      },
    },
  ],
  secProblem: { pt: "O problema", en: "The problem" },
  secDecisions: { pt: "Decisões", en: "Decisions" },
  secStack: { pt: "Stack", en: "Stack" },
  secNext: { pt: "O que eu faria diferente", en: "What I would do differently" },
  rowProblem: { pt: "Restrição", en: "Constraint" },
  rowChoice: { pt: "Escolha", en: "Choice" },
  rowCost: { pt: "Custo", en: "Cost" },
  problem: [
    {
      pt: "Números operacionais chegavam a quem decide por caminhos diferentes: uma planilha aqui, um print de dashboard ali, um relatório que alguém montou à mão na semana passada. Quando dois desses discordavam, e discordavam, ninguém sabia qual estava certo, porque não havia uma fonte que se pudesse reexecutar.",
      en: "Operational numbers reached decision-makers by different routes: a spreadsheet here, a screenshot of a dashboard there, a report someone assembled by hand last week. When two of them disagreed, and they did, nobody knew which was right, because there was no source anyone could re-run.",
    },
    {
      pt: "A vertical de apostas piora isso: número errado é dinheiro, não erro de arredondamento. O portal existe para que a resposta seja sempre a mesma query rodando sobre a mesma base, e para que qualquer pessoa consiga reproduzi-la.",
      en: "The betting vertical makes that worse: a wrong number is money, not a rounding error. The portal exists so the answer is always the same query running against the same database, and so anyone can reproduce it.",
    },
  ],
  decisions: [
    {
      n: "01",
      title: {
        pt: "Traduzir no nível da query, não só na interface",
        en: "Translate at query level, not just in the interface",
      },
      problem: {
        pt: "Três idiomas. Traduzir só os rótulos da UI deixaria os dados em português dentro de um relatório em inglês: nome de produto, status de aposta, categoria.",
        en: "Three languages. Translating only the UI labels would leave the data in Portuguese inside an English report: product name, bet status, category.",
      },
      choice: {
        pt: "A camada de idioma desce até a query: o catálogo devolve o rótulo já na língua pedida, então o relatório sai inteiro coerente.",
        en: "The language layer reaches down into the query: the catalogue returns the label already in the language asked for, so the whole report comes out coherent.",
      },
      cost: {
        pt: "Cada query nova precisa das três variantes de rótulo. É trabalho a mais na escrita e disciplina no catálogo. É o tipo de dívida que aparece na décima query, não na primeira.",
        en: "Every new query needs all three label variants. That is more work to write and more discipline to keep in the catalogue. It is the kind of debt that shows up at the tenth query, not the first.",
      },
    },
    {
      n: "02",
      title: {
        pt: "Fila de jobs com polling e cancelamento",
        en: "A job queue with polling and cancellation",
      },
      problem: {
        pt: "Uma consulta sobre 1,04M linhas não responde dentro de um request HTTP. Sem fila, o navegador espera e estoura; com fila mas sem cancelamento, quem clicou errado ocupa o worker até o fim.",
        en: "A query over 1.04M rows does not answer inside an HTTP request. With no queue the browser waits and times out; with a queue but no cancellation, whoever clicked the wrong thing holds the worker to the end.",
      },
      choice: {
        pt: "Job assíncrono, polling de status pelo front, e cancelamento de verdade: o job morre e o worker é liberado.",
        en: "An async job, status polling from the front end, and real cancellation: the job dies and the worker is freed.",
      },
      cost: {
        pt: "Mais partes móveis que um endpoint síncrono: estado do job, timeout, e o caso de o cliente desistir sem avisar.",
        en: "More moving parts than a synchronous endpoint: job state, timeouts, and the case where the client gives up without saying so.",
      },
    },
    {
      n: "03",
      title: {
        pt: "Um só código para as duas verticais",
        en: "One codebase for both verticals",
      },
      problem: {
        pt: "Apostas e e-commerce têm métricas diferentes, já que GGR e turnover não existem no segundo. O caminho fácil é dois portais.",
        en: "Betting and e-commerce have different metrics, since GGR and turnover do not exist in the second. The easy path is two portals.",
      },
      choice: {
        pt: "Um código, com o catálogo de queries parametrizado por vertical. Correção de bug vale para as duas.",
        en: "One codebase, with the query catalogue parameterised by vertical. A bug fix counts for both.",
      },
      cost: {
        pt: "O catálogo carrega condicionais por vertical. Compensa em duas; numa terceira bem diferente eu revisaria a decisão.",
        en: "The catalogue carries per-vertical conditionals. It pays off at two; at a third one very different from these I would revisit the decision.",
      },
    },
    {
      n: "04",
      title: {
        pt: "Docker Compose e nginx, não uma plataforma gerenciada",
        en: "Docker Compose and nginx, not a managed platform",
      },
      problem: {
        pt: "Precisava rodar em qualquer máquina, inclusive na minha, sem custo fixo.",
        en: "It had to run on any machine, mine included, with no fixed cost.",
      },
      choice: {
        pt: "Compose para subir tudo junto, nginx na frente do FastAPI.",
        en: "Compose to bring everything up together, nginx in front of FastAPI.",
      },
      cost: {
        pt: "Nada de escala automática nem deploy sem downtime. Para o volume atual não faz diferença; num tráfego maior faria.",
        en: "No autoscaling and no zero-downtime deploys. At the current volume it makes no difference; at heavier traffic it would.",
      },
    },
  ],
  /* product names, so they read the same in both languages */
  stack: ["Python · FastAPI", "PostgreSQL · SQL Server", "Chart.js", "Docker Compose · nginx"],
  next: [
    {
      pt: "Testes no catálogo de queries. Hoje uma query errada só aparece quando alguém lê um número estranho, que é a pior forma de descobrir.",
      en: "Tests on the query catalogue. Today a wrong query only surfaces when someone reads an odd number, which is the worst way to find out.",
    },
    {
      pt: "Cache dos resultados por parâmetro. Muita consulta é repetida com os mesmos filtros e paga o custo inteiro de novo.",
      en: "Caching results by parameter. Many queries are repeated with the same filters and pay the full cost again.",
    },
    {
      pt: "Orquestração por Airflow em vez da fila caseira. Certificado, ainda não em produção pelas minhas mãos, então ficou como próximo passo honesto, não como stack de vitrine.",
      en: "Airflow orchestration instead of the home-made queue. Certified, not yet in production under my hands, so it stays an honest next step rather than a shop-window stack.",
    },
  ],
};

/* ── 03 career ──────────────────────────────────────────────────────── */
export const TIMELINE: Array<{ when: Bi; role: Bi; where: string; note: Bi }> = [
  {
    when: { pt: "2025.05 → atual", en: "2025.05 → present" },
    role: { pt: "Engenheiro e analista de dados júnior", en: "Junior data engineer & analyst" },
    where: "BSA Tech · Recife/PE",
    /* The acronyms that prove something stay and the ones that only filled space
       go: joins, subconsultas and CTEs are table stakes for anyone writing SQL,
       while GGR, turnover and retention say which industry and which numbers.
       Each line now says what the technique buys instead of only naming it. */
    note: {
      pt: "SQL avançado em PostgreSQL e SQL Server para apurar GGR, turnover e retenção, que são os números pelos quais a operação decide. Modelo tabelas, chaves e relacionamentos para que a integridade seja garantida pelo banco e não por combinação entre pessoas. Coleta em tempo real pela Microsoft Graph API. Uso modelos de linguagem para escrever query e revisar código mais rápido, e confiro o resultado contra o banco antes de confiar nele. Plantão quando uma rotina morre às 2h.",
      en: "Advanced SQL on PostgreSQL and SQL Server to compute GGR, turnover and retention, the numbers the operation decides on. I model tables, keys and relationships so integrity is enforced by the database rather than agreed between people. Real-time collection through the Microsoft Graph API. I use language models to write queries and review code faster, and I check the result against the database before trusting it. On call when a routine dies at 2am.",
    },
  },
  {
    when: { pt: "2024.08 → 2025.05", en: "2024.08 → 2025.05" },
    /* The person, not the contract, so it reads level with the row above it and
       matches the English, which already named the person. */
    role: { pt: "Estagiário em análise de dados", en: "Data analysis intern" },
    where: "BSA Tech · Recife/PE",
    note: {
      pt: "Levei dados de bancos relacionais e planilhas externas para as bases internas. Primeiro ETL de verdade em Python: limpeza, tratamento e normalização. SQL para os relatórios recorrentes, e o hábito de conferir a chave primária antes de confiar numa contagem.",
      en: "Brought data out of relational databases and external spreadsheets into the internal databases. First real ETL in Python: cleaning, transformation and normalisation. SQL for the recurring reports, and the habit of checking the primary key before trusting a count.",
    },
  },
  {
    when: { pt: "2026.12 · previsto", en: "2026.12 · forecast" },
    /* Labelled, because this field holds a job title in the two rows above and a
       course name here, and the three sit in one list looking alike. */
    role: {
      pt: "Formação · Análise e Desenvolvimento de Sistemas",
      en: "Degree · Systems Analysis & Development",
    },
    where: "UNIBRA · Centro Universitário Brasileiro",
    note: {
      pt: "Em andamento, com conclusão prevista para dez/2026, em paralelo com trabalho em produção em tempo integral. 12 certificações Alura concluídas no caminho.",
      en: "In progress, due December 2026, alongside full-time production work. 12 Alura certifications finished along the way.",
    },
  },
];

/* ── 04 skills ──────────────────────────────────────────────────────── */
export type Skill = {
  name: Bi;
  tag: Bi;
  st: "prod" | "cert";
  cad: Bi;
  note: Bi;
};

export const SKILLS_LEDE: Bi = {
  pt: "Sem notas que eu mesmo me dou. Cada linha diz onde a competência roda e com que frequência, e certificado não é o mesmo que em produção. A última linha diz isso em voz alta.",
  en: "No self-assigned scores. Each row says where the skill runs and how often, and certified is not the same as in production. The last row says so out loud.",
};

export const SKILLS: Skill[] = [
  {
    name: { pt: "SQL", en: "SQL" },
    tag: { pt: "postgresql · sql server", en: "postgresql · sql server" },
    st: "prod",
    cad: { pt: "em produção · diário", en: "in production · daily" },
    note: {
      pt: "SQL avançado: joins, subconsultas, CTEs, DDL, chaves e relacionamentos. O catálogo de <em>292 queries</em> do BlackWall mora aqui.",
      en: "Advanced SQL: joins, subqueries, CTEs, DDL, keys and relationships. The BlackWall catalogue of <em>292 queries</em> lives here.",
    },
  },
  {
    name: { pt: "Python", en: "Python" },
    tag: { pt: "pandas · numpy · fastapi", en: "pandas · numpy · fastapi" },
    st: "prod",
    cad: { pt: "em produção · diário", en: "in production · daily" },
    note: {
      pt: "Pandas, NumPy, Matplotlib, Jupyter. Pipelines orientados a objetos, e o <em>backend FastAPI do BlackWall</em>.",
      en: "Pandas, NumPy, Matplotlib, Jupyter. Object-oriented pipelines, and the <em>BlackWall FastAPI backend</em>.",
    },
  },
  {
    name: { pt: "Automação", en: "Automation" },
    tag: { pt: "graph api · telegram · bots", en: "graph api · telegram · bots" },
    st: "prod",
    cad: { pt: "em produção · com plantão", en: "in production · on call" },
    note: {
      pt: "Três bots Telegram em produção e integração Graph API. A rotina que eles substituíram levava <em>1–2 dias; hoje leva 5–10 minutos</em>.",
      en: "Three Telegram bots in production and Graph API integration. The routine they replaced took <em>1–2 days; it now takes 5–10 minutes</em>.",
    },
  },
  {
    name: { pt: "BI", en: "BI" },
    tag: { pt: "power bi · betmetrica · matplotlib", en: "power bi · betmetrica · matplotlib" },
    st: "prod",
    cad: { pt: "em produção · semanal", en: "in production · weekly" },
    note: {
      pt: "Power BI, BetMetrica e Matplotlib. E conferir um número em <em>quatro fontes</em> antes de ele chegar numa tela.",
      en: "Power BI, BetMetrica and Matplotlib. And cross-checking one number across <em>four sources</em> before it reaches a screen.",
    },
  },
  {
    name: { pt: "Infra", en: "Infra" },
    tag: { pt: "docker · nginx · linux · git", en: "docker · nginx · linux · git" },
    st: "prod",
    cad: { pt: "em produção · diário", en: "in production · daily" },
    note: {
      pt: "Docker Compose e nginx servindo o BlackWall, Linux (Ubuntu/WSL) como ambiente de trabalho, Git para versionamento.",
      en: "Docker Compose and nginx serving BlackWall, Linux (Ubuntu/WSL) as the working environment, Git for versioning.",
    },
  },
  {
    name: { pt: "Airflow · MongoDB · PHP", en: "Airflow · MongoDB · PHP" },
    tag: { pt: "12 certificações Alura", en: "12 Alura certifications" },
    st: "cert",
    cad: { pt: "certificado · fora de produção", en: "certified · not in production" },
    note: {
      pt: "Estudados e certificados, <em>ainda não rodando em produção</em> pelas minhas mãos. Fica numa linha própria porque a diferença importa.",
      en: "Studied and certified, <em>not yet running in production</em> under my hands. It gets its own row because the difference matters.",
    },
  },
];

/* ── 05 stack ───────────────────────────────────────────────────────
   Grouped by how much each tool is actually used, which is the one question this
   section can answer that Pericia cannot. Categories are gone as labels but kept
   as ordering inside each block, so databases still land beside databases without
   a second taxonomy competing for the reader.

   The tiers agree with Pericia: Airflow, MongoDB and PHP are certified-only in
   both places, so the two sections corroborate rather than contradict. */
export type Tier = "core" | "reg" | "seen";

export const STACK_LEDE: Bi = {
  pt: "Agrupado por quanto eu encosto em cada coisa, não por categoria. É a única pergunta que esta seção responde e Competências não.",
  en: "Grouped by how much I actually touch each thing, not by category. It is the one question this section answers and Skills does not.",
};

export const STACK: Array<{ id: Tier; label: Bi; note: Bi; items: string[] }> = [
  {
    id: "core",
    label: { pt: "núcleo", en: "core" },
    note: { pt: "todo dia, em produção", en: "every day, in production" },
    items: [
      "SQL / T-SQL", "Python 3.11",
      "PostgreSQL", "SQL Server 2022",
      "Pandas",
      "Linux / WSL", "Git", "VS Code",
    ],
  },
  {
    id: "reg",
    label: { pt: "recorrente", en: "recurring" },
    note: { pt: "com frequência, em produção", en: "regularly, in production" },
    items: [
      "MySQL",
      "NumPy", "Matplotlib", "FastAPI",
      "Graph API", "Telegram API", "Requests",
      "Power BI", "BetMetrica", "Chart.js", "Excel",
      "Docker Compose", "nginx",
      "Jira", "Jupyter",
    ],
  },
  {
    id: "seen",
    label: { pt: "certificado", en: "certified" },
    note: {
      pt: "estudado e certificado, ainda não em produção",
      en: "studied and certified, not yet in production",
    },
    items: ["Apache Airflow", "MongoDB", "PHP"],
  },
];

/* ── 06 certificates ────────────────────────────────────────────────
   slug is the join key with public/certificados/<lang>/<slug>.pdf. Both
   language folders hold all twelve, so a card always opens in the language
   the visitor is reading. */
export type Shard = { slug: string; title: Bi; sub: Bi };

export const SHARDS: Shard[] = [
  { slug: "airflow-pipeline", 
    title: { pt: "Apache Airflow", en: "Apache Airflow" },
    sub: { pt: "orquestrando seu primeiro pipeline", en: "orchestrating your first pipeline" } },
  { slug: "pipeline-oo", 
    title: { pt: "Pipeline de dados + OO", en: "Data pipeline + OOP" },
    sub: { pt: "python, orientação a objetos", en: "python, object orientation" } },
  { slug: "pipeline-mongo-mysql", 
    title: { pt: "Pipeline: MongoDB + MySQL", en: "Pipeline: MongoDB + MySQL" },
    sub: { pt: "integração python", en: "python integration" } },
  { slug: "sqlserver-advanced", 
    title: { pt: "SQL Server 2022", en: "SQL Server 2022" },
    sub: { pt: "consultas avançadas", en: "advanced queries" } },
  { slug: "sqlserver-intro", 
    title: { pt: "SQL Server 2022", en: "SQL Server 2022" },
    sub: { pt: "conhecendo SQL", en: "getting to know SQL" } },
  { slug: "modelagem-relacional", 
    title: { pt: "Modelagem relacional", en: "Relational modelling" },
    sub: { pt: "entendendo SQL", en: "understanding SQL" } },
  { slug: "mongodb", 
    title: { pt: "MongoDB", en: "MongoDB" },
    sub: { pt: "um banco NoSQL", en: "a NoSQL database" } },
  { slug: "python-requests", 
    title: { pt: "Python e APIs", en: "Python and APIs" },
    sub: { pt: "a biblioteca requests", en: "the requests library" } },
  { slug: "python-dados-2", 
    title: { pt: "Python para Dados", en: "Python for Data" },
    sub: { pt: "funções, estruturas, exceções", en: "functions, structures, exceptions" } },
  { slug: "python-dados-1", 
    title: { pt: "Python para Dados", en: "Python for Data" },
    sub: { pt: "primeiros passos", en: "getting started" } },
  { slug: "php-app", 
    title: { pt: "PHP", en: "PHP" },
    sub: { pt: "criando sua aplicação", en: "creating your application" } },
  { slug: "php-organizado", 
    title: { pt: "PHP", en: "PHP" },
    sub: { pt: "organize seu código", en: "organised code" } },
];


export const SHARD_NOTE: Bi = {
  pt: "Alura · abre o PDF na língua que você está lendo",
  en: "Alura · opens the PDF in the language you are reading",
};

/* ── 07 contact ─────────────────────────────────────────────────────
   The email is the primary action and everything else supports it, so it is not
   in the same list as the rest. */
export const CV: Record<Lang, string> = {
  pt: "/cv/curriculo-mauricio-raposo-pt.pdf",
  en: "/cv/resume-mauricio-raposo-en.pdf",
};

export const NET = {
  lede: {
    pt: "Disponível para oportunidades e conversas técnicas em engenharia e análise de dados. Respondo em até um dia útil.",
    en: "Available for opportunities and technical conversations in data engineering and analysis. I reply within one business day.",
  },
  mail: "raposo360@gmail.com",
  mailCta: { pt: "Enviar e-mail", en: "Send an email" },
  resume: { pt: "Currículo", en: "Résumé" },
  based: { pt: "Recife · PE · Brasil", en: "Recife · PE · Brazil" },
};

/* Secondary channels. The email is deliberately not here.

   The labels are written in their real casing even though .net__ch span
   uppercases them in CSS: the transform is presentation, and a screen reader
   reads the DOM, where "LinkedIn" and "GitHub" are the names of the products.
   The values are what actually changes on screen, since .net__ch b carries no
   transform, so the LinkedIn one reads as a name rather than a URL fragment. */
export type Channel = {
  label: Bi;
  value: string;
  href: string;
  ext?: boolean;
  /* drawn inline in components/Site.tsx: a mark is recognised before a word is
     read, and these two are the ones a recruiter looks for by shape */
  icon: "linkedin" | "github" | "phone";
};

export const CONTACT: Channel[] = [
  { icon: "linkedin", label: { pt: "LinkedIn", en: "LinkedIn" }, value: "Maurício Raposo", href: "https://www.linkedin.com/in/mauricio-raposo/", ext: true },
  { icon: "github", label: { pt: "GitHub", en: "GitHub" }, value: "@rapozinho", href: "https://github.com/rapozinho", ext: true },
  /* The country code was already in the href and missing from the text, so the
     number read as local while the link dialled international. */
  { icon: "phone", label: { pt: "Telefone", en: "Phone" }, value: "+55 (81) 99188-6180", href: "tel:+5581991886180" },
];

export const FOOT: Bi = {
  pt: "construído sobre o tema do blackwall-analytics",
  en: "built on the blackwall-analytics theme",
};

export const SEC_TITLES = {
  ident: IDENT.title,
  projetos: { pt: "Projetos", en: "Projects" },
  traj: { pt: "Trajetória", en: "Career" },
  competencias: { pt: "Competências", en: "Skills" },
  stack: { pt: "Stack", en: "Stack" },
  shards: { pt: "Certificados", en: "Certificates" },
  net: { pt: "Contato", en: "Contact" },
} as const;

