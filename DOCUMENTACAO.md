# SHAKA — Documentação do Código (versão React)

Este documento explica a arquitetura do projeto, o papel de cada arquivo e
como as peças se conectam. A ideia é que você consiga estudar isso antes de
apresentar o trabalho e responder qualquer pergunta sobre "por que esse
arquivo existe" ou "o que esse trecho faz".

---

## 1. Visão geral da arquitetura

O projeto original (HTML + CSS + JS puro) tinha tudo misturado: um
`script.js` de ~700 linhas com variáveis globais, funções que buscavam dados
e funções que escreviam direto no HTML (`document.getElementById(...).innerHTML = ...`).

Na versão React, cada responsabilidade foi separada em uma pasta:

```
src/
  lib/          → lógica pura (cálculos, chamadas HTTP) — não sabe que existe uma tela
  hooks/        → estado + efeitos colaterais reutilizáveis (auth, toast)
  components/   → cada pedaço visual da interface, um arquivo por componente
  App.jsx       → junta tudo, é o "maestro" da aplicação
  main.jsx      → ponto de entrada, injeta o App.jsx na página HTML
  index.css     → todo o visual (idêntico ao shaka.css original)
```

**Regra geral que guiou a migração:** toda variável global do `script.js`
virou `useState` em algum componente. Toda função que alterava o DOM
diretamente virou uma condição dentro do JSX (`{condição && <div>...</div>}`).

---

## 2. `src/lib/` — lógica pura, sem tela

Esses arquivos não importam React e não sabem que existe uma interface. Só
recebem dados, processam e devolvem um resultado. Isso facilita testar e
reaproveitar.

### `lib/supabase.js`
Uma única função, `fazerRequisicaoSupabase(tabela, filtros, metodo, corpo)`,
que monta a URL da REST API do Supabase e faz o `fetch`. É a mesma função do
`script.js` original, só que exportada como módulo em vez de ficar solta no
escopo global. Todo componente que precisa ler ou gravar no banco importa
essa função.

### `lib/weather.js`
Toda a lógica de clima/vento/ondas que estava espalhada no `script.js`:
- `WMO_CODES`: tabela que traduz o código numérico de clima da Open-Meteo
  (ex: `0`, `61`, `95`) para emoji + descrição em português.
- `grausParaDirecao()`: converte graus (0–360°) em ponto cardinal com seta
  (ex: `↑ N`).
- `estimarOndas()`: quando a API de mar não cobre a região, estima altura e
  período de onda a partir da velocidade do vento (fórmula de Sverdrup-Munk
  simplificada).
- `calcularScoreSurf()`: dá uma nota de 0 a 10 pras condições de surf,
  cruzando altura de onda, período, vento e clima.
- `carregarClima(lat, lon)`: função principal — busca a API atmosférica e a
  de ondas, junta tudo e **retorna um objeto pronto** com todos os valores já
  calculados. Diferença importante em relação ao original: antes essa função
  escrevia direto em elementos do DOM (`document.getElementById('climaTemp').textContent = ...`);
  agora ela só devolve os dados, e quem decide o que fazer com eles é o
  componente `BeachDetailsPanel` (guarda num `useState` e passa pro
  `WeatherWidget` exibir).

### `lib/resumoIA.js`
A "IA" do projeto não é um modelo de linguagem — é uma análise local por
palavras-chave nos comentários da praia:
- `analisarComentariosLocal(comentarios, praia)`: conta ocorrências de
  palavras positivas/negativas/relacionadas a surf/estrutura nos comentários,
  e monta um resumo com pontos positivos, negativos, dicas e um "sentimento
  geral". Mesma lógica exata do `script.js` original.
- `resumoSemComentarios()`: resposta padrão quando a praia ainda não tem
  comentários suficientes.
- `SENTIMENTO_CORES`: mapa de cor por sentimento, usado no componente pra
  colorir o texto ("positivo" = verde, "negativo" = vermelho, etc.).

---

## 3. `src/hooks/` — estado reutilizável

Um *hook* em React é uma função que empacota estado + efeitos colaterais
para ser reaproveitada em qualquer componente. Aqui usamos dois:

### `hooks/useToast.js`
Substitui a função `mostrarToast()` do original, que criava um `<div>` no
DOM na marra. Aqui, `mostrarToast(mensagem, tipo)` só atualiza um `useState`
(`toast`), e o componente `Toast.jsx` decide como desenhar isso na tela. Um
`setTimeout` some com o toast depois de 3.2s, igual ao original.

