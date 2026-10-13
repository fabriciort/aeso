import { describe, expect, it } from 'vitest'
import { GERADORES_U16A } from '@/content/matematica/geradores/geometria-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (ou o desenho, no nível 1) e refaz a conta por
// conta própria, sem usar as funções do gerador: o tipo do ângulo pela
// comparação com 90° e 180°, os ponteiros pelo giro de 30° por hora, o
// ângulo de um triângulo desenhado pelas coordenadas dos pontos, e a soma
// dos ângulos de um polígono pelos ângulos de fora (que sempre dão uma
// volta: 180 · n − 360).

const g = (id: string) => GERADORES_U16A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))
const NB = ' '

// ---------------------------------------------------------------- ajudas

const TIPOS = ['agudo', 'reto', 'obtuso', 'raso']
/** O tipo do ângulo, pela comparação com o reto e o raso. */
function classe(graus: number): string {
  if (graus > 0 && graus < 90) return 'agudo'
  if (graus === 90) return 'reto'
  if (graus > 90 && graus < 180) return 'obtuso'
  expect(graus, 'ângulo fora de 0 a 180').toBe(180)
  return 'raso'
}
/** O ângulo entre os ponteiros numa hora cheia: o das horas anda 30° por hora, o dos minutos fica no 12. */
function ponteiros(h: number): number {
  const giro = (h * 30) % 360
  return Math.min(giro, 360 - giro)
}
/** O ângulo no vértice V, entre os pontos P e Q, em graus. */
function anguloEm(V: number[], P: number[], Q: number[]): number {
  const u = [P[0] - V[0], P[1] - V[1]]
  const w = [Q[0] - V[0], Q[1] - V[1]]
  return (Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]))) * 180) / Math.PI
}
/** A soma dos ângulos de um polígono de n lados: os ângulos de fora dão uma volta, e cada par dentro + fora é meia volta. */
const somaPoligono = (n: number) => 180 * n - 360

function errosDiferentes(item: Item) {
  if (item.formato === 'escolha') {
    for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
    expect(new Set(item.opcoes).size, 'opções repetidas').toBe(item.opcoes!.length)
    return
  }
  for (const k of Object.keys(item.erros)) expect(Number(k), `${k} vale a resposta: ${item.enunciado}`).not.toBe(Number(item.resposta))
}
const erroDe = (item: Item, v: number) => Object.entries(item.erros).find(([k]) => Number(k) === v)?.[1]
const foraDoTex = (t: string) => t.replace(/\$[^$]*\$/g, '')
/** Na escolha: a certa é a do texto esperado, e todas as outras apontam para o erro. */
function escolhaBate(item: Item, certa: string, erro: string) {
  expect(item.formato).toBe('escolha')
  expect(item.opcoes![item.resposta as number], item.enunciado).toBe(certa)
  item.opcoes!.forEach((_, i) => i !== item.resposta && expect(item.erros[String(i)], `${item.enunciado} › ${item.opcoes![i]}`).toBe(erro))
}
const graus = (t: string) => [...t.matchAll(/(\d+)°/g)].map((m) => Number(m[1]))

type AnguloV = { graus: number; inicio?: number; em?: number[]; comprimento?: number }

