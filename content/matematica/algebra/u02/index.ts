import type { Aula } from '@/lib/formation/schema'
import { AULAS_AF_U02A } from './parte-a'
import { AULAS_AF_U02B } from './parte-b'

// As aulas da unidade 2 de Álgebra e Funções, em ordem do currículo.
export const AULAS_AF_U02: Aula[] = [...AULAS_AF_U02A, ...AULAS_AF_U02B]
