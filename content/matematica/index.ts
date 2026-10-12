import type { Aula, Gerador } from '@/lib/formation/schema'
import { aula as B_U0_A1 } from './basica/u00/a01-como-funciona'
import { aula as B_U0_A2 } from './basica/u00/a02-diagnostico-entrada'
import { aula as B_U1_A1 } from './basica/u01/a01-agrupar-dez'
import { aula as B_U1_A2 } from './basica/u01/a02-zero-guarda-lugar'
import { aula as B_U1_A3 } from './basica/u01/a03-numeros-grandes'
import { aula as B_U1_A4 } from './basica/u01/a04-comparar-reta'
import { aula as B_U1_A5 } from './basica/u01/a05-arredondar-estimar'
import { aula as B_U2_A1 } from './basica/u02/a01-juntar-tirar'
import { aula as B_U2_A2 } from './basica/u02/a02-contas-de-cabeca'
import { aula as B_U2_A3 } from './basica/u02/a03-adicao-armada'
import { aula as B_U2_A4 } from './basica/u02/a04-subtracao-armada'
import { aula as B_U2_A5 } from './basica/u02/a05-conferir'
import { GERADORES_U0 } from './geradores/estudo-diagnostico'
import { agrupamentoN1, agrupamentoN2, agrupamentoN3 } from './geradores/agrupamento'
import { leituraComZero, palavrasParaNumero, valorDoAlgarismo, valorPosicionalSozinho } from './geradores/valor-posicional'
import { numerosGrandesN1, numerosGrandesN2, numerosGrandesN3 } from './geradores/numeros-grandes'
import { compararN1, compararN2, compararN3 } from './geradores/comparar'
import { arredondarN1, arredondarN2, arredondarN3 } from './geradores/arredondar'
import { GERADORES_U2 } from './geradores/adicao-subtracao'
import { AULAS_U03 } from './basica/u03'
import { AULAS_U04 } from './basica/u04'
import { AULAS_U05 } from './basica/u05'
import { AULAS_U06 } from './basica/u06'
import { AULAS_U07 } from './basica/u07'
import { GERADORES_U3 } from './geradores/multiplicacao'
import { GERADORES_U4 } from './geradores/divisao'
import { GERADORES_U5 } from './geradores/expressoes'
import { GERADORES_U6 } from './geradores/divisibilidade'
import { GERADORES_U7A } from './geradores/fracoes-a'
import { GERADORES_U7B } from './geradores/fracoes-b'

// Índice em ordem do currículo; os testes validam cada aula e cada gerador.
export const AULAS: Aula[] = [B_U0_A1, B_U0_A2, B_U1_A1, B_U1_A2, B_U1_A3, B_U1_A4, B_U1_A5, B_U2_A1, B_U2_A2, B_U2_A3, B_U2_A4, B_U2_A5, ...AULAS_U03, ...AULAS_U04, ...AULAS_U05, ...AULAS_U06, ...AULAS_U07]

export const GERADORES: Gerador[] = [
  ...GERADORES_U0,
  agrupamentoN1, agrupamentoN2, agrupamentoN3,
  valorDoAlgarismo, palavrasParaNumero, leituraComZero, valorPosicionalSozinho,
  numerosGrandesN1, numerosGrandesN2, numerosGrandesN3,
  compararN1, compararN2, compararN3,
  arredondarN1, arredondarN2, arredondarN3,
  ...GERADORES_U2,
  ...GERADORES_U3,
  ...GERADORES_U4,
  ...GERADORES_U5,
  ...GERADORES_U6,
  ...GERADORES_U7A,
  ...GERADORES_U7B,
]

export { ERROS } from './erros'
export { ESBOCOS_CHECKPOINTS, ESBOCO_REVISAO_PILOTO } from './basica/piloto'
export { ROTEIRO_DIAGNOSTICO_ENTRADA } from './geradores/estudo-diagnostico'

export const getAula = (id: string) => AULAS.find((a) => a.id === id)
export const getGerador = (id: string) => GERADORES.find((g) => g.id === id)
