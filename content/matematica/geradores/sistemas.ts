import type { Gerador, Item, Rng } from '@/lib/formation/schema'
import type { EquacaoSistema } from '@/components/aula/visual/sistema-geo'
import { eq, escolha, num, numero, par, tex, visual } from './sistemas-apoio'

type Nivel = 1 | 2 | 3
const niveis = [1, 2, 3] as const
const enunciado = (es: [EquacaoSistema, EquacaoSistema]) => `$${eq(es[0])}$ e $${eq(es[1])}$`
const fechar = (x: number, y: number) => `O par é (${num(x)}; ${num(y)}). Substitua nas duas equações para conferir.`

function pares(r: Rng, n: Nivel): Item {
  const x = n === 3 ? -r.int(1, 6) / 2 : r.int(4, 9)
  const y = n === 3 ? r.int(1, 7) / 2 : r.int(1, 3)
  const a = n === 1 ? 1 : r.int(2, 4)
  const es: [EquacaoSistema, EquacaoSistema] = [[1, 1, x + y], [a, -1, a * x - y]]
  return { enunciado: `Qual par (x; y) satisfaz **as duas** equações: ${enunciado(es)}?`,
    ...escolha(r, par(x, y), [[par(y, x), 'sistema-troca-par'], [par(x + 1, y - 1), 'sistema-so-uma'], [par(x, y + 1), 'sistema-so-uma']]),
    dicas: ['Um par só resolve o sistema quando faz as duas igualdades valerem.', `Teste cada par primeiro na soma ${num(x + y)}. Depois confira a outra igualdade.`, fechar(x, y)],
    ...(n === 1 ? { visual: visual(es) } : {}) }
}

function substituir(r: Rng, n: Nivel): Item {
  const y = n === 3 ? -r.int(1, 5) / 2 : r.int(1, 5)
  const a = n === 1 ? 1 : r.int(2, 4)
  const d = r.int(1, 5)
  const b = n === 1 ? 1 : r.int(2, 3)
  const x = a * y + d
  const c = b * x + y
  const alvo = n === 1 ? 'y' : 'x'
  const es: [EquacaoSistema, EquacaoSistema] = [[1, -a, d], [b, 1, c]]
  return numero(`Use substituição: $x=${a === 1 ? '' : a}y+${d}$ e $${eq(es[1])}$. Quanto vale **${alvo}**?`, alvo === 'y' ? y : x,
    ['Troque x pela expressão inteira que tem o mesmo valor. Use parênteses.', `$${b}(${a}y+${d})+y=${tex(c)}$. Junte os termos: $${b * a + 1}y=${tex(c - b * d)}$.`,
      `Dividindo por ${b * a + 1}, y = ${num(y)}. Volte: x = ${num(x)}. A pergunta pede ${alvo}.`],
    [[alvo === 'y' ? x : y, 'sistema-responde-outra'], [(c - d) / (b * a + 1), 'sistema-sem-parenteses']], n === 1 ? visual(es) : undefined)
}

function somar(r: Rng, n: Nivel): Item {
  const x = n === 3 ? -r.int(1, 6) : r.int(1, 7)
  const y = n === 3 ? -r.int(1, 5) : r.int(1, 6)
  const a = n === 1 ? 1 : r.int(2, 4)
  const b = n === 1 ? 1 : r.int(1, 3)
  const k = n === 1 ? 1 : r.int(2, 4)
  const es: [EquacaoSistema, EquacaoSistema] = [[a, k, a * x + k * y], [b, -k, b * x - k * y]]
  const alvo = n === 1 ? 'x' : 'y'
  return numero(`Resolva por adição: ${enunciado(es)}. Quanto vale **${alvo}**?`, alvo === 'x' ? x : y,
    ['Some os dois lados das igualdades. Os termos de y têm coeficientes opostos.', `A soma dá $${a + b}x=${(a + b) * x}$. Divida por ${a + b} para achar x.`,
      `x = ${num(x)}. Na primeira original, ${k}y = ${num(k * y)}; y = ${num(y)}.`],
    [[alvo === 'x' ? y : x, 'sistema-responde-outra'], [-y, 'sistema-volta-sinal']], n === 1 ? visual(es) : undefined)
}

