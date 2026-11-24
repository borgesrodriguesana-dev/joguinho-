// Lista das 8 rodadas com dificuldade crescente
// Cada rodada tem a palavra em português e 3 cápsulas espalhadas no labirinto
const rodadas = [
  {
    portugues: "MAÇÃ",
    opcoes: [
      { texto: "APPLE", certa: true, explicacao: "Isso! 'Apple' significa maçã." },
      { texto: "BANANA", certa: false, explicacao: "'Banana' significa banana, não maçã." },
      { texto: "GRAPE", certa: false, explicacao: "'Grape' significa uva." }
    ]
  },
  {
    portugues: "CACHORRO",
    opcoes: [
      { texto: "CAT", certa: false, explicacao: "'Cat' significa gato." },
      { texto: "DOG", certa: true, explicacao: "Muito bem! 'Dog' significa cachorro." },
      { texto: "BIRD", certa: false, explicacao: "'Bird' significa pássaro." }
    ]
  },
  {
    portugues: "LIVRO",
    opcoes: [
      { texto: "PEN", certa: false, explicacao: "'Pen' significa caneta." },
      { texto: "DESK", certa: false, explicacao: "'Desk' significa carteira ou mesa." },
      { texto: "BOOK", certa: true, explicacao: "Acertou! 'Book' significa livro." }
    ]
  },
  {
    portugues: "ÁGUA",
    opcoes: [
      { texto: "WATER", certa: true, explicacao: "Perfeito! 'Water' significa água." },
      { texto: "MILK", certa: false, explicacao: "'Milk' significa leite." },
      { texto: "JUICE", certa: false, explicacao: "'Juice' significa suco." }
    ]
  },
  {
    portugues: "VERMELHO",
    opcoes: [
      { texto: "BLUE", certa: false, explicacao: "'Blue' significa azul." },
      { texto: "RED", certa: true, explicacao: "Exato! 'Red' significa vermelho." },
      { texto: "GREEN", certa: false, explicacao: "'Green' significa verde." }
    ]
  },
  {
    portugues: "JANELA",
    opcoes: [
      { texto: "DOOR", certa: false, explicacao: "'Door' significa porta." },
      { texto: "WALL", certa: false, explicacao: "'Wall' significa parede." },
      { texto: "WINDOW", certa: true, explicacao: "Isso mesmo! 'Window' significa janela." }
    ]
  },
  {
    portugues: "RELÓGIO",
    opcoes: [
      { texto: "CLOCK", certa: true, explicacao: "Mandou bem! 'Clock' significa relógio." },
      { texto: "SHOE", certa: false, explicacao: "'Shoe' significa sapato." },
      { texto: "CHAIR", certa: false, explicacao: "'Chair' significa cadeira." }
    ]
  },
  {
    portugues: "COZINHA",
    opcoes: [
      { texto: "BEDROOM", certa: false, explicacao: "'Bedroom' significa quarto." },
      { texto: "KITCHEN", certa: true, explicacao: "Excelente! 'Kitchen' significa cozinha." },
      { texto: "GARDEN", certa: false, explicacao: "'Garden' significa jardim." }
    ]
  }
];

// Mapas de labirinto 7x7 (0 = corredor, 1 = parede)
// Alternam entre as rodadas para deixar a exploração mais divertida
const mapasLabirinto = [
  [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ],
  [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ]
];

// Posições fixas onde as 3 cápsulas aparecem (longe do início do jogador em [1, 1])
const posicoesCapsulas = [
  { linha: 1, coluna: 5 },
  { linha: 5, coluna: 1 },
  { linha: 5, coluna: 5 }
];

// Variáveis de estado da partida
let rodadaAtual = 0;
let pontos = 0;
const pontosPorAcerto = 100;
const penalidadeErro = 25;
const pontuacaoMaxima = rodadas.length * pontosPorAcerto;
const pontuacaoMinimaVitoria = pontuacaoMaxima / 2;

let mapaAtual = [];
let posicaoJogador = { linha: 1, coluna: 1 };
let capsulasAtivas = [];
let tempoInicio = 0;
let bloqueadoParaTransicao = false;

// Elementos da tela
const telaInicio = document.getElementById("tela-inicio");
const telaJogo = document.getElementById("tela-jogo");
const telaFim = document.getElementById("tela-fim");

const textoRodada = document.getElementById("texto-rodada");
const textoPontos = document.getElementById("texto-pontos");
const palavraAlvo = document.getElementById("palavra-alvo");
const gradeLabirinto = document.getElementById("grade-labirinto");
const caixaFeedback = document.getElementById("caixa-feedback");
const textoFeedback = document.getElementById("texto-feedback");

