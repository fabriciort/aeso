// Shared types between the API routes and the client UI.

export interface Measurement {
  value: number
  unit: string
  /** Free-form origin of the value, e.g. "paralaxe", "redshift", "SIMBAD". */
  source?: string
  approximate?: boolean
}

export interface AstroObject {
  /** Canonical identifier (SIMBAD main_id when available). */
  id: string
  /** What the user typed / the friendliest display name. */
  displayName: string
  ra: number
  dec: number
  /** SIMBAD object type code, e.g. "Sy2", "GlC", "*". */
  otype?: string
  /** Human readable object type (pt-BR). */
  typeLabel?: string
  morphology?: string
  spectralType?: string
  magnitudes?: { band: string; value: number }[]
  redshift?: number
  radialVelocity?: number
  parallax?: number
  distance?: Measurement
  /** Angular size (major axis) in arcminutes. */
  sizeArcmin?: number
  aliases?: string[]
  /** Field of view (degrees) that frames the object nicely in the viewer. */
  fov: number
  sources: string[]
}

export interface ObjectListItem {
  id: string
  ra: number
  dec: number
  otype?: string
  typeLabel?: string
  morphology?: string
  spectralType?: string
  magnitude?: number
  redshift?: number
  sizeArcmin?: number
}

export interface Observation {
  obsid: string
  collection: string
  instrument: string
  filters?: string
  target?: string
  productType?: string
  /** ISO date of the start of the observation. */
  date?: string
  exposure?: number
  proposalId?: string
  ra: number
  dec: number
  region?: string
  previewUrl?: string
  isPublic: boolean
  calibLevel?: number
  wavelengthRegion?: string
}

export interface DataProduct {
  id: string
  filename: string
  uri: string
  downloadUrl: string
  size?: number
  productType?: string
  description?: string
  subgroup?: string
  calibLevel?: number
  isPublic: boolean
}

/** Structured description of a characteristic ("by property") search. */
export interface SearchFilters {
  otype?: string
  morphology?: string
  spectralType?: string
  catalog?: string
  magMax?: number
  magMin?: number
  redshiftMax?: number
  redshiftMin?: number
  near?: string
  nearCoords?: { ra: number; dec: number }
  radiusDeg?: number
  sort?: 'brightness' | 'size' | 'redshift'
  limit?: number
}

export type SearchResponse =
  | { kind: 'object'; query: string; object: AstroObject; interpretedBy?: 'rules' | 'ai' }
  | {
      kind: 'list'
      query: string
      description: string
      filters: SearchFilters
      results: ObjectListItem[]
      interpretedBy: 'rules' | 'ai'
    }
  | { kind: 'empty'; query: string; message: string; hint?: string }
  | { kind: 'error'; query: string; message: string }
