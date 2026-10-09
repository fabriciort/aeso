// O contrato entre o CONTEÚDO da Formação em Matemática (escrito em
// content/matematica/) e a EXPERIÊNCIA (o player de aulas, em components/).
//
// Quem escreve o conteúdo decide o que ensinar e em que ordem, as palavras,
// os exemplos, as perguntas, os erros comuns e os exercícios. Também descreve,
// em esboço, como imagina cada visual e cada animação. Quem constrói a
// experiência transforma esses esboços em desenho, movimento e interação.
//
// Diretrizes completas: docs/CONTEUDO.md. Plano da formação: docs/MATEMATICA.md.

// ---------------------------------------------------------------- texto

/**
 * Texto que aparece na tela. Uma frase curta, em português do Brasil, para
 * um adulto. Use **negrito** (markdown) para a palavra que importa e
 * $...$ para matemática em TeX (ex.: "$305 = 300 + 5$").
 * Limite: 140 caracteres. Se precisar de mais, use mais cartões.
 */
export type Texto = string

/**
 * Como a voz da Vega lê o cartão, quando o texto tem matemática ou símbolos
 * que soam mal em voz alta ("trezentos e cinco é trezentos mais cinco").
 * Opcional: sem ela, a voz lê o texto.
 */
export type Fala = string

/** Uma linha de matemática em TeX, com a forma falada. */
export interface Linha {
  tex: string
  fala: string
}

// ---------------------------------------------------------------- visual

/**
 * Os modelos-âncora da formação (docs/MATEMATICA.md, seção 4.1). Use sempre
 * um deles quando servir; "livre" só quando nenhum serve, e explique no
 * esboço o que você imagina.
 */
export type Modelo = 'blocos' | 'reta' | 'barra' | 'retangulo' | 'grade' | 'balanca' | 'quadro-posicional' | 'livre'

export interface Visual {
  modelo: Modelo
  /**
   * O estado do modelo neste cartão, em dados (números, não descrição).
   * Ex.: { numero: 305, casas: ['C', 'D', 'U'] } para quadro-posicional;
   * { de: 0, ate: 20, marcas: [7, 12] } para reta.
   * O palco anima sozinho de um estado para o próximo.
   */
  estado: Record<string, unknown>
  /** O que se move e como, entre o cartão anterior e este (ex.: "as 3 placas encolhem e viram 3 barras"). */
  movimento?: string
  /** Seu esboço livre de como apresentaria este visual. Pode ter um desenho em ASCII. */
  esboco?: string
}

// ---------------------------------------------------------------- interação

export interface Acao {
  tipo: 'arrastar' | 'tocar' | 'deslizar' | 'digitar' | 'desenhar' | 'escolher'
  /** O que o aluno faz, em uma frase (vai para a tela). */
  instrucao: Texto
  /** Quando a tarefa está feita, em dados (ex.: { numero: 350 }). */
  sucesso: Record<string, unknown>
  /** O que o palco faz se o aluno pedir "Me mostre". */
  mostre: string
}

export interface Opcao {
  texto: Texto
  fala?: Fala
  certa?: boolean
  /** Se a opção é um erro comum, o id dele em content/matematica/erros.ts. */
  erro?: string
  /** O que aparece depois da escolha. Explica a certa e desmonta a errada. */
  explica: Texto
  /** O que o palco mostra depois desta escolha (o porquê, em imagem). */
  mostra?: Visual
}

// ---------------------------------------------------------------- cartões

interface Base {
  /** Esboço livre do cartão inteiro: o que o aluno vê, faz e sente. */
  esboco?: string
}

/** Uma situação real e uma pergunta que o aluno ainda não sabe responder. */
export interface Gancho extends Base {
  tipo: 'gancho'
  texto: Texto
  fala?: Fala
  visual: Visual
}

/** O aluno manipula o modelo e descobre o padrão. */
export interface Mexa extends Base {
  tipo: 'mexa'
  texto: Texto
  fala?: Fala
  visual: Visual
  acao: Acao
  /** O que o aluno deve descobrir mexendo (para nós e para a Vega; não vai para a tela). */
  descoberta: string
}

/** Prever antes de ver. */
export interface Aposta extends Base {
  tipo: 'aposta'
  pergunta: Texto
  fala?: Fala
  visual: Visual
  opcoes: Opcao[]
}

/** Dar nome e notação ao que o aluno já viu. */
export interface Ideia extends Base {
  tipo: 'ideia'
  texto: Texto
  fala?: Fala
  visual: Visual
}

