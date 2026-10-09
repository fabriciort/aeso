import { describe, expect, it } from 'vitest'
import {
  diagnosticoAgrupamento, diagnosticoArredondamento, diagnosticoComparacao,
  diagnosticoNumerosGrandes, diagnosticoPosicao, GERADORES_U0,
  ROTEIRO_DIAGNOSTICO_ENTRADA, estudoApoio, estudoMaterial, estudoRetomada,
} from '@/content/matematica/geradores/estudo-diagnostico'
import { rng } from '@/lib/formation/rng'

const sementes = Array.from({ length: 500 }, (_, indice) => indice + 1)
const estudos = [estudoMaterial, estudoApoio, estudoRetomada]

// A regra é inferida do caso descrito no enunciado, sem importar as tabelas
// internas do gerador. Estes itens verificam decisões, não contas ou domínio.
function estrategiaDoCaso(enunciado: string): RegExp {
  if (enunciado.includes('tem papel')) return /Caderno quadriculado, lápis e borracha/
  if (enunciado.includes('sem caderno')) return /folha qualquer ou nas notas do celular/
  if (enunciado.includes('travou')) return /dica, tentar o próximo passo.*conferir/
  if (enunciado.includes('em silêncio')) return /voz desligada.*texto/
  if (enunciado.includes('Já sei isso')) return /direto aos exercícios.*sem ajuda/
  if (enunciado.includes('dias sem estudar')) return /questão antiga sem olhar.*conferir/
  if (enunciado.includes('viu a correção')) return /Fechar a resolução.*outra questão/
  throw new Error(`Caso de estudo sem regra independente: ${enunciado}`)
}

describe('U0: escolhas sobre o estudo', () => {
  for (const gerador of estudos) {
    it(`${gerador.id}: a estratégia corresponde à necessidade descrita`, () => {
      const casos = new Set<string>()
      const posicoesCorretas = new Set<number>()
      for (const semente of sementes) {
        const item = gerador.gerar(rng(semente))
        const regra = estrategiaDoCaso(item.enunciado)
        const adequadas = item.opcoes!.flatMap((opcao, indice) => regra.test(opcao) ? [indice] : [])
        expect(adequadas).toHaveLength(1)
        expect(item.resposta).toBe(adequadas[0])
        expect(new Set(item.opcoes).size).toBe(item.opcoes!.length)
        expect(Object.keys(item.erros).sort()).toEqual(item.opcoes!.flatMap((_, indice) => indice !== item.resposta ? [String(indice)] : []).sort())
        casos.add(item.enunciado)
        posicoesCorretas.add(Number(item.resposta))
      }
      expect(casos.size).toBeGreaterThanOrEqual(2)
      expect(posicoesCorretas.size).toBe(3)
    })
  }
})

