import type { Aula } from '@/lib/formation/schema'
import { AULAS_U15A } from './parte-a'
import { AULAS_U15B } from './parte-b'

// As aulas da unidade 15, em ordem do currículo.
export const AULAS_U15: Aula[] = [...AULAS_U15A, ...AULAS_U15B]
