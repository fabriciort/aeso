import type { LabModule } from '../runtime'
import Stage from './Stage'
import { QUADRATICA_STEPS } from './steps'

const lab: LabModule = { steps: QUADRATICA_STEPS, Stage }
export default lab
