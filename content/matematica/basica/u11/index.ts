import type { Aula } from '@/lib/formation/schema'
import { AULAS_U11A } from './parte-a'
import { AULAS_U11B } from './parte-b'

// As aulas da unidade 11, em ordem do currículo.
export const AULAS_U11: Aula[] = [...AULAS_U11A, ...AULAS_U11B]
