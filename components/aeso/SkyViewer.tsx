'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Crosshair, Maximize2, Minimize2, Minus, Plus } from 'lucide-react'
import type { AladinInstance, AladinStatic, GraphicOverlay } from 'aladin-lite'
import type { Observation } from '@/lib/astro/types'
import { separation } from '@/lib/astro/coords'
import { missionColor } from '@/lib/missions'
import { cn } from '@/lib/utils'

export const SURVEYS = [
  { id: 'P/DSS2/color', label: 'Óptico', hint: 'DSS2 colorido · céu inteiro' },
  { id: 'P/PanSTARRS/DR1/color-z-zg-g', label: 'Pan-STARRS', hint: 'Óptico profundo · dec > −30°' },
  { id: 'P/2MASS/color', label: 'Infravermelho', hint: '2MASS J/H/K' },
  { id: 'P/allWISE/color', label: 'WISE', hint: 'Infravermelho médio' },
  { id: 'P/GALEXGR6_7/NUV', label: 'Ultravioleta', hint: 'GALEX NUV' },
] as const

interface SkyViewerProps {
  ra: number
  dec: number
  fov: number
  label?: string
  observations?: Observation[]
  highlighted?: string | null
  className?: string
}

type Status = 'loading' | 'ready' | 'unsupported'

