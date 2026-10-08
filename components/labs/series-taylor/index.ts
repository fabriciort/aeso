import type { LabModule } from '../runtime'
import Stage from './Stage'
import { SERIES_TAYLOR_STEPS } from './steps'

const lab: LabModule = { steps: SERIES_TAYLOR_STEPS, Stage }
export default lab
