import type { ErroComum } from '@/lib/formation/schema'

// Catálogo de erros comuns da formação. Cada erro tem um id estável, usado
// por opções de cartões e por exercícios para diagnosticar o que o aluno
// pensou. Um erro aparece aqui uma vez só, mesmo que volte em várias aulas.

export const ERROS: ErroComum[] = [
  {
    id: 'valor-de-face',
    nome: 'lê o algarismo, não o valor da casa',
    causa: 'Trata cada algarismo como o próprio número, sem considerar a posição.',
    exemplo: 'Em 4.072, diz que o 7 vale 7.',
    desmonte: 'Acender a casa das dezenas e mostrar as 7 barras de 10 embaixo dela: 7 dezenas são 70.',
  },
  {
    id: 'casa-errada',
    nome: 'erra a casa por uma posição',
    causa: 'Conta as casas a partir do lado errado, ou pula uma.',
    exemplo: 'Em 4.072, diz que o 7 vale 700.',
    desmonte: 'Rotular as casas da direita para a esquerda (U, D, C, M) e contar junto com o aluno.',
  },
  {
    id: 'concatena-casas',
    nome: 'escreve as casas coladas',
    causa: 'Escreve o número como se fala, juntando os pedaços: "seiscentos" (600) e "nove" (9).',
    exemplo: '"Seiscentos e nove" vira 6009.',
    desmonte: 'Montar no quadro posicional: 6 centenas, 0 dezenas, 9 unidades. O número tem três casas, não quatro.',
  },
  {
    id: 'esquece-zero',
    nome: 'esquece o zero que guarda o lugar',
    causa: 'Acha que o zero "não vale nada" e pode sumir.',
    exemplo: '"Seiscentos e nove" vira 69.',
    desmonte: 'Tirar o zero do quadro: o 6 escorrega para as dezenas e as 6 placas viram 6 barras. Sobram 69, um número bem menor.',
  },
]

export function getErro(id: string): ErroComum | undefined {
  return ERROS.find((e) => e.id === id)
}
