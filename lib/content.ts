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
  { id: "pericia", label: { pt: "perícia", en: "skills" } },
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
    ["> ", 'aproxime-se para identificar <span class="a">— role</span>'],
  ],
  en: [
    ["> ", "probing blackwall perimeter"],
    ["> ", 'ICE <span class="w">active</span> · layer 3'],
    ["> ", '<span class="w">[!]</span> presence detected on the far side'],
    ["> ", '<span class="k">humanoid</span> shape · weak signal'],
    ["> ", 'close in to identify <span class="a">— scroll</span>'],
  ],
};

/* ── 01 identity ────────────────────────────────────────────────────── */
export const IDENT = {
  title: { pt: "Identificação", en: "Identity" },
  badge: { pt: "id confirmado", en: "id confirmed" },
  name: "Maurício Raposo",
  role: {
    pt: "engenheiro e analista de dados · bsa tech",
    en: "data engineer & analyst · bsa tech",
  },
  bio: {
    pt: "Escrevo o SQL e construo as rotinas Python que mantêm os números operacionais honestos — na vertical de apostas, onde número errado é dinheiro, não erro de arredondamento. Uma rotina manual que automatizei saiu de <mark>1–2 dias para 5–10 minutos</mark> e roda em produção até hoje.",
    en: "I write the SQL and build the Python routines that keep operational numbers honest — in the betting vertical, where a wrong number is money, not a rounding error. One manual routine I automated went from <mark>1–2 days to 5–10 minutes</mark> and still runs in production.",
  },
  figs: [
    { dt: { pt: "em dados desde", en: "in data since" }, dd: "2024", em: ".08" },
    { dt: { pt: "tempo de ciclo", en: "cycle time cut" }, dd: "~99", em: "%" },
    { dt: { pt: "bots em produção", en: "bots in production" }, dd: "2", em: "" },
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
      pt: "Portal de BI que atende duas verticais — apostas e e-commerce — a partir de um só código. Fila de jobs com polling e cancelamento, e tradução no <b>nível da query</b>, não só na UI.",
      en: "A BI portal serving two verticals — betting and e-commerce — from one codebase. Job queue with polling and cancellation, and translation at <b>query level</b>, not just the UI.",
    },
    kv: [
      { pt: "queries <b>292</b>", en: "queries <b>292</b>" },
      { pt: "linhas <b>1.04M</b>", en: "rows <b>1.04M</b>" },
      { pt: "bases <b>8</b>", en: "databases <b>8</b>" },
      { pt: "idiomas <b>3</b>", en: "languages <b>3</b>" },
    ],
    status: { kind: "ok", label: { pt: "online · público", en: "online · public" } },
    links: [
      { href: "/blackwall", label: { pt: "case study →", en: "case study →" }, internal: true },
      { href: "https://rapozinho.github.io/blackwall-analytics/", label: { pt: "abrir demo →", en: "open demo →" } },
      { href: "https://github.com/rapozinho/blackwall-analytics", label: { pt: "repo →", en: "repo →" } },
    ],
  },
  {
    label: { pt: "Automação de rotina", en: "Routine automation" },
    note: {
      pt: "Um processo que comia <b>um a dois dias</b> de trabalho manual: reconstruído em Python com extração SQL e coleta via Microsoft Graph API. Agora 5 a 10 minutos.",
      en: "A process that ate <b>one to two days</b> of manual work: rebuilt in Python with SQL extraction and Microsoft Graph API collection. Now 5 to 10 minutes.",
    },
    kv: [
      { pt: "antes <b>1–2 d</b>", en: "before <b>1–2 d</b>" },
      { pt: "depois <b>5–10 min</b>", en: "after <b>5–10 min</b>" },
    ],
    status: { kind: "warn", label: { pt: "interno · nda", en: "internal · nda" } },
  },
  {
    label: { pt: "Bots de relatório", en: "Telegram report bots" },
    note: {
      pt: "Dois bots mantidos vivos para os times de KPI e Produto. Relatórios sob demanda no chat, conferidos entre banco, Excel, Power BI e BetMetrica antes de qualquer envio.",
      en: "Two bots kept alive for the KPI and Product teams. Reports on demand in chat, cross-checked against the database, Excel, Power BI and BetMetrica before anything is sent.",
    },
    kv: [
      { pt: "bots <b>2</b>", en: "bots <b>2</b>" },
      { pt: "times <b>2</b>", en: "teams <b>2</b>" },
      { pt: "KPIs <b>GGR +2</b>", en: "KPIs <b>GGR +2</b>" },
    ],
    status: { kind: "warn", label: { pt: "interno · nda", en: "internal · nda" } },
  },
  {
    label: { pt: "Atrás do ICE", en: "Behind the ICE" },
    note: {
      pt: "Trabalho de produção da BSA Tech que não posso publicar: o banco, o catálogo de queries de KPI, o código dos bots. Explico a arquitetura numa entrevista.",
      en: "BSA Tech production work I cannot publish: the database, the KPI query catalogue, the bot source. I will walk through the architecture in an interview.",
    },
    status: { kind: "off", label: { pt: "acesso negado", en: "access denied" } },
  },
];

