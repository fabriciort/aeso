import { describe, expect, it } from 'vitest'
import { GERADORES_U13A } from '@/content/matematica/geradores/potencias-a'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê os números do enunciado (as potências em TeX, os trechos em
// negrito) e refaz a conta por conta própria, com BigInt e sem usar as
// funções do gerador. Os decimais (0,01) são comparados como frações
// exatas: 0,01 = 1/100.

const g = (id: string) => GERADORES_U13A.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

/** b elevado a e (e ≥ 0), em BigInt. */
const P = (b: number | bigint, e: number) => BigInt(b) ** BigInt(e)

/** Uma fração exata [numerador, denominador]. */
type Fr = [bigint, bigint]
/** "0,25" → 25/100; "−3" ou "-3" → −3/1; 12 → 12/1. */
function fracao(v: string | number): Fr {
  const s = String(v).replace('−', '-').replace(/\./g, '')
  const m = s.match(/^(-?)(\d+)(?:,(\d+))?$/)
  expect(m, `número mal escrito: ${v}`).not.toBeNull()
  const dec = m![3] ?? ''
  const num = BigInt(m![2] + dec) * (m![1] ? -BigInt(1) : BigInt(1))
  return [num, BigInt(10) ** BigInt(dec.length)]
}
const igual = (a: Fr, b: Fr) => a[0] * b[1] === b[0] * a[1]
/** b elevado a e, também com e negativo, como fração. */
const potFr = (b: number, e: number): Fr => (e >= 0 ? [P(b, e), BigInt(1)] : [BigInt(1), P(b, -e)])

/** As chaves de `erros` nunca valem o mesmo que a resposta certa. */
function errosDiferentes(item: Item) {
  if (item.formato === 'escolha') {
    for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
    return
  }
  const certa = fracao(item.resposta)
  for (const k of Object.keys(item.erros)) expect(igual(fracao(k), certa), `${k} vale a resposta ${item.resposta}: ${item.enunciado}`).toBe(false)
}
/** O erro previsto para esta resposta digitada (comparada como número). */
const erroDe = (item: Item, valor: string | number | bigint) => Object.entries(item.erros).find(([k]) => igual(fracao(k), fracao(String(valor))))?.[1]
/** O texto fora do TeX. */
const foraDoTex = (t: string) => t.replace(/\$[^$]*\$/g, '')

describe('U13 (aulas 1 a 3) · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3', () => {
    expect(GERADORES_U13A).toHaveLength(9)
    for (const aula of ['B.U13.A1', 'B.U13.A2', 'B.U13.A3']) {
      expect(GERADORES_U13A.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
  })
  it('erros diferentes da certa, visual nos níveis 1 e só neles, e o menos verdadeiro fora do TeX', () => {
    for (const ger of GERADORES_U13A) {
      for (const item of itens(ger)) {
        errosDiferentes(item)
        if (ger.nivel === 1) expect(item.visual, `${ger.id}: o nível 1 tem visual`).toBeDefined()
        if (ger.nivel === 3) expect(item.visual).toBeUndefined()
        expect(foraDoTex(item.enunciado), 'sem hífen no lugar do menos').not.toMatch(/-/)
        for (const d of item.dicas) expect(foraDoTex(d), 'sem hífen no lugar do menos').not.toMatch(/-/)
        // Todo número que o aluno digita é um inteiro ou um decimal com vírgula.
        if (item.formato === 'numero') fracao(item.resposta)
        // Na aula 3, o teclado sempre tem a tecla do menos (para não entregar o sinal).
        if (ger.aula === 'B.U13.A3') expect(item.sinal, `${ger.id}: ${item.enunciado}`).toBe(true)
      }
    }
  })
})

// ---------------------------------------------------------------- aula 1

describe('U13 · aula 1: potência', () => {
  it('potencia-n1: o quadrado, a potência por extenso e o expoente de um produto', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('potencia-n1'))) {
      const q = item.enunciado.match(/^Quanto é \$\{(\d+)\^\{2\}\}\\text\{\?\}\$ Conte os quadradinhos do quadrado\.$/)
      if (q) {
        tipos.add('quadrado')
        const b = Number(q[1])
        const e = item.visual!.estado as { linhas: number; colunas: number }
        expect(item.visual!.modelo).toBe('retangulo')
        expect([e.linhas, e.colunas]).toEqual([b, b])
        // Os quadradinhos contados um por um.
        let n = 0
        for (let i = 0; i < e.linhas; i++) for (let j = 0; j < e.colunas; j++) n++
        expect(item.resposta).toBe(n)
        if (2 * b !== n) expect(erroDe(item, 2 * b)).toBe('potencia-multiplica-base-pelo-expoente')
        continue
      }
      const p = item.enunciado.match(/^Quanto é \$\{(\d+)\^\{(\d+)\}\}\\text\{\?\}\$$/)
      if (p) {
        tipos.add('potencia')
        const [b, e] = [Number(p[1]), Number(p[2])]
        expect(BigInt(item.resposta)).toBe(P(b, e))
        // Por extenso na tela: e fatores b.
        const linhas = (item.visual!.estado as { expressao: string[] }).expressao
        expect(linhas[linhas.length - 1].split(' × ')).toEqual(Array(e).fill(String(b)))
        if (BigInt(b * e) !== P(b, e)) expect(erroDe(item, b * e)).toBe('potencia-multiplica-base-pelo-expoente')
        continue
      }
      const x = item.enunciado.match(/^Escreva \$\{(.+)\}\$ como potência de \*\*(\d+)\*\*\. Qual é o expoente\?$/)
      expect(x, item.enunciado).not.toBeNull()
      tipos.add('expoente')
      const fatores = x![1].split(' \\times ')
      expect(new Set(fatores)).toEqual(new Set([x![2]]))
      expect(item.resposta).toBe(fatores.length)
    }
    expect(tipos).toEqual(new Set(['quadrado', 'potencia', 'expoente']))
  })

  it('potencia-n2: potências de 10, o expoente de um número com zeros e potências maiores', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('potencia-n2'))) {
      const p = item.enunciado.match(/^Quanto é \$\{(\d+)\^\{(\d+)\}\}\\text\{\?\}\$$/)
      if (p) {
        const [b, e] = [Number(p[1]), Number(p[2])]
        tipos.add(b === 10 ? 'dez' : 'maior')
        expect(BigInt(item.resposta)).toBe(P(b, e))
        if (b === 10) {
          // O 1 seguido de e zeros.
          expect(String(item.resposta)).toBe('1' + '0'.repeat(e))
          expect(erroDe(item, 10 * e)).toBe('potencia-multiplica-base-pelo-expoente')
          expect(erroDe(item, P(10, e - 1))).toBe('conta-zeros-errado')
          expect(erroDe(item, P(10, e + 1))).toBe('conta-zeros-errado')
        } else if (BigInt(b * e) !== P(b, e)) expect(erroDe(item, b * e)).toBe('potencia-multiplica-base-pelo-expoente')
        continue
      }
      const z = item.enunciado.match(/^\*\*([\d.]+)\*\* é 10 elevado a quanto\?$/)
      expect(z, item.enunciado).not.toBeNull()
      tipos.add('volta')
      const v = z![1]
      expect(v, 'ponto do milhar de três em três').toMatch(/^\d{1,3}(\.\d{3})*$/)
      const n = BigInt(v.replace(/\./g, ''))
      expect(n).toBe(P(10, item.resposta as number))
      expect(erroDe(item, (item.resposta as number) + 1)).toBe('conta-zeros-errado')
    }
    expect(tipos).toEqual(new Set(['dez', 'volta', 'maior']))
  })

  it('potencia-n3: papel dobrado, notícia, bactérias e caixa cúbica', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('potencia-n3'))) {
      const t = item.enunciado
      let certa: bigint
      let base: number
      let expoente: number
      let m
      if ((m = t.match(/^Você dobra uma folha ao meio \*\*(\d+)\*\* vezes\. Quantas camadas ficam\?$/))) {
        tipos.add('folha')
        // Cada dobra dobra as camadas.
        let camadas = BigInt(1)
        for (let i = 0; i < Number(m[1]); i++) camadas *= BigInt(2)
        ;[certa, base, expoente] = [camadas, 2, Number(m[1])]
      } else if ((m = t.match(/^Você conta uma notícia a \*\*(\d+)\*\* pessoas, e cada uma conta a \*\*(\d+)\*\* novas\. Quantas pessoas ouvem na rodada \*\*(\d+)\*\*\?$/))) {
        tipos.add('noticia')
        expect(m[1]).toBe(m[2])
        let pessoas = BigInt(m[1])
        for (let i = 2; i <= Number(m[3]); i++) pessoas *= BigInt(m[2])
        ;[certa, base, expoente] = [pessoas, Number(m[1]), Number(m[3])]
      } else if ((m = t.match(/^Uma bactéria vira \*\*2\*\* a cada hora, e cada nova faz o mesmo\. Começando com \*\*1\*\*, quantas há depois de \*\*(\d+)\*\* horas\?$/))) {
        tipos.add('bacterias')
        let n = BigInt(1)
        for (let i = 0; i < Number(m[1]); i++) n += n
        ;[certa, base, expoente] = [n, 2, Number(m[1])]
      } else {
        m = t.match(/^Uma caixa em forma de cubo tem \*\*(\d+)\*\* cubinhos em cada lado\. Quantos cubinhos cabem nela\?$/)
        expect(m, t).not.toBeNull()
        tipos.add('cubo')
        const b = BigInt(m![1])
        ;[certa, base, expoente] = [b * b * b, Number(m![1]), 3]
      }
      expect(BigInt(item.resposta)).toBe(certa)
      if (BigInt(base * expoente) !== certa) expect(erroDe(item, base * expoente)).toBe('potencia-multiplica-base-pelo-expoente')
    }
    expect(tipos).toEqual(new Set(['folha', 'noticia', 'bacterias', 'cubo']))
  })
})

