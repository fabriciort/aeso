import { describe, expect, it } from 'vitest'
import { GERADORES_U20 } from '@/content/matematica/geradores/projeto'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (os números em negrito, com a unidade) e refaz a
// conta por conta própria, sem usar as funções do gerador. As caixas e as
// latas são contadas uma a uma, juntando até cobrir a área (sem dividir); o
// perímetro, andando lado por lado; a raiz, procurando o número que vezes ele
// mesmo dá a área; a equação, testando x = 1, 2, 3… até a conta fechar. Nas
// escolhas, a opção certa é lida do texto e comparada com a conta.

const g = (id: string) => GERADORES_U20.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
/** '1.200' → 1200; '2,5 m' → 2.5; '−3 °C' → −3. */
const numero = (s: string) => {
  const m = s.match(/[−-]?\d[\d.]*(,\d+)?/)
  expect(m, `sem número em "${s}"`).not.toBeNull()
  return Number(m![0].replace(/\./g, '').replace(',', '.').replace('−', '-'))
}
const medidas = (item: Item) => negritos(item.enunciado).map(numero)
const perto = (a: number, b: number) => Math.abs(a - b) < 1e-9
/** O erro mapeado para a resposta errada que vale `v` (numérico). */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => perto(Number(t), v))
  return k === undefined ? undefined : item.erros[k]
}
/** O valor numérico de uma opção: 'R$ 1.700' → 1700; '7,5 km' → 7.5; '$\frac{5}{8}$' → 0,625. */
const valorDe = (t: string) => {
  const f = t.match(/\\frac\{(\d+)\}\{(\d+)\}/)
  return f ? Number(f[1]) / Number(f[2]) : numero(t)
}
const certaDe = (item: Item) => item.opcoes![item.resposta as number]
/** O erro da opção que vale `v`. */
const erroDaOpcao = (item: Item, v: number) => {
  const i = item.opcoes!.findIndex((o, j) => j !== item.resposta && perto(valorDe(o), v))
  return i < 0 ? undefined : item.erros[String(i)]
}

/** Quantas peças de `cobre` cobrem `area`, juntando uma a uma (sem dividir). */
function quantas(area: number, cobre: number) {
  let n = 0
  while (n * cobre < area - 1e-9) n++
  return n
}
/** O perímetro, lado por lado. */
const volta = (lados: number[]) => lados.reduce((s, l) => s + l, 0)

describe('U20 · geradores', () => {
  it('6 geradores, 3 por aula, níveis 1 a 3; visual só no nível 1', () => {
    expect(GERADORES_U20).toHaveLength(6)
    for (const aula of ['B.U20.A1', 'B.U20.A2']) {
      expect(GERADORES_U20.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_U20) {
      for (const item of itens(ger)) {
        if (ger.nivel > 1) expect(item.visual, ger.id).toBeUndefined()
        else expect(item.visual, ger.id).toBeDefined()
      }
    }
  })
  it('nenhum erro vale a certa; menos verdadeiro, espaço que não quebra e milhar bem escritos', () => {
    for (const ger of GERADORES_U20) {
      for (const item of itens(ger)) {
        const fora = (t: string) => t.replace(/\$[^$]*\$/g, '')
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          // O hífen só vale entre letras (caixa-d'água).
          expect(fora(t), `${ger.id}: hífen no lugar do menos em "${t}"`).not.toMatch(/(?<![a-zà-ú])-|-(?![a-zà-ú])/i)
          expect(t, `${ger.id}: unidade sem o espaço que não quebra em "${t}"`).not.toMatch(/\d (%|m\b|m²|km|kg|L\b|mL|°C)/)
          expect(t, `${ger.id}: R$ sem o espaço que não quebra em "${t}"`).not.toMatch(/R\$ \d/)
          expect(fora(t), `${ger.id}: milhar sem ponto em "${t}"`).not.toMatch(/\d{4}/)
        }
        if (item.formato === 'escolha') {
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          expect(item.opcoes!.length, item.enunciado).toBeGreaterThanOrEqual(3)
          const vals = item.opcoes!.map(valorDe)
          expect(new Set(vals.map((v) => Math.round(v * 1e6))).size, `${item.enunciado}: duas opções com o mesmo valor`).toBe(vals.length)
          // Toda opção errada aponta para um erro.
          expect(Object.keys(item.erros).length, item.enunciado).toBe(item.opcoes!.length - 1)
          expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
          continue
        }
        expect(item.formato).toBe('numero')
        expect(Number.isInteger(item.resposta), item.enunciado).toBe(true)
        expect(item.resposta as number).toBeGreaterThan(0)
        for (const t of Object.keys(item.erros)) expect(perto(Number(t), item.resposta as number), `${item.enunciado}: o erro "${t}" vale a certa`).toBe(false)
      }
    }
  })
  it('as contas de conferência batem com contas feitas à mão', () => {
    expect(quantas(15, 2)).toBe(8)
    expect(quantas(16.5, 2)).toBe(9)
    expect(quantas(36, 10)).toBe(4)
    expect(volta([5, 3, 5, 3])).toBe(16)
    expect(numero('R$ 1.200')).toBe(1200)
    expect(numero('−3 °C')).toBe(-3)
    expect(valorDe('$\\frac{5}{8}$')).toBe(0.625)
  })
})

