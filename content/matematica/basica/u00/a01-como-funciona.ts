import type { Aula, Visual } from '@/lib/formation/schema'

// A primeira aula da formação. Ela não ensina hábitos de estudo em abstrato:
// mostra a jornada inteira, dá ao aluno uma primeira vitória com as mãos
// (juntar 10 peças numa barra) e, de passagem, apresenta cada ferramenta da
// aula (mexer, apostar, errar, anotar, praticar, pedir dica).

const PARADAS = ['Contar', 'Somar e subtrair', 'Multiplicar e dividir', 'Frações', 'Porcentagem', 'Equações', 'Funções', 'Cálculo']

const jornada = (esboco: string, extra: Record<string, unknown> = {}): Visual => ({
  modelo: 'livre',
  estado: { jornada: PARADAS, aqui: 0, ...extra },
  esboco,
})
const mesa = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado, esboco })
const percurso = (etapa: string, esboco: string): Visual => ({
  modelo: 'livre',
  estado: { etapas: ['tentar', 'conferir', 'tentar de novo'], etapa },
  esboco,
})

export const aula: Aula = {
  id: 'B.U0.A1',
  titulo: 'Boas-vindas à formação',
  objetivo: 'Ver o caminho do zero ao Cálculo, fazer a primeira manipulação, entender que errar faz parte e saber como estudar: tentar, conferir, tentar de novo.',
  modelo: 'livre',
  esboco: 'A primeira impressão da formação. O aluno vê a jornada inteira (oito paradas, de Contar a Cálculo) com a luz na primeira. Em um minuto ele já mexe: junta 10 peças numa barra, a primeira vitória, que a unidade 1 vai explicar. Depois, cada cartão apresenta uma ferramenta da aula sem manual: a aposta (que mostra que errar é pista), o caderno, o "Já sei isso" e a Vega. O fecho volta à jornada: a próxima parada é descobrir por onde começar. Momento-chave: o toque nas 10 peças que viram uma barra, "eu consigo".',
  vega: 'Esta é a primeira aula. O aluno pode ter medo de matemática e lembranças ruins da escola. Acolha, sem infantilizar e sem dizer "é fácil". A ideia central: a formação começa do zero (contar), cada aula usa só o que já foi visto, errar mostra o que falta aprender, e estudar de verdade é tentar sozinho, conferir e tentar de novo sem olhar. Caderno quadriculado, lápis e borracha ajudam; sem caderno, qualquer folha ou as notas do celular servem. A voz é opcional. "Já sei isso" leva direto aos exercícios da aula. As dicas vêm uma de cada vez: a ideia, o primeiro passo, a resolução. Se o aluno perguntar o que vem pela frente: contar e o sistema de numeração; somar e subtrair; multiplicar e dividir; frações; porcentagem; equações; funções; e, no fim, o Cálculo.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Boas-vindas! Aqui você vai do **zero ao Cálculo**, uma aula curta de cada vez.',
      fala: 'Boas-vindas! Aqui você vai do zero ao Cálculo, uma aula curta de cada vez.',
      visual: jornada('O caminho se desenha de cima para baixo: oito paradas ligadas por uma linha. A primeira, Contar, acende em âmbar com "você está aqui"; as outras esperam, apagadas. Nada de porcentagem de progresso: só o lugar no caminho.'),
      esboco: 'Abrir com o tamanho da jornada e, ao mesmo tempo, com o primeiro passo à mão. A pessoa sente que começou uma formação, não um app de exercícios.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto de matemática você precisa saber para começar?',
      visual: jornada('A jornada continua no palco. A escolha certa faz a primeira parada pulsar.'),
      opcoes: [
        {
          texto: 'Nada. A formação começa do começo', certa: true,
          explica: 'Isso. A primeira parada é contar. Cada aula só usa o que você já viu antes.',
          mostra: jornada('A primeira parada pulsa; uma linha curta liga Contar a Somar e subtrair, mostrando que uma aula prepara a outra.'),
        },
        {
          texto: 'Pelo menos a tabuada',
          explica: 'Não precisa. A tabuada vem mais adiante, e você vai entender de onde ela vem.',
          mostra: jornada('A parada Multiplicar e dividir acende de leve, mais abaixo no caminho: a tabuada tem o seu lugar, e ele não é o começo.'),
        },
        {
          texto: 'Ter ido bem na escola',
          explica: 'Não precisa. Muita gente aprende matemática de verdade já adulta. Aqui o ritmo é seu.',
          mostra: jornada('A jornada fica como está, com a luz na primeira parada: o ponto de partida é o mesmo para todo mundo.'),
        },
      ],
      esboco: 'Tirar o medo logo no começo. Nenhuma opção errada é humilhada: as duas desmontam uma crença com uma frase.',
    },
    {
      tipo: 'mexa',
      texto: 'Aqui você aprende **mexendo**. Junte 10 peças.',
      fala: 'Aqui você aprende mexendo. Junte dez peças.',
      visual: {
        modelo: 'blocos',
        estado: { centenas: 0, dezenas: 0, unidades: 14 },
        esboco: 'Catorze cubos soltos, com a borda tracejada que diz "toque aqui". No toque, dez cubos deslizam e se fundem numa barra; quatro ficam soltos. Primeira vitória da formação, em um gesto.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas peças.',
        sucesso: { dezenas: 1, unidades: 4 },
        mostre: 'Dez cubos se juntam numa barra; quatro continuam soltos.',
      },
      descoberta: 'O app responde ao toque e a matemática aparece nas mãos: 10 peças soltas viram uma barra, e nenhuma peça some.',
      esboco: 'É uma prévia da primeira aula da unidade 1, sem explicar ainda. A explicação vem lá; aqui vale a sensação de "eu fiz".',
    },
    {
      tipo: 'ideia',
      texto: 'Você juntou 10 peças numa barra, e nenhuma sumiu: ainda são **14**. Logo você vai ver por que isso muda tudo.',
      fala: 'Você juntou dez peças numa barra, e nenhuma sumiu: ainda são catorze. Logo você vai ver por que isso muda tudo.',
      visual: {
        modelo: 'blocos',
        estado: { centenas: 0, dezenas: 1, unidades: 4, total: 14 },
        esboco: 'A barra e os 4 cubos ficam no palco; o total 14 aparece embaixo, devagar.',
      },
      esboco: 'Fechar o gesto com o que ele mostrou, e deixar uma curiosidade para a unidade 1.',
    },
    {
      tipo: 'ideia',
      texto: 'Tenha do lado um **caderno quadriculado**, lápis e borracha. Sem caderno, qualquer folha ou as notas do celular servem.',
      visual: mesa({ materiais: ['caderno quadriculado', 'lápis', 'borracha'] }, 'Os três materiais aparecem um por um na mesa.'),
      esboco: 'Material simples, dito uma vez. Nenhuma exigência que impeça começar agora.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você errou uma pergunta aqui. O que isso quer dizer?',
      visual: mesa({ atalho: 'erro', destino: 'pista' }, 'Dois cartões: "erro" e "pista", ligados por uma seta. A seta acende quando o aluno escolhe.'),
      opcoes: [
        {
          texto: 'Que achei uma coisa que falta aprender', certa: true,
          explica: 'Isso. O erro é uma pista: ele mostra o que explicar. Toda resposta errada aqui ganha uma explicação.',
        },
        {
          texto: 'Que eu não levo jeito para matemática',
          explica: 'Não. Errar faz parte de aprender, para todo mundo. Cada erro abre uma explicação, não uma nota.',
        },
      ],
      esboco: 'A própria aposta é a ferramenta: o aluno vê como uma escolha é respondida, com o porquê. Se escolher a errada, vive o que a frase diz.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você leu uma resolução e entendeu tudo. Como saber se consegue resolver sozinho?',
      visual: percurso('conferir', 'Três etapas em coluna, com "conferir" aceso: a resolução está aberta.'),
      opcoes: [
        {
          texto: 'Tentar outra questão, sem olhar a resolução', certa: true,
          explica: 'Isso. Se você resolve sem olhar, você sabe. Achar a resposta conhecida não é saber.',
          mostra: percurso('tentar de novo', 'A luz desce para "tentar de novo": uma questão nova, com a resolução fechada.'),
        },
        {
          texto: 'Reler até a resposta parecer conhecida', erro: 'estudo-so-observar',
          explica: 'Reler deixa a resposta familiar, mas não testa nada. Feche a resolução e tente uma questão nova.',
          mostra: percurso('tentar de novo', 'A luz desce para "tentar de novo": é ali que a gente descobre o que sabe.'),
        },
        {
          texto: 'Copiar a resposta e contar como acerto', erro: 'estudo-dica-resposta',
          explica: 'Copiar mostra o que você viu, não o que você sabe fazer.',
          mostra: percurso('tentar', 'A luz volta para "tentar": sem tentativa própria, não há o que conferir.'),
        },
      ],
      esboco: 'O momento de estudo mais importante da formação: reconhecer uma resposta não é conseguir produzi-la.',
    },
    {
      tipo: 'anote',
      titulo: 'Estudo ativo',
      definicao: 'Estudo ativo é tentar sozinho, conferir e tentar de novo sem olhar a resolução.',
      exemplo: { tex: '\\text{Tentar, conferir, tentar de novo.}', fala: 'tentar, conferir, tentar de novo' },
      alerta: 'Entender a resolução lendo não quer dizer que você consegue resolver sozinho.',
      esboco: 'A primeira página do caderno. O título da página do player ("Copie no seu caderno") ensina o cartão: toda aula tem um.',
    },
    {
      tipo: 'ideia',
      texto: 'Travou? Toque na **Vega**, lá em cima, e peça uma dica. Já sabe o assunto? **Já sei isso** leva direto aos exercícios.',
      visual: mesa({ dicas: ['a ideia', 'o primeiro passo', 'a resolução'] }, 'As três dicas, numeradas, aparecem uma de cada vez: a ajuda vem aos poucos, nunca a resposta de cara.'),
      esboco: 'Apresentar as duas saídas para quem trava e para quem já sabe, logo antes dos exercícios.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['estudo-material-n1', 'estudo-apoio-n2', 'estudo-retomada-n3'],
      esboco: 'Três decisões de estudo, uma por nível. Servem para o aluno conhecer os exercícios (opções, dica, próximo sozinho), não para medir matemática.',
    },
    {
      tipo: 'fecho',
      texto: 'Pronto: você começou. Próxima parada: 5 perguntas rápidas para ver **por onde você começa**.',
      visual: jornada('A jornada volta, agora com a primeira parada marcada como começada. A luz fica em Contar.', { aqui: 0 }),
      esboco: 'Responder ao gancho com a jornada já começada e dar o próximo passo concreto: o diagnóstico.',
    },
  ],
}
