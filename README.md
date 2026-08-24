# Portfólio — Maurício Raposo

Engenheiro e analista de dados júnior. Next.js 15 (App Router), TypeScript,
WebGL escrito à mão.

A entrada é uma travessia da BlackWall: um voo automático por um túnel de dados,
depois a aproximação da parede controlada por scroll, e a travessia — onde a
figura do outro lado se resolve exatamente no retângulo em que a foto será
desenhada. Tema herdado do próprio
[blackwall-analytics](https://github.com/rapozinho/blackwall-analytics): mesma
regra de cor (vermelho = ICE, âmbar = ação do usuário, ciano = dado íntegro).

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 4 rotas, todas estáticas
npm run typecheck
```

## Estrutura

| Caminho | O que é |
|---|---|
| `app/page.tsx` | Ato I (entrada) + Ato II (conteúdo) |
| `app/blackwall/` | Case study do BlackWall Analytics |
| `app/opengraph-image.tsx` | Card social gerado no build, para não desalinhar da copy |
| `lib/content.ts` | **Todo o texto do site, PT e EN.** Cada string é um par |
| `lib/shader.ts` | Fragment shader GLSL ES 1.0, escrito à mão |
| `lib/engine.ts` | Raymarch, voo de entrada, aproximação por scroll |
| `lib/wall2d.ts` | Parede de bandas atrás do conteúdo do Ato II |
| `prototipo/` | Protótipo original + o renderizador CPU que o calibrou |

### Duas coisas que não são acidente

**O motor é imperativo.** `lib/engine.ts` escreve uniforms a 60fps. Passar isso
por estado React re-renderizaria a árvore sessenta vezes por segundo para mudar
um transform. React é dono da marcação; o motor escreve nos nós que anima.

**O CSS não é Tailwind.** As ~470 linhas em `app/globals.css` foram afinadas
contra vídeo de referência, medindo. Tailwind está instalado para trabalho novo e
importado **sem preflight** — o preflight zera `border-width` e reatribui a
`font-family` do body, ambos definidos de propósito.

## Alterar o shader

Um erro de compilação GLSL renderiza tela preta, sem outro sintoma. O validador
estático existe por isso:

```bash
cd prototipo
python check_shader.py     # chaves, parênteses, uniforms, locais redeclarados
python render.py v1        # espelho do shader em numpy: PNGs em frames/
```

O renderizador CPU existe porque o GLSL roda no navegador, onde não há como
inspecionar o resultado durante o desenvolvimento. Calibrar ali e portar as
constantes de volta foi o que corrigiu o que a olho nu passava: aliasing dos
fios, ondas que escureciam em vez de acender, densidade que só funcionava a uma
distância.

## Deploy

Vercel, plano Hobby. `SITE` em `app/layout.tsx` resolve de
`VERCEL_PROJECT_PRODUCTION_URL` no build — defina `NEXT_PUBLIC_SITE_URL` só
quando houver domínio próprio.
