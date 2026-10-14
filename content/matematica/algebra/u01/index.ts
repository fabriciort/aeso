import type { Aula } from '@/lib/formation/schema'
import { AULAS_AF_U01A } from './parte-a'
import { AULAS_AF_U01B } from './parte-b'

// As aulas da unidade 1 de Álgebra e Funções, em ordem do currículo.
export const AULAS_AF_U01: Aula[] = [...AULAS_AF_U01A, ...AULAS_AF_U01B]