describe('U20 · aula 1: o projeto', () => {
  it('obra-n1: rodapé, piso e caixas, com a planta na tela', () => {
    const vistos = { rodape: 0, piso: 0, caixas: 0 }
    for (const item of itens(g('obra-n1'))) {
      const [c, l] = medidas(item)
      const e = item.visual!.estado as { poligono: { vertices: number[][] } }
      expect(e.poligono.vertices[2]).toEqual([c, l])
      if (/rodapé/.test(item.enunciado)) {
        vistos.rodape++
        expect(item.resposta).toBe(volta([c, l, c, l]))
        expect(erroPara(item, c + l)).toBe('perimetro-esquece-lados')
        if (c * l !== item.resposta) expect(erroPara(item, c * l)).toBe('confunde-area-perimetro')
      } else if (/caixa/.test(item.enunciado)) {
        vistos.caixas++
        const k = medidas(item)[2]
        let cobertas = 0
        for (let i = 0; i < c; i++) for (let j = 0; j < l; j++) cobertas++
        expect(item.resposta).toBe(quantas(cobertas, k))
        expect(cobertas % k, 'a divisão não é exata').not.toBe(0)
        expect(erroPara(item, (item.resposta as number) - 1)).toBe('ignora-contexto-do-resto')
      } else {
        vistos.piso++
        let quadrados = 0
        for (let i = 0; i < c; i++) for (let j = 0; j < l; j++) quadrados++
        expect(item.resposta).toBe(quadrados)
        if (volta([c, l, c, l]) !== quadrados) expect(erroPara(item, volta([c, l, c, l]))).toBe('confunde-area-perimetro')
        if (c + l !== volta([c, l, c, l])) expect(erroPara(item, c + l)).toBe('soma-no-lugar-de-multiplicar')
      }
    }
    for (const v of Object.values(vistos)) expect(v).toBeGreaterThan(30)
  })
  it('obra-n2: caixas com 10 % de sobra e latas sem a porta e a janela', () => {
    const vistos = { sobra: 0, tinta: 0 }
    for (const item of itens(g('obra-n2'))) {
      const ms = medidas(item)
      if (/pedreiro pede/.test(item.enunciado)) {
        vistos.sobra++
        const [c, l, k, p] = ms
        expect(p).toBe(10)
        const area = c * l
        const comSobra = area + (area * p) / 100
        expect(item.resposta).toBe(quantas(comSobra, k))
        const sem = quantas(area, k)
        if (sem !== item.resposta) expect(erroPara(item, sem)).toBe('esquece-a-sobra')
        const baixo = (item.resposta as number) - 1
        if (baixo !== sem && !perto((item.resposta as number) * k, comSobra)) expect(erroPara(item, baixo)).toBe('ignora-contexto-do-resto')
      } else {
        vistos.tinta++
        const [c, l, h, porta, janela, lata] = ms
        const paredes = volta([c, l, c, l]) * h
        const pinta = paredes - porta - janela
        expect(item.resposta, item.enunciado).toBe(quantas(pinta, lata))
        const sem = quantas(paredes, lata)
        if (sem !== item.resposta) expect(erroPara(item, sem)).toBe('esquece-de-descontar-aberturas')
        const baixo = (item.resposta as number) - 1
        if (baixo !== sem && !perto((item.resposta as number) * lata, pinta)) expect(erroPara(item, baixo)).toBe('ignora-contexto-do-resto')
      }
    }
    for (const v of Object.values(vistos)) expect(v).toBeGreaterThan(80)
  })
  it('obra-n3: o orçamento com desconto e a equação do pedreiro', () => {
    const vistos = { orcamento: 0, pedreiro: 0 }
    for (const item of itens(g('obra-n3'))) {
      const ms = medidas(item)
      if (/Orçamento/.test(item.enunciado)) {
        vistos.orcamento++
        const [q1, p1, m, p2, q3, p3, d] = ms
        let total = 0
        for (let i = 0; i < q1; i++) total += p1
        for (let i = 0; i < m; i++) total += p2
        for (let i = 0; i < q3; i++) total += p3
        const desconto = (total / 100) * d
        expect(perto(item.resposta as number, total - desconto), item.enunciado).toBe(true)
        expect(erroPara(item, total)).toBe('responde-outra-pergunta')
        expect(erroPara(item, desconto)).toBe('desconto-como-preco-final')
        if (total - d !== desconto) expect(erroPara(item, total - d)).toBe('porcentagem-como-numero-inteiro')
        const precos = p1 + p2 + p3
        if (![total, desconto, total - d].includes(precos)) expect(erroPara(item, precos)).toBe('esquece-a-quantidade')
      } else {
        vistos.pedreiro++
        const [fixo, a, total] = ms
        let x = 0
        while (fixo + a * x < total) x++
        expect(fixo + a * x).toBe(total)
        expect(item.resposta).toBe(x)
        expect(erroPara(item, total - fixo)).toBe('esquece-de-dividir')
        if (Number.isInteger(total / a)) expect(erroPara(item, total / a)).toBe('esquece-valor-fixo')
      }
    }
    for (const v of Object.values(vistos)) expect(v).toBeGreaterThan(80)
  })
})

