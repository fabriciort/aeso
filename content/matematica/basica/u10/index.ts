import type { Aula } from '@/lib/formation/schema'
import { AULAS_U10A } from './parte-a'
import { AULAS_U10B } from './parte-b'

// As aulas da unidade 10, em ordem do currículo.
export const AULAS_U10: Aula[] = [...AULAS_U10A, ...AULAS_U10B]