/** O que copiar no caderno. Formato fixo. */
export interface Anote extends Base {
  tipo: 'anote'
  /** Nome do conceito. */
  titulo: string
  /** A definição canônica (a mesma frase sempre que o conceito voltar). */
  definicao: Texto
  exemplo: Linha
  /** O erro comum a evitar. */
  alerta: Texto
}

/** Exemplo guiado: o aluno escolhe o próximo passo e o caderno da tela se escreve. */
export interface PassoAPasso extends Base {
  tipo: 'passo'
  problema: Texto
  fala?: Fala
  visual: Visual
  passos: {
    pergunta: Texto
    fala?: Fala
    opcoes: Opcao[]
    /** A linha que entra no caderno da tela quando o passo é acertado. */
    linha: Linha
  }[]
}

/** Pausa para resolver no papel; depois o aluno confere. */
export interface Caderno extends Base {
  tipo: 'caderno'
  instrucao: Texto
  fala?: Fala
  /** A resposta final que o aluno digita. */
  resposta: string | number
  /** A resolução, linha a linha, para o aluno comparar com o que fez. */
  resolucao: Linha[]
}

/** Exercícios até o aluno mostrar que sabe. */
export interface SuaVez extends Base {
  tipo: 'sua-vez'
  /** Ids de geradores (content/matematica/geradores), do mais fácil ao mais difícil. */
  geradores: string[]
}

/** A pergunta do gancho respondida; o que vem depois. */
export interface Fecho extends Base {
  tipo: 'fecho'
  texto: Texto
  fala?: Fala
  visual?: Visual
}

export type Cartao = Gancho | Mexa | Aposta | Ideia | Anote | PassoAPasso | Caderno | SuaVez | Fecho

// ---------------------------------------------------------------- aula

export interface Aula {
  /** Igual ao id da aula em lib/math/curriculum.ts (ex.: "B.U1.A2"). */
  id: string
  titulo: string
  /** O que o aluno consegue fazer ao final (para nós e para a Vega). */
  objetivo: string
  /** O modelo-âncora principal da aula. */
  modelo: Modelo
  cartoes: Cartao[]
  /** Contexto escondido para a Vega: a ideia central, os erros esperados, como guiar sem entregar. */
  vega: string
  /** Esboço geral: como você apresentaria a aula inteira, em poucas linhas. */
  esboco?: string
  /** Revisão: quem revisou o conteúdo e quando (preenchido na revisão). */
  revisao?: { por: string; em: string; notas?: string }
}

// ---------------------------------------------------------------- erros comuns

export interface ErroComum {
  /** ex.: "concatena-casas" */
  id: string
  /** Nome curto para nós ("escreve as casas coladas"). */
  nome: string
  /** O que o aluno faz e por quê (a concepção por trás). */
  causa: string
  /** Exemplo concreto do erro. */
  exemplo: string
  /** Como a formação desmonta o erro (a imagem ou o contraexemplo que convence). */
  desmonte: string
}

// ---------------------------------------------------------------- exercícios

/** Gerador de números aleatórios com semente (mesma semente, mesmos exercícios). */
export interface Rng {
  /** Inteiro em [min, max]. */
  int(min: number, max: number): number
  /** Um item da lista. */
  pick<T>(items: readonly T[]): T
  /** Número em [0, 1). */
  next(): number
}

export type Resposta = number | string

export interface Item {
  /** O enunciado na tela (curto). */
  enunciado: Texto
  fala?: Fala
  /** Como o aluno responde. */
  formato: 'numero' | 'fracao' | 'escolha' | 'reta' | 'expressao'
  /** Para "escolha": as opções na ordem em que aparecem. */
  opcoes?: string[]
  /** A resposta certa (para "escolha", o índice). */
  resposta: Resposta
  /**
   * Respostas erradas previsíveis e o erro comum que cada uma revela.
   * Chave: a resposta errada (como o aluno digitaria); valor: id do erro.
   */
  erros: Record<string, string>
  /** 3 dicas: (1) lembra a ideia; (2) dá o primeiro passo; (3) mostra a resolução. */
  dicas: [Texto, Texto, Texto]
  /** O visual do exercício, se houver. */
  visual?: Visual
}

export interface Gerador {
  /** ex.: "valor-do-algarismo" */
  id: string
  /** Habilidade da formação que este gerador treina (ex.: "B.U1.A2"). */
  aula: string
  /** 1 (primeiro contato) a 3 (sozinho, sem apoio). */
  nivel: 1 | 2 | 3
  gerar(rng: Rng): Item
}
