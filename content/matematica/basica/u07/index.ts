import type { Aula } from '@/lib/formation/schema'
import { AULAS_U07A } from './parte-a'
import { AULAS_U07B } from './parte-b'

// As aulas da unidade 7, em ordem do currículo.
export const AULAS_U07: Aula[] = [...AULAS_U07A, ...AULAS_U07B]
