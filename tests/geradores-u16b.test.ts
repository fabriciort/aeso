import { describe, expect, it } from 'vitest'
import { GERADORES_U16B } from '@/content/matematica/geradores/geometria-b'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (as medidas em negrito) e refaz a conta por conta
// própria, sem usar as funções do gerador. A geometria é conferida por outro
// caminho: o perímetro andando pelos cantos da figura, a área pela fórmula do
// cadarço (com os cantos montados a partir das medidas) ou contando os
// quadradinhos da grade, a volta do círculo com 3,14 em ponto flutuante, e a
// hipotenusa procurando, na força bruta, o inteiro cujo quadrado fecha a conta.

const g = (id: string) => GERADORES_U16B.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

type P = [number, number]

const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
/** '219,8 cm' → 219.8; '12 m' → 12. */
const numero = (s: string) => {
  const m = s.match(/\d+(,\d+)?/)
  expect(m, `sem número em "${s}"`).not.toBeNull()
  return Number(m![0].replace(',', '.'))
}
const medidas = (item: Item) => negritos(item.enunciado).map(numero)
/** A resposta (ou um erro) como o aluno digita: 219,8 ou '219,8' → 219.8. */
const valor = (v: string | number) => {
  expect(String(v), 'sem menos nem ponto decimal').toMatch(/^\d+(,\d+)?$/)
  return Number(String(v).replace(',', '.'))
}
const perto = (a: number, b: number) => Math.abs(a - b) < 1e-6
/** O erro mapeado para a resposta errada que vale `v`. */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => perto(valor(t), v))
  return k === undefined ? undefined : item.erros[k]
}

/** O perímetro andando pelos cantos. */
const volta = (pts: P[]) => pts.reduce((s, p, i) => s + Math.hypot(pts[(i + 1) % pts.length][0] - p[0], pts[(i + 1) % pts.length][1] - p[1]), 0)
/** A área pela fórmula do cadarço. */
const cadarco = (pts: P[]) => Math.abs(pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0)) / 2
/** O quanto o lado inclinado anda para o lado, sabendo o lado e a altura (inteiro, ou falha). */
const paraOLado = (s: number, h: number) => {
  const o = Math.sqrt(s * s - h * h)
  expect(Number.isInteger(o), `lado ${s} e altura ${h} não fecham um triângulo retângulo de lados inteiros`).toBe(true)
  return o
}
/** O inteiro x com x² = n, na força bruta (ou undefined). */
const raizInteira = (n: number) => {
  for (let x = 0; x <= 1000; x++) if (x * x === n) return x
  return undefined
}
/** Quantos quadradinhos da grade têm o centro dentro do polígono. */
function quadradinhos(pts: P[]): number {
  const dentro = ([x, y]: P) => {
    let c = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i]
      const [xj, yj] = pts[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
    }
    return c
  }
  let n = 0
  for (let x = -20; x < 20; x++) for (let y = -20; y < 20; y++) if (dentro([x + 0.5, y + 0.5])) n++
  return n
}

describe('U16 (aulas 5 a 8) · geradores', () => {
  it('12 geradores, 3 por aula, níveis 1 a 3; visual só no nível 1', () => {
    expect(GERADORES_U16B).toHaveLength(12)
    for (const aula of ['B.U16.A5', 'B.U16.A6', 'B.U16.A7', 'B.U16.A8']) {
      expect(GERADORES_U16B.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_U16B) {
      for (const item of itens(ger)) {
        if (ger.nivel > 1) expect(item.visual, ger.id).toBeUndefined()
        else expect(item.visual?.modelo, ger.id).toBe('figura')
      }
    }
  })
  it('nenhum erro vale a certa; sem hífen fora do TeX; medidas com espaço que não quebra', () => {
    for (const ger of GERADORES_U16B) {
      for (const item of itens(ger)) {
        const fora = (t: string) => t.replace(/\$[^$]*\$/g, '')
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          expect(fora(t), `${ger.id}: hífen no lugar do menos em "${t}"`).not.toMatch(/-/)
          expect(fora(t), `${ger.id}: unidade sem o espaço que não quebra em "${t}"`).not.toMatch(/\d (cm|m|cm²|m²|voltas)(?![\wÀ-ÿ²])/)
        }
        expect(item.dicas).toHaveLength(3)
        if (item.formato === 'escolha') {
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          continue
        }
        expect(item.formato).toBe('numero')
        const r = valor(item.resposta)
        expect(r, item.enunciado).toBeGreaterThan(0)
        // Um decimal vem como texto com vírgula, como o aluno digita; um inteiro, como número.
        if (typeof item.resposta === 'string') expect(item.resposta).toMatch(/,/)
        for (const t of Object.keys(item.erros)) expect(perto(valor(t), r), `${item.enunciado}: o erro "${t}" vale a certa`).toBe(false)
      }
    }
  })
  it('as contas de conferência batem com contas feitas à mão', () => {
    expect(volta([[0, 0], [5, 0], [5, 3], [0, 3]])).toBe(16)
    expect(cadarco([[0, 0], [6, 0], [9, 4], [3, 4]])).toBe(24)
    expect(cadarco([[0, 0], [8, 0], [3, 4]])).toBe(16)
    expect(quadradinhos([[0, 0], [6, 0], [6, 4], [0, 4]])).toBe(24)
    expect(paraOLado(5, 4)).toBe(3)
    expect(raizInteira(25)).toBe(5)
    expect(raizInteira(24)).toBeUndefined()
  })
})