### `hooks/useAuth.js`
Substitui `verificarUsuarioLogado()`, `autenticar()` e `logout()` do
original:
- Ao montar a aplicação, verifica se existe um usuário salvo no
  `localStorage` (`shakaUsuario`). Se não existir, gera um `usuarioId`
  anônimo com `crypto.randomUUID()` — isso é usado pra permitir comentar sem
  estar logado.
- `autenticar({ modo, nome, email, senha })`: faz login ou cadastro (a
  diferença é o parâmetro `modo`), tenta a tabela `usuario` e, se falhar,
  tenta `Usuario` (mantive esse fallback porque o código original também
  tinha, provavelmente por inconsistência no nome da tabela no Supabase).
- `logout()`: limpa o usuário, gera um novo id anônimo e limpa o
  `localStorage`.

Esse hook é chamado uma vez, no `App.jsx`, e o resultado (`usuario`,
`usuarioId`, `autenticar`, `logout`) é passado como *props* para quem
precisar.

---

## 4. `src/components/` — a interface, peça por peça

Cada componente é uma função que retorna JSX (HTML "aumentado" com lógica
JS). Ordem sugerida de leitura, da tela para os detalhes:

### `App.jsx` — o maestro
É o componente raiz. Junta os dois hooks, carrega as praias e os serviços do
Supabase assim que a página abre (`useEffect` com array vazio `[]`, que
equivale ao antigo `window.addEventListener('DOMContentLoaded', iniciarApp)`),
guarda quais modais estão abertos, e renderiza todos os outros componentes
passando os dados e funções que cada um precisa via *props*.

### `Navbar.jsx`
Barra fixa no topo. Escuta o evento de scroll da página (`useEffect` com
`window.addEventListener('scroll', ...)`) pra saber quando aplicar o fundo
mais escuro (`scrolled`). Mostra o botão "Login" ou o avatar do usuário,
dependendo se `usuario` (vindo do `useAuth`) existe ou não.

### `Hero.jsx`
Seção de abertura, estática. A única lógica é gerar as 28 partículas
animadas de fundo — no original isso era um `<script>` solto no HTML que
criava `<div>`s na marra; aqui virou uma função `gerarParticulas()` chamada
uma única vez com `useMemo` (pra não regenerar as posições aleatórias toda
vez que o componente atualiza).

### `SpotsSection.jsx`
Junta busca + mapa + lista + painel de detalhes. Guarda dois estados: o
texto da busca (`busca`) e a praia clicada (`praiaSelecionada`). A lista
filtrada (`praiasFiltradas`) é recalculada automaticamente com `useMemo`
sempre que `busca` ou `praias` mudam — equivale à função `filtrarPraias()`
do original.

### `Map.jsx`
A parte mais delicada da migração. Leaflet (a biblioteca do mapa) manipula o
DOM diretamente por fora do React, então ele não pode virar JSX puro. A
solução: um `<div>` controlado por `useRef`, e toda a configuração do
Leaflet roda dentro de `useEffect`s:
- Um `useEffect` com `[]` cria o mapa **uma única vez**.
- Um `useEffect` que depende de `praias` recria os marcadores sempre que a
  lista muda (busca, filtro).
- Um `useEffect` que depende de `praiaFoco` dá o `flyTo()` (zoom animado) na
  praia selecionada.

### `BeachCard.jsx`
Card individual da lista lateral. Componente pequeno, só recebe a praia e
uma função de clique via props.

### `BeachDetailsPanel.jsx`
O painel que abre ao clicar numa praia. É o componente com mais estado do
projeto: clima, análise, eventos, comentários, resumo de IA e os formulários
inline de evento e comentário. Um `useEffect` que depende de `praia?.id`
dispara a busca de todos esses dados assim que uma praia diferente é
selecionada — equivale à função `selecionarPraia()` do original, mas em vez
de um monte de `.innerHTML`, cada pedaço de dado vira um `useState` que o
JSX usa pra desenhar a seção correspondente.

### `WeatherWidget.jsx`
Só recebe os dados de clima já calculados (via props) e desenha. Não faz
nenhuma chamada de rede — isso é responsabilidade do `BeachDetailsPanel`,
que chama `carregarClima()` e passa o resultado pra baixo. Essa separação
(quem busca dado vs. quem exibe) é um padrão comum em React.

