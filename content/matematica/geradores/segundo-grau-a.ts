import type { Gerador, Item, Rng } from '@/lib/formation/schema'
import { binomio, conjunto, escolha, formulas, num, numero, polinomio } from './segundo-grau-apoio'

const niveis = [1, 2, 3] as const
const comSinal = (r: Rng) => r.pick([-1, 1]) * r.int(1, 5)

function quadrado(r: Rng, nivel: 1 | 2 | 3): Item {
  const s = r.int(1, 7)
  if (nivel === 1) {
    const k = r.pick([s * s, s * s, 0, -s * s])
    const certa = conjunto(k > 0 ? [-s, s] : k === 0 ? [0] : [])
    return { enunciado: `Quais são todas as raízes reais de $x^2 = ${k}$?`,
      ...escolha(r, certa, [[conjunto([s]), 'equacao-esquece-raiz-negativa'], [conjunto([-s]), 'quadrado-negativo-tem-raiz-real'], [conjunto([0]), 'raizes-iguais-contadas-duas'], ['Nenhuma raiz real', 'delta-nao-quadrado-sem-raizes']]),
      dicas: ['Teste os dois sinais: um número e seu oposto têm o mesmo quadrado.', `O quadrado de um real nunca é negativo. Aqui o resultado pedido é ${num(k)}.`,
        k > 0 ? `${s}² e (${num(-s)})² dão ${k}. As raízes são ${num(-s)} e ${s}.` : k === 0 ? 'Só 0 tem quadrado 0: uma raiz real.' : 'Nenhum quadrado real é negativo. Não há raiz real.'], visual: formulas(`x^2=${k}`) }
  }
  if (nivel === 2) {
    const d = comSinal(r)
    const roots = [-d - s, -d + s]
    return { enunciado: `Quais são todas as raízes de $(${binomio(d)})^2 = ${s * s}$?`,
      ...escolha(r, conjunto(roots), [[conjunto([-d + s]), 'equacao-esquece-raiz-negativa'], [conjunto([d - s, d + s]), 'equacao-deslocamento-troca-sinal'], [conjunto([-s, s]), 'equacao-deslocamento-troca-sinal']]),
      dicas: ['Primeiro descubra os dois valores possíveis do que está ao quadrado.', `$${binomio(d)} = ${s}$ ou $${binomio(d)} = -${s}$.`, `Subtraia ${num(d)} nos dois casos: x = ${num(roots[0])} ou x = ${num(roots[1])}.`] }
  }
  const d = comSinal(r) * 2
  const a = r.pick([1, 2])
  const lado = a * s
  const menor = (-lado - d) / a
  return numero(`Resolva $(${a === 1 ? '' : a}x ${d < 0 ? '-' : '+'} ${Math.abs(d)})^2 = ${lado * lado}$. Qual é a **menor** raiz?`, menor,
    ['Desfaça o quadrado antes de desfazer a soma e a multiplicação.', `O que está ao quadrado vale ${lado} ou ${num(-lado)}.`, `No menor caso, ${a}x = ${num(-lado - d)}. Dividindo por ${a}, x = ${num(menor)}.`],
    [[(lado - d) / a, 'equacao-esquece-raiz-negativa'], [-lado, 'equacao-deslocamento-troca-sinal']])
}

function produto(r: Rng, nivel: 1 | 2 | 3): Item {
  const p = r.int(1, 6)
  const q = -r.int(1, 6)
  const escala = nivel === 2 ? r.int(2, 4) : 1
  const primeiro = escala === 1 ? binomio(-p) : `${escala}x - ${escala * p}`
  if (nivel !== 3) {
    return { enunciado: `Encontre todas as raízes: $(${primeiro})(${binomio(-q)}) = 0$.`,
      ...escolha(r, conjunto([p, q]), [[conjunto([-p, -q]), 'equacao-raiz-copia-sinal'], [conjunto([p]), 'produto-zero-exige-dois'], [conjunto([p * escala, q]), 'equacao-fator-esquece-coeficiente']]),
      dicas: ['Um produto zera quando pelo menos um fator é zero.', `Resolva $${primeiro}=0$ ou $${binomio(-q)}=0$.`, `As raízes são ${num(q)} e ${p}. Cada uma zera um fator.`],
      ...(nivel === 1 ? { visual: { modelo: 'livre' as const, estado: { produtoZero: { raizes: [p, q], valores: [q, 0, p], x: 0 } }, esboco: 'Em x = 0 os dois fatores ainda são não nulos; a tabela mostra o produto com sinal.' } } : {}) }
  }
  const t = p + r.int(1, 4)
  return { enunciado: `São três fatores. Quais raízes zeram $(${binomio(-p)})(${binomio(-q)})(${binomio(-t)})$?`,
    ...escolha(r, conjunto([p, q, t]), [[conjunto([p, q]), 'equacao-esquece-raiz-negativa'], [conjunto([-p, -q, -t]), 'equacao-raiz-copia-sinal'], [conjunto([t]), 'produto-zero-exige-dois']]),
    dicas: ['Com três fatores, um único fator zero também zera o produto.', 'Resolva cada fator igual a zero, um de cada vez.', `Os valores são ${num(q)}, ${p} e ${t}. Teste cada um no produto.`] }
}