describe('U16 (aulas 1 a 4) · geradores', () => {
  it('12 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U16A).toHaveLength(12)
    for (const aula of ['B.U16.A1', 'B.U16.A2', 'B.U16.A3', 'B.U16.A4']) {
      expect(GERADORES_U16A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('erros diferentes da certa, visual só no nível 1, o menos verdadeiro fora do TeX, espaço que não quebra e o grau colado', () => {
    for (const ger of GERADORES_U16A) {
      for (const item of itens(ger)) {
        errosDiferentes(item)
        if (ger.nivel === 1) expect(item.visual, `${ger.id}: o nível 1 tem visual`).toBeDefined()
        else expect(item.visual, `${ger.id}: os níveis 2 e 3 não têm visual`).toBeUndefined()
        if (item.visual) expect(item.visual.modelo).toBe('figura')
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          expect(foraDoTex(t), `sem hífen no lugar do menos: ${t}`).not.toMatch(/-/)
          expect(t, `unidades com espaço que não quebra: ${t}`).not.toMatch(/\d (cm|m|h)\b/)
          expect(t, `o grau colado ao número: ${t}`).not.toMatch(/\d\s+°/)
        }
        expect(item.enunciado.replace(/\$/g, '').length, item.enunciado).toBeLessThanOrEqual(140)
        if (item.formato === 'numero') {
          // Graus e contagens: inteiros e positivos.
          expect(Number.isInteger(Number(item.resposta)), item.enunciado).toBe(true)
          expect(Number(item.resposta)).toBeGreaterThan(0)
        }
      }
    }
  })
})

// ---------------------------------------------------------------- aula 1

describe('U16 · aula 1: ponto, reta, ângulo', () => {
  it('tipo-de-angulo-n1: o tipo do ângulo desenhado e qual de dois abre mais', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('tipo-de-angulo-n1'))) {
      const e = item.visual!.estado as { angulo: AnguloV | AnguloV[] }
      if (item.enunciado === 'Este ângulo é agudo, reto, obtuso ou raso?') {
        const a = e.angulo as AnguloV
        tipos.add(classe(a.graus))
        expect(item.opcoes).toEqual(TIPOS)
        escolhaBate(item, classe(a.graus), 'troca-tipo-de-angulo')
        continue
      }
      expect(item.enunciado).toBe('Qual dos dois ângulos abre mais?')
      tipos.add('dois')
      const [a1, a2] = e.angulo as AnguloV[]
      expect(a1.graus).not.toBe(a2.graus)
      const maior = a1.graus > a2.graus ? 0 : 1
      escolhaBate(item, `O ângulo ${maior + 1}`, 'angulo-pelo-tamanho-dos-lados')
      // A armadilha: o que abre mais tem os lados mais curtos.
      const [cMaior, cMenor] = maior === 0 ? [a1.comprimento!, a2.comprimento!] : [a2.comprimento!, a1.comprimento!]
      expect(cMaior).toBeLessThan(cMenor)
      // Os dois não se encostam: o fim do primeiro fica antes do começo do segundo.
      const fim1 = Math.max(a1.comprimento!, a1.comprimento! * Math.cos((a1.graus * Math.PI) / 180))
      const comeco2 = a2.em![0] + Math.min(0, a2.comprimento! * Math.cos((a2.graus * Math.PI) / 180))
      expect(comeco2 - fim1).toBeGreaterThan(0.5)
    }
    expect(tipos).toEqual(new Set(['agudo', 'reto', 'obtuso', 'raso', 'dois']))
  })

  it('tipo-de-angulo-n2: os ponteiros nas horas cheias e o ângulo descrito', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('tipo-de-angulo-n2'))) {
      expect(item.opcoes).toEqual(TIPOS)
      const h = item.enunciado.match(/^(?:À 1 hora|Às (\d+) horas), os ponteiros do relógio formam um ângulo\. Ele é agudo, reto, obtuso ou raso\?$/)
      if (h) {
        const hora = h[1] ? Number(h[1]) : 1
        if (h[1]) expect(hora >= 2 && hora <= 11, item.enunciado).toBe(true)
        tipos.add(`relógio ${classe(ponteiros(hora))}`)
        escolhaBate(item, classe(ponteiros(hora)), 'troca-tipo-de-angulo')
        continue
      }
      const d = item.enunciado.match(/^Um ângulo (.+)\. Ele é agudo, reto, obtuso ou raso\?$/)
      expect(d, item.enunciado).not.toBeNull()
      const t = d![1]
      // Pelas palavras: primeiro o que passa do reto (que também fala de meia volta e de linha).
      const certa = /mais que o canto|passa do canto/.test(t) ? 'obtuso' : /menos que o canto|cabe dentro/.test(t) ? 'agudo' : /igual ao canto|quarto de volta/.test(t) ? 'reto' : /em linha|meia volta/.test(t) ? 'raso' : '?'
      tipos.add(`descrito ${certa}`)
      escolhaBate(item, certa, 'troca-tipo-de-angulo')
    }
    for (const t of TIPOS) {
      expect(tipos.has(`relógio ${t}`), t).toBe(true)
      expect(tipos.has(`descrito ${t}`), t).toBe(true)
    }
  })

  it('tipo-de-angulo-n3: segmento, reta ou semirreta; lados medidos que não decidem; os ponteiros à tarde', () => {
    const tipos = new Set<string>()
    const ORDEM = ['agudo', 'reto', 'obtuso', 'raso']
    for (const item of itens(g('tipo-de-angulo-n3'))) {
      const l = item.enunciado.match(/^A linha (.+) Ela é um segmento, uma reta ou uma semirreta\?$/)
      if (l) {
        const t = l[1]
        const certa = /para nos dois pontos/.test(t) ? 'um segmento' : /começa em/.test(t) ? 'uma semirreta' : /sem fim para os dois lados/.test(t) ? 'uma reta' : '?'
        tipos.add(certa)
        expect(item.opcoes).toEqual(['um segmento', 'uma reta', 'uma semirreta'])
        escolhaBate(item, certa, 'confunde-reta-e-segmento')
        continue
      }
      const s = item.enunciado.match(new RegExp(`^O ângulo A tem lados de (\\d+)${NB}cm e é (\\w+)\\. O ângulo B tem lados de (\\d+)${NB}cm e é (\\w+)\\. Qual abre mais\\?$`))
      if (s) {
        tipos.add('lados')
        const [lA, tA, lB, tB] = [Number(s[1]), s[2], Number(s[3]), s[4]]
        expect(ORDEM.indexOf(tA)).toBeGreaterThanOrEqual(0)
        expect(ORDEM.indexOf(tB)).toBeGreaterThanOrEqual(0)
        expect(tA).not.toBe(tB)
        const aMaior = ORDEM.indexOf(tA) > ORDEM.indexOf(tB)
        escolhaBate(item, aMaior ? 'O ângulo A' : 'O ângulo B', 'angulo-pelo-tamanho-dos-lados')
        // A armadilha: o de lados mais compridos é o que abre menos.
        expect(aMaior ? lA < lB : lB < lA).toBe(true)
        continue
      }
      const h = item.enunciado.match(new RegExp(`^Às (\\d+)${NB}h, os ponteiros do relógio formam um ângulo\\. Ele é agudo, reto, obtuso ou raso\\?$`))
      expect(h, item.enunciado).not.toBeNull()
      const hora = Number(h![1])
      expect(hora).toBeGreaterThan(12)
      expect(hora).toBeLessThan(24)
      tipos.add('tarde')
      expect(item.opcoes).toEqual(TIPOS)
      escolhaBate(item, classe(ponteiros(hora)), 'troca-tipo-de-angulo')
    }
    expect(tipos).toEqual(new Set(['um segmento', 'uma reta', 'uma semirreta', 'lados', 'tarde']))
  })
})

