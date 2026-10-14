import { describe, expect, it } from 'vitest'
import { GERADORES_U18B } from '@/content/matematica/geradores/graficos-b'
import { aplicarRegra } from '@/components/aula/visual/plano-geo'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (os números em negrito, ou a regra em TeX) e
// refaz a conta por conta própria, sem usar as funções do gerador. As
// relações são conferidas por outro caminho: a reta pelos pontos da tabela
// (produto vetorial para ver se estão alinhados, e onde a reta corta o 0), a
// corrida somando km por km, o valor fixo e o preço por hora procurados na
// força bruta, e a volta da conta ao consumo procurando o consumo que dá a
// conta. Na máquina da tela, a regra é conferida pela conta que o player faz.

const g = (id: string) => GERADORES_U18B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

type P = [number, number]

const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
/** 'R$ 0,80' → 0.8; '12 km' → 12. */
const numero = (s: string) => {
  const m = s.match(/\d+(,\d+)?/)
  expect(m, `sem número em "${s}"`).not.toBeNull()
  return Number(m![0].replace(',', '.'))
}
const medidas = (item: Item) => negritos(item.enunciado).map(numero)
/** A resposta (ou um erro) como o aluno digita: '124,6' → 124.6; -3 → −3. */
const valor = (v: string | number) => {
  expect(String(v), 'sem ponto decimal').toMatch(/^-?\d+(,\d+)?$/)
  return Number(String(v).replace(',', '.'))
}
const perto = (a: number, b: number) => Math.abs(a - b) < 1e-6
/** O erro mapeado para a resposta errada que vale `v`. */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => perto(valor(t), v))
  return k === undefined ? undefined : item.erros[k]
}

/** Os pontos estão todos numa reta? (produto vetorial com os dois primeiros) */
const alinhados = (ps: P[]) => ps.every(([x, y]) => perto((ps[1][0] - ps[0][0]) * (y - ps[0][1]) - (ps[1][1] - ps[0][1]) * (x - ps[0][0]), 0))
/** Onde a reta pelos dois primeiros pontos corta o x = 0. */
const corteNoZero = (ps: P[]) => ps[0][1] - ((ps[1][1] - ps[0][1]) / (ps[1][0] - ps[0][0])) * ps[0][0]

describe('U18 (aulas 4 e 5) · geradores', () => {
  it('6 geradores, 3 por aula, níveis 1 a 3; visual só no nível 1', () => {
    expect(GERADORES_U18B).toHaveLength(6)
    for (const aula of ['B.U18.A4', 'B.U18.A5']) {
      expect(GERADORES_U18B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_U18B) {
      for (const item of itens(ger)) {
        if (ger.nivel > 1) expect(item.visual, ger.id).toBeUndefined()
        else expect(item.visual?.modelo, ger.id).toBe('plano')
      }
    }
  })
  it('nenhum erro vale a certa; sem hífen fora do TeX; unidades e R$ com espaço que não quebra', () => {
    for (const ger of GERADORES_U18B) {
      for (const item of itens(ger)) {
        const fora = (t: string) => t.replace(/R\$/g, 'R').replace(/\$[^$]*\$/g, '')
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          expect(fora(t), `${ger.id}: hífen no lugar do menos em "${t}"`).not.toMatch(/-/)
          expect(t, `${ger.id}: unidade sem o espaço que não quebra em "${t}"`).not.toMatch(/\d (kg|km|h|kWh)(?![\wÀ-ÿ])/)
          expect(t, `${ger.id}: R$ sem o espaço que não quebra em "${t}"`).not.toMatch(/R\$ \d/)
        }
        expect(item.dicas).toHaveLength(3)
        if (item.formato === 'escolha') {
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          continue
        }
        expect(item.formato).toBe('numero')
        const r = valor(item.resposta)
        // Um decimal vem como texto com vírgula, como o aluno digita; um inteiro, como número.
        if (typeof item.resposta === 'string') expect(item.resposta).toMatch(/,/)
        if (r < 0) expect(item.sinal, `${item.enunciado}: resposta negativa sem a tecla do menos`).toBe(true)
        for (const t of Object.keys(item.erros)) expect(perto(valor(t), r), `${item.enunciado}: o erro "${t}" vale a certa`).toBe(false)
      }
    }
  })
  it('as contas de conferência batem com contas feitas à mão', () => {
    expect(alinhados([[1, 7], [2, 9], [4, 13]])).toBe(true)
    expect(alinhados([[1, 1], [2, 4], [3, 9]])).toBe(false)
    expect(corteNoZero([[1, 7], [2, 9]])).toBe(5)
    expect(corteNoZero([[2, 3], [4, 6]])).toBe(0)
  })
})