describe('U20 · aula 2: a avaliação final', () => {
  it('prova-n1: desconto, pizza, chance e média, com o visual', () => {
    const vistos = { desconto: 0, pizza: 0, chance: 0, media: 0 }
    for (const item of itens(g('prova-n1'))) {
      const ms = medidas(item)
      const certa = valorDe(certaDe(item))
      if (/desconto/.test(item.enunciado)) {
        vistos.desconto++
        const [preco, d] = ms
        const desc = (preco * d) / 100
        expect(certa).toBe(preco - desc)
        expect(erroDaOpcao(item, desc)).toBe('desconto-como-preco-final')
        expect(erroDaOpcao(item, preco - d)).toBe('porcentagem-como-numero-inteiro')
        expect(erroDaOpcao(item, preco + desc)).toBe('operacao-trocada')
        expect(item.visual!.modelo).toBe('grade')
      } else if (/pizza/.test(item.enunciado)) {
        vistos.pizza++
        const [n, k] = ms
        expect(perto(certa, (n - k) / n)).toBe(true)
        expect(certaDe(item)).toBe(`$\\frac{${n - k}}{${n}}$`)
        expect(erroDaOpcao(item, k / n)).toBe('responde-outra-pergunta')
        expect(erroDaOpcao(item, (n - k) / k)).toBe('pintadas-sobre-nao-pintadas')
        expect(erroDaOpcao(item, n / (n - k))).toBe('troca-numerador-denominador')
        expect(item.visual!.modelo).toBe('barra')
      } else if (/saco/.test(item.enunciado)) {
        vistos.chance++
        const [v, a, vd] = ms
        const cor = item.enunciado.match(/uma (vermelha|azul|verde)\?/)![1]
        const fav = { vermelha: v, azul: a, verde: vd }[cor]!
        const tot = v + a + vd
        expect(perto(certa, Math.round((fav * 100) / tot))).toBe(true)
        expect(Number.isInteger((fav * 100) / tot)).toBe(true)
        expect(erroDaOpcao(item, fav)).toBe('parte-como-porcentagem')
        expect(item.visual!.modelo).toBe('sorteio')
      } else {
        vistos.media++
        const vs = ms
        expect(vs).toHaveLength(5)
        const media = vs.reduce((s, x) => s + x, 0) / 5
        expect(certa).toBe(media)
        const fila = [...vs].sort((x, y) => x - y)
        expect(erroDaOpcao(item, fila[2])).toBe('troca-media-mediana-moda')
        expect(erroDaOpcao(item, (fila[0] + fila[4]) / 2)).toBe('media-do-menor-e-do-maior')
        expect(item.visual!.modelo).toBe('dados')
      }
    }
    for (const v of Object.values(vistos)) expect(v).toBeGreaterThan(40)
  })
  it('prova-n2: ônibus, temperatura, decimal e copos', () => {
    const vistos = { onibus: 0, temperatura: 0, decimal: 0, copos: 0 }
    for (const item of itens(g('prova-n2'))) {
      const ms = medidas(item)
      const certa = valorDe(certaDe(item))
      if (/excursão/.test(item.enunciado)) {
        vistos.onibus++
        const [n, cap] = ms
        let carros = 0
        let levados = 0
        while (levados < n) {
          carros++
          levados += cap
        }
        expect(certa).toBe(carros)
        expect(erroDaOpcao(item, carros - 1)).toBe('ignora-contexto-do-resto')
        expect(erroDaOpcao(item, n - (carros - 1) * cap)).toBe('troca-quociente-e-resto')
      } else if (/temperatura/.test(item.enunciado)) {
        vistos.temperatura++
        const [de, ate] = ms
        expect(de).toBeLessThan(0)
        let graus = 0
        for (let t = de; t < ate; t++) graus++
        expect(certa).toBe(graus)
        expect(erroDaOpcao(item, Math.abs(ate + de))).toBe('tirar-negativo-subtrai')
        expect(erroDaOpcao(item, ate)).toBe('responde-outra-pergunta')
      } else if (/queijo/.test(item.enunciado)) {
        vistos.decimal++
        const vals = item.opcoes!.map(valorDe)
        expect(certa).toBe(Math.max(...vals))
        for (let i = 0; i < vals.length; i++) if (i !== item.resposta) expect(item.erros[String(i)]).toBe('decimal-mais-casas-maior')
      } else {
        vistos.copos++
        const [litros, copo] = ms
        let enche = 0
        let ml = 0
        while (ml + copo <= litros * 1000) {
          ml += copo
          enche++
        }
        expect(ml).toBe(litros * 1000)
        expect(certa).toBe(enche)
        expect(erroDaOpcao(item, enche / 10)).toBe('fator-de-conversao-errado')
      }
    }
    for (const v of Object.values(vistos)) expect(v).toBeGreaterThan(40)
  })
  it('prova-n3: equação, raiz, volume e receita', () => {
    const vistos = { equacao: 0, raiz: 0, volume: 0, receita: 0 }
    for (const item of itens(g('prova-n3'))) {
      const ms = medidas(item)
      const certa = valorDe(certaDe(item))
      if (/mais/.test(item.enunciado)) {
        vistos.equacao++
        const [fixo, k, total] = ms
        let x = 0
        while (fixo + k * x < total) x++
        expect(fixo + k * x).toBe(total)
        expect(certa).toBe(x)
        expect(erroDaOpcao(item, total - fixo)).toBe('esquece-de-dividir')
        if (Number.isInteger(total / k) && total / k !== total - fixo) expect(erroDaOpcao(item, total / k)).toBe('esquece-valor-fixo')
      } else if (/terreno/.test(item.enunciado)) {
        vistos.raiz++
        const [area] = ms
        let lado = 0
        while (lado * lado < area) lado++
        expect(lado * lado).toBe(area)
        expect(certa).toBe(lado)
        expect(erroDaOpcao(item, area / 2)).toBe('raiz-e-a-metade')
        expect(erroDaOpcao(item, area / 4)).toBe('confunde-area-perimetro')
      } else if (/caixa-d'água/.test(item.enunciado)) {
        vistos.volume++
        const [c, l, h] = ms
        let cubos = 0
        for (let i = 0; i < c; i++) for (let j = 0; j < l; j++) for (let k = 0; k < h; k++) cubos++
        expect(certa).toBe(cubos * 1000)
        expect(erroDaOpcao(item, cubos)).toBe('confunde-m3-com-litro')
        expect(erroDaOpcao(item, cubos * 100)).toBe('fator-de-conversao-errado')
      } else {
        vistos.receita++
        const [a, b, c] = ms
        expect(perto(certa, (c / b) * a)).toBe(true)
        if (a + c - b > 0 && a + c - b !== certa) expect(erroDaOpcao(item, a + c - b)).toBe('pensa-aditivamente')
      }
    }
    for (const v of Object.values(vistos)) expect(v).toBeGreaterThan(40)
  })
})
