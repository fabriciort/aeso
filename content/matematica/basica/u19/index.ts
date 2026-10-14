import type { Aula } from '@/lib/formation/schema'
import { AULAS_U19A } from './parte-a'
import { AULAS_U19B } from './parte-b'

// As aulas da unidade 19, em ordem do currículo.
export const AULAS_U19: Aula[] = [...AULAS_U19A, ...AULAS_U19B]
