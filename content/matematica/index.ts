import type { Aula, Gerador } from '@/lib/formation/schema'
import { aula as B_U0_A1 } from './basica/u00/a01-como-funciona'
import { aula as B_U0_A2 } from './basica/u00/a02-diagnostico-entrada'
import { aula as B_U1_A1 } from './basica/u01/a01-agrupar-dez'
import { aula as B_U1_A2 } from './basica/u01/a02-zero-guarda-lugar'
import { aula as B_U1_A3 } from './basica/u01/a03-numeros-grandes'
import { aula as B_U1_A4 } from './basica/u01/a04-comparar-reta'
import { aula as B_U1_A5 } from './basica/u01/a05-arredondar-estimar'
import { GERADORES_U0 } from './geradores/estudo-diagnostico'
import { agrupamentoN1, agrupamentoN2, agrupamentoN3 } from './geradores/agrupamento'
import { leituraComZero, palavrasParaNumero, valorDoAlgarismo, valorPosicionalSozinho } from './geradores/valor-posicional'
import { numerosGrandesN1, numerosGrandesN2, numerosGrandesN3 } from './geradores/numeros-grandes'
import { compararN1, compararN2, compararN3 } from './geradores/comparar'
import { arredondarN1, arredondarN2, arredondarN3 } from './geradores/arredondar'

// Índice em ordem do currículo; os testes validam cada aula e cada gerador.
export const AULAS: Aula[] = [B_U0_A1, B_U0_A2, B_U1_A1, B_U1_A2, B_U1_A3, B_U1_A4, B_U1_A5]

export const GERADORES: Gerador[] = [
  ...GERADORES_U0,
  agrupamentoN1, agrupamentoN2, agrupamentoN3,
  valorDoAlgarismo, palavrasParaNumero, leituraComZero, valorPosicionalSozinho,
  numerosGrandesN1, numerosGrandesN2, numerosGrandesN3,
  compararN1, compararN2, compararN3,
  arredondarN1, arredondarN2, arredondarN3,
]

export { ERROS } from './erros'
export { ESBOCOS_CHECKPOINTS, ESBOCO_REVISAO_PILOTO } from './basica/piloto'
export { ROTEIRO_DIAGNOSTICO_ENTRADA } from './geradores/estudo-diagnostico'

export const getAula = (id: string) => AULAS.find((a) => a.id === id)
export const getGerador = (id: string) => GERADORES.find((g) => g.id === id)
