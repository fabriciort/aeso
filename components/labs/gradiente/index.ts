import type { LabModule } from '../runtime'
import Stage from './Stage'
import { GRADIENTE_STEPS } from './steps'

const lab: LabModule = { steps: GRADIENTE_STEPS, Stage }
export default lab
