import type { Item, Rng, Visual } from '@/lib/formation/schema'
import { linearTex, type EquacaoSistema } from '@/components/aula/visual/sistema-geo'

export const num = (n: number) => String(n).replace('-', '−').replace('.', ',')
export const tex = (n: number) => String(n).replace('.', '{,}')
export const par = (x: number, y: number) => `$(${tex(x)}; ${tex(y)})$`
export const eq = (e: EquacaoSistema) => linearTex(e).replace(/\./g, '{,}')
export const visual = (equacoes: [EquacaoSistema, EquacaoSistema]): Visual => ({ modelo: 'livre', estado: { sistema: { equacoes } }, esboco: 'As duas equações originais, sem o par solução: o aluno precisa combinar as condições.' })
export function escolha(r: Rng, certa: string, erradas: [string, string][]): Pick<Item, 'formato' | 'opcoes' | 'resposta' | 'erros'> {
  const vistas = new Set([certa])
  const os = [{ texto: certa, erro: '' }]
  for (const [texto, erro] of erradas) if (!vistas.has(texto)) { vistas.add(texto); os.push({ texto, erro }) }
  for (let j = os.length - 1; j > 0; j--) { const k = r.int(0, j); [os[j], os[k]] = [os[k], os[j]] }
  return { formato: 'escolha', opcoes: os.map(o => o.texto), resposta: os.findIndex(o => !o.erro), erros: Object.fromEntries(os.flatMap((o, j) => o.erro ? [[String(j), o.erro]] : [])) }
}
export function numero(enunciado: string, resposta: number, dicas: Item['dicas'], erradas: [number, string][], v?: Visual): Item {
  return { enunciado, formato: 'numero', resposta: Number.isInteger(resposta) ? resposta : num(resposta), sinal: true, dicas,
    erros: Object.fromEntries(erradas.filter(([v]) => v !== resposta).map(([v, e]) => [num(v), e])), ...(v ? { visual: v } : {}) }
}