function fatoracao(r: Rng, nivel: 1 | 2 | 3): Item {
  const p = r.int(1, 6)
  const q = nivel === 2 ? 0 : nivel === 1 ? -r.int(1, 5) : p + r.int(1, 4)
  const b = -p - q
  const c = p * q
  const poli = polinomio(1, b, c)
  const certa = conjunto([p, q])
  const f = q === 0 ? `x(${binomio(-p)})` : `(${binomio(-p)})(${binomio(-q)})`
  return { enunciado: `Resolva por fatoração: $${poli} = 0$. Quais são todas as raízes?`,
    ...escolha(r, certa, [[conjunto([-p, -q]), 'equacao-raiz-copia-sinal'], [conjunto([p]), q === 0 ? 'equacao-divide-por-x' : 'produto-zero-exige-dois'], [conjunto([b, c]), 'produto-zero-aplicado-a-soma']]),
    dicas: [q === 0 ? 'Ponha x em evidência. Dividir por x pode perder uma raiz.' : 'Procure dois números com a soma do coeficiente de x e o produto do termo constante.',
      `$${poli} = ${f}$.`, `Um fator zero basta: x = ${num(q)} ou x = ${p}. Confira na equação original.`],
    ...(nivel === 1 ? { visual: formulas(`${poli}=0`) } : {}) }
}

function completar(r: Rng, nivel: 1 | 2 | 3): Item {
  const m = nivel === 1 ? r.int(1, 4) : comSinal(r)
  const lado = Math.abs(m) + r.int(1, 4)
  const d = lado * lado - m * m
  const poli = polinomio(1, 2 * m, 0)
  if (nivel === 1) return numero(`Em $${poli} = ${d}$, quanto devemos somar **aos dois lados** para completar o quadrado?`, m * m,
    ['Reparta o coeficiente de x em duas metades. O que falta é o canto do quadrado.', `Metade de ${2 * m} é ${m}. O canto tem lados ${m} e ${m}.`, `Some ${m}² = ${m * m} dos dois lados. Fica (x + ${m})² = ${lado * lado}.`],
    [[m, 'completar-metade-sem-quadrado'], [4 * m * m, 'completar-dobra-coeficiente']],
    { modelo: 'retangulo', estado: { completarQuadrado: { metade: m, direita: d, etapa: 1 } }, esboco: 'Faixas repartidas e canto tracejado ainda sem área escrita.' })
  const roots = [-m - lado, -m + lado]
  if (nivel === 2) return { enunciado: `Complete o quadrado e encontre as raízes de $${poli} = ${d}$.`,
    ...escolha(r, conjunto(roots), [[conjunto([-m + lado]), 'equacao-esquece-raiz-negativa'], [conjunto([m - lado, m + lado]), 'equacao-deslocamento-troca-sinal'], [conjunto([-lado, lado]), 'completar-so-um-lado']]),
    dicas: ['Metade do coeficiente de x, elevada ao quadrado, completa o canto.', `Some ${m * m} dos dois lados: $(${binomio(m)})^2 = ${lado * lado}$.`, `Agora $${binomio(m)}$ vale ${lado} ou ${num(-lado)}. Raízes: ${num(roots[0])} e ${num(roots[1])}.`] }
  const a = r.pick([2, 3])
  return numero(`Divida por ${a} e complete o quadrado: $${polinomio(a, 2 * a * m, 0)} = ${a * d}$. Qual é a menor raiz?`, roots[0],
    ['Divida todos os termos pelo coeficiente de x². Depois complete o quadrado.', `A equação fica $${poli} = ${d}$. Some ${m * m} dos dois lados.`, `$(${binomio(m)})^2 = ${lado * lado}$. A menor raiz é ${num(roots[0])}.`],
    [[roots[1], 'equacao-esquece-raiz-negativa'], [-lado, 'equacao-deslocamento-troca-sinal']])
}

export const GERADORES_AF_U03A: Gerador[] = [
  ...niveis.map((nivel): Gerador => ({ id: `segundo-quadrado-n${nivel}`, aula: 'AF.U3.A1', nivel, gerar: (r) => quadrado(r, nivel) })),
  ...niveis.map((nivel): Gerador => ({ id: `segundo-produto-n${nivel}`, aula: 'AF.U3.A2', nivel, gerar: (r) => produto(r, nivel) })),
  ...niveis.map((nivel): Gerador => ({ id: `segundo-fatoracao-n${nivel}`, aula: 'AF.U3.A3', nivel, gerar: (r) => fatoracao(r, nivel) })),
  ...niveis.map((nivel): Gerador => ({ id: `segundo-completar-n${nivel}`, aula: 'AF.U3.A4', nivel, gerar: (r) => completar(r, nivel) })),
]
