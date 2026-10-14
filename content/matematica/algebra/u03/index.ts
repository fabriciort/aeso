import type { Aula } from '@/lib/formation/schema'
import { AULAS_AF_U03A } from './parte-a'
import { AULAS_AF_U03B } from './parte-b'

// As aulas da unidade 3 de Álgebra e Funções, em ordem do currículo.
export const AULAS_AF_U03: Aula[] = [...AULAS_AF_U03A, ...AULAS_AF_U03B]
