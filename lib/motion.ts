// Motion tokens (see docs/DESIGN.md). Use these instead of ad-hoc values.
import type { Transition, Variants } from 'framer-motion'

export const spring = {
  soft: { type: 'spring', stiffness: 260, damping: 30 } as Transition,
  snappy: { type: 'spring', stiffness: 500, damping: 38 } as Transition,
  gentle: { type: 'spring', stiffness: 170, damping: 26 } as Transition,
}

export const ease = [0.22, 1, 0.36, 1] as const

export const stagger = (gap = 0.05, delay = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

export const rise: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: spring.soft },
}

/** Area/view transition: crossfade with a slight scale and blur. */
export const viewTransition: Variants = {
  initial: { opacity: 0, scale: 0.985, filter: 'blur(8px)' },
  enter: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.45, ease } },
  exit: { opacity: 0, scale: 1.01, filter: 'blur(6px)', transition: { duration: 0.22, ease } },
}
