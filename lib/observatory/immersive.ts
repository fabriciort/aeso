'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

// Modo foco: makes the lab take the whole screen.
//
// What browsers allow (and what they don't):
// - Android/desktop: Fullscreen API. The browser ALWAYS shows its own
//   "full screen" notice; websites cannot disable it (anti-phishing). We
//   enter fullscreen at the start of our own transition so the notice
//   lands on the animation, not on content.
// - iPhone Safari: no Fullscreen API for pages. Only an installed web app
//   (Add to Home Screen) runs without browser chrome.
// - Installed app (display-mode standalone/fullscreen): already immersive,
//   nothing to request and no notice at all.

type WakeLockSentinelLike = { release: () => Promise<void> }

export function isInstalledApp(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function canFullscreen(): boolean {
  if (typeof document === 'undefined') return false
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: unknown }
  return Boolean(document.fullscreenEnabled && (el.requestFullscreen || el.webkitRequestFullscreen))
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

let wakeLock: WakeLockSentinelLike | null = null

async function keepAwake() {
  try {
    const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock
    if (wl && !wakeLock) wakeLock = await wl.request('screen')
  } catch {
    // battery saver or unsupported: ignore
  }
}

async function releaseAwake() {
  try {
    await wakeLock?.release()
  } catch {}
  wakeLock = null
}

/** Must be called from a user gesture (click/tap). */
export async function enterFocus(): Promise<boolean> {
  void keepAwake()
  if (isInstalledApp()) return true
  if (!canFullscreen() || document.fullscreenElement) return Boolean(document.fullscreenElement)
  try {
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    try {
      // Keep phones upright inside a lab; ignored where unsupported.
      await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('portrait')
    } catch {}
    return true
  } catch {
    return false
  }
}

export async function exitFocus() {
  void releaseAwake()
  try {
    ;(screen.orientation as ScreenOrientation & { unlock?: () => void }).unlock?.()
  } catch {}
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch {}
  }
}

function subscribeFullscreen(cb: () => void) {
  document.addEventListener('fullscreenchange', cb)
  return () => document.removeEventListener('fullscreenchange', cb)
}

/** Whether the page is currently immersive (fullscreen or installed app). */
export function useImmersive(): boolean {
  return useSyncExternalStore(
    subscribeFullscreen,
    () => Boolean(document.fullscreenElement) || isInstalledApp(),
    () => false,
  )
}

// Wake lock is dropped when the tab is hidden; re-acquire on return.
export function useKeepAwake(active: boolean) {
  useEffect(() => {
    if (!active) return
    void keepAwake()
    const onVis = () => document.visibilityState === 'visible' && keepAwake()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      void releaseAwake()
    }
  }, [active])
}

// ------------------------------------------------------------ Install

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const installListeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    installListeners.forEach((l) => l())
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installListeners.forEach((l) => l())
  })
}

export type InstallMode = 'prompt' | 'ios' | 'none'

export function useInstall(): { mode: InstallMode; install: () => Promise<boolean> } {
  const [version, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    installListeners.add(l)
    return () => {
      installListeners.delete(l)
    }
  }, [])
  const [mode, setMode] = useState<InstallMode>('none')
  useEffect(() => {
    if (isInstalledApp()) setMode('none')
    else if (deferred) setMode('prompt')
    else if (isIOS()) setMode('ios')
    else setMode('none')
  }, [version])
  const install = useCallback(async () => {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    return outcome === 'accepted'
  }, [])
  return { mode, install }
}

/** Light haptic feedback where supported (Android). */
export function haptic(pattern: number | number[] = 8) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
  } catch {}
}
