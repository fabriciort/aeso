import type { LabModule } from '../runtime'
import Stage from './Stage'
import { UNIVERSO_STEPS } from './steps'

const lab: LabModule = { steps: UNIVERSO_STEPS, Stage }
export default lab