// ---------------------------------------------------------------- aula 2

describe('U16 · aula 2: medir ângulos', () => {
  it('medir-angulo-n1: o ângulo no transferidor, de 10 em 10, virado para os dois lados', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('medir-angulo-n1'))) {
      expect(item.enunciado).toBe('Quantos graus mede este ângulo?')
      const e = item.visual!.estado as { angulo: AnguloV; transferidor: boolean | { invertido?: boolean } }
      const medida = Math.abs(e.angulo.graus)
      expect(item.resposta).toBe(medida)
      // Os números do transferidor são de 10 em 10, e o 90 é igual nas duas escalas.
      expect(medida % 10).toBe(0)
      expect(medida).not.toBe(90)
      expect(erroDe(item, 180 - medida)).toBe('le-escala-de-fora')
      // Virado para a esquerda, o lado deitado aponta para 180° e a escala certa é a de fora.
      const virado = e.angulo.inicio === 180
      tipos.add(virado ? 'esquerda' : 'direita')
      expect(typeof e.transferidor === 'object' && e.transferidor.invertido === true).toBe(virado)
      if (virado) expect(e.angulo.graus).toBeLessThan(0)
    }
    expect(tipos).toEqual(new Set(['esquerda', 'direita']))
  })

  it('medir-angulo-n2: as duas escalas em palavras e o tipo pelos graus', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('medir-angulo-n2'))) {
      const s = item.enunciado.match(/^Sobre o lado deitado, a escala de (dentro|fora) marca 0\. O outro lado passa no (\d+) de dentro e no (\d+) de fora\. Quanto mede o ângulo\?$/)
      if (s) {
        tipos.add(`escala ${s[1]}`)
        const [dentro, fora] = [Number(s[2]), Number(s[3])]
        // As duas escalas andam em sentidos contrários: somam 180.
        expect(dentro + fora).toBe(180)
        const certa = s[1] === 'dentro' ? dentro : fora
        expect(item.resposta).toBe(certa)
        expect(erroDe(item, 180 - certa)).toBe('le-escala-de-fora')
        continue
      }
      const t = item.enunciado.match(/^Um ângulo mede (\d+)°\. Ele é agudo, reto, obtuso ou raso\?$/)
      expect(t, item.enunciado).not.toBeNull()
      const c = classe(Number(t![1]))
      tipos.add(c)
      expect(item.opcoes).toEqual(TIPOS)
      escolhaBate(item, c, 'troca-tipo-de-angulo')
    }
    expect(tipos).toEqual(new Set(['escala dentro', 'escala fora', 'agudo', 'reto', 'obtuso', 'raso']))
  })

  it('medir-angulo-n3: o que falta num canto reto ou numa reta, e o canto da fatia de pizza', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('medir-angulo-n3'))) {
      const r = item.enunciado.match(/^Um canto reto foi dividido em dois ângulos\. Um deles mede (\d+)°\. Quanto mede o outro\?$/)
      if (r) {
        tipos.add('reto')
        const a = Number(r[1])
        expect(Number(item.resposta) + a).toBe(90)
        expect(erroDe(item, 180 - a)).toBe('confunde-reto-e-raso')
        continue
      }
      const s = item.enunciado.match(/^Uma semirreta sai de um ponto de uma reta e faz (\d+)° com ela\. Quanto mede o ângulo do outro lado\?$/)
      if (s) {
        tipos.add('reta')
        const a = Number(s[1])
        expect(Number(item.resposta) + a).toBe(180)
        if (a < 90) expect(erroDe(item, 90 - a)).toBe('confunde-reto-e-raso')
        continue
      }
      const p = item.enunciado.match(/^Uma pizza foi cortada do centro em (\d+) fatias iguais\. Quantos graus tem o canto de cada fatia, no centro\?$/)
      expect(p, item.enunciado).not.toBeNull()
      tipos.add('pizza')
      const n = Number(p![1])
      // Fatia por fatia, os cantos dão a volta inteira.
      let volta = 0
      for (let i = 0; i < n; i++) volta += Number(item.resposta)
      expect(volta).toBe(360)
      if ((180 / n) % 1 === 0) expect(erroDe(item, 180 / n)).toBe('confunde-volta-e-meia-volta')
    }
    expect(tipos).toEqual(new Set(['reto', 'reta', 'pizza']))
  })
})