// ---------------------------------------------------------------- aula 2

describe('U13 · aula 2: propriedades sem decorar', () => {
  /** Que expoente x faz bˣ valer v (uma fração)? */
  function expoenteDe(b: number, v: Fr): number {
    for (let x = -30; x <= 60; x++) if (igual(potFr(b, x), v)) return x
    throw new Error(`${v} não é potência de ${b}`)
  }

  it('propriedades-n1: produto e divisão de mesma base, com a conta por extenso', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('propriedades-n1'))) {
      const m = item.enunciado.match(/^\$\{(\d+)\^\{(\d+)\} \\(times|div) (\d+)\^\{(\d+)\}\}\$ é \*\*(\d+)\*\* elevado a quanto\?$/)
      expect(m, item.enunciado).not.toBeNull()
      const [b, a, op, b2, c, base] = [Number(m![1]), Number(m![2]), m![3], Number(m![4]), Number(m![5]), Number(m![6])]
      expect(b2).toBe(b)
      expect(base).toBe(b)
      tipos.add(op)
      // Pelos valores: bᵃ × bᶜ (ou ÷) tem de ser b elevado à resposta.
      const v: Fr = op === 'times' ? [P(b, a) * P(b, c), BigInt(1)] : [P(b, a), P(b, c)]
      expect(item.resposta).toBe(expoenteDe(b, v))
      // Por extenso: a fatores b e c fatores b.
      const extenso = (item.visual!.estado as { expressao: string[] }).expressao[1]
      // A conta do meio, fora dos parênteses, separa os dois grupos.
      let fundo = 0
      let meio = -1
      ;[...extenso].forEach((ch, i) => {
        if (ch === '(') fundo++
        else if (ch === ')') fundo--
        else if (fundo === 0 && ch === (op === 'times' ? '×' : '÷') && meio < 0) meio = i
      })
      const [esq, dir] = [extenso.slice(0, meio), extenso.slice(meio + 1)]
      const conta = (s: string) => s.replace(/[()]/g, '').trim().split(' × ').filter((x) => x === String(b)).length
      expect(conta(esq)).toBe(a)
      expect(conta(dir)).toBe(c)
      if (op === 'times') {
        if (a * c !== a + c) expect(erroDe(item, a * c)).toBe('potencia-multiplica-expoentes')
      } else expect(erroDe(item, a + c)).toBe('potencia-soma-expoentes-na-divisao')
    }
    expect(tipos).toEqual(new Set(['times', 'div']))
  })

  it('propriedades-n2: potência de potência, três potências e os parênteses', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('propriedades-n2'))) {
      const t = item.enunciado
      let m
      if ((m = t.match(/^\$\{\((\d+)\^\{(\d+)\}\)\^\{(\d+)\}\}\$ é \*\*(\d+)\*\* elevado a quanto\?$/))) {
        tipos.add('potencia de potencia')
        const [b, a, c] = [Number(m[1]), Number(m[2]), Number(m[3])]
        expect(Number(m[4])).toBe(b)
        expect(item.resposta).toBe(expoenteDe(b, [P(P(b, a), c), BigInt(1)]))
        if (a + c !== a * c) expect(erroDe(item, a + c)).toBe('potencia-de-potencia-soma')
      } else if ((m = t.match(/^\$\{(\d+)\^\{(\d+)\} \\times (\d+)\^\{(\d+)\} \\div (\d+)\^\{(\d+)\}\}\$ é \*\*(\d+)\*\* elevado a quanto\?$/))) {
        tipos.add('tres')
        const b = Number(m[1])
        expect([m[3], m[5], m[7]].map(Number)).toEqual([b, b, b])
        const [a, c, d] = [Number(m[2]), Number(m[4]), Number(m[6])]
        expect(item.resposta).toBe(expoenteDe(b, [P(b, a) * P(b, c), P(b, d)]))
        expect(item.resposta as number).toBeGreaterThan(0)
        expect(erroDe(item, a + c + d)).toBe('potencia-soma-expoentes-na-divisao')
      } else {
        m = t.match(/^Quanto é \$\{(\(-\d+\)|-\d+)\^\{(\d+)\}\}\\text\{\?\}\$$/)
        expect(m, t).not.toBeNull()
        const e = Number(m![2])
        expect(e % 2, 'expoente par: os parênteses mudam o sinal').toBe(0)
        const entre = m![1].startsWith('(')
        const k = Number(m![1].replace(/[()-]/g, ''))
        tipos.add(entre ? 'entre' : 'fora')
        // Com parênteses, a base é −k; sem, só o k é elevado e o menos vem depois.
        const certa = entre ? P(-k, e) : -P(k, e)
        expect(BigInt(item.resposta)).toBe(certa)
        expect(item.sinal, 'a resposta pode ser negativa').toBe(true)
        expect(erroDe(item, -certa)).toBe('potencia-sinal-fora-dos-parenteses')
      }
    }
    expect(tipos).toEqual(new Set(['potencia de potencia', 'tres', 'entre', 'fora']))
  })

  it('propriedades-n3: bases diferentes, qual conta dá a potência e as caixas de parafusos', () => {
    const tipos = new Set<string>()
    /** O valor de uma opção: bᵃ × cᵈ, (bᵃ)ᶜ ou bᵃ ÷ bᶜ. */
    function valor(o: string): Fr {
      let m
      if ((m = o.match(/^\$\{(\d+)\^\{(\d+)\} \\times (\d+)\^\{(\d+)\}\}\$$/))) return [P(Number(m[1]), Number(m[2])) * P(Number(m[3]), Number(m[4])), BigInt(1)]
      if ((m = o.match(/^\$\{\((\d+)\^\{(\d+)\}\)\^\{(\d+)\}\}\$$/))) return [P(P(Number(m[1]), Number(m[2])), Number(m[3])), BigInt(1)]
      m = o.match(/^\$\{(\d+)\^\{(\d+)\} \\div (\d+)\^\{(\d+)\}\}\$$/)
      expect(m, o).not.toBeNull()
      return [P(Number(m![1]), Number(m![2])), P(Number(m![3]), Number(m![4]))]
    }
    for (const item of itens(g('propriedades-n3'))) {
      const t = item.enunciado
      let m
      if ((m = t.match(/^Quanto é \$\{(\d+)\^\{(\d+)\} \\times (\d+)\^\{(\d+)\}\}\\text\{\?\}\$$/))) {
        tipos.add('bases diferentes')
        const [a, e1, c, e2] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]
        expect(a).not.toBe(c)
        expect(BigInt(item.resposta)).toBe(P(a, e1) * P(c, e2))
        expect(erroDe(item, P(a * c, e1 + e2))).toBe('potencia-junta-bases-diferentes')
      } else if ((m = t.match(/^Qual conta dá \$\{(\d+)\^\{(\d+)\}\}\\text\{\?\}\$$/))) {
        tipos.add('escolha')
        expect(item.formato).toBe('escolha')
        const alvo = potFr(Number(m[1]), Number(m[2]))
        const certas = item.opcoes!.map((o, i) => (igual(valor(o), alvo) ? i : -1)).filter((i) => i >= 0)
        expect(certas, item.opcoes!.join(' | ')).toEqual([item.resposta])
        expect(new Set(Object.values(item.erros))).toEqual(new Set(['potencia-de-potencia-soma', 'potencia-multiplica-expoentes', 'potencia-junta-bases-diferentes']))
      } else if ((m = t.match(/^Um depósito tem \$10\^\{(\d+)\}\$ caixas com \$10\^\{(\d+)\}\$ parafusos cada\. O total de parafusos é 10 elevado a quanto\?$/))) {
        tipos.add('total')
        const total = P(10, Number(m[1])) * P(10, Number(m[2]))
        expect(String(total)).toBe('1' + '0'.repeat(item.resposta as number))
      } else {
        m = t.match(/^Você tem \$10\^\{(\d+)\}\$ parafusos para pôr em caixas de \$10\^\{(\d+)\}\$\. O número de caixas é 10 elevado a quanto\?$/)
        expect(m, t).not.toBeNull()
        tipos.add('caixas')
        const caixas = P(10, Number(m![1])) / P(10, Number(m![2]))
        expect(String(caixas)).toBe('1' + '0'.repeat(item.resposta as number))
      }
    }
    expect(tipos).toEqual(new Set(['bases diferentes', 'escolha', 'total', 'caixas']))
  })
})

