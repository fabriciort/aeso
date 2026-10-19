import { AULAS_AF_U05 } from './algebra/u05'
import { GERADORES_AF_U05 } from './geradores/inequacoes'
import { AULAS_AF_U04 } from './algebra/u04'
import { GERADORES_AF_U04 } from './geradores/sistemas'
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
import { AULAS_U08 } from './basica/u08'
import { AULAS_U09 } from './basica/u09'
import { AULAS_U10 } from './basica/u10'
import { AULAS_U11 } from './basica/u11'
import { AULAS_U12 } from './basica/u12'
import { AULAS_U13 } from './basica/u13'
import { AULAS_U14 } from './basica/u14'
import { AULAS_U15 } from './basica/u15'
import { AULAS_U16 } from './basica/u16'
import { AULAS_U17 } from './basica/u17'
import { AULAS_U18 } from './basica/u18'
import { AULAS_U19 } from './basica/u19'
import { AULAS_U20 } from './basica/u20'
import { AULAS_AF_U01 } from './algebra/u01'
import { AULAS_AF_U02 } from './algebra/u02'
import { AULAS_AF_U03 } from './algebra/u03'
import { GERADORES_U3 } from './geradores/multiplicacao'
import { GERADORES_U4 } from './geradores/divisao'
import { GERADORES_U5 } from './geradores/expressoes'
import { GERADORES_U6 } from './geradores/divisibilidade'
import { GERADORES_U7A } from './geradores/fracoes-a'
import { GERADORES_U7B } from './geradores/fracoes-b'
import { GERADORES_U8A } from './geradores/decimais-a'
import { GERADORES_U8B } from './geradores/decimais-b'
import { GERADORES_U9A } from './geradores/medidas-a'
import { GERADORES_U9B } from './geradores/medidas-b'
import { GERADORES_U10A } from './geradores/proporcao-a'
import { GERADORES_U10B } from './geradores/proporcao-b'
import { GERADORES_U11A } from './geradores/porcentagem-a'
import { GERADORES_U11B } from './geradores/porcentagem-b'
import { GERADORES_U12A } from './geradores/negativos-a'
import { GERADORES_U12B } from './geradores/negativos-b'
import { GERADORES_U13A } from './geradores/potencias-a'
import { GERADORES_U13B } from './geradores/potencias-b'
import { GERADORES_U14A } from './geradores/algebra-a'
import { GERADORES_U14B } from './geradores/algebra-b'
import { GERADORES_U15A } from './geradores/equacoes-a'
import { GERADORES_U15B } from './geradores/equacoes-b'
import { GERADORES_U16A } from './geradores/geometria-a'
import { GERADORES_U16B } from './geradores/geometria-b'
import { GERADORES_U17 } from './geradores/solidos'
import { GERADORES_U18A } from './geradores/graficos-a'
import { GERADORES_U18B } from './geradores/graficos-b'
import { GERADORES_U19A } from './geradores/estatistica-a'
import { GERADORES_U19B } from './geradores/estatistica-b'
import { GERADORES_U20 } from './geradores/projeto'
import { GERADORES_AF_U01A } from './geradores/polinomios-a'
import { GERADORES_AF_U01B } from './geradores/polinomios-b'
import { GERADORES_AF_U02A } from './geradores/fatoracao-a'
import { GERADORES_AF_U02B } from './geradores/fatoracao-b'
import { GERADORES_AF_U03A } from './geradores/segundo-grau-a'
import { GERADORES_AF_U03B } from './geradores/segundo-grau-b'

// Índice em ordem do currículo; os testes validam cada aula e cada gerador.
export const AULAS: Aula[] = [B_U0_A1, B_U0_A2, B_U1_A1, B_U1_A2, B_U1_A3, B_U1_A4, B_U1_A5, B_U2_A1, B_U2_A2, B_U2_A3, B_U2_A4, B_U2_A5, ...AULAS_U03, ...AULAS_U04, ...AULAS_U05, ...AULAS_U06, ...AULAS_U07, ...AULAS_U08, ...AULAS_U09, ...AULAS_U10, ...AULAS_U11, ...AULAS_U12, ...AULAS_U13, ...AULAS_U14, ...AULAS_U15, ...AULAS_U16, ...AULAS_U17, ...AULAS_U18, ...AULAS_U19, ...AULAS_U20, ...AULAS_AF_U01, ...AULAS_AF_U02, ...AULAS_AF_U03, ...AULAS_AF_U04, ...AULAS_AF_U05]

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
  ...GERADORES_U8A,
  ...GERADORES_U8B,
  ...GERADORES_U9A,
  ...GERADORES_U9B,
  ...GERADORES_U10A,
  ...GERADORES_U10B,
  ...GERADORES_U11A,
  ...GERADORES_U11B,
  ...GERADORES_U12A,
  ...GERADORES_U12B,
  ...GERADORES_U13A,
  ...GERADORES_U13B,
  ...GERADORES_U14A,
  ...GERADORES_U14B,
  ...GERADORES_U15A,
  ...GERADORES_U15B,
  ...GERADORES_U16A,
  ...GERADORES_U16B,
  ...GERADORES_U17,
  ...GERADORES_U18A,
  ...GERADORES_U18B,
  ...GERADORES_U19A,
  ...GERADORES_U19B,
  ...GERADORES_U20,
  ...GERADORES_AF_U01A,
  ...GERADORES_AF_U01B,
  ...GERADORES_AF_U02A,
  ...GERADORES_AF_U02B,
  ...GERADORES_AF_U03A,
  ...GERADORES_AF_U03B,
  ...GERADORES_AF_U04,
  ...GERADORES_AF_U05,
]

export { ERROS } from './erros'
export { ESBOCOS_CHECKPOINTS, ESBOCO_REVISAO_PILOTO } from './basica/piloto'
export { ROTEIRO_DIAGNOSTICO_ENTRADA } from './geradores/estudo-diagnostico'

export const getAula = (id: string) => AULAS.find((a) => a.id === id)
export const getGerador = (id: string) => GERADORES.find((g) => g.id === id)
