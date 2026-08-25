# Protótipo — Travessia da BlackWall

Protótipo da tela de entrada do portfólio: um voo automático por um túnel de dados
ciano, seguido da aproximação da BlackWall controlada por scroll, e a travessia.

Tema herdado do próprio [blackwall-analytics](https://github.com/rapozinho/blackwall-analytics):
mesma regra de cor (vermelho = parede/ICE, âmbar = ação do usuário, ciano = dado
íntegro), mesmo chanfro assimétrico, mesmas fontes (Chakra Petch + Share Tech Mono).

## Arquivos

| Arquivo | O que é |
|---|---|
| `bw.tpl.html` | **Fonte.** A foto é o placeholder `__PHOTO__`. Editar aqui. |
| `bw.html` | Build publicável, com a foto embutida como data URI. Gerado, não editar. |
| `photo.b64` | `eu.jpg` redimensionada para 460×628 e convertida em data URI. |
| `render.py` | Espelho do shader da parede em numpy. Renderiza PNGs para conferência. |
| `oldnet.py` | Espelho do túnel de blocos da entrada. |
| `check_shader.py` | Validação estática do GLSL (chaves, parênteses, uniforms, armadilhas do GLSL ES 1.0). |

### Gerar o build a partir da fonte

```bash
python -c "
import io
t = io.open('bw.tpl.html', encoding='utf-8').read()
p = io.open('photo.b64', encoding='utf-8').read().strip()
io.open('bw.html','w',encoding='utf-8').write(t.replace('__PHOTO__', p))
"
```

### Conferir antes de publicar

```bash
python check_shader.py     # erro de shader = tela preta, sem outro sintoma
python render.py v1        # PNGs em frames/ nos 4 estágios da aproximação
python oldnet.py           # PNGs do túnel de entrada
```

O renderizador CPU existe porque o GLSL roda no navegador, onde não há como
inspecionar o resultado durante o desenvolvimento. Calibrar ali e portar as
constantes de volta foi o que permitiu corrigir os erros que a olho nu passavam:
aliasing dos fios, ondas que escureciam em vez de acender, densidade que só
funcionava a uma distância.

## Estrutura da cena

```
z -500 .......... -140 .......... -30 .......... -3.2 ....... +19
   túnel de blocos    escuridão      aproximação      travessia
   (voo automático, 5,2s)            (scroll, ~1900px)
```

- **Túnel:** retículo denso com corredor central esculpido (`d = max(d, 5.6 - rad)`),
  placas horizontais empilhadas, arestas acesas em ciano.
- **Parede:** cinco cortinas de fios em profundidades diferentes, todos vermelhos.
  O azul são ondas viajando (`max()` de duas senoides), que **acendem** o fio que
  cruzam. LOD contínuo mantém o passo projetado em ~7px a qualquer distância.
- **Chão:** pontos quadrados na mesma grade em X dos fios — é esse alinhamento que
  faz as fileiras saírem de baixo de cada fio. Limitados à região da parede.
- **Travessia:** a foto converge para o retângulo exato onde o Ato II a desenha
  (medido em tempo de execução), fechando num match cut.

## Pendente

- PDFs reais: 12 certificados (`Certificados/`) e 2 currículos (`Currículos/`) apontam para `#0`
- Rota `/blackwall` com o case study
- Porte para Next.js + Tailwind
- Densidade do túnel e cor ainda em ajuste contra o vídeo de referência
