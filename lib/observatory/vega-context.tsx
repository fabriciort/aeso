'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// What Vega knows about the screen. Views and lab steps publish a short
// description of their current state; the Vega panel sends it with each
// question.

export interface VegaContextValue {
  lab?: string
  step?: string
  state?: string
}

interface Store {
  ctx: VegaContextValue
  setCtx: (c: VegaContextValue) => void
  open: boolean
  setOpen: (o: boolean) => void
  /** A suggested question to prefill (e.g. from a "Pergunte à Vega" button). */
  prompt: string | null
  ask: (q: string) => void
  clearPrompt: () => void
}

const Ctx = createContext<Store | null>(null)

export function VegaProvider({ children }: { children: React.ReactNode }) {
  const [ctx, setCtx] = useState<VegaContextValue>({})
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState<string | null>(null)
  const value = useMemo(
    () => ({
      ctx,
      setCtx,
      open,
      setOpen,
      prompt,
      ask: (q: string) => {
        setPrompt(q)
        setOpen(true)
      },
      clearPrompt: () => setPrompt(null),
    }),
    [ctx, open, prompt],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useVega(): Store {
  const v = useContext(Ctx)
  if (!v) throw new Error('useVega fora do VegaProvider')
  return v
}

/** Publishes what is on screen for Vega while the component is mounted. */
export function useVegaScreen(c: VegaContextValue) {
  const { setCtx } = useVega()
  const key = JSON.stringify(c)
  useEffect(() => {
    setCtx(JSON.parse(key) as VegaContextValue)
  }, [key, setCtx])
}