### `ServicosSection.jsx` / `ServicoCard.jsx`
Grid de serviços com filtro por categoria e busca por texto. Igual ao
`SpotsSection`, usa `useMemo` para recalcular a lista filtrada
automaticamente (substitui `filtrarServicos()` do original). `SERVICO_META`
é o mapa de ícone/rótulo por tipo de serviço (aluguel, aula, reparo etc.).

### `AuthModal.jsx`
Modal de login/cadastro. Alterna entre os dois modos com um `useState`
(`modo`), mostra o campo de email só quando `modo === 'cadastro'`, e chama a
função `autenticar` (vinda do `useAuth` via props) ao submeter o formulário.

### `ServicoModal.jsx`
Modal de cadastro de serviço. Bem direto: guarda os campos do formulário em
`useState`s, valida nome + tipo, envia pro Supabase e chama
`onServicoCriado()` pra recarregar a lista no `App.jsx`.

### `Toast.jsx`
Componente pequeno e "burro": só recebe o objeto `toast` (mensagem + tipo)
vindo do `useToast` e desenha a notificação. Toda a lógica de quando mostrar
e esconder mora no hook, não aqui.

---

## 5. Fluxo de dados — "quem manda o quê pra quem"

React segue um fluxo de dados **de cima pra baixo**: o `App.jsx` é dono dos
dados principais (praias, serviços, usuário) e passa pedaços deles pros
componentes filhos via *props*. Quando um filho precisa avisar o pai de algo
(ex: "usuário logou", "praia foi selecionada"), ele recebe uma **função**
via props e a chama — nunca edita o estado do pai diretamente.

Exemplo prático, do clique num card de praia até o mapa reagir:

1. Usuário clica num `BeachCard` → chama `onClick(praia)`.
2. Essa função é, na real, o `setPraiaSelecionada` do `SpotsSection.jsx`
   (foi passada como prop `onClick={setPraiaSelecionada}`).
3. `praiaSelecionada` muda → o React re-renderiza o `SpotsSection`.
4. O `Map.jsx` recebe a nova `praiaSelecionada` como prop `praiaFoco` → o
   `useEffect` que depende dela dispara o `flyTo()`.
5. O `BeachDetailsPanel` recebe a mesma praia como prop → o `useEffect`
   que depende de `praia?.id` dispara as buscas de clima/eventos/comentários.

Ninguém "manda o mapa se mover" diretamente — todo mundo reage à mudança do
mesmo dado central (`praiaSelecionada`).

---

## 6. Supabase — como os dados chegam

O projeto usa o Supabase como *backend as a service*: não existe um servidor
próprio, o React conversa direto com a API REST do Supabase via `fetch()`
(a função `fazerRequisicaoSupabase`). Tabelas usadas:

| Tabela          | Para quê                                    |
|------------------|----------------------------------------------|
| `praia`          | lista de praias exibidas no mapa/sidebar      |
| `analisePraia`   | dados extras (pedras, corrente forte, ondas fortes) |
| `evento`         | eventos cadastrados por praia                 |
| `comentario`      | comentários/dicas dos usuários por praia      |
| `servico`         | serviços cadastrados (independente de praia)  |
| `usuario`         | cadastro/login (com fallback pra `Usuario`)   |

---

## 7. Perguntas que podem cair na apresentação

**"Por que o mapa não é um componente 100% React?"**
Porque o Leaflet é uma biblioteca que precisa de um elemento real do DOM pra
desenhar tiles, marcadores etc. — ele não fala a "língua" do JSX. A solução
padrão em qualquer integração de libs assim (mapas, gráficos, editores de
texto) é isolar a lib inteira dentro de `useEffect` + `useRef`.

**"Onde fica o backend?"**
Não existe um backend próprio — o Supabase cumpre esse papel (banco +
API REST + autenticação, se você decidir usar a autenticação nativa dele no
futuro em vez da tabela `usuario` manual).

**"O que é `useState`? E `useEffect`?"**
`useState` guarda um valor que, quando muda, faz a tela redesenhar
automaticamente. `useEffect` roda um código em resposta a algo mudar — busca
de dados, integração com bibliotecas externas, listeners de evento.

**"Por que separar em tantos arquivos pequenos?"**
Facilita achar bug, testar isoladamente e reaproveitar. `WeatherWidget`, por
exemplo, não sabe nada sobre Supabase ou sobre qual praia está selecionada —
só sabe desenhar os números que recebe. Isso é chamado de "componente
burro/apresentacional" vs. "componente inteligente/container"
(`BeachDetailsPanel`, nesse caso).
