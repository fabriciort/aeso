import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

type Escala = 10 | 100 | 1000

const ALVOS: Record<Escala, string> = {
  10: 'à dezena mais próxima',
  100: 'à centena mais próxima',
  1000: 'ao milhar mais próximo',
}
const formatar = (numero: number) => numero.toLocaleString('pt-BR')
const aproximar = (numero: number, escala: number) => Math.floor((numero + escala / 2) / escala) * escala

function errosNumericos(numero: number, escala: Escala, resposta: number): Record<string, string> {
  const erros: Record<string, string> = {}
  const incluir = (valor: number, erro: string) => {
    // Uma resposta pode coincidir com outra estratégia; mantenha um diagnóstico
    // possível sem sobrescrevê-lo e nunca registre a resposta correta como erro.
    if (valor !== resposta && erros[String(valor)] === undefined) erros[String(valor)] = erro
  }
  incluir(Math.ceil(numero / escala) * escala, 'arredonda-sempre-para-cima')
  if (numero % escala === escala / 2) incluir(Math.floor(numero / escala) * escala, 'empate-para-baixo')
  incluir(aproximar(numero, escala / 10), 'olha-casa-errada')
  incluir(aproximar(numero, escala * 10), 'olha-casa-errada')
  return erros
}

function retaDeEntrada(numero: number, escala: Escala): Visual {
  const inferior = Math.floor(numero / escala) * escala
  return {
    modelo: 'reta',
    estado: { de: inferior, ate: inferior + escala, marcas: [inferior, numero, inferior + escala] },
    esboco: 'Mostre o número entre dois múltiplos consecutivos, em escala uniforme. Sem seta, distância destacada ou extremo escolhido. Após responder, compare os dois trechos; no empate, mostre trechos iguais e destaque o extremo maior.',
  }
}

function itemNumerico(numero: number, escala: Escala, enunciado: string, comVisual: boolean): Item {
  const inferior = Math.floor(numero / escala) * escala
  const superior = inferior + escala
  const meio = inferior + escala / 2
  const resposta = aproximar(numero, escala)
  return {
    enunciado,
    formato: 'numero',
    resposta,
    erros: errosNumericos(numero, escala, resposta),
    dicas: [
      'Ache as duas marcas vizinhas e veja qual está mais perto. No meio, fica a maior.',
      `${formatar(numero)} fica entre ${formatar(inferior)} e ${formatar(superior)}. O meio é ${formatar(meio)}.`,
      numero === meio
        ? `${formatar(numero)} está bem no meio. No meio, fica a maior: ${formatar(resposta)}.`
        : `${formatar(numero)} fica mais perto de ${formatar(resposta)}: ${formatar(numero)} ≈ ${formatar(resposta)}.`,
    ],
    ...(comVisual ? { visual: retaDeEntrada(numero, escala) } : {}),
  }
}

/** Primeiro contato: dezenas com números de dois algarismos, sem empate. */
export const arredondarN1: Gerador = {
  id: 'arredondar-n1',
  aula: 'B.U1.A5',
  nivel: 1,
  gerar(r) {
    const numero = r.int(1, 8) * 10 + r.pick([1, 2, 3, 4, 6, 7, 8, 9])
    return itemNumerico(numero, 10, `Arredonde ${formatar(numero)} à dezena mais próxima.`, true)
  },
}

/** O caso que pega: abaixo, no meio e acima, incluindo trocas de casa. */
export const arredondarN2: Gerador = {
  id: 'arredondar-n2',
  aula: 'B.U1.A5',
  nivel: 2,
  gerar(r) {
    const escala = r.pick<Escala>([10, 100, 1000])
    const superior = escala * r.pick([10, 100])
    const resto = r.pick([escala / 2 - 1, escala / 2, escala / 2 + 1, escala - 1])
    const numero = superior - escala + resto
    return itemNumerico(numero, escala, `Arredonde ${formatar(numero)} ${ALVOS[escala]}.`, true)
  },
}

interface Alternativa {
  texto: string
  erro?: string
}

function itemEscolha(r: Rng, enunciado: string, alternativas: Alternativa[], dicas: Item['dicas']): Item {
  const ordem = r.pick([[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]])
  const ordenadas = ordem.map((indice) => alternativas[indice])
  const erros: Record<string, string> = {}
  ordenadas.forEach((alternativa, indice) => {
    if (alternativa.erro) erros[String(indice)] = alternativa.erro
  })
  return {
    enunciado,
    formato: 'escolha',
    opcoes: ordenadas.map((alternativa) => alternativa.texto),
    resposta: ordenadas.findIndex((alternativa) => !alternativa.erro),
    erros,
    dicas,
  }
}

/** Sozinho: quantidade, escrita da aproximação ou decisão sobre um limite. */
export const arredondarN3: Gerador = {
  id: 'arredondar-n3',
  aula: 'B.U1.A5',
  nivel: 3,
  gerar(r) {
    const situacao = r.pick(['quantidade', 'notacao', 'limite'] as const)
    if (situacao === 'quantidade') {
      const escala = r.pick<Escala>([10, 100, 1000])
      const numero = r.int(1, 99) * escala + r.int(1, escala - 1)
      const contexto = r.pick([
        `Uma trilha tem ${formatar(numero)} m`,
        `Um catálogo tem ${formatar(numero)} livros`,
        `Um depósito guarda ${formatar(numero)} caixas`,
      ])
      return itemNumerico(numero, escala, `${contexto}. Arredonde ${ALVOS[escala]}.`, false)
    }
    if (situacao === 'notacao') {
      const numero = r.int(1, 9) * 1000 + r.pick([249, 251, 449, 451, 649, 651, 749])
      const resposta = aproximar(numero, 100)
      const outraCasa = aproximar(numero, 1000)
      return itemEscolha(r,
        `Um catálogo tem ${formatar(numero)} livros. Arredonde à centena. Qual escrita está certa?`,
        [
          { texto: `${formatar(numero)} ≈ ${formatar(resposta)}` },
          { texto: `${formatar(numero)} = ${formatar(resposta)}`, erro: 'estimativa-exata' },
          { texto: `${formatar(numero)} ≈ ${formatar(outraCasa)}`, erro: 'olha-casa-errada' },
        ],
        [
          '≈ quer dizer “mais ou menos”. = é só para números iguais.',
          `Ache as centenas vizinhas de ${formatar(numero)} e veja qual está mais perto.`,
          `${formatar(numero)} ≈ ${formatar(resposta)}. Os números não são iguais, então não vale =.`,
        ])
    }
    const numero = r.int(11, 49) * 100 + r.int(1, 49)
    const aproximacao = aproximar(numero, 100)
    return itemEscolha(r,
      `Uma mesa custa R$ ${formatar(numero)}, “uns R$ ${formatar(aproximacao)}”. Com R$ ${formatar(aproximacao)}, dá para comprar?`,
      [
        { texto: 'Não. O preço exato é maior que isso.' },
        { texto: 'Sim. O preço é igual ao arredondado.', erro: 'estimativa-exata' },
        { texto: 'Sim. Arredondar sempre garante.', erro: 'aproximacao-garante-limite' },
      ],
      [
        'Arredondar dá uma ideia do preço. Para pagar, vale o preço exato.',
        `Compare o preço exato, R$ ${formatar(numero)}, com R$ ${formatar(aproximacao)}.`,
        `R$ ${formatar(numero)} é mais que R$ ${formatar(aproximacao)}. Não dá.`,
      ])
  },
}
