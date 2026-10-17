import type { Item, Rng, Visual } from '@/lib/formation/schema'

export const num = (n: number) => String(n).replace('.', ',').replace('-', '−')
export const texNum = (n: number) => String(n).replace('.', '{,}')
export const binomio = (d: number) => d === 0 ? 'x' : `x ${d < 0 ? '-' : '+'} ${Math.abs(d)}`

export function polinomio(a: number, b: number, c: number): string {
  const termos = [[a, 'x^2'], [b, 'x'], [c, '']] as const
  return termos.filter(([k]) => k !== 0).map(([k, letra], j) => {
    const corpo = `${letra && Math.abs(k) === 1 ? '' : Math.abs(k)}${letra}`
    return `${k < 0 ? (j === 0 ? '-' : ' - ') : j === 0 ? '' : ' + '}${corpo}`
  }).join('') || '0'
}

export function formulas(...ts: string[]): Visual {
  return { modelo: 'livre', estado: { formulas: ts }, esboco: 'A equação em TeX, sem raízes reveladas; o aluno decide o próximo passo.' }
}

export const conjunto = (xs: number[]) => xs.length === 0 ? 'Nenhuma raiz real' : `$x = ${[...new Set(xs)].sort((a, b) => a - b).map(texNum).join(' \\text{ ou } x = ')}$`

/** Remove colisões ANTES de embaralhar: uma resposta nunca tem dois sentidos. */
export function escolha(r: Rng, certa: string, erradas: [string, string][]): Pick<Item, 'formato' | 'opcoes' | 'resposta' | 'erros'> {
  const vistas = new Set([certa])
  const os = [{ texto: certa, erro: '' }]
  for (const [texto, erro] of erradas) if (!vistas.has(texto)) { vistas.add(texto); os.push({ texto, erro }) }
  for (let j = os.length - 1; j > 0; j--) {
    const k = r.int(0, j)
    ;[os[j], os[k]] = [os[k], os[j]]
  }
  return { formato: 'escolha', opcoes: os.map((o) => o.texto), resposta: os.findIndex((o) => !o.erro),
    erros: Object.fromEntries(os.flatMap((o, j) => o.erro ? [[String(j), o.erro]] : [])) }
}

export function numero(enunciado: string, resposta: number, dicas: Item['dicas'], erradas: [number, string][], visual?: Visual): Item {
  const erros: Record<string, string> = {}
  for (const [n, erro] of erradas) if (n !== resposta && !(num(n) in erros)) erros[num(n)] = erro
  return { enunciado, formato: 'numero', resposta: Number.isInteger(resposta) ? resposta : num(resposta), sinal: true, erros, dicas, ...(visual ? { visual } : {}) }
}
