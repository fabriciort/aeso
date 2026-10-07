'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, ExternalLink, Sparkles } from 'lucide-react'
import type { AstroObject } from '@/lib/astro/types'
import { formatDec, formatRA } from '@/lib/astro/coords'
import { otypeFamily } from '@/lib/astro/otypes'
import { formatAngle, formatDistance, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

const FAMILY_GRADIENT: Record<string, string> = {
  galaxy: 'from-sky-400/30 via-indigo-500/20 to-transparent',
  nebula: 'from-fuchsia-400/30 via-rose-500/20 to-transparent',
  cluster: 'from-amber-300/30 via-orange-500/15 to-transparent',
  star: 'from-yellow-200/30 via-amber-400/15 to-transparent',
  compact: 'from-violet-400/30 via-purple-600/20 to-transparent',
  other: 'from-slate-300/20 via-slate-500/10 to-transparent',
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
}
export const rise = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 260, damping: 30 } },
}

export default function ObjectDetails({ object, interpretedBy }: { object: AstroObject; interpretedBy?: 'rules' | 'ai' }) {
  const family = otypeFamily(object.otype)
  const distance = object.distance ? formatDistance(object.distance) : undefined
  const vmag = object.magnitudes?.find((m) => m.band === 'V') ?? object.magnitudes?.[0]
  const showId = object.id !== object.displayName

  const facts: { label: string; value: string; sub?: string }[] = []
  if (distance) facts.push({ label: 'Distância', value: distance.primary, sub: distance.secondary })
  if (vmag) facts.push({ label: `Magnitude ${vmag.band}`, value: formatNumber(vmag.value) })
  if (object.sizeArcmin) facts.push({ label: 'Tamanho aparente', value: formatAngle(object.sizeArcmin) })
  if (object.redshift !== undefined && Math.abs(object.redshift) > 0) facts.push({ label: 'Redshift (z)', value: formatNumber(object.redshift, 5) })
  if (object.radialVelocity !== undefined) facts.push({ label: 'Velocidade radial', value: `${formatNumber(object.radialVelocity, 1)} km/s` })
  if (object.spectralType) facts.push({ label: 'Tipo espectral', value: object.spectralType })
  if (object.morphology) facts.push({ label: 'Morfologia', value: object.morphology })

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex h-full flex-col gap-5">
      <motion.div variants={rise} className="relative">
        <div className={cn('pointer-events-none absolute -left-6 -top-10 h-40 w-56 rounded-full bg-gradient-to-br blur-3xl', FAMILY_GRADIENT[family])} />
        <div className="relative flex flex-wrap items-center gap-2">
          {object.typeLabel && <span className="eyebrow !text-white/55">{object.typeLabel}</span>}
          {interpretedBy === 'ai' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-200">
              <Sparkles className="h-3 w-3" /> interpretado por IA
            </span>
          )}
        </div>
        <h1 className="relative mt-2 text-balance text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[40px]">
          {object.displayName}
        </h1>
        {showId && <p className="relative mt-1.5 font-mono text-sm text-white/45">{object.id}</p>}
      </motion.div>

      <motion.div variants={rise} className="grid grid-cols-2 gap-2">
        <CoordCell label="Ascensão reta" value={formatRA(object.ra)} raw={object.ra.toFixed(6)} />
        <CoordCell label="Declinação" value={formatDec(object.dec)} raw={object.dec.toFixed(6)} />
      </motion.div>

      {facts.length > 0 && (
        <motion.dl variants={rise} className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4">
          {facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="eyebrow">{f.label}</dt>
              <dd className="mt-1 truncate text-[15px] text-white" title={f.value}>
                {f.value}
              </dd>
              {f.sub && <dd className="truncate text-xs text-white/45">{f.sub}</dd>}
            </div>
          ))}
        </motion.dl>
      )}

      {object.aliases && object.aliases.length > 0 && (
        <motion.div variants={rise}>
          <p className="eyebrow mb-2">Também conhecido como</p>
          <div className="flex flex-wrap gap-1.5">
            {object.aliases.slice(0, 12).map((a) => (
              <span key={a} className="rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] text-white/60">
                {a}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={rise} className="mt-auto flex flex-wrap gap-2 pt-1">
        <ExternalButton href={`https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(object.id)}`}>SIMBAD</ExternalButton>
        <ExternalButton href={`https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${encodeURIComponent(`${object.ra} ${object.dec}`)}`}>
          MAST Portal
        </ExternalButton>
        <ExternalButton href={`https://ned.ipac.caltech.edu/conesearch?coordinates=${object.ra}d%20${object.dec}d&radius=1`}>NED</ExternalButton>
      </motion.div>
    </motion.div>
  )
}

function CoordCell({ label, value, raw }: { label: string; value: string; raw: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(raw)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      className="focus-ring group rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
      title={`Copiar ${raw}°`}
    >
      <span className="eyebrow flex items-center justify-between">
        {label}
        {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />}
      </span>
      <span className="mt-1 block font-mono text-[13px] tabular-nums text-white">{value}</span>
    </button>
  )
}

function ExternalButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="chip focus-ring">
      {children}
      <ExternalLink className="h-3 w-3 opacity-60" />
    </a>
  )
}