const botaoIniciar = document.getElementById("botao-iniciar");
const botaoReiniciar = document.getElementById("botao-reiniciar");
const botaoTema = document.getElementById("botao-tema");
const botoesSeta = document.querySelectorAll(".botao-seta");

// Alterna entre as telas (início, jogo, fim)
function mostrarTela(telaEscolhida) {
  telaInicio.classList.remove("ativa");
  telaJogo.classList.remove("ativa");
  telaFim.classList.remove("ativa");
  telaEscolhida.classList.add("ativa");
  avisarAlturaPortal();
}

// Inicia uma nova partida do zero
function iniciarJogo() {
  rodadaAtual = 0;
  pontos = 0;
  tempoInicio = Date.now();
  bloqueadoParaTransicao = false;
  caixaFeedback.classList.add("oculto");
  atualizarPlacar();
  mostrarTela(telaJogo);
  carregarRodada();
}

// Prepara o labirinto e as cápsulas da rodada atual
function carregarRodada() {
  bloqueadoParaTransicao = false;
  const dadosRodada = rodadas[rodadaAtual];
  palavraAlvo.textContent = dadosRodada.portugues;
  atualizarPlacar();

  // Escolhe o mapa da rodada
  mapaAtual = mapasLabirinto[rodadaAtual % mapasLabirinto.length];

  // Coloca o astronauta no canto superior esquerdo
  posicaoJogador = { linha: 1, coluna: 1 };

  // Embaralha as posições das 3 opções de palavras no labirinto
  const posicoesEmbaralhadas = [...posicoesCapsulas].sort(() => Math.random() - 0.5);
  capsulasAtivas = dadosRodada.opcoes.map((opcao, indice) => ({
    linha: posicoesEmbaralhadas[indice].linha,
    coluna: posicoesEmbaralhadas[indice].coluna,
    texto: opcao.texto,
    certa: opcao.certa,
    explicacao: opcao.explicacao,
    coletada: false
  }));

  desenharLabirinto();
  avisarAlturaPortal();
}

// Desenha toda a grade 7x7 na tela
function desenharLabirinto() {
  gradeLabirinto.innerHTML = "";

  for (let l = 0; l < 7; l++) {
    for (let c = 0; c < 7; c++) {
      const celula = document.createElement("div");
      celula.classList.add("celula");

      if (mapaAtual[l][c] === 1) {
        celula.classList.add("parede");
      } else {
        celula.classList.add("corredor");
      }

      // Verifica se há uma cápsula não coletada nesta célula
      const capsulaAqui = capsulasAtivas.find(
        (cap) => !cap.coletada && cap.linha === l && cap.coluna === c
      );

      // Verifica se o astronauta está nesta célula
      if (posicaoJogador.linha === l && posicaoJogador.coluna === c) {
        celula.classList.add("jogador");
        celula.textContent = "🧑‍🚀";
        celula.setAttribute("aria-label", "Astronauta");
      } else if (capsulaAqui) {
        celula.classList.add("capsula");
        celula.textContent = capsulaAqui.texto;
      }

      gradeLabirinto.appendChild(celula);
    }
  }
}

// Move o astronauta se o caminho estiver livre
function moverJogador(direcao) {
  if (!telaJogo.classList.contains("ativa") || bloqueadoParaTransicao) {
    return;
  }

  let novaLinha = posicaoJogador.linha;
  let novaColuna = posicaoJogador.coluna;

  if (direcao === "cima") novaLinha--;
  if (direcao === "baixo") novaLinha++;
  if (direcao === "esquerda") novaColuna--;
  if (direcao === "direita") novaColuna++;

  // Só anda se não bater na parede
  if (mapaAtual[novaLinha] && mapaAtual[novaLinha][novaColuna] === 0) {
    posicaoJogador.linha = novaLinha;
    posicaoJogador.coluna = novaColuna;
    verificarColisaoCapsula();
    desenharLabirinto();
  }
}

// Verifica se o astronauta encostou em alguma cápsula de palavra
function verificarColisaoCapsula() {
  const capsulaTocada = capsulasAtivas.find(
    (cap) => !cap.coletada && cap.linha === posicaoJogador.linha && cap.coluna === posicaoJogador.coluna
  );

  if (!capsulaTocada) return;

  capsulaTocada.coletada = true;

  if (capsulaTocada.certa) {
    pontos += pontosPorAcerto;
    exibirFeedback(capsulaTocada.explicacao, true);
    atualizarPlacar();
    bloqueadoParaTransicao = true;

    // Avança para a próxima rodada após um pequeno intervalo para leitura
    setTimeout(() => {
      rodadaAtual++;
      if (rodadaAtual < rodadas.length) {
        carregarRodada();
      } else {
        finalizarJogo();
      }
    }, 1200);
  } else {
    // Penalidade por pegar palavra errada, sem deixar pontos negativos
    pontos = Math.max(0, pontos - penalidadeErro);
    exibirFeedback("Ops! " + capsulaTocada.explicacao, false);
    atualizarPlacar();
  }
}