function preparar(r: Rng, n: Nivel): Item {
  const x = n === 3 ? -r.int(1, 7) / 2 : r.int(1, 6)
  const y = n === 3 ? r.int(1, 7) / 2 : r.int(1, 5)
  const [a, b, c, d] = n === 1 ? [1, 2, 2, 1] : r.pick([[2, 3, 3, 2], [3, 2, 2, 3], [2, -3, 3, 2]])
  const es: [EquacaoSistema, EquacaoSistema] = [[a, b, a * x + b * y], [c, d, c * x + d * y]]
  const coef = d * a - b * c
  return numero(`Prepare a eliminação: ${enunciado(es)}. Quanto vale **x**?`, x,
    ['Multiplique equações inteiras para criar coeficientes opostos. O total também recebe o fator.',
      `Primeira × (${d}); segunda × (${num(-b)}). Os termos de y se cancelam.`,
      `Somando: ${num(coef)}x = ${num(coef * x)}. Logo x = ${num(x)}. Voltando à original: y = ${num(y)}.`],
    [[-x, 'sistema-divisao-sinal'], [y, 'sistema-responde-outra'], [coef * x, 'sistema-nao-divide']], n === 1 ? visual(es) : undefined)
}

function retas(r: Rng, n: Nivel): Item {
  const x = r.int(1, 6)
  const y = r.int(1, 5)
  if (n === 1) {
    const es: [EquacaoSistema, EquacaoSistema] = [[1, 1, x + y], [1, -1, x - y]]
    return { enunciado: `Onde se encontram as retas $${eq(es[0])}$ e $${eq(es[1])}$?`,
      ...escolha(r, par(x, y), [[par(x + 1, y - 1), 'sistema-grafico-uma-reta'], [par(x, -y), 'sistema-grafico-uma-reta']]),
      dicas: ['O encontro é um ponto que satisfaz as duas equações.', `Somando: 2x = ${2 * x}. Depois use a soma ${x + y} para achar y.`, fechar(x, y)],
      visual: { modelo: 'plano', estado: { x: { de: -1, ate: 12, passo: 1 }, y: { de: -6, ate: 7, passo: 1 }, retas: [{ a: -1, b: x + y, destaque: 'ambar' }, { a: 1, b: y - x, destaque: 'azul' }] }, esboco: 'Duas retas que se cruzam; o aluno calcula o ponto comum, sem etiqueta que revele a resposta.' } }
  }
  const caso = r.pick(['unica', 'nenhuma', 'infinitas'] as const)
  const vertical = n === 3 && r.pick([true, false])
  const a = vertical ? 1 : r.int(1, 3)
  const b = vertical ? 0 : r.int(1, 3)
  const c = a * x + b * y
  const k = r.int(2, 4)
  const es: [EquacaoSistema, EquacaoSistema] = [[a, b, c], caso === 'unica' ? (vertical ? [0, 1, y] : [a, -b, a * x - b * y]) : [k * a, k * b, k * c + (caso === 'nenhuma' ? 1 : 0)]]
  const certa = caso === 'unica' ? 'Uma solução' : caso === 'nenhuma' ? 'Nenhuma solução' : 'Infinitas soluções'
  return { enunciado: `Quantas soluções tem o sistema ${enunciado(es)}?`,
    ...escolha(r, certa, [['Uma solução', caso === 'infinitas' ? 'sistema-identidade-zero' : 'sistema-contradicao-par'], ['Nenhuma solução', caso === 'infinitas' ? 'sistema-identidade-sem-solucao' : 'sistema-direcoes-diferentes'], ['Infinitas soluções', caso === 'nenhuma' ? 'sistema-paralelas-coincidentes' : 'sistema-direcoes-diferentes']]),
    dicas: ['Pergunte se as retas se cruzam, são paralelas distintas ou representam a mesma condição.', caso === 'unica' ? 'As retas têm direções diferentes e se cruzam em um único ponto.' : `Subtraia ${k} vezes a primeira da segunda: sobra 0 = ${caso === 'nenhuma' ? 1 : 0}.`,
      caso === 'unica' ? fechar(x, y) : caso === 'nenhuma' ? '0 = 1 é impossível: nenhuma solução, pois as retas são paralelas distintas.' : '0 = 0 repete a condição original: infinitos pares na mesma reta. Não fixa as letras em zero.'] }
}

