import type { Aula } from '@/lib/formation/schema'
import { AULAS_U09A } from './parte-a'
import { AULAS_U09B } from './parte-b'

// As aulas da unidade 9, em ordem do currículo.
export const AULAS_U09: Aula[] = [...AULAS_U09A, ...AULAS_U09B]
