import type { LabModule } from '../runtime'
import Stage from './Stage'
import { EQUACOES_STEPS } from './steps'

const lab: LabModule = { steps: EQUACOES_STEPS, Stage }
export default lab
