import type { Aula } from '@/lib/formation/schema'
import { AULAS_U08A } from './parte-a'
import { AULAS_U08B } from './parte-b'

// As aulas da unidade 8, em ordem do currículo.
export const AULAS_U08: Aula[] = [...AULAS_U08A, ...AULAS_U08B]
