import type { Lab } from './types'
import { CIRCULO_TRIGONOMETRICO } from './circulo-trigonometrico'
import { DERIVADA } from './derivada'
import { EQUACOES } from './equacoes'
import { EQUACOES_DIFERENCIAIS } from './equacoes-diferenciais'
import { FUNCAO_QUADRATICA } from './funcao-quadratica'
import { GRADIENTE } from './gradiente'
import { INTEGRAL } from './integral'
import { SERIES_TAYLOR } from './series-taylor'

// The interactive laboratórios of the Formação em Matemática. Where each one
// sits in the formation (módulo → unidade) is defined in lib/math/curriculum.ts.

export const MATH_LABS: Lab[] = [EQUACOES, FUNCAO_QUADRATICA, CIRCULO_TRIGONOMETRICO, DERIVADA, INTEGRAL, SERIES_TAYLOR, GRADIENTE, EQUACOES_DIFERENCIAIS]
