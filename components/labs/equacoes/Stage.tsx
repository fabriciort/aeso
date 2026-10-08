'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { difference, itemsOf, tiltTarget, springStep, valueOf, type Side, type Where } from '@/lib/math/equations'
import { fmt } from '@/lib/math/view'
import { haptic } from '@/lib/observatory/immersive'
import { cn } from '@/lib/utils'
import { prefersReducedMotion, useMathCanvas } from '@/components/math/canvas'
import { Tex } from '@/components/math/Tex'
import { Panel, type StageProps } from '../runtime'
import { MAX_PAN, READ_MS, type EqLive, type NbLine, type Pans, type View } from './shared'

// The continuous Palco of "Equações na balança": one two-pan balance that
// lives through the whole lab. Boxes (x), weights (1) and helium balloons
// (−1) sit on the pans; the beam follows a damped spring toward an angle
// proportional to the weight difference (limited by its stop). Every
// object eases toward its slot, flies away when removed and drops in when
// added, so one View flows into the next. Below the balance, the caderno
// writes the equation line by line.

const ROSE = '#fda4af'
const SKY = '#7dd3fc'
const SPLIT_MS = 1050

const EMPTY: View = {
  key: 'vazio',
  eq: { l: { m: 1, x: 0, c: 0 }, r: { m: 1, x: 0, c: 0 } },
  X: 1,
  label: null,
  v: 'x',
  nb: [],
  aria: 'Uma balança de dois pratos, vazia e equilibrada',
}

type SideKey = 'L' | 'R'
type Kind = 'box' | 'unit' | 'balloon' | 'block'

interface Target {
  id: string
  kind: Kind
  side: SideKey
  lx: number
  ly: number
  w: number
  h: number
  group: number
  label?: string
  value?: number
  /** Balloon string anchor (local). */
  ax?: number
  ay?: number
  order: number
}

interface Item {
  id: string
  kind: Kind
  side: SideKey | null
  /** Local to the pan (side set) or world (side null). */
  lx: number
  ly: number
  w: number
  h: number
  a: number
  s: number
  rot: number
  hl: number
  rev: number
  group: number
  label?: string
  value?: number
  ax: number
  ay: number
  seed: number
  leaving: null | { mode: 'fly' | 'pop' | 'home'; t: number; vx: number; vy: number; vr: number; delay: number }
}

