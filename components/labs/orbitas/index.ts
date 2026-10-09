import type { LabModule } from '../runtime'
import Stage from './Stage'
import { ORBITAS_STEPS } from './steps'

const lab: LabModule = { steps: ORBITAS_STEPS, Stage }
export default lab
