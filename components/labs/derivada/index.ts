import type { LabModule } from '../runtime'
import Stage from './Stage'
import { DERIVADA_STEPS } from './steps'

const lab: LabModule = { steps: DERIVADA_STEPS, Stage }
export default lab