// ---------------------------------------------------------------- aula 3

describe('U16 · aula 3: triângulos e os 180°', () => {
  it('terceiro-angulo-n1: o triângulo desenhado tem mesmo os ângulos escritos', () => {
    for (const item of itens(g('terceiro-angulo-n1'))) {
      const m = item.enunciado.match(/^Dois ângulos do triângulo medem (\d+)° e (\d+)°\. Quanto mede o terceiro\?$/)
      expect(m, item.enunciado).not.toBeNull()
      const [a, b] = [Number(m![1]), Number(m![2])]
      const e = item.visual!.estado as { pontos: Record<string, number[]>; poligono: { vertices: string[]; angulos: unknown[] } }
      const { A, B, C } = e.pontos
      expect(e.poligono.angulos).toEqual([a, b, '?'])
      // As coordenadas: o ângulo em A e em B batem com os números, e o terceiro é a resposta.
      expect(anguloEm(A, B, C)).toBeCloseTo(a, 0)
      expect(anguloEm(B, C, A)).toBeCloseTo(b, 0)
      expect(anguloEm(C, A, B)).toBeCloseTo(Number(item.resposta), 0)
      expect(Number(item.resposta)).toBeGreaterThanOrEqual(25)
      expect(erroDe(item, 360 - a - b)).toBe('triangulo-soma-360')
      if (a + b !== item.resposta) expect(erroDe(item, a + b)).toBe('operacao-trocada')
      // O triângulo cabe no palco: não fica alto demais.
      expect(C[1]).toBeLessThanOrEqual(9)
    }
  })

  it('terceiro-angulo-n2: o triângulo retângulo e os dois ângulos iguais', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('terceiro-angulo-n2'))) {
      const x = Number(item.resposta)
      const r = item.enunciado.match(/^Um triângulo retângulo tem um ângulo de (\d+)°\. Quanto mede o outro ângulo agudo\?$/)
      if (r) {
        tipos.add('retângulo')
        const a = Number(r[1])
        expect(90 + a + x).toBe(180)
        expect(x).toBeLessThan(90)
        expect(erroDe(item, 180 - a)).toBe('esquece-um-angulo-na-soma')
        continue
      }
      const i = item.enunciado.match(/^Num triângulo, dois ângulos são iguais e o terceiro mede (\d+)°\. Quanto mede cada um dos iguais\?$/)
      if (i) {
        tipos.add('iguais')
        const t = Number(i[1])
        expect(x + x + t).toBe(180)
        expect(erroDe(item, 180 - t)).toBe('esquece-de-dividir')
        continue
      }
      const d = item.enunciado.match(/^Num triângulo, dois ângulos medem (\d+)° cada um\. Quanto mede o terceiro\?$/)
      expect(d, item.enunciado).not.toBeNull()
      tipos.add('terceiro')
      const e = Number(d![1])
      expect(e + e + x).toBe(180)
      expect(erroDe(item, 180 - e)).toBe('esquece-um-angulo-na-soma')
    }
    expect(tipos).toEqual(new Set(['retângulo', 'iguais', 'terceiro']))
  })

  it('terceiro-angulo-n3: a escada, o telhado e x, 2x e 3x', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('terceiro-angulo-n3'))) {
      const x = Number(item.resposta)
      const e = item.enunciado.match(/^A escada encostada na parede faz (\d+)° com o chão\. A parede faz um canto reto com o chão\. Que ângulo a escada faz com a parede\?$/)
      if (e) {
        tipos.add('escada')
        const a = Number(e[1])
        expect(a + 90 + x).toBe(180)
        expect(erroDe(item, 180 - a)).toBe('esquece-um-angulo-na-soma')
        continue
      }
      const t = item.enunciado.match(/^A tesoura do telhado tem a ponta de cima com (\d+)° e os dois cantos de baixo iguais\. Quanto mede cada canto de baixo\?$/)
      if (t) {
        tipos.add('telhado')
        const p = Number(t[1])
        expect(p + x + x).toBe(180)
        expect(erroDe(item, 180 - p)).toBe('esquece-de-dividir')
        continue
      }
      const m = item.enunciado.match(/^Os ângulos de um triângulo medem \$\{(\d*)x\}\$, \$\{(\d*)x\}\$ e \$\{(\d*)x\}\$, em graus\. Quanto vale \$x\$\?$/)
      expect(m, item.enunciado).not.toBeNull()
      tipos.add('x')
      const ks = [m![1], m![2], m![3]].map((k) => (k === '' ? 1 : Number(k)))
      // Troca o x pela resposta: os três ângulos somam 180, e cada um cabe num triângulo.
      expect(ks.reduce((s, k) => s + k * x, 0)).toBe(180)
      for (const k of ks) expect(k * x).toBeLessThan(180)
      const s = ks[0] + ks[1] + ks[2]
      if ((360 / s) % 1 === 0) expect(erroDe(item, 360 / s)).toBe('triangulo-soma-360')
    }
    expect(tipos).toEqual(new Set(['escada', 'telhado', 'x']))
  })
})