describe('U0: primeira resposta diagnóstica calculada pelo enunciado', () => {
  it('conta cada pacote e preserva os parafusos soltos', () => {
    for (const semente of sementes) {
      const item = diagnosticoAgrupamento.gerar(rng(semente))
      const [, pacotes, porPacote, soltos] = item.enunciado.match(/Há (\d+) pacotes com (\d+) parafusos cada e mais (\d+) parafusos soltos/)!
      const contagem = Array.from({ length: Number(pacotes) }, () => Number(porPacote))
      expect(item.resposta).toBe(contagem.reduce((total, quantidade) => total + quantidade, Number(soltos)))
      expect(item.erros[String(Number(pacotes) + Number(soltos))]).toBe('conta-grupos-como-unidades')
      expect(item.erros[String(contagem.reduce((total, quantidade) => total + quantidade, 0))]).toBe('descarta-sobra')
      expect(item.visual?.estado.totalVisivel).toBe(false)
    }
  })

  it('usa a posição explícita mesmo quando o algarismo se repete', () => {
    let houveRepeticao = false
    for (const semente of sementes) {
      const item = diagnosticoPosicao.gerar(rng(semente))
      const [, numero, primeiro, algarismo] = item.enunciado.match(/Em (\d+), quanto vale o (primeiro )?(\d)\?/)!
      expect(numero[0]).toBe(algarismo)
      // Com o algarismo repetido (202), o enunciado diz qual: o primeiro.
      expect(Boolean(primeiro)).toBe(numero[0] === numero[2])
      const partes = numero.split('')
      const valorPeloTexto = Number(partes[0] + '0'.repeat(partes.length - 1))
      expect(item.resposta).toBe(valorPeloTexto)
      expect(numero[1]).toBe('0')
      expect(item.erros[algarismo]).toBe('valor-de-face')
      expect(item.visual?.estado.blocosVisiveis).toBe(false)
      expect(item.visual?.estado.casasRotuladas).toBe(false)
      houveRepeticao ||= numero[0] === numero[2]
    }
    expect(houveRepeticao).toBe(true)
  })

  it('compõe milhões e milhares pela escrita em classes de três algarismos', () => {
    for (const semente of sementes) {
      const item = diagnosticoNumerosGrandes.gerar(rng(semente))
      const [, milhoes, milhares] = item.enunciado.match(/é de (\d+) milhões e (\d+) mil reais/)!
      const escritoEmClasses = [milhoes, milhares.padStart(3, '0'), '000'].join('')
      expect(item.resposta).toBe(Number(escritoEmClasses))
      expect(Object.values(item.erros)).toEqual(['classe-errada', 'classe-errada'])
    }
  })

  it('compara quantidades inteiras, inclusive quando a última casa sugere o contrário', () => {
    const ordens = new Set<boolean>()
    for (const semente of sementes) {
      const item = diagnosticoComparacao.gerar(rng(semente))
      const [, primeiro, segundo] = item.enunciado.match(/tem (\d+) peças no estoque; outra, (\d+)/)!
      const numeros = [Number(primeiro), Number(segundo)]
      const ordenados = [...numeros].sort((a, b) => a - b)
      expect(item.resposta).toBe(ordenados[1])
      expect(ordenados[0] % 10).toBeGreaterThan(ordenados[1] % 10)
      expect(item.erros[String(ordenados[0])]).toBe('compara-pela-ultima-casa')
      ordens.add(numeros[0] > numeros[1])
    }
    expect(ordens.size).toBe(2)
  })

  it('arredonda o empate pela convenção declarada no próprio enunciado', () => {
    for (const semente of sementes) {
      const item = diagnosticoArredondamento.gerar(rng(semente))
      const [, valor] = item.enunciado.match(/custa R\$ (\d+)/)!
      const numero = Number(valor)
      const esperado = Math.round(numero / 10) * 10
      expect(item.enunciado).toContain('Se ficar no meio, vá para a maior')
      expect(numero % 10).toBe(5)
      expect(item.resposta).toBe(esperado)
      expect(Math.abs(esperado - numero)).toBe(5)
      expect(item.erros[String(esperado - 10)]).toBe('empate-para-baixo')
    }
  })
})

describe('U0: contrato e limites do piloto', () => {
  it('o roteiro propõe um slot para cada aula da U1, sem alegar avaliar outras unidades', () => {
    expect(ROTEIRO_DIAGNOSTICO_ENTRADA.map((slot) => slot.alvo)).toEqual(['B.U1.A1', 'B.U1.A2', 'B.U1.A3', 'B.U1.A4', 'B.U1.A5'])
    for (const slot of ROTEIRO_DIAGNOSTICO_ENTRADA) {
      expect(GERADORES_U0.find((gerador) => gerador.id === slot.gerador)?.aula).toBe('B.U0.A2')
    }
  })

  for (const gerador of GERADORES_U0) {
    it(`${gerador.id}: é determinístico, tem três dicas e deixa o nível 3 sem visual`, () => {
      const variedade = new Set<string>()
      for (const semente of sementes) {
        const item = gerador.gerar(rng(semente))
        expect(item).toEqual(gerador.gerar(rng(semente)))
        expect(item.dicas).toHaveLength(3)
        for (const texto of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) expect(texto.length).toBeLessThanOrEqual(140)
        expect(Object.keys(item.erros)).not.toContain(String(item.resposta))
        if (gerador.nivel === 3) expect(item.visual).toBeUndefined()
        else expect(item.visual?.esboco?.length).toBeGreaterThan(40)
        variedade.add(JSON.stringify([item.enunciado, item.opcoes]))
      }
      expect(variedade.size).toBeGreaterThan(5)
    })
  }
})