// ---------------------------------------------------------------- aula 3

describe('U13 · aula 3: expoente zero e negativo', () => {
  it('expoente-zero-negativo-n1: o valor que falta na tabela', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('expoente-zero-negativo-n1'))) {
      const m = item.enunciado.match(/^Siga o padrão da tabela: quanto é \$\{(\d+)\^\{(0|-1)\}\}\\text\{\?\}\$( Escreva como decimal\.)?$/)
      expect(m, item.enunciado).not.toBeNull()
      const [b, e] = [Number(m![1]), Number(m![2])]
      tipos.add(String(e))
      // A tabela: cada valor é o anterior dividido pela base, e o último é o "?".
      const linhas = (item.visual!.estado as { tabela: { linhas: { valores: (number | string)[] }[] } }).tabela.linhas
      const valores = linhas[1].valores
      expect(valores[valores.length - 1]).toBe('?')
      for (let i = 1; i < valores.length - 1; i++) {
        const [a, c] = [fracao(valores[i - 1]), fracao(valores[i])]
        expect(igual([a[0], a[1] * BigInt(b)], c), `${valores[i - 1]} ÷ ${b} = ${valores[i]}`).toBe(true)
      }
      // Seguindo o padrão um passo além.
      const ant = fracao(valores[valores.length - 2])
      expect(igual(fracao(item.resposta), [ant[0], ant[1] * BigInt(b)])).toBe(true)
      expect(igual(fracao(item.resposta), potFr(b, e))).toBe(true)
      if (e === 0) expect(erroDe(item, 0)).toBe('expoente-zero-da-zero')
      if (e === -1) expect(erroDe(item, -b)).toBe('expoente-negativo-da-negativo')
    }
    expect(tipos).toEqual(new Set(['0', '-1']))
  })

  it('expoente-zero-negativo-n2: base elevada a zero, 10 e 2 com expoente negativo, e o expoente de um decimal', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('expoente-zero-negativo-n2'))) {
      const t = item.enunciado
      let m
      if ((m = t.match(/^Quanto é \$\{(\d+)\^\{0\}\}\\text\{\?\}\$$/))) {
        tipos.add('zero')
        expect(Number(m[1])).toBeGreaterThan(0)
        // bᵏ ÷ bᵏ = 1, para qualquer k: o padrão da tabela.
        expect(igual(fracao(item.resposta), [P(Number(m[1]), 3), P(Number(m[1]), 3)])).toBe(true)
        expect(erroDe(item, 0)).toBe('expoente-zero-da-zero')
      } else if ((m = t.match(/^Escreva \$\{(10|2)\^\{-(\d+)\}\}\$ como decimal\.$/))) {
        tipos.add(m[1])
        const [b, k] = [Number(m[1]), Number(m[2])]
        expect(String(item.resposta)).toMatch(/^0,\d+$/)
        expect(igual(fracao(item.resposta), [BigInt(1), P(b, k)])).toBe(true)
        expect(erroDe(item, -P(b, k))).toBe('expoente-negativo-da-negativo')
      } else {
        m = t.match(/^\*\*(0,\d+)\*\* é 10 elevado a quanto\?$/)
        expect(m, t).not.toBeNull()
        tipos.add('volta')
        const e = item.resposta as number
        expect(e).toBeLessThan(0)
        expect(igual(fracao(m![1]), potFr(10, e))).toBe(true)
        expect(erroDe(item, -e)).toBe('esquece-sinal-do-resultado')
      }
    }
    expect(tipos).toEqual(new Set(['zero', '10', '2', 'volta']))
  })

  it('expoente-zero-negativo-n3: a divisão que dá zero no expoente, o produto e as unidades', () => {
    const tipos = new Set<string>()
    for (const item of itens(g('expoente-zero-negativo-n3'))) {
      const t = item.enunciado
      let m
      if ((m = t.match(/^Quanto é \$\{(\d+)\^\{(\d+)\} \\div (\d+)\^\{(\d+)\}\}\\text\{\?\}\$$/))) {
        tipos.add('divisao')
        expect([m[3], m[4]]).toEqual([m[1], m[2]])
        const v = P(Number(m[1]), Number(m[2]))
        expect(igual(fracao(item.resposta), [v, v])).toBe(true)
        expect(erroDe(item, 0)).toBe('expoente-zero-da-zero')
      } else if ((m = t.match(/^Escreva \$\{10\^\{(\d+)\} \\times 10\^\{-(\d+)\}\}\$ como decimal\.$/))) {
        tipos.add('produto')
        const [a, c] = [Number(m[1]), Number(m[2])]
        expect(c).toBeGreaterThan(a)
        expect(String(item.resposta)).toMatch(/^0,\d+$/)
        expect(igual(fracao(item.resposta), [P(10, a), P(10, c)])).toBe(true)
      } else {
        m = t.match(/^1 (k?m) tem \*\*([\d.]+)\*\* (d?c?m{1,2}|m)\. Então 1 (km|dm|cm|mm) é \$\{10\^\{\?\}\}\$ m\. Qual é o expoente\?$/)
        expect(m, t).not.toBeNull()
        tipos.add(m![4])
        const n = BigInt(m![2].replace(/\./g, ''))
        // 1 km = n m (expoente positivo); 1 m = n dm, cm ou mm (a unidade é 1/n do metro).
        const valorEmMetros: Fr = m![1] === 'km' ? [n, BigInt(1)] : [BigInt(1), n]
        expect(m![1] === 'km' ? m![3] : m![4]).toBe(m![1] === 'km' ? 'm' : m![3])
        const e = item.resposta as number
        expect(igual(potFr(10, e), valorEmMetros)).toBe(true)
        expect(erroDe(item, -e)).toBe('converte-no-sentido-errado')
      }
    }
    expect(tipos).toEqual(new Set(['divisao', 'produto', 'km', 'dm', 'cm', 'mm']))
  })
})
