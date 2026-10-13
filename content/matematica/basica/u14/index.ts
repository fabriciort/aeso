import type { Aula } from '@/lib/formation/schema'
import { AULAS_U14A } from './parte-a'
import { AULAS_U14B } from './parte-b'

// As aulas da unidade 14, em ordem do currículo.
export const AULAS_U14: Aula[] = [...AULAS_U14A, ...AULAS_U14B]