/* ── 03 career ──────────────────────────────────────────────────────── */
export const TIMELINE: Array<{ when: Bi; role: Bi; where: string; note: Bi }> = [
  {
    when: { pt: "2025.05 → atual", en: "2025.05 → present" },
    role: { pt: "Engenheiro e analista de dados júnior", en: "Junior data engineer & analyst" },
    where: "BSA Tech · Recife/PE",
    note: {
      pt: "SQL avançado em PostgreSQL e SQL Server — joins, subconsultas, CTEs — calculando GGR, turnover e retenção. DDL de tabelas, chaves e relacionamentos para que integridade seja estrutural. Microsoft Graph API para coleta em tempo real. Plantão quando uma rotina morre às 2h.",
      en: "Advanced SQL on PostgreSQL and SQL Server — joins, subqueries, CTEs — computing GGR, turnover and retention. DDL for tables, keys and relationships so integrity is structural. Microsoft Graph API for real-time collection. On call when a routine dies at 2am.",
    },
  },
  {
    when: { pt: "2024.08 → 2025.05", en: "2024.08 → 2025.05" },
    role: { pt: "Estágio em análise de dados", en: "Data analysis intern" },
    where: "BSA Tech · Recife/PE",
    note: {
      pt: "Tirei dados de bancos relacionais e planilhas externas para as bases internas. Primeiro ETL de verdade em Python — limpeza, tratamento, normalização. SQL para relatórios recorrentes, e o hábito de checar a chave primária antes de confiar numa contagem.",
      en: "Pulled data out of relational databases and external spreadsheets into the internal bases. First real ETL in Python — cleaning, treatment, normalisation. SQL for recurring reports, and the habit of checking the primary key before trusting a count.",
    },
  },
  {
    when: { pt: "2026.12 · previsto", en: "2026.12 · forecast" },
    role: { pt: "Análise e Desenvolvimento de Sistemas", en: "Systems Analysis & Development" },
    where: "UNIBRA · Centro Universitário Brasileiro",
    note: {
      pt: "Em andamento, conclusão prevista dez/2026 — cursado em paralelo com trabalho em produção full-time. 12 certificações Alura concluídas no caminho.",
      en: "In progress, graduating Dec/2026 — taken in parallel with full-time production work. 12 Alura certifications finished along the way.",
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
  pt: "Sem notas que eu mesmo me dou. Cada linha diz onde a competência roda e com que frequência, e certificado não é o mesmo que em produção — a última linha diz isso em voz alta.",
  en: "No self-assigned scores. Each row says where the skill runs and how often, and certified is not the same as in production — the last row says so out loud.",
};

export const SKILLS: Skill[] = [
  {
    name: { pt: "SQL", en: "SQL" },
    tag: { pt: "postgresql · sql server", en: "postgresql · sql server" },
    st: "prod",
    cad: { pt: "em produção · diário", en: "in production · daily" },
    note: {
      pt: "T-SQL avançado: joins, subconsultas, CTEs, DDL, chaves e relacionamentos. O catálogo de <em>292 queries</em> do BlackWall mora aqui.",
      en: "Advanced T-SQL: joins, subqueries, CTEs, DDL, keys and relationships. The BlackWall catalogue of <em>292 queries</em> lives here.",
    },
  },
  {
    name: { pt: "Python", en: "Python" },
    tag: { pt: "pandas · numpy · fastapi", en: "pandas · numpy · fastapi" },
    st: "prod",
    cad: { pt: "em produção · diário", en: "in production · daily" },
    note: {
      pt: "Pandas, NumPy, Matplotlib, Jupyter. Pipelines orientados a objeto, e o <em>backend FastAPI do BlackWall</em>.",
      en: "Pandas, NumPy, Matplotlib, Jupyter. Object-oriented pipelines, and the <em>BlackWall FastAPI backend</em>.",
    },
  },
  {
    name: { pt: "Automação", en: "Automation" },
    tag: { pt: "graph api · telegram · bots", en: "graph api · telegram · bots" },
    st: "prod",
    cad: { pt: "em produção · com plantão", en: "in production · on call" },
    note: {
      pt: "Dois bots Telegram em produção e integração Graph API. A rotina que eles substituíram levava <em>1–2 dias; hoje leva 5–10 minutos</em>.",
      en: "Two Telegram bots in production and Graph API integration. The routine they replaced took <em>1–2 days; it now takes 5–10 minutes</em>.",
    },
  },
  {
    name: { pt: "BI", en: "BI" },
    tag: { pt: "power bi · betmetrica · matplotlib", en: "power bi · betmetrica · matplotlib" },
    st: "prod",
    cad: { pt: "em produção · semanal", en: "in production · weekly" },
    note: {
      pt: "Power BI, BetMetrica, Matplotlib — e conferir um número em <em>quatro fontes</em> antes de ele chegar numa tela.",
      en: "Power BI, BetMetrica, Matplotlib — and cross-checking one number across <em>four sources</em> before it reaches a screen.",
    },
  },
  {
    name: { pt: "Infra", en: "Infra" },
    tag: { pt: "docker · nginx · linux · git", en: "docker · nginx · linux · git" },
    st: "prod",
    cad: { pt: "em produção · diário", en: "in production · daily" },
    note: {
      pt: "Docker Compose e nginx servindo o BlackWall, Linux (Ubuntu/WSL) como ambiente de trabalho, Git no versionamento.",
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
  pt: "Agrupado por quanto eu encosto em cada coisa, não por categoria. É a única pergunta que esta seção responde e a Perícia não.",
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
    sub: { pt: "python, orientação a objeto", en: "python, object orientation" } },
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
  pt: "alura · abre o PDF na língua que você está lendo",
  en: "alura · opens the PDF in the language you are reading",
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
    pt: "Aberto a conversas sobre engenharia e análise de dados. Respondo em até um dia útil.",
    en: "Open to conversations about data engineering and analysis. I reply within one business day.",
  },
  mail: "raposo360@gmail.com",
  mailCta: { pt: "escrever", en: "write to me" },
  resume: { pt: "currículo", en: "résumé" },
  based: { pt: "Recife · PE · Brasil", en: "Recife · PE · Brazil" },
};

/* Secondary channels. The email is deliberately not here. */
export const CONTACT: Array<{ label: Bi; value: string; href: string; ext?: boolean }> = [
  { label: { pt: "linkedin", en: "linkedin" }, value: "/in/mauricio-raposo", href: "https://www.linkedin.com/in/mauricio-raposo/", ext: true },
  { label: { pt: "github", en: "github" }, value: "@rapozinho", href: "https://github.com/rapozinho", ext: true },
  { label: { pt: "telefone", en: "phone" }, value: "(81) 9.9188-6180", href: "tel:+5581991886180" },
];

export const FOOT: Bi = {
  pt: "construído sobre o tema do blackwall-analytics",
  en: "built on the blackwall-analytics theme",
};

export const SEC_TITLES = {
  ident: IDENT.title,
  projetos: { pt: "Projetos", en: "Projects" },
  traj: { pt: "Trajetória", en: "Career" },
  pericia: { pt: "Perícia", en: "Skills" },
  stack: { pt: "Stack", en: "Stack" },
  shards: { pt: "Certificados", en: "Certificates" },
  net: { pt: "Contato", en: "Contact" },
} as const;

