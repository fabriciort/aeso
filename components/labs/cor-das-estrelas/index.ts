import type { LabModule } from '../runtime'
import Stage from './Stage'
import { COR_STEPS } from './steps'

const lab: LabModule = { steps: COR_STEPS, Stage }
export default lab
