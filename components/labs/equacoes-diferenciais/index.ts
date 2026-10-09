import type { LabModule } from '../runtime'
import Stage from './Stage'
import { EQUACOES_DIFERENCIAIS_STEPS } from './steps'

const lab: LabModule = { steps: EQUACOES_DIFERENCIAIS_STEPS, Stage }
export default lab