describe('U18 · aula 4: relações entre grandezas', () => {
  it('relacoes-n1: a reta pela origem, a reta com valor fixo e a curva, lidas no gráfico', () => {
    const vistos = { proporcional: 0, fixo: 0, curva: 0 }
    for (const item of itens(g('relacoes-n1'))) {
      const e = item.visual!.estado as { tabela: { pares: P[] }; retas?: { a: number; b: number }[] }
      const ps = e.tabela.pares
      const qual = (t: string) => (t.startsWith('Sim') ? 'proporcional' : t.includes('não passa') ? 'fixo' : 'curva')
      const tipos = item.opcoes!.map(qual)
      expect(new Set(tipos).size).toBe(3)
      const certo = !alinhados(ps) ? 'curva' : perto(corteNoZero(ps), 0) ? 'proporcional' : 'fixo'
      vistos[certo]++
      expect(tipos[item.resposta as number], item.enunciado).toBe(certo)
      // A reta desenhada passa por todos os pontos da tabela; a curva não tem reta.
      if (certo === 'curva') expect(e.retas).toBeUndefined()
      else for (const [x, y] of ps) expect(perto(e.retas![0].a * x + e.retas![0].b, y)).toBe(true)
      const iProp = String(tipos.indexOf('proporcional'))
      if (certo === 'fixo') expect(item.erros[iProp]).toBe('toda-reta-e-proporcional')
      if (certo === 'curva') expect(item.erros[iProp]).toBe('cresce-junto-e-proporcional')
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
  it('relacoes-n2: o preço proporcional e a corrida com valor fixo', () => {
    const vistos = { proporcional: 0, corrida: 0 }
    for (const item of itens(g('relacoes-n2'))) {
      const fs = medidas(item)
      const r = item.resposta as number
      if (item.enunciado.includes('para começar')) {
        vistos.corrida++
        const [b, a, n, v, m] = fs
        // A corrida, km por km.
        let preco = b
        for (let i = 0; i < n; i++) preco += a
        expect(v, 'o preço dado bate com a regra').toBe(preco)
        preco = b
        for (let i = 0; i < m; i++) preco += a
        expect(r, item.enunciado).toBe(preco)
        expect(erroPara(item, (v * m) / n)).toBe('regra-de-tres-sem-proporcao')
        expect(erroPara(item, a * m)).toBe('esquece-valor-fixo')
      } else {
        vistos.proporcional++
        const [k, v, m] = fs
        expect(m).not.toBe(k)
        expect(r, item.enunciado).toBe((v * m) / k)
        expect(erroPara(item, v + (m - k))).toBe('pensa-aditivamente')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
  it('relacoes-n3: o valor fixo e o preço de outro tempo, a partir de dois pedidos', () => {
    const vistos = { fixo: 0, outro: 0 }
    for (const item of itens(g('relacoes-n3'))) {
      const fs = medidas(item)
      const [h1, v1, h2, v2] = fs
      // O valor fixo e o preço por hora, na força bruta.
      const sols: [number, number][] = []
      for (let b = 0; b <= 100; b++) for (let a = 1; a <= 30; a++) if (b + a * h1 === v1 && b + a * h2 === v2) sols.push([b, a])
      expect(sols, item.enunciado).toHaveLength(1)
      const [b, a] = sols[0]
      expect(b).toBeGreaterThan(0)
      if (item.enunciado.includes('valor fixo, em reais')) {
        vistos.fixo++
        expect(item.resposta, item.enunciado).toBe(b)
        expect(erroPara(item, 0)).toBe('toda-reta-e-proporcional')
      } else {
        vistos.outro++
        const h3 = fs[4]
        expect(item.resposta, item.enunciado).toBe(b + a * h3)
        expect(erroPara(item, a * h3)).toBe('esquece-valor-fixo')
        if ((v1 * h3) % h1 === 0) expect(erroPara(item, (v1 * h3) / h1)).toBe('regra-de-tres-sem-proporcao')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})

describe('U18 · aula 5: a ideia de função', () => {
  it('funcao-n1: a máquina de dois passos, na tela', () => {
    for (const item of itens(g('funcao-n1'))) {
      const m = item.enunciado.match(/\\times\\ (\d+)\$ e depois \$\+\\ (\d+)\$\. Entra \*\*(\d+)\*\*/)
      expect(m, item.enunciado).not.toBeNull()
      const [a, b, x] = m!.slice(1).map(Number)
      let s = 0
      for (let i = 0; i < a; i++) s += x
      expect(item.resposta, item.enunciado).toBe(s + b)
      // A máquina da tela faz a mesma conta, com o mesmo número esperando para entrar.
      const mq = (item.visual!.estado as { maquina: { regra: string; entradas: number[] } }).maquina
      expect(mq.entradas).toEqual([x])
      expect(aplicarRegra(mq.regra, x)).toBe(item.resposta)
      expect(erroPara(item, a * x)).toBe('esquece-valor-fixo')
      expect(erroPara(item, a * (x + b))).toBe('regra-fora-de-ordem')
    }
  })
  it('funcao-n2: a regra com letras, com saídas que podem ser negativas', () => {
    let negativas = 0
    for (const item of itens(g('funcao-n2'))) {
      const m = item.enunciado.match(/\$y = (\d+)x ([+-]) (\d+)\$.*\$x = (\d+)\$/)
      expect(m, item.enunciado).not.toBeNull()
      const a = Number(m![1])
      const b = Number(m![3])
      const x = Number(m![4])
      let s = 0
      for (let i = 0; i < x; i++) s += a
      const certa = m![2] === '-' ? s - b : s + b
      expect(item.resposta, item.enunciado).toBe(certa)
      expect(item.sinal).toBe(true)
      if (certa < 0) negativas++
      if (a * x !== certa) expect(erroPara(item, a * x)).toBe('esquece-valor-fixo')
      if (x > 0) {
        const junto = Number(`${a}${x}`)
        const foraDeOrdem = m![2] === '-' ? a * (x - b) : a * (x + b)
        // Quando o número colado coincide com a conta fora de ordem, fica o primeiro erro.
        if ((m![2] === '-' ? junto - b : junto + b) !== foraDeOrdem) expect(erroPara(item, m![2] === '-' ? junto - b : junto + b)).toBe('junta-algarismos-com-a-letra')
        if (foraDeOrdem !== certa && foraDeOrdem !== a * x) expect(erroPara(item, foraDeOrdem)).toBe('regra-fora-de-ordem')
      }
    }
    expect(negativas, 'alguma saída negativa').toBeGreaterThan(20)
  })
  it('funcao-n3: a conta de luz e a corrida, de ida e de volta', () => {
    const vistos = { 'luz-volta': 0, 'corrida-volta': 0, 'luz-ida': 0 }
    for (const item of itens(g('funcao-n3'))) {
      const fs = medidas(item)
      if (item.enunciado.includes('corrida')) {
        vistos['corrida-volta']++
        const [b, a, v] = fs
        const km = Array.from({ length: 200 }, (_, i) => i).filter((k) => b + a * k === v)
        expect(km, item.enunciado).toHaveLength(1)
        expect(item.resposta).toBe(km[0])
        expect(erroPara(item, (v - b) * a)).toBe('desfaz-com-a-mesma-operacao')
        expect(erroPara(item, v * a + b)).toBe('troca-entrada-e-saida')
        continue
      }
      const [f, p] = fs
      // Em centavos, para não carregar erros de arredondamento.
      const pc = Math.round(p * 100)
      if (item.enunciado.includes('veio')) {
        vistos['luz-volta']++
        const v = fs[2]
        const ks = Array.from({ length: 1001 }, (_, i) => i).filter((k) => k * pc + f * 100 === v * 100)
        expect(ks, item.enunciado).toHaveLength(1)
        expect(item.resposta).toBe(ks[0])
        expect(erroPara(item, ((v - f) * pc) / 100)).toBe('desfaz-com-a-mesma-operacao')
        expect(erroPara(item, (v * pc) / 100 + f)).toBe('troca-entrada-e-saida')
      } else {
        vistos['luz-ida']++
        const k = fs[2]
        const conta = k * pc + f * 100
        expect(Math.round(valor(item.resposta) * 100), item.enunciado).toBe(conta)
        expect(erroPara(item, (k * pc) / 100)).toBe('esquece-valor-fixo')
        expect(erroPara(item, ((k + f) * pc) / 100)).toBe('regra-fora-de-ordem')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})
