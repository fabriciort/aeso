// Minimal typings for the parts of Aladin Lite v3 used by AESo.
declare module 'aladin-lite' {
  export interface AladinInstance {
    gotoRaDec(ra: number, dec: number): void
    animateToRaDec(ra: number, dec: number, durationSec?: number, onComplete?: () => void): void
    zoomToFoV(fov: number, durationSec?: number, onComplete?: () => void): void
    setFoV(fov: number): void
    getFov(): [number, number]
    getRaDec(): [number, number]
    setBaseImageLayer(id: string): void
    addOverlay(overlay: GraphicOverlay): void
    increaseZoom(): void
    decreaseZoom(): void
    on(event: string, cb: (...args: unknown[]) => void): void
    addListener(event: string, cb: (e: Event) => void): void
  }
  export interface GraphicOverlay {
    addFootprints(fps: unknown[]): void
    removeAll(): void
    reportChange?(): void
    hide(): void
    show(): void
  }
  export interface AladinStatic {
    init: Promise<void>
    aladin(el: HTMLElement | string, options?: Record<string, unknown>): AladinInstance
    graphicOverlay(options?: Record<string, unknown>): GraphicOverlay
    footprintsFromSTCS(stcs: string, options?: Record<string, unknown>): unknown[]
  }
  const A: AladinStatic
  export default A
}