function problemas(r: Rng, n: Nivel): Item {
  if (n === 2) {
    const x = r.int(5, 12)
    const y = r.int(1, 4)
    const c = 2 * x + 3 * y
    const d = 3 * x + 2 * y
    return numero(`2 cadernos e 3 canetas custam R$ ${c}; 3 cadernos e 2 canetas, R$ ${d}. Qual é o preço de **um caderno**?`, x,
      ['Aqui as incógnitas são preços: x do caderno e y da caneta.', `$2x+3y=${c}$ e $3x+2y=${d}$. Multiplique as linhas por 2 e −3 para eliminar y.`,
        `Fica −5x = ${num(-5 * x)}: x = ${x} reais. A caneta custa ${y} reais. Confira as duas compras.`], [[y, 'sistema-responde-outra'], [c, 'sistema-unidades']])
  }
  const total = r.int(6, 12)
  const bus = r.int(1, total - 1)
  const metro = total - bus
  const p = r.int(3, 6)
  const gasto = p * bus + (p + 2) * metro + (n === 3 ? r.pick([0, 1, 1]) : 0)
  const en = `${total} bilhetes: ônibus a R$ ${p}, metrô a R$ ${p + 2}. Gasto de R$ ${gasto}.`
  const y = (gasto - p * total) / 2
  const x = total - y
  if (n === 1) return numero(`${en} Quantos bilhetes de **ônibus**?`, bus,
    ['Defina x como ônibus e y como metrô. Escreva uma equação para cada total.', `$x+y=${total}$ e $${p}x+${p + 2}y=${gasto}$. Elimine x para achar y.`, `y = ${metro}. Então x = ${total} − ${metro} = ${bus}. Os dois totais conferem.`], [[metro, 'sistema-responde-outra'], [total, 'sistema-so-uma']], visual([[1, 1, total], [p, p + 2, gasto]]))
  const possivel = Number.isInteger(y) && y >= 0 && x >= 0
  return { enunciado: `${en} Essa compra de bilhetes **inteiros** é possível?`,
    ...escolha(r, possivel ? 'Compra possível' : 'Compra impossível', [[possivel ? 'Compra impossível' : 'Compra possível', 'sistema-arredonda-contagem']]),
    dicas: ['Não basta a álgebra ter solução: as quantidades de bilhetes precisam ser inteiras e não negativas.', `Elimine x: 2y = ${gasto - p * total}, então y = ${num(y)}. E x = ${num(x)}.`,
      possivel ? `Sim: ${num(x)} de ônibus e ${num(y)} de metrô conferem nos dois totais.` : 'Não: o modelo exige meio bilhete. Arredondar mudaria o gasto e não atenderia às duas condições.'] }
}

const temas = [['par', pares], ['substituir', substituir], ['somar', somar], ['preparar', preparar], ['retas', retas], ['problemas', problemas]] as const
export const GERADORES_AF_U04: Gerador[] = temas.flatMap(([tema, gerar], j) => niveis.map(nivel => ({
  id: `sistema-${tema}-n${nivel}`, aula: `AF.U4.A${j + 1}`, nivel, gerar: (r: Rng) => gerar(r, nivel),
})))
