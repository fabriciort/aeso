import type { LabModule } from '../runtime'
import Stage from './Stage'
import { CIRCULO_STEPS } from './steps'

const lab: LabModule = { steps: CIRCULO_STEPS, Stage }
export default lab
