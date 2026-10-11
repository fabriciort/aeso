import { describe, expect, it } from 'vitest'
import { numerosGrandesN1, numerosGrandesN2, numerosGrandesN3 } from '@/content/matematica/geradores/numeros-grandes'
import { rng } from '@/lib/formation/rng'
import type { Item, Rng } from '@/lib/formation/schema'

const geradores = [numerosGrandesN1, numerosGrandesN2, numerosGrandesN3]
const grupo = '(milhar|milhares|milhão|milhões|bilhão|bilhões)'

// Calcula por montagem das classes escritas no enunciado, sem a soma do gerador.
function lerClasses(item: Item): number {
  const classes = ['000', '000', '000', '000']
  const posicao: Record<string, number> = { bilhão: 0, bilhões: 0, milhão: 1, milhões: 1, milhar: 2, milhares: 2 }
  for (const match of item.enunciado.matchAll(new RegExp(`(\\d+) ${grupo}`, 'g'))) {
    classes[posicao[match[2]]] = match[1].padStart(3, '0')
  }
  const unidades = item.enunciado.match(/(\d+) (?:unidades|reais)/)!
  classes[3] = unidades[1].padStart(3, '0')
  return Number(classes.join(''))
}

function roteiro(inteiros: number[], escolhas: number[] = []): Rng {
  let i = 0
  let j = 0
  return { int: () => inteiros[i++], pick: <T>(items: readonly T[]) => items[escolhas[j++] ?? 0], next: () => 0 }
}

describe('números grandes: classes de três e separadores declarados', () => {
  for (const gerador of geradores) {
    it(`${gerador.id}: 300 respostas conferidas a partir do enunciado`, () => {
      const vistos = new Set<string>()
      const formatos = new Set<string>()
      const indices = new Set<number>()
      for (let seed = 1; seed <= 300; seed++) {
        const item = gerador.gerar(rng(seed))
        if (item.formato === 'escolha') {
          const registro = item.enunciado.match(/aparece o número ([\d,]+)\./)![1]
          const esperado = Number(registro.replace(/,/g, ''))
          const selecionada = item.opcoes![Number(item.resposta)]
          expect(selecionada).toMatch(/^\d{1,3}(?:\.\d{3})+$/)
          expect(Number(selecionada.replace(/\./g, ''))).toBe(esperado)
          expect(item.enunciado).toContain('em inglês')
          expect(new Set(item.opcoes).size).toBe(item.opcoes!.length)
          expect(Object.values(item.erros).sort()).toEqual(['classe-errada', 'separador-decimal'])
          for (const chave of Object.keys(item.erros)) {
            expect(Number(chave)).toBeGreaterThanOrEqual(0)
            expect(Number(chave)).toBeLessThan(item.opcoes!.length)
          }
          indices.add(Number(item.resposta))
        } else {
          const esperado = lerClasses(item)
          expect(item.resposta).toBe(esperado)
          for (const chave of Object.keys(item.erros)) expect(Number(chave)).not.toBe(esperado)
          expect(Object.values(item.erros)).toContain('classe-errada')
          expect(Object.values(item.erros)).toContain('concatena-casas')
          for (const erro of Object.values(item.erros)) {
            expect(['classe-errada', 'concatena-casas', 'esquece-zero']).toContain(erro)
          }
        }
        expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
        for (const texto of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) expect(texto.length).toBeLessThanOrEqual(140)
        expect(item.dicas).toHaveLength(3)
        if (gerador.nivel === 3) {
          expect(item.visual).toBeUndefined()
          expect(item.enunciado).not.toMatch(/imaginad/i)
        } else {
          expect(item.visual?.estado.numero).toBeNull()
          expect(item.visual?.estado.preenchimento).toEqual([])
        }
        vistos.add(item.enunciado)
        formatos.add(item.formato)
      }
      expect(vistos.size).toBeGreaterThan(30)
      if (gerador.nivel === 2) {
        expect(formatos).toEqual(new Set(['numero', 'escolha']))
        expect(indices).toEqual(new Set([0, 1, 2]))
      }
    })

    it(`${gerador.id}: determinismo em várias sementes e sequências`, () => {
      for (const seed of [0, 1, 42, 300, 65_535]) {
        const a = rng(seed)
        const b = rng(seed)
        for (let i = 0; i < 5; i++) expect(gerador.gerar(a)).toEqual(gerador.gerar(b))
      }
    })
  }

  it('preserva classes vazias entre milhões, bilhões e unidades', () => {
    expect(numerosGrandesN1.gerar(roteiro([1, 0])).resposta).toBe(1_000)
    const milhao = numerosGrandesN2.gerar(roteiro([1, 7], [0, 0]))
    expect(milhao.resposta).toBe(1_000_007)
    expect(milhao.erros['17']).toBe('esquece-zero')
    expect(numerosGrandesN2.gerar(roteiro([2, 0], [0, 1])).resposta).toBe(2_000_000_000)
    expect(numerosGrandesN3.gerar(roteiro([2, 0, 7], [0])).resposta).toBe(2_000_007)
    expect(numerosGrandesN3.gerar(roteiro([2, 0, 7], [1])).resposta).toBe(2_000_000_007)
    expect(numerosGrandesN3.gerar(roteiro([9, 99, 99], [1])).resposta).toBe(9_099_000_099)
  })

  it('interpreta 12,500 explicitamente como milhar inglês e traduz para 12.500', () => {
    for (const giro of [0, 1, 2]) {
      const item = numerosGrandesN2.gerar(roteiro([12, 500, giro], [1]))
      expect(item.enunciado).toContain('12,500')
      expect(item.opcoes![Number(item.resposta)]).toBe('12.500')
      const indiceVirgula = item.opcoes!.indexOf('12,500')
      expect(item.erros[String(indiceVirgula)]).toBe('separador-decimal')
      expect(item.resposta).not.toBe(indiceVirgula)
    }
  })

  it('preserva um diagnóstico quando deslocar classe e omitir zeros produzem a mesma resposta', () => {
    const item = numerosGrandesN3.gerar(roteiro([1, 0, 23], [0]))
    expect(item.resposta).toBe(1_000_023)
    expect(item.erros['1023']).toBe('classe-errada')
    expect(Object.values(item.erros)).toEqual(['classe-errada', 'concatena-casas'])
  })
})
