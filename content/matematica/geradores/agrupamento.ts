import type { Gerador, Item } from '@/lib/formation/schema'

const escrito = (n: number) => n.toLocaleString('pt-BR')

function contar(grupos: number, tamanho: number, soltas: number, nivel: 1 | 2 | 3): Item {
  const total = grupos * tamanho + soltas
  const erros: Record<string, string> = {
    [String(grupos + soltas)]: 'conta-grupos-como-unidades',
  }
  // Perder um grupo numa troca altera o total; não é uma troca equivalente.
  if (nivel > 1) erros[String(total - tamanho)] = 'troca-incompleta'
  const sobraNaDezena = grupos * tamanho + soltas * 10
  if (soltas > 0 && !(String(sobraNaDezena) in erros)) {
    erros[String(sobraNaDezena)] = 'sobra-na-casa-errada'
  }
  if (soltas > 0 && !(String(grupos * tamanho) in erros)) {
    erros[String(grupos * tamanho)] = 'descarta-sobra'
  }
  return {
    enunciado: nivel === 3
      ? `Chegaram ${grupos} caixas com ${escrito(tamanho)} peças cada, e mais ${soltas} peças soltas. Quantas peças são ao todo?`
      : `São ${grupos} grupos de ${escrito(tamanho)} e ${soltas} unidades soltas. Quantas unidades ao todo?`,
    formato: 'numero',
    resposta: total,
    erros,
    dicas: [
      'Cada grupo vale todas as peças que tem dentro.',
      `Conte primeiro os ${grupos} grupos de ${escrito(tamanho)}. Depois some as ${soltas} soltas.`,
      `${grupos} grupos de ${escrito(tamanho)} dão ${escrito(grupos * tamanho)}. Com mais ${soltas} soltas, são ${escrito(total)}.`,
    ],
    ...(nivel < 3 ? {
      visual: {
        modelo: 'blocos' as const,
        estado: { grupos, unidadesPorGrupo: tamanho, unidadesSoltas: soltas, total: null, trocasFeitas: 0 },
        esboco: nivel === 1
          ? 'Mostre barras de dez cubos e os cubos soltos. Não exiba o total; ao conferir, abra as barras e conte.'
          : 'Mostre os grupos ainda sem troca, em lotes de dez. O aluno prevê o total antes de reagrupar; revele a equivalência ao conferir.',
      },
    } : {}),
  }
}

export const agrupamentoN1: Gerador = {
  id: 'agrupamento-n1',
  aula: 'B.U1.A1',
  nivel: 1,
  gerar(r) {
    return contar(r.int(1, 9), 10, r.int(0, 9), 1)
  },
}

export const agrupamentoN2: Gerador = {
  id: 'agrupamento-n2',
  aula: 'B.U1.A1',
  nivel: 2,
  gerar(r) {
    const tamanho = r.pick([10, 100])
    return contar(r.int(10, 19), tamanho, r.int(0, 9), 2)
  },
}

export const agrupamentoN3: Gerador = {
  id: 'agrupamento-n3',
  aula: 'B.U1.A1',
  nivel: 3,
  gerar(r) {
    const tamanho = r.pick([10, 100, 1_000])
    // Até quatro algarismos: leitura de classes maiores vem em B.U1.A3.
    return contar(r.int(2, tamanho === 1_000 ? 9 : 99), tamanho, r.int(0, 9), 3)
  },
}
