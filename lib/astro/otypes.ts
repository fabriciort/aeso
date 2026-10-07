// SIMBAD object type codes → pt-BR labels. Covers the common types; unknown
// codes fall back to the raw code.
// Reference: https://simbad.cds.unistra.fr/guide/otypes.htx

const LABELS: Record<string, string> = {
  '*': 'Estrela',
  '**': 'Estrela dupla ou múltipla',
  'SB*': 'Binária espectroscópica',
  'EB*': 'Binária eclipsante',
  'V*': 'Estrela variável',
  'Ce*': 'Cefeida',
  'RR*': 'Variável RR Lyrae',
  'Mi*': 'Variável Mira',
  'WD*': 'Anã branca',
  'N*': 'Estrela de nêutrons',
  Psr: 'Pulsar',
  'RG*': 'Gigante vermelha',
  's*r': 'Supergigante vermelha',
  's*b': 'Supergigante azul',
  'HB*': 'Estrela do ramo horizontal',
  'BS*': 'Retardatária azul',
  'Y*O': 'Objeto estelar jovem',
  'TT*': 'Estrela T Tauri',
  'Em*': 'Estrela de emissão',
  'WR*': 'Estrela Wolf-Rayet',
  'C*': 'Estrela de carbono',
  'BD*': 'Anã marrom',
  'PM*': 'Estrela de alto movimento próprio',
  'HV*': 'Estrela de alta velocidade',
  'No*': 'Nova',
  SN: 'Supernova',
  SNR: 'Remanescente de supernova',
  BH: 'Buraco negro',
  XB: 'Binária de raios X',
  'Pl': 'Exoplaneta',
  'Pl?': 'Candidato a exoplaneta',
  PN: 'Nebulosa planetária',
  HII: 'Região H II',
  ISM: 'Meio interestelar',
  Cld: 'Nuvem',
  MoC: 'Nuvem molecular',
  DNe: 'Nebulosa escura',
  RNe: 'Nebulosa de reflexão',
  GNe: 'Nebulosa',
  EmO: 'Objeto de emissão',
  Cl: 'Aglomerado estelar',
  GlC: 'Aglomerado globular',
  OpC: 'Aglomerado aberto',
  As: 'Associação estelar',
  G: 'Galáxia',
  GiG: 'Galáxia em grupo',
  GiC: 'Galáxia em aglomerado',
  BiC: 'Galáxia mais brilhante de aglomerado',
  IG: 'Galáxias em interação',
  PaG: 'Par de galáxias',
  SBG: 'Galáxia starburst',
  bCG: 'Galáxia anã compacta azul',
  LSB: 'Galáxia de baixo brilho superficial',
  EmG: 'Galáxia de emissão',
  H2G: 'Galáxia H II',
  rG: 'Radiogaláxia',
  AGN: 'Núcleo galáctico ativo',
  LIN: 'Galáxia LINER',
  SyG: 'Galáxia Seyfert',
  Sy1: 'Galáxia Seyfert 1',
  Sy2: 'Galáxia Seyfert 2',
  Bla: 'Blazar',
  BLL: 'Objeto BL Lac',
  QSO: 'Quasar',
  GrG: 'Grupo de galáxias',
  CGG: 'Grupo compacto de galáxias',
  ClG: 'Aglomerado de galáxias',
  SCG: 'Superaglomerado de galáxias',
  gLS: 'Lente gravitacional',
  LeI: 'Imagem de lente gravitacional',
  GWE: 'Evento de onda gravitacional',
  gam: 'Fonte de raios gama',
  X: 'Fonte de raios X',
  Rad: 'Fonte de rádio',
  IR: 'Fonte infravermelha',
  UV: 'Fonte ultravioleta',
}

export function otypeLabel(code?: string | null): string | undefined {
  if (!code) return undefined
  const clean = code.trim()
  return LABELS[clean] ?? LABELS[clean.replace(/_Candidate$|\?$/, '')] ?? clean
}

/** Coarse family used for icons, colors and default field-of-view. */
export type ObjectFamily = 'star' | 'galaxy' | 'nebula' | 'cluster' | 'compact' | 'other'

export function otypeFamily(code?: string | null): ObjectFamily {
  if (!code) return 'other'
  const c = code.trim()
  if (/^(G|GiG|GiC|BiC|IG|PaG|SBG|bCG|LSB|EmG|H2G|rG|AGN|LIN|SyG|Sy1|Sy2|Bla|BLL|QSO|GrG|CGG|ClG|SCG)$/.test(c)) return 'galaxy'
  if (/^(PN|HII|ISM|Cld|MoC|DNe|RNe|GNe|EmO|SNR)$/.test(c)) return 'nebula'
  if (/^(Cl|GlC|OpC|As)$/.test(c)) return 'cluster'
  if (/^(BH|N\*|Psr|XB|WD\*)$/.test(c)) return 'compact'
  if (c.includes('*')) return 'star'
  return 'other'
}
