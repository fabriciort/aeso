import type { Aula } from '@/lib/formation/schema'
import { AULAS_U16A } from './parte-a'
import { AULAS_U16B } from './parte-b'

// As aulas da unidade 16, em ordem do currículo.
export const AULAS_U16: Aula[] = [...AULAS_U16A, ...AULAS_U16B]
