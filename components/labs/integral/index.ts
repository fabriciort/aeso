import type { LabModule } from '../runtime'
import Stage from './Stage'
import { INTEGRAL_STEPS } from './steps'

const lab: LabModule = { steps: INTEGRAL_STEPS, Stage }
export default lab
