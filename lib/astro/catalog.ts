// Small built-in index of well-known objects. It powers instant autocomplete
// in the search bar and translates popular (pt-BR / English) names that the
// name resolvers do not understand, e.g. "Pilares da Criação" → M 16.

export interface FamousObject {
  id: string
  names: string[]
  type: string
}

export const FAMOUS_OBJECTS: FamousObject[] = [
  { id: 'M31', names: ['Galáxia de Andrômeda', 'Andrômeda', 'Andromeda Galaxy', 'Andromeda'], type: 'Galáxia espiral' },
  { id: 'M51', names: ['Galáxia do Rodamoinho', 'Rodamoinho', 'Whirlpool Galaxy', 'Whirlpool'], type: 'Galáxia espiral' },
  { id: 'M42', names: ['Nebulosa de Órion', 'Órion', 'Orion Nebula'], type: 'Nebulosa de emissão' },
  { id: 'M45', names: ['Plêiades', 'Pleiades', 'Sete Irmãs'], type: 'Aglomerado aberto' },
  { id: 'M1', names: ['Nebulosa do Caranguejo', 'Caranguejo', 'Crab Nebula'], type: 'Remanescente de supernova' },
  { id: 'M16', names: ['Pilares da Criação', 'Nebulosa da Águia', 'Pillars of Creation', 'Eagle Nebula'], type: 'Nebulosa de emissão' },
  { id: 'M104', names: ['Galáxia do Sombrero', 'Sombrero', 'Sombrero Galaxy'], type: 'Galáxia espiral' },
  { id: 'M33', names: ['Galáxia do Triângulo', 'Triângulo', 'Triangulum Galaxy'], type: 'Galáxia espiral' },
  { id: 'M57', names: ['Nebulosa do Anel', 'Ring Nebula'], type: 'Nebulosa planetária' },
  { id: 'M27', names: ['Nebulosa do Haltere', 'Dumbbell Nebula'], type: 'Nebulosa planetária' },
  { id: 'M13', names: ['Grande Aglomerado de Hércules', 'Hercules Cluster'], type: 'Aglomerado globular' },
  { id: 'M87', names: ['Virgo A', 'M87*'], type: 'Galáxia elíptica' },
  { id: 'M82', names: ['Galáxia do Charuto', 'Cigar Galaxy'], type: 'Galáxia starburst' },
  { id: 'M81', names: ['Galáxia de Bode', "Bode's Galaxy"], type: 'Galáxia espiral' },
  { id: 'M8', names: ['Nebulosa da Lagoa', 'Lagoon Nebula'], type: 'Nebulosa de emissão' },
  { id: 'M20', names: ['Nebulosa Trífida', 'Trifid Nebula'], type: 'Nebulosa' },
  { id: 'M17', names: ['Nebulosa Ômega', 'Omega Nebula', 'Swan Nebula'], type: 'Nebulosa de emissão' },
  { id: 'M64', names: ['Galáxia do Olho Negro', 'Black Eye Galaxy'], type: 'Galáxia espiral' },
  { id: 'M101', names: ['Galáxia do Cata-vento', 'Pinwheel Galaxy'], type: 'Galáxia espiral' },
  { id: 'NGC 5139', names: ['Ômega Centauri', 'Omega Centauri', 'ω Cen'], type: 'Aglomerado globular' },
  { id: 'NGC 6543', names: ['Nebulosa Olho de Gato', "Cat's Eye Nebula"], type: 'Nebulosa planetária' },
  { id: 'NGC 1300', names: ['NGC 1300'], type: 'Galáxia espiral barrada' },
  { id: 'NGC 3372', names: ['Nebulosa de Carina', 'Carina Nebula', 'Eta Carinae Nebula'], type: 'Nebulosa de emissão' },
  { id: 'NGC 7293', names: ['Nebulosa da Hélice', 'Helix Nebula'], type: 'Nebulosa planetária' },
  { id: 'NGC 2070', names: ['Nebulosa da Tarântula', 'Tarantula Nebula', '30 Doradus'], type: 'Região H II' },
  { id: 'NGC 7318', names: ['Quinteto de Stephan', "Stephan's Quintet"], type: 'Grupo compacto de galáxias' },
  { id: 'NGC 3132', names: ['Nebulosa do Anel Sul', 'Southern Ring Nebula'], type: 'Nebulosa planetária' },
  { id: 'NGC 628', names: ['M74', 'Phantom Galaxy', 'Galáxia Fantasma'], type: 'Galáxia espiral' },
  { id: 'LMC', names: ['Grande Nuvem de Magalhães', 'Large Magellanic Cloud'], type: 'Galáxia anã' },
  { id: 'SMC', names: ['Pequena Nuvem de Magalhães', 'Small Magellanic Cloud'], type: 'Galáxia anã' },
  { id: 'Sgr A*', names: ['Sagitário A*', 'Centro galáctico', 'Galactic Center'], type: 'Buraco negro supermassivo' },
  { id: 'Cen A', names: ['Centaurus A', 'NGC 5128'], type: 'Radiogaláxia' },
  { id: 'SMACS J0723.3-7327', names: ['SMACS 0723', 'Primeiro campo profundo do JWST', "Webb's First Deep Field"], type: 'Aglomerado de galáxias' },
  { id: 'Abell 1689', names: ['Abell 1689'], type: 'Aglomerado de galáxias' },
  { id: 'Sirius', names: ['Sírius', 'alf CMa'], type: 'Estrela' },
  { id: 'Betelgeuse', names: ['Betelgeuse', 'alf Ori'], type: 'Supergigante vermelha' },
  { id: 'Vega', names: ['Vega', 'alf Lyr'], type: 'Estrela' },
  { id: 'Polaris', names: ['Estrela Polar', 'Polaris'], type: 'Estrela' },
  { id: 'Proxima Cen', names: ['Próxima Centauri', 'Proxima Centauri'], type: 'Anã vermelha' },
  { id: 'eta Car', names: ['Eta Carinae'], type: 'Estrela variável' },
  { id: 'TRAPPIST-1', names: ['TRAPPIST-1'], type: 'Estrela com exoplanetas' },
  { id: 'HD 209458', names: ['Osiris', 'HD 209458'], type: 'Estrela com exoplaneta' },
  { id: 'WASP-39', names: ['WASP-39'], type: 'Estrela com exoplaneta' },
  { id: '3C 273', names: ['3C 273'], type: 'Quasar' },
  { id: 'Cas A', names: ['Cassiopeia A'], type: 'Remanescente de supernova' },
  { id: 'SN 1987A', names: ['SN 1987A', 'Supernova 1987A'], type: 'Supernova' },
]

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9*+.,<>=\- ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "m 51", "M51", "ngc1300" → comparable compact form. */
function compact(s: string): string {
  return normalize(s).replace(/\s+/g, '')
}

