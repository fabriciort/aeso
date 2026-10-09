'use client'

import { useEffect, useState } from 'react'

// O conteúdo da formação carrega à parte (code-split): o mapa e o resto do
// app não pagam por ele até alguém abrir uma aula ou o painel de uma unidade.

type Conteudo = typeof import('@/content/matematica')

let cache: Conteudo | null = null
let pending: Promise<Conteudo> | null = null

export function loadConteudo(): Promise<Conteudo> {
  if (cache) return Promise.resolve(cache)
  pending ??= import('@/content/matematica').then((m) => (cache = m))
  return pending
}

export function useConteudo(): Conteudo | null {
  const [c, setC] = useState<Conteudo | null>(cache)
  useEffect(() => {
    if (c) return
    let alive = true
    void loadConteudo().then((m) => alive && setC(m))
    return () => {
      alive = false
    }
  }, [c])
  return c
}
