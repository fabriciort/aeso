import type { Item, Rng, Visual } from '@/lib/formation/schema'
import { t, type Intervalo } from '@/components/aula/visual/inequacao-geo'
export const I = (de: number | null, ate: number | null, incluiDe=false, incluiAte=false): Intervalo => ({de,ate,incluiDe,incluiAte})
/** Une faixas sobrepostas antes de escrever: duas opções não podem dizer o mesmo conjunto. */
function normalizar(is: Intervalo[]): Intervalo[] {
  const ordenados=is.map(i=>({...i})).sort((a,b)=>(a.de??-Infinity)-(b.de??-Infinity))
  const out:Intervalo[]=[]
  for(const i of ordenados){
    const p=out[out.length-1]
    if(!p){out.push(i);continue}
    if(p.ate===null || i.de===null || i.de<p.ate || (i.de===p.ate&&(p.incluiAte||i.incluiDe))){
      if(p.de===i.de)p.incluiDe=Boolean(p.incluiDe||i.incluiDe)
      if(p.ate!==null && (i.ate===null || i.ate>p.ate)){p.ate=i.ate;p.incluiAte=i.incluiAte}
      else if(p.ate===i.ate)p.incluiAte=Boolean(p.incluiAte||i.incluiAte)
    }else out.push(i)
  }
  return out
}
export function conjunto(originais: Intervalo[]): string {
  const is=normalizar(originais)
  if (!is.length) return 'Nenhuma solução'
  if (is.length===1 && is[0].de===null && is[0].ate===null) return 'Todos os reais'
  return '$'+is.map(i=>i.de===i.ate && i.de!==null ? `\\{${t(i.de)}\\}` : `${i.de!==null&&i.incluiDe?'[':']'}${i.de===null?'-\\infty':t(i.de)};${i.ate===null?'+\\infty':t(i.ate)}${i.ate!==null&&i.incluiAte?']':'['}`).join('\\cup')+'$'
}
export function escolha(r: Rng, certa: string, erradas: [string,string][]): Pick<Item,'formato'|'resposta'|'opcoes'|'erros'> {
  const os=[{texto:certa,erro:''}], vistas=new Set([certa])
  for (const [texto,erro] of erradas) if(!vistas.has(texto)){vistas.add(texto);os.push({texto,erro})}
  for(let j=os.length-1;j>0;j--){const k=r.int(0,j);[os[j],os[k]]=[os[k],os[j]]}
  return {formato:'escolha',resposta:os.findIndex(o=>!o.erro),opcoes:os.map(o=>o.texto),erros:Object.fromEntries(os.flatMap((o,j)=>o.erro?[[String(j),o.erro]]:[]))}
}
export const visual = (is: Intervalo[],de=-10,ate=10): Visual => ({modelo:'reta',estado:{faixas:{de,ate,intervalos:is}},esboco:'Faixa contínua com os extremos incluídos ou excluídos; as setas mostram que a solução continua além da janela.'})
export function numero(enunciado:string,resposta:number,dicas:Item['dicas'],erradas:[number,string][],v?:Visual):Item {
 return {enunciado,formato:'numero',resposta,sinal:true,dicas,erros:Object.fromEntries(erradas.filter(([x])=>x!==resposta).map(([x,e])=>[String(x).replace('-', '−'),e])),...(v?{visual:v}:{})}
}