// ---------------------------------------------------------------- aula 4

const NOMES = ['triângulo', 'quadrilátero', 'pentágono', 'hexágono']

describe('U16 · aula 4: polígonos', () => {
  it('poligono-n1: o nome do polígono desenhado e os triângulos das diagonais', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('poligono-n1'))) {
      const e = item.visual!.estado as { poligono: { vertices: number[][] }; poligonos?: { vertices: number[][] }[] }
      const n = e.poligono.vertices.length
      if (item.enunciado === 'Como se chama este polígono?') {
        tipos.add(`nome ${n}`)
        expect(item.opcoes).toEqual(NOMES)
        escolhaBate(item, NOMES[n - 3], 'troca-nome-do-poligono')
        continue
      }
      const m = item.enunciado.match(/^As diagonais saem de um vértice deste polígono de (\d+) lados\. Quantos triângulos elas formam\?$/)
      expect(m, item.enunciado).not.toBeNull()
      tipos.add('diagonais')
      expect(Number(m![1])).toBe(n)
      // Os triângulos desenhados: todos saem do mesmo vértice e cobrem o polígono.
      const tri = e.poligonos!
      expect(item.resposta).toBe(tri.length)
      for (const t of tri) expect(t.vertices[0]).toEqual(e.poligono.vertices[0])
      // Somando os ângulos dos triângulos, dá a soma do polígono.
      const somaTri = tri.reduce((s, t) => s + anguloEm(t.vertices[0], t.vertices[1], t.vertices[2]) + anguloEm(t.vertices[1], t.vertices[2], t.vertices[0]) + anguloEm(t.vertices[2], t.vertices[0], t.vertices[1]), 0)
      expect(somaTri).toBeCloseTo(somaPoligono(n), 3)
      expect(erroDe(item, n)).toBe('triangulos-demais')
    }
    expect(tipos).toEqual(new Set(['nome 3', 'nome 4', 'nome 5', 'nome 6', 'diagonais']))
  })

  it('poligono-n2: a soma dos ângulos e o canto do polígono regular', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('poligono-n2'))) {
      const x = Number(item.resposta)
      const s = item.enunciado.match(/^Quanto somam os ângulos de um polígono de (\d+) lados\?$/)
      if (s) {
        tipos.add('soma')
        const n = Number(s[1])
        expect(x).toBe(somaPoligono(n))
        expect(erroDe(item, 180 * n)).toBe('triangulos-demais')
        if (n > 3) expect(erroDe(item, 180)).toBe('poligono-soma-180')
        continue
      }
      const r = item.enunciado.match(/^Um polígono regular tem (\d+) lados\. Quanto mede cada um dos seus ângulos\?$/)
      expect(r, item.enunciado).not.toBeNull()
      tipos.add('regular')
      const n = Number(r![1])
      // Cada canto de dentro mais o de fora é meia volta; os de fora dão uma volta.
      expect(x + 360 / n).toBe(180)
      expect(erroDe(item, somaPoligono(n))).toBe('esquece-de-dividir')
    }
    expect(tipos).toEqual(new Set(['soma', 'regular']))
  })

  it('poligono-n3: o ângulo que falta no quadrilátero e no pentágono, e o canto dos objetos', () => {
    const tipos = new Set<string>()
    const LADOS: [RegExp, number][] = [
      [/hexágono/, 6],
      [/octógono/, 8],
      [/pentágono/, 5],
      [/10 lados/, 10],
      [/triângulo/, 3],
      [/quadrado/, 4],
    ]
    for (const item of itens(g('poligono-n3'))) {
      const x = Number(item.resposta)
      const f = item.enunciado.match(/^(Três|Quatro) ângulos de um (quadrilátero|pentágono) medem (.+)\. Quanto mede o (quarto|quinto)\?$/)
      if (f) {
        const n = f[2] === 'quadrilátero' ? 4 : 5
        tipos.add(f[2])
        expect(f[1]).toBe(n === 4 ? 'Três' : 'Quatro')
        expect(f[4]).toBe(n === 4 ? 'quarto' : 'quinto')
        const conhecidos = graus(f[3])
        expect(conhecidos).toHaveLength(n - 1)
        const total = conhecidos.reduce((s, v) => s + v, 0)
        expect(total + x).toBe(somaPoligono(n))
        // Todos os ângulos cabem num polígono sem bico para dentro.
        for (const v of [...conhecidos, x]) {
          expect(v).toBeGreaterThan(0)
          expect(v).toBeLessThan(180)
        }
        expect(erroDe(item, 180 * n - total)).toBe('triangulos-demais')
        continue
      }
      const o = item.enunciado.match(/^(.+)\. Quanto mede cada um dos seus ângulos\?$/)
      expect(o, item.enunciado).not.toBeNull()
      const achado = LADOS.find(([re]) => re.test(o![1]))
      expect(achado, o![1]).toBeDefined()
      const n = achado![1]
      tipos.add('objeto')
      expect(x + 360 / n).toBe(180)
      expect(erroDe(item, somaPoligono(n))).toBe('esquece-de-dividir')
    }
    expect(tipos).toEqual(new Set(['quadrilátero', 'pentágono', 'objeto']))
  })
})
