import type { Aula } from '@/lib/formation/schema'
import { AULAS_U12A } from './parte-a'
import { AULAS_U12B } from './parte-b'

// As aulas da unidade 12, em ordem do currículo.
export const AULAS_U12: Aula[] = [...AULAS_U12A, ...AULAS_U12B]
