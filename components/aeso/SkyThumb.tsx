'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Small sky cutout rendered on the fly by the CDS hips2fits service.
 * https://alasky.cds.unistra.fr/hips-image-services/hips2fits
 */
export function skyCutoutUrl(ra: number, dec: number, fovDeg: number, size = 256, hips = 'CDS/P/DSS2/color') {
  const p = new URLSearchParams({
    hips,
    width: String(size),
    height: String(size),
    fov: fovDeg.toFixed(4),
    projection: 'TAN',
    coordsys: 'icrs',
    ra: ra.toFixed(6),
    dec: dec.toFixed(6),
    format: 'jpg',
  })
  return `https://alasky.cds.unistra.fr/hips-image-services/hips2fits?${p}`
}

export default function SkyThumb({
  ra,
  dec,
  fov,
  size = 256,
  className,
  alt = '',
}: {
  ra: number
  dec: number
  fov: number
  size?: number
  className?: string
  alt?: string
}) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  return (
    <div className={cn('relative overflow-hidden bg-[#06070b]', className)}>
      {state !== 'ok' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(148,180,255,0.18),transparent_55%)]">
          {state === 'loading' && (
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
          )}
        </div>
      )}
      {state !== 'error' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={skyCutoutUrl(ra, dec, fov, size)}
          alt={alt}
          loading="lazy"
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={cn('h-full w-full object-cover transition-all duration-700', state === 'ok' ? 'scale-100 opacity-100' : 'scale-105 opacity-0')}
        />
      )}
    </div>
  )
}
