// Laboratório = a guided experience made of Etapas (see docs/PRODUTO.md).

export type StepKind = 'cenario' | 'previsao' | 'conceito' | 'observacao' | 'medicao' | 'desafio' | 'conclusao'

export const STEP_LABEL: Record<StepKind, string> = {
  cenario: 'Imagine',
  previsao: 'Preveja',
  conceito: 'Entenda',
  observacao: 'Observe',
  medicao: 'Meça',
  desafio: 'E se…?',
  conclusao: 'Conclua',
}

export interface LabStep {
  id: string
  kind: StepKind
  title: string
  /** Short goal shown under the title. */
  goal: string
  /** Hidden context for Vega: what the student is doing and the key idea. */
  vega: string
}

export interface LabTarget {
  name: string
  ra: number
  dec: number
  period: number
  /** Semi-major axis in stellar radii. */
  aR: number
  impact: number
  /** Literature radius ratio, used only for checks and copy. */
  radiusRatio: number
  starRadiusSun: number
  distanceLy: number
  limbDarkening: { u1: number; u2: number }
  reference: string
}

export interface Lab {
  slug: string
  title: string
  subtitle: string
  area: 'Astronomia' | 'Física'
  level: 'Ensino médio' | 'Graduação' | 'Todos'
  minutes: number
  status: 'disponivel' | 'em-breve'
  concepts: string[]
  /** Accent color of the lab cover (CSS). */
  accent: string
  steps: LabStep[]
  target?: LabTarget
  achievement?: { title: string; description: string }
}