/** Exact match against an id or a popular name. */
export function lookupFamous(query: string): FamousObject | undefined {
  const q = compact(query)
  if (!q) return undefined
  return FAMOUS_OBJECTS.find((o) => compact(o.id) === q || o.names.some((n) => compact(n) === q))
}

export interface Suggestion {
  id: string
  label: string
  type: string
}

/** Prefix/substring matches for instant autocomplete. */
export function suggest(query: string, limit = 6): Suggestion[] {
  const q = normalize(query)
  if (q.length < 1) return []
  const qc = q.replace(/\s+/g, '')
  const scored: { s: Suggestion; score: number }[] = []
  for (const o of FAMOUS_OBJECTS) {
    const candidates = [o.id, ...o.names]
    let best = -1
    let label = o.names[0]
    for (const c of candidates) {
      const n = normalize(c)
      const nc = n.replace(/\s+/g, '')
      let score = -1
      if (nc === qc) score = 100
      else if (nc.startsWith(qc)) score = 80 - nc.length / 10
      else if (n.split(' ').some((w) => w.startsWith(q))) score = 60 - nc.length / 10
      else if (nc.includes(qc) && qc.length >= 3) score = 40
      if (score > best) {
        best = score
        label = c === o.id ? o.names[0] : c
      }
    }
    if (best >= 0) scored.push({ s: { id: o.id, label, type: o.type }, score: best })
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s)
}