describe('U16 · aula 5: perímetro', () => {
  it('perimetro-n1: o retângulo com o desenho dos quatro lados', () => {
    for (const item of itens(g('perimetro-n1'))) {
      const [b, h] = medidas(item)
      expect(b).not.toBe(h)
      const cantos: P[] = [[0, 0], [b, 0], [b, h], [0, h]]
      expect(item.resposta, item.enunciado).toBe(volta(cantos))
      expect(erroPara(item, b + h)).toBe('perimetro-esquece-lados')
      expect(erroPara(item, b * h)).toBe('confunde-area-perimetro')
      // O desenho: os lados escritos somam a volta.
      const e = item.visual!.estado as { poligono: { vertices: P[]; lados: number[] } }
      expect(e.poligono.lados.reduce((s, x) => s + x, 0)).toBe(item.resposta)
      expect(volta(e.poligono.vertices)).toBe(item.resposta)
    }
  })
  it('perimetro-n2: o quadrado, o polígono de lados iguais e o retângulo grande', () => {
    const vistos = { quadrado: 0, regular: 0, retangulo: 0 }
    for (const item of itens(g('perimetro-n2'))) {
      const fs = medidas(item)
      const r = item.resposta as number
      let m: RegExpMatchArray | null
      if (item.enunciado.startsWith('Um quadrado')) {
        vistos.quadrado++
        const [l] = fs
        expect(r).toBe(l + l + l + l)
        expect(erroPara(item, l * l)).toBe('confunde-area-perimetro')
        expect(erroPara(item, l + l)).toBe('perimetro-esquece-lados')
      } else if ((m = item.enunciado.match(/tem os (\d+) lados iguais/))) {
        vistos.regular++
        const n = Number(m[1])
        const nomes: Record<string, number> = { triângulo: 3, pentágono: 5, hexágono: 6, octógono: 8 }
        expect(nomes[item.enunciado.split(' ')[1]], 'o nome bate com o número de lados').toBe(n)
        expect(r).toBe(Array.from({ length: n }, () => fs[0]).reduce((s, x) => s + x, 0))
        expect(erroPara(item, fs[0])).toBe('perimetro-esquece-lados')
      } else {
        vistos.retangulo++
        const [b, h] = fs
        expect(r).toBe(volta([[0, 0], [b, 0], [b, h], [0, h]]))
        expect(erroPara(item, b + h)).toBe('perimetro-esquece-lados')
        expect(erroPara(item, b * h)).toBe('confunde-area-perimetro')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
  it('perimetro-n3: cerca com portão, rodapé com porta e a praça ao contrário', () => {
    const vistos = { cerca: 0, rodape: 0, praca: 0 }
    for (const item of itens(g('perimetro-n3'))) {
      const fs = medidas(item)
      const r = item.resposta as number
      if (item.enunciado.includes('praça')) {
        vistos.praca++
        const [p] = fs
        // O lado que, quatro vezes, dá a volta.
        let l = 0
        while (4 * l < p) l++
        expect(4 * l).toBe(p)
        expect(r).toBe(l)
        expect(erroPara(item, p / 2)).toBe('perimetro-esquece-lados')
        continue
      }
      const [b, h, vao] = fs
      if (item.enunciado.includes('cerca')) vistos.cerca++
      else {
        vistos.rodape++
        expect(vao).toBe(1)
      }
      expect(r, item.enunciado).toBe(volta([[0, 0], [b, 0], [b, h], [0, h]]) - vao)
      expect(erroPara(item, b + h - vao)).toBe('perimetro-esquece-lados')
      if (b * h - vao !== r) expect(erroPara(item, b * h - vao)).toBe('confunde-area-perimetro')
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})

describe('U16 · aula 6: área', () => {
  it('area-figuras-n1: o retângulo sobre a grade', () => {
    for (const item of itens(g('area-figuras-n1'))) {
      const [b, h] = medidas(item)
      const e = item.visual!.estado as { grade: boolean; poligono: { vertices: P[] } }
      expect(e.grade).toBe(true)
      // Contar os quadradinhos do desenho.
      expect(item.resposta, item.enunciado).toBe(quadradinhos(e.poligono.vertices))
      expect(item.resposta).toBe(cadarco([[0, 0], [b, 0], [b, h], [0, h]]))
      expect(erroPara(item, 2 * (b + h))).toBe('confunde-area-perimetro')
    }
  })
  /** Confere um paralelogramo ou um triângulo de base b, altura h e lado inclinado s. */
  const confere = (item: Item, tipo: 'paralelogramo' | 'triangulo', b: number, h: number, s: number | undefined) => {
    const o = s === undefined ? 0 : paraOLado(s, h)
    const cantos: P[] = tipo === 'paralelogramo' ? [[0, 0], [b, 0], [b + o, h], [o, h]] : [[0, 0], [b, 0], [o, h]]
    const area = cadarco(cantos)
    expect(item.resposta, item.enunciado).toBe(area)
    expect(Number.isInteger(area)).toBe(true)
    if (tipo === 'paralelogramo') expect(erroPara(item, b * s!)).toBe('area-com-o-lado-inclinado')
    else {
      expect(erroPara(item, b * h)).toBe('area-do-triangulo-sem-metade')
      if (s !== undefined) expect(erroPara(item, (b * s) / 2)).toBe('area-com-o-lado-inclinado')
      // O pé da altura cai dentro da base.
      expect(o).toBeLessThan(b)
    }
  }
  it('area-figuras-n2: o paralelogramo e o triângulo, com o lado inclinado dado', () => {
    const vistos = { paralelogramo: 0, triangulo: 0 }
    for (const item of itens(g('area-figuras-n2'))) {
      const [b, h, s] = medidas(item)
      expect(item.enunciado).toMatch(/em cm²\?$/)
      const tipo = item.enunciado.startsWith('Um paralelogramo') ? 'paralelogramo' : 'triangulo'
      vistos[tipo]++
      confere(item, tipo, b, h, s)
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('area-figuras-n3: a parede com janela, o terreno triangular e o canteiro torto', () => {
    const vistos = { parede: 0, terreno: 0, canteiro: 0 }
    for (const item of itens(g('area-figuras-n3'))) {
      const fs = medidas(item)
      if (item.enunciado.includes('parede')) {
        vistos.parede++
        const [w, hh, jw, jh] = fs
        expect(item.resposta, item.enunciado).toBe(cadarco([[0, 0], [w, 0], [w, hh], [0, hh]]) - cadarco([[0, 0], [jw, 0], [jw, jh], [0, jh]]))
        expect(jw).toBeLessThan(w)
        expect(jh).toBeLessThan(hh)
      } else if (item.enunciado.includes('triângulo')) {
        vistos.terreno++
        confere(item, 'triangulo', fs[0], fs[1], undefined)
      } else {
        vistos.canteiro++
        confere(item, 'paralelogramo', fs[0], fs[1], fs[2])
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})

describe('U16 · aula 7: círculo e π', () => {
  it('circulo-n1: a volta pelo diâmetro, com o círculo desenhado', () => {
    for (const item of itens(g('circulo-n1'))) {
      expect(item.enunciado).toContain('π ≈ 3,14')
      const [d] = medidas(item)
      expect(perto(valor(item.resposta), 3.14 * d), item.enunciado).toBe(true)
      expect(erroPara(item, 3.14 * (d / 2))).toBe('confunde-raio-diametro')
      expect(erroPara(item, 3 * d)).toBe('pi-e-3-14')
      const e = item.visual!.estado as { circulo: { diametroVisivel: boolean; diametroTexto: string } }
      expect(e.circulo.diametroVisivel).toBe(true)
      expect(numero(e.circulo.diametroTexto)).toBe(d)
    }
  })
  it('circulo-n2: a volta pelo raio, e o que é π', () => {
    const vistos = { raio: 0, pi: 0 }
    for (const item of itens(g('circulo-n2'))) {
      if (item.formato === 'escolha') {
        vistos.pi++
        const certa = item.opcoes![item.resposta as number]
        expect(certa).toMatch(/não acaba/)
        const erroDe = (re: RegExp) => item.erros[String(item.opcoes!.findIndex((o) => re.test(o)))]
        expect(erroDe(/exatamente 3,14/)).toBe('pi-e-3-14')
        expect(erroDe(/maior/)).toBe('pi-depende-do-tamanho')
        continue
      }
      vistos.raio++
      expect(item.enunciado).toMatch(/de raio/)
      const [r] = medidas(item)
      // O diâmetro tem dois raios.
      expect(perto(valor(item.resposta), 3.14 * (r + r)), item.enunciado).toBe(true)
      expect(erroPara(item, 3.14 * r)).toBe('confunde-raio-diametro')
      expect(erroPara(item, 3 * (r + r))).toBe('pi-e-3-14')
    }
    expect(vistos.pi).toBeGreaterThan(50)
    expect(vistos.raio).toBeGreaterThan(150)
  })
  it('circulo-n3: o diâmetro a partir da volta, e várias voltas', () => {
    const vistos = { inverso: 0, voltas: 0 }
    for (const item of itens(g('circulo-n3'))) {
      const fs = medidas(item)
      if (item.enunciado.startsWith('A volta')) {
        vistos.inverso++
        const [v] = fs
        const d = valor(item.resposta)
        expect(perto(3.14 * d, v), item.enunciado).toBe(true)
        if (Number.isInteger(d / 2)) expect(erroPara(item, d / 2)).toBe('confunde-raio-diametro')
      } else {
        vistos.voltas++
        const [d, n] = fs
        expect(negritos(item.enunciado)[1]).toMatch(/voltas$/)
        expect(perto(valor(item.resposta), n * 3.14 * d), item.enunciado).toBe(true)
        expect(erroPara(item, 3.14 * d), 'uma volta só').toBe('responde-outra-pergunta')
        expect(erroPara(item, n * 3 * d)).toBe('pi-e-3-14')
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
})

describe('U16 · aula 8: teorema de Pitágoras', () => {
  /** Hipotenusa: o inteiro cujo quadrado é a soma dos quadrados dos catetos. */
  const confereHipotenusa = (item: Item, a: number, b: number) => {
    const c = raizInteira(a * a + b * b)
    expect(c, `${item.enunciado}: os catetos não fecham uma terna inteira`).toBeDefined()
    expect(item.resposta, item.enunciado).toBe(c)
    expect(erroPara(item, a + b)).toBe('pitagoras-soma-os-lados')
    expect(erroPara(item, a * a + b * b)).toBe('pitagoras-esquece-a-raiz')
  }
  /** Cateto: o inteiro x com x² + a² = c². */
  const confereCateto = (item: Item, c: number, a: number) => {
    const x = raizInteira(c * c - a * a)
    expect(x, `${item.enunciado}: não fecha uma terna inteira`).toBeDefined()
    expect(item.resposta, item.enunciado).toBe(x)
    expect(erroPara(item, c - a)).toBe('pitagoras-soma-os-lados')
    expect(erroPara(item, c * c - a * a)).toBe('pitagoras-esquece-a-raiz')
  }
  it('pitagoras-n1: o 3-4-5 e seus múltiplos, com os quadrados desenhados', () => {
    for (const item of itens(g('pitagoras-n1'))) {
      const [a, b] = medidas(item)
      confereHipotenusa(item, a, b)
      // O desenho: um triângulo retângulo, com o canto reto marcado e os quadrados nos lados.
      const e = item.visual!.estado as { poligono: { vertices: P[]; angulosRetos: number[] }; quadradosNosLados: { areas: (number | string)[] } }
      const [v0, v1, v2] = e.poligono.vertices
      const [ux, uy, wx, wy] = [v1[0] - v0[0], v1[1] - v0[1], v2[0] - v0[0], v2[1] - v0[1]]
      expect(ux * wx + uy * wy, 'canto reto no canto 0').toBe(0)
      expect(e.poligono.angulosRetos).toEqual([0])
      const areas = e.quadradosNosLados.areas.filter((x): x is number => typeof x === 'number')
      expect(areas.sort((x, y) => x - y)).toEqual([a * a, b * b].sort((x, y) => x - y))
    }
  })
  it('pitagoras-n2: outras ternas e o cateto que falta', () => {
    const vistos = { hipotenusa: 0, cateto: 0 }
    for (const item of itens(g('pitagoras-n2'))) {
      const fs = medidas(item)
      if (item.enunciado.startsWith('Os catetos')) {
        vistos.hipotenusa++
        confereHipotenusa(item, fs[0], fs[1])
      } else {
        vistos.cateto++
        expect(item.enunciado).toMatch(/a hipotenusa mede/)
        confereCateto(item, fs[0], fs[1])
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(100)
  })
  it('pitagoras-n3: a escada, a tela e o esquadro do pedreiro', () => {
    const vistos = { escada: 0, tela: 0, esquadro: 0 }
    for (const item of itens(g('pitagoras-n3'))) {
      const fs = medidas(item)
      if (item.enunciado.includes('escada')) {
        vistos.escada++
        const [c, pe] = fs
        confereCateto(item, c, pe)
        expect(c).toBeLessThanOrEqual(10)
      } else {
        if (item.enunciado.includes('tela')) vistos.tela++
        else vistos.esquadro++
        confereHipotenusa(item, fs[0], fs[1])
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(60)
  })
})