// Mostra a explicação curta de acerto ou erro
function exibirFeedback(mensagem, acertou) {
  textoFeedback.textContent = mensagem;
  caixaFeedback.classList.remove("oculto", "acerto", "erro");
  caixaFeedback.classList.add(acertou ? "acerto" : "erro");
  avisarAlturaPortal();
}

// Atualiza os textos de rodada e pontuação no topo
function atualizarPlacar() {
  const numeroExibido = Math.min(rodadaAtual + 1, rodadas.length);
  textoRodada.textContent = `${numeroExibido}/${rodadas.length}`;
  textoPontos.textContent = pontos;
}

// Encerra o jogo, mostra o resultado e envia os dados para o portal
function finalizarJogo() {
  const tempoTotalMs = Date.now() - tempoInicio;
  const tempoSegundos = Math.round(tempoTotalMs / 1000);

  const tituloResultado = document.getElementById("titulo-resultado");
  const mensagemResultado = document.getElementById("mensagem-resultado");
  const pontosFinais = document.getElementById("pontos-finais");
  const pontosMaximos = document.getElementById("pontos-maximos");
  const tempoFinal = document.getElementById("tempo-final");

  pontosFinais.textContent = pontos;
  pontosMaximos.textContent = pontuacaoMaxima;
  tempoFinal.textContent = `${tempoSegundos}s`;

  if (pontos >= pontuacaoMinimaVitoria) {
    tituloResultado.textContent = "🎉 Missão Cumprida!";
    mensagemResultado.textContent = "Parabéns! Você atingiu a pontuação necessária e dominou o vocabulário espacial.";
  } else {
    tituloResultado.textContent = "🛸 Quase lá!";
    mensagemResultado.textContent = `Você precisava de pelo menos ${pontuacaoMinimaVitoria} pontos para vencer. Tente novamente!`;
  }

  mostrarTela(telaFim);

  // Contrato com o portal: avisa que o jogo terminou
  window.parent.postMessage(
    {
      type: "vrgame:finish",
      score: pontos,
      maxScore: pontuacaoMaxima,
      timeMs: tempoTotalMs,
      detail: { jogo: "astrowords" }
    },
    "*"
  );
}

// Aplica tema claro ou escuro
function aplicarTema(tema) {
  if (tema === "light" || tema === "claro") {
    document.body.classList.add("tema-claro");
  } else {
    document.body.classList.remove("tema-claro");
  }
  avisarAlturaPortal();
}

// Envia a altura atual do documento para o portal ajustar o quadro
function avisarAlturaPortal() {
  const altura = document.documentElement.scrollHeight;
  window.parent.postMessage({ type: "vrgame:resize", height: altura }, "*");
}

// Eventos de teclado (Setas e WASD)
window.addEventListener("keydown", (evento) => {
  const mapaTeclas = {
    ArrowUp: "cima",
    w: "cima",
    W: "cima",
    ArrowDown: "baixo",
    s: "baixo",
    S: "baixo",
    ArrowLeft: "esquerda",
    a: "esquerda",
    A: "esquerda",
    ArrowRight: "direita",
    d: "direita",
    D: "direita"
  };

  if (mapaTeclas[evento.key]) {
    evento.preventDefault();
    moverJogador(mapaTeclas[evento.key]);
  }
});

// Eventos dos botões na tela
botoesSeta.forEach((botao) => {
  botao.addEventListener("click", () => {
    moverJogador(botao.dataset.direcao);
  });
});

botaoIniciar.addEventListener("click", iniciarJogo);
botaoReiniciar.addEventListener("click", iniciarJogo);

botaoTema.addEventListener("click", () => {
  document.body.classList.toggle("tema-claro");
  avisarAlturaPortal();
});

// Escuta mensagens enviadas pelo portal (tema e tela cheia)
window.addEventListener("message", (evento) => {
  const dados = evento.data;
  if (!dados || typeof dados !== "object") return;

  if (dados.type === "vrgame:theme" && dados.theme) {
    aplicarTema(dados.theme);
  }

  if (dados.type === "vrgame:fullscreen") {
    avisarAlturaPortal();
  }
});

// Atualiza a altura quando a janela mudar de tamanho
window.addEventListener("resize", avisarAlturaPortal);

// Avisa o portal assim que o jogo terminar de carregar
window.addEventListener("load", () => {
  window.parent.postMessage({ type: "vrgame:ready" }, "*");
  avisarAlturaPortal();
});