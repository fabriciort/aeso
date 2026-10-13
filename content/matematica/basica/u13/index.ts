import type { Aula } from '@/lib/formation/schema'
import { AULAS_U13A } from './parte-a'
import { AULAS_U13B } from './parte-b'

// As aulas da unidade 13, em ordem do currículo.
export const AULAS_U13: Aula[] = [...AULAS_U13A, ...AULAS_U13B]