/** Rough angular size (degrees) of an STC-S region, to skip huge footprints. */
function regionExtent(region: string): number {
  const nums = (region.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
  if (/^\s*CIRCLE/i.test(region) && nums.length >= 3) return nums[2] * 2
  let max = 0
  for (let i = 0; i + 3 < nums.length; i += 2) {
    const dRa = Math.abs(nums[i] - nums[0]) * Math.cos((nums[1] * Math.PI) / 180)
    const dDec = Math.abs(nums[i + 1] - nums[1])
    max = Math.max(max, Math.min(dRa, 360 - dRa), dDec)
  }
  return max
}

const MAX_FOOTPRINTS = 250

export default function SkyViewer({ ra, dec, fov, label, observations, highlighted, className }: SkyViewerProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const aladinRef = useRef<AladinInstance | null>(null)
  const libRef = useRef<AladinStatic | null>(null)
  const footprintsRef = useRef<GraphicOverlay | null>(null)
  const highlightRef = useRef<GraphicOverlay | null>(null)
  const targetRef = useRef({ ra, dec, fov })
  const [status, setStatus] = useState<Status>('loading')
  const [survey, setSurvey] = useState<string>(SURVEYS[0].id)
  const [fullscreen, setFullscreen] = useState(false)
  const [showFootprints, setShowFootprints] = useState(true)

  targetRef.current = { ra, dec, fov }

  // Boot Aladin Lite once (client-only: it needs WebGL2 and the DOM).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const A = (await import('aladin-lite')).default
        await A.init
        if (cancelled || !containerRef.current) return
        const t = targetRef.current
        const aladin = A.aladin(containerRef.current, {
          survey: SURVEYS[0].id,
          fov: t.fov,
          target: `${t.ra} ${t.dec}`,
          cooFrame: 'ICRS',
          projection: 'SIN',
          showReticle: false,
          showZoomControl: false,
          showFullscreenControl: false,
          showLayersControl: false,
          showGotoControl: false,
          showFrame: false,
          showCooLocation: false,
          showProjectionControl: false,
          showStatusBar: false,
          showContextMenu: false,
          showSimbadPointerControl: false,
          showCooGridControl: false,
          showSettingsControl: false,
          showShareControl: false,
          showFov: false,
          backgroundColor: 'rgb(3, 4, 7)',
        })
        libRef.current = A
        aladinRef.current = aladin
        footprintsRef.current = A.graphicOverlay({ name: 'Observações MAST', lineWidth: 1.25 })
        highlightRef.current = A.graphicOverlay({ name: 'Selecionada', lineWidth: 3 })
        aladin.addOverlay(footprintsRef.current)
        aladin.addOverlay(highlightRef.current)
        setStatus('ready')
      } catch (err) {
        console.error('[SkyViewer]', err)
        if (!cancelled) setStatus('unsupported')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Fly to a new target: zoom out, pan, zoom back in.
  useEffect(() => {
    const aladin = aladinRef.current
    if (!aladin || status !== 'ready') return
    const [cRa, cDec] = aladin.getRaDec()
    const sep = separation({ ra: cRa, dec: cDec }, { ra, dec })
    if (sep < 1e-4) {
      aladin.zoomToFoV(fov, 0.9)
      return
    }
    const currentFov = Math.max(...aladin.getFov())
    const cruise = Math.min(Math.max(currentFov, sep * 1.6, fov), 140)
    aladin.zoomToFoV(cruise, 0.7, () => {
      aladin.animateToRaDec(ra, dec, Math.min(0.8 + sep / 90, 1.8), () => aladin.zoomToFoV(fov, 1.2))
    })
  }, [ra, dec, fov, status])

  useEffect(() => {
    if (status === 'ready') aladinRef.current?.setBaseImageLayer(survey)
  }, [survey, status])

  // MAST footprints
  useEffect(() => {
    const A = libRef.current
    const overlay = footprintsRef.current
    if (!A || !overlay || status !== 'ready') return
    overlay.removeAll()
    overlay.reportChange?.()
    if (!showFootprints) {
      overlay.hide()
      return
    }
    overlay.show()
    // Skip footprints much larger than the view (TESS sectors, GALEX tiles…):
    // they would cover the object without telling anything useful.
    const limit = Math.max(fov * 1.6, 0.05)
    const small = (observations ?? [])
      .filter((o) => o.region)
      .map((o) => ({ o, size: regionExtent(o.region!) }))
      .filter((x) => x.size > 0 && x.size <= limit)
      .sort((a, b) => a.size - b.size)
      .slice(0, MAX_FOOTPRINTS)
      .map((x) => x.o)
    for (const o of small) {
      if (!o.region) continue
      try {
        overlay.addFootprints(A.footprintsFromSTCS(o.region, { color: missionColor(o.collection), lineWidth: 1.25 }))
      } catch {
        // Some regions use STC-S constructs Aladin cannot parse; skip them.
      }
    }
  }, [observations, status, showFootprints, fov])

  useEffect(() => {
    const A = libRef.current
    const overlay = highlightRef.current
    if (!A || !overlay || status !== 'ready') return
    overlay.removeAll()
    overlay.reportChange?.()
    const o = observations?.find((x) => x.obsid === highlighted)
    if (o?.region) {
      try {
        overlay.addFootprints(A.footprintsFromSTCS(o.region, { color: '#ffffff', lineWidth: 2.5 }))
      } catch {}
    }
  }, [highlighted, observations, status])

  // Native fullscreen for an immersive look.
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else frameRef.current?.requestFullscreen?.()
  }

  const recenter = () => {
    const aladin = aladinRef.current
    if (!aladin) return
    aladin.animateToRaDec(ra, dec, 0.8, () => aladin.zoomToFoV(fov, 0.8))
  }

  return (
    <div
      ref={frameRef}
      className={cn('group relative isolate overflow-hidden bg-[#030407]', fullscreen ? 'rounded-none' : 'rounded-[28px]', className)}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" aria-label={`Visualização do céu em torno de ${label ?? 'alvo'}`} />

      {/* Soft vignette to blend the canvas into the UI */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_120px_30px_rgba(3,4,7,0.85)]" />

      <AnimatePresence>
        {status !== 'ready' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#030407]"
          >
            {status === 'loading' ? (
              <>
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 animate-ping rounded-full border border-white/20" />
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-sky-300/60 to-indigo-500/40 blur-[2px]" />
                </div>
                <p className="text-sm text-white/50">Preparando o céu…</p>
              </>
            ) : (
              <p className="max-w-xs text-center text-sm text-white/50">
                Seu navegador não suporta WebGL2, necessário para o visualizador interativo.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target label */}
      {label && (
        <div className="pointer-events-none absolute left-4 top-4 z-20 flex max-w-[calc(100%-80px)] items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur-xl">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.6)]" />
          <span className="truncate">{label}</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
        <ControlButton label="Aproximar" onClick={() => aladinRef.current?.increaseZoom()}>
          <Plus className="h-4 w-4" />
        </ControlButton>
        <ControlButton label="Afastar" onClick={() => aladinRef.current?.decreaseZoom()}>
          <Minus className="h-4 w-4" />
        </ControlButton>
        <ControlButton label="Recentralizar" onClick={recenter}>
          <Crosshair className="h-4 w-4" />
        </ControlButton>
        <ControlButton label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'} onClick={toggleFullscreen}>
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </ControlButton>
      </div>

      <div className="absolute inset-x-4 bottom-4 z-20 flex flex-wrap items-end justify-between gap-2">
        <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-black/45 p-1 backdrop-blur-xl [scrollbar-width:none]">
          {SURVEYS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSurvey(s.id)}
              title={s.hint}
              className={cn(
                'focus-ring relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors',
                survey === s.id ? 'text-black' : 'text-white/65 hover:text-white',
              )}
            >
              {survey === s.id && (
                <motion.span
                  layoutId="survey-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{s.label}</span>
            </button>
          ))}
        </div>
        {observations && observations.length > 0 && (
          <button
            onClick={() => setShowFootprints((v) => !v)}
            className={cn(
              'focus-ring rounded-full bg-black/45 px-3 py-2 text-xs backdrop-blur-xl transition-colors',
              showFootprints ? 'text-white' : 'text-white/50',
            )}
          >
            {showFootprints ? 'Ocultar' : 'Mostrar'} campos observados
          </button>
        )}
      </div>
    </div>
  )
}

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white/80 backdrop-blur-xl transition hover:bg-black/65 hover:text-white active:scale-95"
    >
      {children}
    </button>
  )
}
