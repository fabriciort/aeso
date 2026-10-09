import type { Aula, Gerador } from '@/lib/formation/schema'
import { aula as B_U1_A2 } from './basica/u01/a02-zero-guarda-lugar'
import { palavrasParaNumero, valorDoAlgarismo } from './geradores/valor-posicional'

// Índice do conteúdo da formação. Toda aula e todo gerador novo entra aqui;
// os testes (tests/conteudo.test.ts) validam tudo o que estiver listado.

export const AULAS: Aula[] = [B_U1_A2]

export const GERADORES: Gerador[] = [valorDoAlgarismo, palavrasParaNumero]

export { ERROS } from './erros'

export const getAula = (id: string) => AULAS.find((a) => a.id === id)
export const getGerador = (id: string) => GERADORES.find((g) => g.id === id)
