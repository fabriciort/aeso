// Laboratório = a guided experience made of Etapas (see docs/PRODUTO.md).

export type TrackId = 'basica' | 'ensino-medio' | 'pre-calculo' | 'calculo-1' | 'calculo-2' | 'calculo-3' | 'calculo-4'

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
  /** Suggested questions shown in the Vega panel during this step (2–3). */
  ask?: string[]
  /** Overrides the kind's label (e.g. "Resolva" instead of "Meça" in Matemática). */
  label?: string
}

export function stepLabel(step: LabStep): string {
  return step.label ?? STEP_LABEL[step.kind]
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
  area: 'Astronomia' | 'Física' | 'Matemática'
  level: 'Ensino fundamental' | 'Ensino médio' | 'Pré-cálculo' | 'Graduação' | 'Todos'
  /** Matemática: the trilha this lab belongs to (lib/labs/math.ts). */
  track?: TrackId
  minutes: number
  status: 'disponivel' | 'em-breve'
  concepts: string[]
  /** Accent color of the lab cover (CSS). */
  accent: string
  steps: LabStep[]
  /** TESS transit target (labs that load a real light curve). */
  target?: LabTarget
  /** Object opened in the Céu from the lab's conclusion. */
  skyTarget?: string
  achievement?: { title: string; description: string }
}
