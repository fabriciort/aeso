import type { Aula } from '@/lib/formation/schema'
import { AULAS_U18A } from './parte-a'
import { AULAS_U18B } from './parte-b'

// As aulas da unidade 18, em ordem do currículo.
export const AULAS_U18: Aula[] = [...AULAS_U18A, ...AULAS_U18B]
