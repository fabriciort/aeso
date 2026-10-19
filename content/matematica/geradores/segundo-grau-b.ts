import type { Gerador, Item, Rng } from '@/lib/formation/schema'
import { conjunto, escolha, formulas, num, numero, polinomio } from './segundo-grau-apoio'

const niveis = [1, 2, 3] as const

function formula(r: Rng, nivel: 1 | 2 | 3): Item {
  // Construção a partir de duas raízes conhecidas; os testes substituem as
  // respostas no enunciado, sem reconstruir as raízes por esta receita.
  const p = nivel === 3 ? r.pick([-1, 1]) * (2 * r.int(1, 4) + 1) / 2 : r.int(1, 6)
  const q = -r.int(1, 5)
  const a = nivel === 1 ? 1 : nivel === 2 ? r.pick([2, 3]) : r.pick([-2, 2])
  const b = -a * (p + q)
  const c = a * p * q
  const delta = b * b - 4 * a * c
  const radical = Math.sqrt(delta)
  return { enunciado: `Use a fórmula em $${polinomio(a, b, c)} = 0$. Quais são todas as raízes?`,
    ...escolha(r, conjunto([p, q]), [[conjunto([-p, -q]), 'equacao-menos-b'], [conjunto([p]), 'equacao-esquece-raiz-negativa'],
      [conjunto([-b + radical / (2 * a), -b - radical / (2 * a)]), 'equacao-divide-so-radical']]),
    dicas: ['Identifique a, b e c com seus sinais. Calcule primeiro o que fica dentro da raiz.',
      `a = ${num(a)}, b = ${num(b)}, c = ${num(c)}. Δ = ${delta} e √Δ = ${radical}.`,
      `Divida ${num(-b)} + ${radical} e ${num(-b)} − ${radical} por ${num(2 * a)}. Raízes: ${num(q)} e ${num(p)}.`],
    ...(nivel === 1 ? { visual: formulas(`${polinomio(a, b, c)}=0`, 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}') } : {}) }
}

function discriminante(r: Rng, nivel: 1 | 2 | 3): Item {
  const m = r.int(1, 6) * r.pick([-1, 1])
  const tipo = r.int(-1, 1)
  const k = tipo === 0 ? 0 : tipo * (nivel === 3 ? r.pick([2, 3, 5, 7]) : r.int(1, 4) ** 2)
  const escala = nivel === 1 ? 1 : r.pick([-2, -1, 2])
  const a = escala
  const b = -2 * m * escala
  const c = (m * m - k) * escala
  const delta = b * b - 4 * a * c
  const resposta = tipo > 0 ? 2 : tipo === 0 ? 1 : 0
  return numero(`Em $${polinomio(a, b, c)} = 0$, quantas raízes reais **diferentes** existem?`, resposta,
    ['O sinal de Δ decide a quantidade de raízes reais. Não é preciso calcular as raízes.',
      `Use a = ${num(a)}, b = ${num(b)} e c = ${num(c)} em Δ = b² − 4ac.`,
      `Δ = ${num(delta)}. ${delta > 0 ? 'É positivo: duas raízes reais diferentes.' : delta === 0 ? 'É zero: uma raiz real, repetida na fórmula.' : 'É negativo: não há raiz real.'}`],
    [[2, delta === 0 ? 'raizes-iguais-contadas-duas' : 'delta-negativo-raizes-negativas'], [0, 'delta-nao-quadrado-sem-raizes'], [1, 'equacao-esquece-raiz-negativa']],
    nivel === 1 ? formulas(`${polinomio(a, b, c)}=0`, '\\Delta=b^2-4ac') : undefined)
}

function problemas(r: Rng, nivel: 1 | 2 | 3): Item {
  if (nivel === 1) {
    const largura = r.int(2, 9)
    const extra = r.int(1, 5)
    const area = largura * (largura + extra)
    return numero(`Um terreno tem ${area} m². O comprimento supera a largura em ${extra} m. Qual é a largura, em metros?`, largura,
      ['Chame a largura de x. O comprimento será x mais a diferença entre os lados.',
        `A área dá x(x + ${extra}) = ${area}. Multiplique os lados, não os some.`,
        `A largura é ${largura} m: ${largura} · ${largura + extra} = ${area}. A raiz ${num(-largura - extra)} não mede um lado.`],
      [[-largura - extra, 'equacao-aceita-medida-negativa'], [largura + extra, 'responde-outra-pergunta'], [(area - extra) / 2, 'problema-area-soma-lados']],
      { modelo: 'retangulo', estado: { base: ['x', extra], altura: ['x'], total: `${area} m²` }, esboco: 'Largura x e comprimento x mais a diferença; a área total é dada, sem a medida resolvida.' })
  }
  if (nivel === 2) {
    const a = r.int(2, 6)
    const b = a + r.int(1, 4)
    const x = r.int(1, 3)
    const area = (a + 2 * x) * (b + 2 * x)
    return numero(`Uma foto de ${a} cm por ${b} cm ganha moldura externa uniforme. A área total é ${area} cm². Qual é a largura da moldura, em cm?`, x,
      ['A borda entra duas vezes em cada dimensão: uma faixa de cada lado.',
        `Os lados externos são ${a} + 2x e ${b} + 2x. Seu produto é ${area}.`,
        `x = ${x} cm: os lados externos são ${a + 2 * x} e ${b + 2 * x} cm. O produto é ${area} cm².`],
      [[2 * x, 'moldura-conta-uma-faixa'], [-x - (a + b) / 2, 'equacao-aceita-medida-negativa'], [a + 2 * x, 'responde-outra-pergunta']])
  }
  const p = r.int(1, 8)
  const produto = p * (p + 1)
  return { enunciado: `Dois inteiros consecutivos têm produto ${produto}. Quais são **todos os pares** possíveis?`,
    ...escolha(r, `${p} e ${p + 1}; ${num(-p - 1)} e ${num(-p)}`,
      [[`${p} e ${p + 1}`, 'problema-descarta-negativo-sempre'], [`${num(-p)} e ${p + 1}`, 'sinais-iguais-da-negativo'], [`${produto} e ${produto + 1}`, 'produto-zero-aplicado-a-soma']]),
    dicas: ['Números consecutivos são x e x + 1. Aqui a pergunta permite inteiros negativos.',
      `Monte x(x + 1) = ${produto}, ou x² + x − ${produto} = 0.`,
      `Os pares são ${p} e ${p + 1}, e ${num(-p - 1)} e ${num(-p)}. Nos dois pares a diferença é 1 e o produto é ${produto}.`] }
}

export const GERADORES_AF_U03B: Gerador[] = [
  ...niveis.map((nivel): Gerador => ({ id: `segundo-formula-n${nivel}`, aula: 'AF.U3.A5', nivel, gerar: (r) => formula(r, nivel) })),
  ...niveis.map((nivel): Gerador => ({ id: `segundo-delta-n${nivel}`, aula: 'AF.U3.A6', nivel, gerar: (r) => discriminante(r, nivel) })),
  ...niveis.map((nivel): Gerador => ({ id: `segundo-problemas-n${nivel}`, aula: 'AF.U3.A7', nivel, gerar: (r) => problemas(r, nivel) })),
]