interface Geo {
  cx: number
  Lb: number
  pw: number
  u: number
  pivotY: number
  baseY: number
  Hb: number
  thermo: number
  tray: number
  medal: number
  split: number
  level: number
  showC: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

type Shown = View & { splitNow?: { k: number; where: Where } | null }

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

function notebookHeight(v: View, H: number) {
  return v.nb.length ? clamp(H * 0.3, 92, 150) : 0
}

function targetGeo(v: Shown, W: number, H: number): Geo {
  const nbH = notebookHeight(v, H)
  const thW = v.thermo ? Math.min(100, W * 0.27) : 0
  const usable = W - thW
  const Hb = H - nbH
  const baseY = Hb - (v.tray ? 66 : 16)
  const pivotY = baseY - Math.max(50, baseY * 0.24)
  // Pans as wide as the stage allows: cx ± (Lb + pw/2) stays 10 px inside.
  const Lb = Math.min((usable / 2 - 10) / 1.52, 230)
  const pw = Math.min(Lb * 1.04, 200)
  return {
    cx: usable / 2,
    Lb,
    pw,
    u: clamp(pw / 5.4, 13, 30),
    pivotY,
    baseY,
    Hb,
    thermo: v.thermo ? 1 : 0,
    tray: v.tray ? 1 : 0,
    medal: v.medal ? 1 : 0,
    split: v.splitNow ? 1 : 0,
    level: v.thermo ? (v.thermo.F - 32) / 1.8 : 37,
    showC: v.thermo?.showC ? 1 : 0,
  }
}

/** Where every object of a side goes, relative to the top center of its pan. */
function pile(s: Side, S: SideKey, key: string, u: number, pw: number, groups: number): Target[] {
  const { boxes, units, balloons } = itemsOf(s)
  const G = Math.max(1, Math.round(groups))
  const gw = pw / G
  const gap = 2
  const B = Math.min(u * 1.55, gw * 0.92)
  const U = Math.min(u, gw * 0.9)
  const groupOf = (i: number, n: number) => (n ? Math.min(G - 1, Math.floor((i * G) / n)) : 0)
  const out: Target[] = []
  let order = 0
  for (let g = 0; g < G; g++) {
    const gx = -pw / 2 + gw * (g + 0.5)
    const grid = (n: number, kind: 'b' | 'u', size: number, base: number, k: Kind) => {
      const idx: number[] = []
      for (let i = 0; i < n; i++) if (groupOf(i, n) === g) idx.push(i)
      const cols = Math.max(1, Math.floor((gw + gap) / (size + gap)))
      idx.forEach((i, j) => {
        const row = Math.floor(j / cols)
        const inRow = Math.min(cols, idx.length - row * cols)
        const col = j % cols
        out.push({
          id: `${key}:${S}:${kind}${i}`,
          kind: k,
          side: S,
          lx: gx + (col - (inRow - 1) / 2) * (size + gap),
          ly: -(base + row * (size + gap) + size / 2),
          w: size,
          h: size,
          group: g,
          order: order++,
        })
      })
      return base + Math.ceil(idx.length / cols) * (size + gap)
    }
    const afterBoxes = grid(boxes, 'b', B, 0, 'box')
    const top = grid(units, 'u', U, afterBoxes, 'unit')
    const bIdx: number[] = []
    for (let i = 0; i < balloons; i++) if (groupOf(i, balloons) === g) bIdx.push(i)
    const sp = Math.min(gw / Math.max(1, bIdx.length), U * 1.25)
    bIdx.forEach((i, j) => {
      const x = gx + (j - (bIdx.length - 1) / 2) * sp
      out.push({
        id: `${key}:${S}:n${i}`,
        kind: 'balloon',
        side: S,
        lx: x,
        ly: -(top + 30 + U * 0.8 + (j % 2) * 9),
        w: U * 1.15,
        h: U * 1.4,
        ax: gx + (x - gx) * 0.35,
        ay: -top,
        group: g,
        order: order++,
      })
    })
  }
  return out
}

function blockPile(s: Side, S: SideKey, key: string, v: string, X: number, pw: number, hs: number): Target[] {
  const out: Target[] = []
  const bw = pw * 0.7
  let y = 0
  if (s.c > 0) {
    const h = s.c * hs
    out.push({ id: `${key}:${S}:kc`, kind: 'block', side: S, lx: 0, ly: -(y + h / 2), w: bw, h, group: 0, label: fmt(s.c, 2), value: s.c, order: 0 })
    y += h + 2
  }
  if (s.x > 0) {
    const h = s.x * X * hs
    out.push({ id: `${key}:${S}:kx`, kind: 'box', side: S, lx: 0, ly: -(y + h / 2), w: bw, h, group: 0, label: s.x === 1 ? v : `${fmt(s.x)}·${v}`, value: s.x * X, order: 1 })
  }
  return out
}

function targetsOf(v: Shown, g: Geo): Target[] {
  if (v.blocks) {
    const hs = (Math.max(60, g.pivotY - 34) * 0.78) / v.blocks
    return [...blockPile(v.eq.l, 'L', v.key, v.v, v.X, g.pw, hs), ...blockPile(v.eq.r, 'R', v.key, v.v, v.X, g.pw, hs)]
  }
  const groups = (S: SideKey) => {
    const sp = v.splitNow
    if (sp && (sp.where === 'both' || (sp.where === 'left') === (S === 'L'))) return sp.k
    return (S === 'L' ? v.eq.l : v.eq.r).m
  }
  return [...pile(v.eq.l, 'L', v.key, g.u, g.pw, groups('L')), ...pile(v.eq.r, 'R', v.key, g.u, g.pw, groups('R'))]
}

export default function EquationStage({ live, setLive, lab }: StageProps) {
  const L = live as Partial<EqLive>
  const view = L.view ?? EMPTY
  const accent = lab.accent
  const reduced = useReducedMotion()

  // The shown View lags behind during a division: first the groups form,
  // then the extra groups fly away.
  const [shown, setShown] = useState<Shown>(view)
  const shownRef = useRef<Shown>(view)
  shownRef.current = shown
  const lastSplit = useRef<number | null>(view.fx?.kind === 'split' ? view.fx.id : null)
  useEffect(() => {
    const fx = view.fx
    if (fx?.kind === 'split' && fx.id !== lastSplit.current) {
      lastSplit.current = fx.id
      const prev = shownRef.current
      if (!prefersReducedMotion() && !view.blocks && prev.key === view.key) {
        setShown({ ...prev, splitNow: { k: fx.k, where: fx.where } })
        haptic(8)
        const t = setTimeout(() => setShown(view), SPLIT_MS)
        return () => clearTimeout(t)
      }
    }
    setShown(view)
  }, [view])

  const { ref, size, context } = useMathCanvas()
  const ctxRef = useRef(context)
  ctxRef.current = context
  const pansRef = useRef<Pans>({ L: 0, R: 0 })
  pansRef.current = L.pans ?? { L: 0, R: 0 }

  const sim = useRef({
    geo: null as Geo | null,
    spring: { a: 0, v: 0 },
    items: new Map<string, Item>(),
    guard: new Map<string, number>(),
    drag: null as Item | null,
    pointer: { x: 0, y: 0 },
    homes: [] as Item[],
    particles: [] as Particle[],
    drops: [] as { x: number; y: number; y1: number; t: number; size: number }[],
    ghosts: [] as { x: number; y: number; w: number; h: number; label: string; t: number }[],
    lastShown: null as Shown | null,
    readStart: 0,
    readId: -1,
    medalT: 0,
    seed: 1,
  })

  // ---------------------------------------------------------------- loop
  useEffect(() => {
    if (!size.w || !size.h) return
    const S = sim.current
    const W = size.w
    const H = size.h
    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = now / 1000
      const rm = prefersReducedMotion()
      const v = shownRef.current
      const tg = targetGeo(v, W, H)
      if (!S.geo || rm) S.geo = { ...tg }
      const g = S.geo
      const kg = 1 - Math.exp(-dt * 6)
      for (const k of Object.keys(tg) as (keyof Geo)[]) g[k] += (tg[k] - g[k]) * kg

      // View change: special effects once.
      const changed = S.lastShown !== v
      const prevShown = S.lastShown
      S.lastShown = v
      if (changed && v.fx?.kind === 'wobble' && prevShown?.fx?.id !== v.fx.id) S.spring.v += 0.9
      if (v.read === undefined) S.readId = -1
      else if (v.read !== S.readId) {
        S.readId = v.read
        S.readStart = now
      }
      if (v.medal && !S.medalT) {
        S.medalT = now
        burst(S.particles, g.cx, g.pivotY - g.Lb * 0.2, accent, 26, 260)
      }
      if (!v.medal) S.medalT = 0

      // Physics of the beam.
      let diff = difference(v.eq, v.X)
      if (v.blocks) diff = (diff / v.blocks) * 9
      const target = tiltTarget(diff)
      S.spring = rm ? { a: target, v: 0 } : springStep(S.spring, target, dt)
      const th = S.spring.a
      const pan = (side: SideKey) => {
        const sgn = side === 'L' ? -1 : 1
        return { x: g.cx + sgn * g.Lb * Math.cos(th), y: g.pivotY + sgn * g.Lb * Math.sin(th) - 12 }
      }

      // Sync objects with the targets.
      const targets = targetsOf(v, g)
      const ids = new Set(targets.map((x) => x.id))
      const cancel = changed && v.fx?.kind === 'cancel' && prevShown?.fx?.id !== v.fx.id
      const splitFx = v.fx?.kind === 'split'
      for (const [id, until] of S.guard) if (now > until) S.guard.delete(id)
      for (const tt of targets) {
        let it = S.items.get(tt.id)
        if (!it) {
          if (S.guard.has(tt.id)) continue
          it = {
            id: tt.id,
            kind: tt.kind,
            side: tt.side,
            lx: tt.lx,
            ly: tt.ly - 130 - tt.order * 6,
            w: tt.w,
            h: tt.h,
            a: 0,
            s: 1,
            rot: 0,
            hl: 0,
            rev: v.label !== null ? 1 : 0,
            group: tt.group,
            label: tt.label,
            value: tt.value,
            ax: tt.ax ?? tt.lx,
            ay: tt.ay ?? 0,
            seed: S.seed++,
            leaving: null,
          }
          if (tt.kind === 'block') it.ly = tt.ly - 60
          S.items.set(tt.id, it)
        }
        if (it.value !== undefined && tt.value !== undefined && tt.value < it.value - 1e-6 && !splitFx) {
          // A block got lighter: the removed part flies away.
          const p = pan(tt.side)
          const dh = it.h * (1 - tt.value / it.value)
          S.ghosts.push({ x: p.x + it.lx, y: p.y + it.ly - it.h / 2 + dh / 2, w: it.w, h: dh, label: `−${fmt(it.value - tt.value, 2)}`, t: 0 })
        }
        it.value = tt.value
        it.label = tt.label
        it.group = tt.group
        const ke = rm ? 1 : 1 - Math.exp(-dt * 9)
        it.lx += (tt.lx - it.lx) * ke
        it.ly += (tt.ly - it.ly) * ke
        it.w += (tt.w - it.w) * ke
        it.h += (tt.h - it.h) * ke
        it.ax += ((tt.ax ?? tt.lx) - it.ax) * ke
        it.ay += ((tt.ay ?? 0) - it.ay) * ke
        it.a += (1 - it.a) * (rm ? 1 : 1 - Math.exp(-dt * 7))
        it.rev += ((v.label !== null ? 1 : 0) - it.rev) * (rm ? 1 : 1 - Math.exp(-dt * 5))
        // Reading highlight (Entenda): boxes, then weights, then the right side.
        let hl = 0
        if (v.read !== undefined) {
          const ph = (now - S.readStart) / READ_MS
          if (ph < 4.6) {
            if (tt.side === 'L' && tt.kind === 'box' && ph >= 0) hl = 1
            if (tt.side === 'L' && tt.kind === 'unit' && ph >= 1) hl = 1
            if (tt.side === 'R' && ph >= 3) hl = 1
          }
        }
        it.hl += (hl - it.hl) * (1 - Math.exp(-dt * 8))
      }
      for (const it of [...S.items.values()]) {
        if (it.leaving || ids.has(it.id) || S.guard.has(it.id)) continue
        S.items.delete(it.id)
        if (rm) continue
        const p = pan(it.side ?? 'L')
        const wx = p.x + it.lx
        const wy = p.y + it.ly
        const out = it.side === 'L' ? -1 : 1
        it.side = null
        it.lx = wx
        it.ly = wy
        if (it.kind === 'balloon') {
          it.leaving = { mode: 'pop', t: 0, vx: 0, vy: -20, vr: 0, delay: cancel ? 0.5 : 0.05 }
          if (cancel) S.drops.push({ x: wx, y: wy - 150, y1: wy, t: 0, size: it.w * 0.85 })
        } else {
          it.leaving = { mode: 'fly', t: 0, vx: out * (30 + Math.random() * 70), vy: -(260 + Math.random() * 140), vr: (Math.random() - 0.5) * 5, delay: Math.random() * 0.08 }
        }
        S.items.set(`${it.id}~${S.seed++}`, it)
      }

      // ------------------------------------------------------------ draw
      const ctx = ctxRef.current()
      if (!ctx) {
        raf = requestAnimationFrame(frame)
        return
      }

      // Thermometer (No mundo real).
      if (g.thermo > 0.01) drawThermo(ctx, W, g, accent)

      // Medal ring (Conclua).
      if (g.medal > 0.01) {
        const p = S.medalT ? clamp((now - S.medalT) / 1300, 0, 1) : 1
        const e = 1 - Math.pow(1 - p, 3)
        const R = Math.min(g.Lb * 1.12, g.Hb * 0.44)
        const cy = Math.min(g.pivotY - R * 0.3, g.Hb - R - 6)
        const grd = ctx.createRadialGradient(g.cx, cy, R * 0.2, g.cx, cy, R * 1.2)
        grd.addColorStop(0, hexA(accent, 0.1 * g.medal))
        grd.addColorStop(1, hexA(accent, 0))
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(g.cx, cy, R * 1.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = hexA(accent, 0.7 * g.medal)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(g.cx, cy, R, -Math.PI / 2, -Math.PI / 2 + e * Math.PI * 2)
        ctx.stroke()
      }

      // Base, beam, needle, pans.
      const pl = pan('L')
      const pr = pan('R')
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.beginPath()
      ctx.moveTo(g.cx - 4, g.pivotY)
      ctx.lineTo(g.cx + 4, g.pivotY)
      ctx.lineTo(g.cx + 11, g.baseY)
      ctx.lineTo(g.cx - 11, g.baseY)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.roundRect(g.cx - 52, g.baseY - 2, 104, 7, 3.5)
      ctx.fill()

      // Scale arc and needle (perpendicular to the beam).
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(g.cx, g.pivotY, 30, -Math.PI / 2 - 0.35, -Math.PI / 2 + 0.35)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(g.cx, g.pivotY - 27)
      ctx.lineTo(g.cx, g.pivotY - 33)
      ctx.stroke()
      const balanced = Math.abs(diff) < 1e-6
      ctx.strokeStyle = balanced ? hexA(accent, 0.9) : 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(g.cx, g.pivotY)
      ctx.lineTo(g.cx + Math.sin(th) * 28, g.pivotY - Math.cos(th) * 28)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(255,255,255,0.62)'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(g.cx - g.Lb * Math.cos(th), g.pivotY - g.Lb * Math.sin(th))
      ctx.lineTo(g.cx + g.Lb * Math.cos(th), g.pivotY + g.Lb * Math.sin(th))
      ctx.stroke()
      ctx.lineCap = 'butt'
      for (const p of [pl, pr]) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.fillRect(p.x - 1.5, p.y, 3, 12)
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.beginPath()
        ctx.roundRect(p.x - g.pw / 2, p.y, g.pw, 5, 2.5)
        ctx.fill()
      }
      ctx.fillStyle = '#e8ebf2'
      ctx.beginPath()
      ctx.arc(g.cx, g.pivotY, 5, 0, Math.PI * 2)
      ctx.fill()

      // Equality badge above the pivot.
      {
        const ph = v.read !== undefined ? (now - S.readStart) / READ_MS : 9
        const pulse = ph >= 2 && ph < 4.6 ? 1.18 : 1
        const r = 13 * pulse
        const y = g.pivotY - 52
        ctx.fillStyle = balanced ? hexA(accent, 0.18) : 'rgba(253,164,175,0.16)'
        ctx.strokeStyle = balanced ? hexA(accent, 0.7) : 'rgba(253,164,175,0.6)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(g.cx, y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = balanced ? accent : ROSE
        ctx.font = `600 ${Math.round(16 * pulse)}px ui-sans-serif, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(balanced ? '=' : diff > 0 ? '<' : '>', g.cx, y + 1)
      }

      // Groups being formed (division).
      if (g.split > 0.02 && v.splitNow) {
        for (const side of ['L', 'R'] as SideKey[]) {
          if (v.splitNow.where !== 'both' && (v.splitNow.where === 'left') !== (side === 'L')) continue
          const p = pan(side)
          const k = v.splitNow.k
          for (let gi = 0; gi < k; gi++) {
            const mine = targets.filter((x) => x.side === side && x.group === gi)
            if (!mine.length) continue
            const x0 = Math.min(...mine.map((m) => m.lx - m.w / 2)) - 4
            const x1 = Math.max(...mine.map((m) => m.lx + m.w / 2)) + 4
            const y0 = Math.min(...mine.map((m) => m.ly - m.h / 2)) - 4
            const y1 = Math.max(...mine.map((m) => m.ly + m.h / 2)) + 3
            ctx.setLineDash(gi === 0 ? [] : [4, 4])
            ctx.strokeStyle = gi === 0 ? hexA(accent, 0.85 * g.split) : `rgba(255,255,255,${0.35 * g.split})`
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(p.x + x0, p.y + y0, x1 - x0, y1 - y0, 6)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }

      // Objects: strings first, then bodies.
      const all = [...S.items.values()]
      const world = (it: Item) => {
        if (!it.side) return { x: it.lx, y: it.ly }
        const p = pan(it.side)
        return { x: p.x + it.lx, y: p.y + it.ly }
      }
      for (const it of all) {
        if (it.kind !== 'balloon' || !it.side) continue
        const p = pan(it.side)
        const w = world(it)
        const bob = Math.sin(t * 1.7 + it.seed) * 2.2
        ctx.strokeStyle = `rgba(200,225,255,${0.45 * it.a})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(w.x, w.y + bob + it.h / 2)
        ctx.quadraticCurveTo(w.x + Math.sin(t * 1.3 + it.seed) * 4, (w.y + p.y + it.ay) / 2, p.x + it.ax, p.y + it.ay)
        ctx.stroke()
      }
      for (const it of all) {
        let { x, y } = world(it)
        let a = it.a
        let s = it.s
        let rot = 0
        const lv = it.leaving
        if (lv) {
          lv.t += dt
          const tt = Math.max(0, lv.t - lv.delay)
          if (lv.mode === 'fly') {
            it.lx += lv.vx * dt * (tt > 0 ? 1 : 0)
            it.ly += lv.vy * dt * (tt > 0 ? 1 : 0)
            lv.vy -= 120 * dt * (tt > 0 ? 1 : 0)
            it.rot += lv.vr * dt * (tt > 0 ? 1 : 0)
            a = it.a * clamp(1 - tt / 0.7, 0, 1)
            rot = it.rot
            x = it.lx
            y = it.ly
          } else if (lv.mode === 'pop') {
            if (tt > 0 && it.s === 1) {
              burst(S.particles, x, y, SKY, 9, 120)
              it.s = 1.0001
            }
            s = 1 + clamp(tt / 0.2, 0, 1) * 0.5
            a = it.a * clamp(1 - tt / 0.2, 0, 1)
          } else {
            a = it.a
          }
          if ((lv.mode !== 'home' && tt > 0.75) || a <= 0.001) {
            for (const [k, val] of S.items) if (val === it) S.items.delete(k)
            continue
          }
        }
        if (it.kind === 'balloon' && it.side) y += Math.sin(t * 1.7 + it.seed) * 2.2
        drawItem(ctx, it, x, y, a, s, rot, accent, v.v, v.label)
      }

      // Weights falling to cancel balloons.
      S.drops = S.drops.filter((d) => {
        d.t += dt
        const p = clamp(d.t / 0.5, 0, 1)
        const y = d.y + (d.y1 - d.y) * p * p
        if (p >= 1) {
          burst(S.particles, d.x, d.y1, '#ffffff', 6, 90)
          return false
        }
        drawUnit(ctx, d.x, y, d.size, 1, 1)
        return true
      })
      // Pieces cut from blocks.
      S.ghosts = S.ghosts.filter((gh) => {
        gh.t += dt
        const a = clamp(1 - gh.t / 0.9, 0, 1)
        if (a <= 0) return false
        const y = gh.y - 160 * gh.t * gh.t - 30 * gh.t
        ctx.globalAlpha = a
        ctx.fillStyle = 'rgba(235,238,245,0.85)'
        ctx.beginPath()
        ctx.roundRect(gh.x - gh.w / 2, y - gh.h / 2, gh.w, gh.h, 4)
        ctx.fill()
        ctx.fillStyle = '#0b0d12'
        ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        if (gh.h > 13) ctx.fillText(gh.label, gh.x, y)
        ctx.globalAlpha = 1
        return true
      })

      // Tray (Imagine).
      if (g.tray > 0.01) {
        const tr = trayRect(g)
        ctx.globalAlpha = g.tray
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(tr.x, tr.y, tr.w, tr.h, 14)
        ctx.fill()
        ctx.stroke()
        for (let i = 0; i < 4; i++) drawUnit(ctx, tr.x + 14 + g.u / 2 + i * (g.u + 4), tr.y + tr.h / 2, g.u, 1, 1)
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.font = '500 11px ui-sans-serif, system-ui, sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText('pesos de 1', tr.x + tr.w - 12, tr.y + tr.h / 2)
        ctx.globalAlpha = 1
      }

      // Weights going back to the tray.
      S.homes = S.homes.filter((it) => {
        const tr = trayRect(g)
        const tx = tr.x + 22
        const ty = tr.y + tr.h / 2
        const ke = 1 - Math.exp(-dt * 10)
        it.lx += (tx - it.lx) * ke
        it.ly += (ty - it.ly) * ke
        if (Math.hypot(tx - it.lx, ty - it.ly) < 2) return false
        drawUnit(ctx, it.lx, it.ly, it.w, 1, 1)
        return true
      })

      // The dragged weight.
      if (S.drag) {
        const d = S.drag
        const ke = 1 - Math.exp(-dt * 30)
        d.lx += (S.pointer.x - d.lx) * ke
        d.ly += (S.pointer.y - g.u * 0.9 - d.ly) * ke
        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 14
        ctx.shadowOffsetY = 6
        drawUnit(ctx, d.lx, d.ly, d.w * 1.15, 1, 1)
        ctx.restore()
      }

      // Particles.
      S.particles = S.particles.filter((p) => {
        p.life -= dt
        if (p.life <= 0) return false
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 60 * dt
        ctx.globalAlpha = clamp(p.life / 0.6, 0, 1)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [size.w, size.h, accent])

  // ---------------------------------------------------------------- drag (Imagine)
  const drag = Boolean(shown.tray)
  const local = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const panAt = (side: SideKey) => {
    const S = sim.current
    const g = S.geo!
    const th = S.spring.a
    const sgn = side === 'L' ? -1 : 1
    return { x: g.cx + sgn * g.Lb * Math.cos(th), y: g.pivotY + sgn * g.Lb * Math.sin(th) - 12 }
  }
  const onDown = (e: React.PointerEvent) => {
    const S = sim.current
    const g = S.geo
    if (!drag || !g) return
    const p = local(e)
    S.pointer = p
    const tr = trayRect(g)
    const unit = (x: number, y: number): Item => ({
      id: 'drag',
      kind: 'unit',
      side: null,
      lx: x,
      ly: y,
      w: g.u,
      h: g.u,
      a: 1,
      s: 1,
      rot: 0,
      hl: 0,
      rev: 0,
      group: 0,
      ax: 0,
      ay: 0,
      seed: 0,
      leaving: null,
    })
    if (p.x > tr.x - 10 && p.x < tr.x + tr.w + 10 && p.y > tr.y - 14 && p.y < tr.y + tr.h + 10) {
      S.drag = unit(p.x, p.y)
    } else {
      // Grab a weight from a pan: the top one of that pan comes to the finger.
      let best: SideKey | null = null
      let bestD = Math.max(28, g.u * 1.6)
      for (const it of S.items.values()) {
        if (it.kind !== 'unit' || !it.side || it.leaving) continue
        const pp = panAt(it.side)
        const d = Math.hypot(pp.x + it.lx - p.x, pp.y + it.ly - p.y)
        if (d < bestD) {
          bestD = d
          best = it.side
        }
      }
      if (!best) return
      const pans = pansRef.current
      const id = `${shownRef.current.key}:${best}:u${pans[best] - 1}`
      const it = S.items.get(id)
      if (!it) return
      const pp = panAt(best)
      S.items.delete(id)
      S.guard.set(id, performance.now() + 500)
      S.drag = unit(pp.x + it.lx, pp.y + it.ly)
      setLive({ pans: { ...pans, [best]: pans[best] - 1 } })
    }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    haptic(6)
  }
  const onMove = (e: React.PointerEvent) => {
    if (sim.current.drag) sim.current.pointer = local(e)
  }
  const onUp = () => {
    const S = sim.current
    const d = S.drag
    if (!d || !S.geo) return
    S.drag = null
    const g = S.geo
    const pans = pansRef.current
    let side: SideKey | null = null
    for (const sk of ['L', 'R'] as SideKey[]) {
      const p = panAt(sk)
      if (Math.abs(d.lx - p.x) < g.pw * 0.78 && d.ly < p.y + 34 && d.ly > p.y - g.Hb * 0.85) side = sk
    }
    if (side && pans[side] < MAX_PAN) {
      const p = panAt(side)
      const id = `${shownRef.current.key}:${side}:u${pans[side]}`
      S.items.set(id, { ...d, id, side, lx: d.lx - p.x, ly: d.ly - p.y })
      S.guard.set(id, performance.now() + 500)
      setLive({ pans: { ...pans, [side]: pans[side] + 1 } })
      haptic(10)
    } else {
      S.homes.push(d)
      haptic(4)
    }
  }

  // ---------------------------------------------------------------- overlays
  const nbH = size.h ? notebookHeight(shown, size.h) : 0
  const diff = difference(shown.eq, shown.X)
  const tilt = Math.abs(diff) < 1e-6 ? 'equilibrada' : diff > 0 ? 'com a direita mais baixa' : 'com a esquerda mais baixa'
  const aria = `${shown.aria}. Balança ${tilt}.`
  const lines = shown.nb.slice(-3)

  return (
    <Panel>
      <div
        className={cn('absolute inset-0', drag && 'cursor-grab touch-none select-none')}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={ref} role="img" aria-label={aria} className="absolute inset-0 h-full w-full" />
      </div>

      <AnimatePresence>
        {shown.readout && (
          <motion.div key="readout" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-between">
            {(['l', 'r'] as const).map((k) => (
              <span key={k} className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[12px] tabular-nums text-white/80 backdrop-blur-xl">
                {k === 'l' ? 'esquerda' : 'direita'} {fmt(valueOf(shown.eq[k], shown.X), 1)}
              </span>
            ))}
          </motion.div>
        )}
        {shown.badges && (
          <motion.div key="badges" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
            {shown.badges.map((b, i) => (
              <motion.span
                key={b.tex}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.25, type: 'spring', stiffness: 260, damping: 30 }}
                className="rounded-full bg-black/50 px-3 py-1 text-[14px] text-white/85 backdrop-blur-xl"
              >
                <Tex say={b.say}>{b.tex}</Tex>
              </motion.span>
            ))}
          </motion.div>
        )}
        {shown.thermo && (
          <motion.span key="thermo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[12px] text-white/85 backdrop-blur-xl">
            {fmt(shown.thermo.F, 1)} °F{shown.thermo.showC ? ` = ${fmt((shown.thermo.F - 32) / 1.8, 1)} °C` : ''}
          </motion.span>
        )}
      </AnimatePresence>

      <Notebook lines={lines} height={nbH} title={shown.nbTitle} reduced={Boolean(reduced)} accent={accent} />
    </Panel>
  )
}

// ------------------------------------------------------------------ caderno

function Notebook({ lines, height, title, reduced, accent }: { lines: NbLine[]; height: number; title?: string; reduced: boolean; accent: string }) {
  return (
    <motion.div
      initial={false}
      animate={{ height, opacity: height ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 30 }}
      className="pointer-events-none absolute inset-x-2 bottom-2 z-10 overflow-hidden rounded-[20px] border border-white/[0.07] bg-white/[0.035]"
      aria-live="polite"
    >
      <div className="flex h-full flex-col px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">Caderno{title ? ` · ${title}` : ''}</p>
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-0.5 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            {lines.map((l, i) => {
              const old = i < lines.length - 1
              const color =
                l.tone === 'bad' ? 'text-rose-200' : l.tone === 'meh' ? 'text-amber-100/80' : l.tone === 'rule' || l.tone === 'done' ? '' : old ? 'text-white/50' : 'text-white'
              return (
                <motion.div
                  key={l.id}
                  layout={!reduced}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={{ opacity: old && l.tone !== 'rule' ? 0.6 : 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, filter: 'blur(6px)' }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('flex items-center justify-center gap-3 whitespace-nowrap text-[16.5px] leading-tight lg:text-[19px]', color)}
                  style={l.tone === 'rule' || l.tone === 'done' ? { color: accent } : undefined}
                >
                  {l.parts ? (
                    <span className="inline-flex items-baseline gap-[0.3em]" role="math" aria-label={l.say} data-say={l.say}>
                      {l.parts.map((p, j) => (
                        <motion.span key={j} initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: reduced ? 0 : (j * READ_MS) / 1000 + 0.05, duration: 0.4 }}>
                          <Tex>{p}</Tex>
                        </motion.span>
                      ))}
                    </span>
                  ) : (
                    <Tex say={l.say}>{l.tex}</Tex>
                  )}
                  {l.note && <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px]', l.tone === 'bad' ? 'bg-rose-400/10 text-rose-200/90' : l.tone === 'meh' ? 'bg-amber-300/10 text-amber-100/80' : 'bg-white/[0.06] text-white/55')}>{l.note}</span>}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------------ drawing

function trayRect(g: Geo) {
  const w = 4 * (g.u + 4) + 96
  return { x: g.cx - w / 2, y: g.baseY + 14, w, h: Math.max(40, g.u + 14) }
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(a, 0, 1)})`
}

function burst(list: Particle[], x: number, y: number, color: string, n: number, speed: number) {
  if (prefersReducedMotion()) return
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4
    const s = speed * (0.5 + Math.random() * 0.6)
    list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, color })
  }
}

function drawUnit(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, a: number, s: number) {
  const w = size * s
  ctx.globalAlpha = a
  ctx.fillStyle = 'rgba(232,236,244,0.94)'
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - w / 2, w, w, Math.max(2, w * 0.2))
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillRect(x - w / 2 + 2, y - w / 2 + 1.5, w - 4, 1.2)
  if (w >= 12) {
    ctx.fillStyle = '#1a1d26'
    ctx.font = `600 ${Math.round(w * 0.58)}px ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('1', x, y + 0.5)
  }
  ctx.globalAlpha = 1
}

function drawItem(ctx: CanvasRenderingContext2D, it: Item, x: number, y: number, a: number, s: number, rot: number, accent: string, letter: string, label: number | null) {
  if (a <= 0.005) return
  ctx.save()
  ctx.translate(x, y)
  if (rot) ctx.rotate(rot)
  const w = it.w * s
  const h = it.h * s
  if (it.kind === 'unit') {
    ctx.restore()
    ctx.save()
    if (rot) {
      ctx.translate(x, y)
      ctx.rotate(rot)
      drawUnit(ctx, 0, 0, it.w, a, s)
    } else drawUnit(ctx, x, y, it.w, a, s)
    ctx.restore()
    return
  }
  ctx.globalAlpha = a
  if (it.kind === 'balloon') {
    const g = ctx.createRadialGradient(-w * 0.18, -h * 0.2, w * 0.05, 0, 0, w * 0.7)
    g.addColorStop(0, '#e0f4ff')
    g.addColorStop(0.5, SKY)
    g.addColorStop(1, '#3b82b0')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(-2.5, h / 2 + 2)
    ctx.lineTo(2.5, h / 2 + 2)
    ctx.lineTo(0, h / 2 - 1)
    ctx.fill()
    if (w >= 13) {
      ctx.fillStyle = '#082233'
      ctx.font = `600 ${Math.round(w * 0.42)}px ui-sans-serif, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('−1', 0, 0.5)
    }
    ctx.restore()
    return
  }
  if (it.kind === 'block') {
    ctx.fillStyle = 'rgba(232,236,244,0.9)'
    ctx.beginPath()
    ctx.roundRect(-w / 2, -h / 2, w, h, 5)
    ctx.fill()
    if (h > 12) {
      ctx.fillStyle = '#1a1d26'
      ctx.font = '600 12.5px ui-sans-serif, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(it.label ?? '', 0, 0.5)
    }
    ctx.restore()
    return
  }
  // Box (or the unknown's block in block mode).
  if (it.hl > 0.01) {
    ctx.shadowColor = accent
    ctx.shadowBlur = 18 * it.hl
  }
  const grd = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
  grd.addColorStop(0, hexA(accent, 1))
  grd.addColorStop(1, mix(accent, 0.62))
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(6, w * 0.18))
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.6 * it.hl})`
  ctx.lineWidth = 1 + it.hl
  ctx.stroke()
  if (it.value === undefined) {
    // Lid line, like a closed box.
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-w / 2 + 2, -h / 2 + h * 0.24)
    ctx.lineTo(w / 2 - 2, -h / 2 + h * 0.24)
    ctx.stroke()
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#062012'
  if (it.value !== undefined) {
    // Block of the unknown (decimal mode): its label, always visible.
    if (h > 12) {
      ctx.font = '600 13px ui-sans-serif, system-ui, sans-serif'
      ctx.fillText(it.label ?? letter, 0, 0.5)
    }
  } else {
    // Closed box: the letter, which turns into the number when revealed.
    const cy = h * 0.1
    if (label === null || it.rev < 0.99) {
      ctx.globalAlpha = a * (label === null ? 1 : 1 - it.rev)
      ctx.font = `italic ${Math.round(h * 0.56)}px KaTeX_Math, "Times New Roman", serif`
      ctx.fillText(letter, 0, cy)
    }
    if (label !== null && it.rev > 0.01) {
      ctx.globalAlpha = a * it.rev
      ctx.font = `700 ${Math.round(h * 0.5)}px ui-sans-serif, system-ui, sans-serif`
      ctx.fillText(fmt(label, 1), 0, cy)
    }
  }
  ctx.restore()
}

function mix(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgb(${Math.round(((n >> 16) & 255) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`
}

function drawThermo(ctx: CanvasRenderingContext2D, W: number, g: Geo, accent: string) {
  const a = g.thermo
  const x = W - Math.min(100, W * 0.27) / 2 - 4
  const top = 40
  const bot = g.Hb - 30
  const C0 = 34
  const C1 = 41
  const yOf = (C: number) => bot - 14 - ((C - C0) / (C1 - C0)) * (bot - 14 - top - 6)
  ctx.globalAlpha = a
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x - 6, top, 12, bot - top, 6)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, bot + 4, 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#fb7185'
  ctx.beginPath()
  ctx.arc(x, bot + 4, 8, 0, Math.PI * 2)
  ctx.fill()
  const yl = yOf(g.level)
  ctx.fillRect(x - 3, yl, 6, bot + 4 - yl)
  ctx.font = '500 10.5px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.textAlign = 'right'
  for (let F = 94; F <= 104; F += 2) {
    const y = yOf((F - 32) / 1.8)
    ctx.fillRect(x - 10, y, 4, 1)
    ctx.fillText(String(F), x - 13, y)
  }
  ctx.textAlign = 'left'
  ctx.globalAlpha = a * g.showC
  for (let C = 35; C <= 40; C++) {
    const y = yOf(C)
    ctx.fillRect(x + 6, y, 4, 1)
    ctx.fillText(String(C), x + 13, y)
  }
  ctx.globalAlpha = a
  ctx.strokeStyle = hexA(accent, 0.8)
  ctx.beginPath()
  ctx.moveTo(x - 12, yl)
  ctx.lineTo(x + 12, yl)
  ctx.stroke()
  ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.textAlign = 'right'
  ctx.fillText('°F', x - 10, top - 10)
  ctx.globalAlpha = a * g.showC
  ctx.textAlign = 'left'
  ctx.fillText('°C', x + 10, top - 10)
  ctx.globalAlpha = 1
}

