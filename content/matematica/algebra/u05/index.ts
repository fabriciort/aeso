import type { Aula } from '@/lib/formation/schema'
import { AULAS_AF_U05A } from './parte-a'
import { AULAS_AF_U05B } from './parte-b'

// As aulas da unidade 5 de Álgebra e Funções, em ordem do currículo.
export const AULAS_AF_U05: Aula[] = [...AULAS_AF_U05A, ...AULAS_AF_U05B]
