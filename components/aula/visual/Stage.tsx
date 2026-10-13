'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { Visual } from '@/lib/formation/schema'
import { useSize } from '../useSize'
import { Balanca, type BalancaInteract, type BalancaState } from './Balanca'
import { Barra, type BarraInteract, type BarraState } from './Barra'
import { Figura, type FiguraInteract, type FiguraState } from './Figura'
import { Grade, type GradeInteract, type GradeState } from './Grade'
import { Grafico, type GraficoInteract, type GraficoState } from './Grafico'
import { Blocos, type BlocosState, type Ordem } from './Blocos'
import { Livre, hasLivre, type LivreInteract, type LivreState } from './Livre'
import { Plano, type PlanoInteract, type PlanoState } from './Plano'
import { Quadro, type QuadroInteract, type QuadroState } from './Quadro'
import { Reta, type RetaInteract, type RetaState } from './Reta'
import { Retangulo, type RetanguloInteract, type RetanguloState } from './Retangulo'
import { Solido, type SolidoInteract, type SolidoState } from './Solido'

// O palco da aula. Fica montado de um cartão para o outro: quando o modelo é
// o mesmo, só o estado muda e as peças se movem até o novo lugar; quando o
// modelo muda, um some e o outro aparece.

export interface Interact {
  blocos?: { onTap: (o: Ordem) => void; canTap?: (o: Ordem) => boolean }
  quadro?: QuadroInteract
  reta?: RetaInteract
  livre?: LivreInteract
  retangulo?: RetanguloInteract
  barra?: BarraInteract
  grade?: GradeInteract
  balanca?: BalancaInteract
  figura?: FiguraInteract
  solido?: SolidoInteract
  plano?: PlanoInteract
  grafico?: GraficoInteract
}

/** The content's state, with the names the generators also use mapped in. */
export function normalize(v: Visual): Record<string, unknown> {
  const e = { ...v.estado }
  if (v.modelo === 'blocos') {
    const porGrupo = (e.unidadesPorGrupo ?? e.tamanhoDoGrupo ?? 10) as number
    if (e.grupos !== undefined && e.dezenas === undefined && porGrupo === 10) e.dezenas = e.grupos
    if (e.unidades === undefined) e.unidades = e.soltos ?? e.unidadesSoltas
    if (e.total === null) delete e.total
  }
  if (v.modelo === 'reta' && Array.isArray(e.pontos) && e.numeros === undefined && (e.pontos as unknown[]).length) e.numeros = e.pontos
  return e
}

/** Whether a visual draws anything (a livre state may be only data). */
export function hasStage(v?: Visual | null): v is Visual {
  if (!v) return false
  if (v.modelo === 'livre') return hasLivre(v.estado as LivreState)
  return ['blocos', 'reta', 'quadro-posicional', 'retangulo', 'barra', 'grade', 'balanca', 'figura', 'solido', 'plano', 'grafico'].includes(v.modelo)
}

export function Stage({ visual, interact }: { visual: Visual; interact?: Interact }) {
  const [ref, size] = useSize<HTMLDivElement>()
  const s = normalize(visual)
  return (
    <div ref={ref} className="relative h-full w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={visual.modelo}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {size.w > 0 && (
            <>
              {visual.modelo === 'blocos' && <Blocos s={s as BlocosState} size={size} onTap={interact?.blocos?.onTap} canTap={interact?.blocos?.canTap} />}
              {visual.modelo === 'quadro-posicional' && <Quadro s={s as QuadroState} size={size} {...interact?.quadro} />}
              {visual.modelo === 'reta' && <Reta s={s as RetaState} size={size} {...interact?.reta} />}
              {visual.modelo === 'retangulo' && <Retangulo s={s as RetanguloState} size={size} {...interact?.retangulo} />}
              {visual.modelo === 'barra' && <Barra s={s as BarraState} size={size} {...interact?.barra} />}
              {visual.modelo === 'grade' && <Grade s={s as GradeState} size={size} {...interact?.grade} />}
              {visual.modelo === 'balanca' && <Balanca s={s as BalancaState} size={size} {...interact?.balanca} />}
              {visual.modelo === 'figura' && <Figura s={s as FiguraState} size={size} {...interact?.figura} />}
              {visual.modelo === 'solido' && <Solido s={s as SolidoState} size={size} {...interact?.solido} />}
              {visual.modelo === 'plano' && <Plano s={s as PlanoState} size={size} {...interact?.plano} />}
              {visual.modelo === 'grafico' && <Grafico s={s as GraficoState} size={size} {...interact?.grafico} />}
              {visual.modelo === 'livre' && <Livre s={s as LivreState} size={size} {...interact?.livre} />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
