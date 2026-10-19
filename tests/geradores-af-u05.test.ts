import { describe, expect, it } from 'vitest'
import { AULAS_AF_U05 } from '@/content/matematica/algebra/u05'
import { GERADORES_AF_U05 } from '@/content/matematica/geradores/inequacoes'
import { getUnit } from '@/lib/math/curriculum'
import { rng } from '@/lib/formation/rng'
import type { Rng } from '@/lib/formation/schema'

// Parser independente. A expressão lida do enunciado é avaliada com a ordem
// das operações, sem consultar os coeficientes ou intervalos da produção.
const limpar=(s:string)=>s.replace(/\{,\}/g,'.').replace(/−/g,'-').replace(/\s/g,'')
function avaliar(src:string,x:number):number {
 const s=limpar(src),ts=s.match(/\d+(?:\.\d+)?|[x()+\-*^]/g)??[]
 expect(ts.join('')).toBe(s);let j=0
 function atomo():number {const t=ts[j++];if(t==='('){const a=soma();expect(ts[j++]).toBe(')');return a}if(t==='x')return x;expect(t).toMatch(/^\d+(?:\.\d+)?$/);return Number(t)}
 function potencia():number {let a=atomo();if(ts[j]==='^'){j++;a=a**atomo()}return a}
 function sinal():number {if(ts[j]==='-'){j++;return -sinal()}if(ts[j]==='+'){j++;return sinal()}return potencia()}
 function produto():number {let a=sinal();while(j<ts.length&&(ts[j]==='*'||/^[x(\d]/.test(ts[j]))){if(ts[j]==='*')j++;a*=sinal()}return a}
 function soma():number {let a=produto();while(ts[j]==='+'||ts[j]==='-'){const t=ts[j++];a+=(t==='+'?1:-1)*produto()}return a}
 const a=soma();expect(j).toBe(ts.length);return a
}
function lerCondicao(tex:string) {
 const ts=tex.split(/(\\le|\\ge|<|>)/),preds:((x:number)=>boolean)[]=[],pontos:number[]=[]
 expect(ts.length).toBeGreaterThan(2)
 for(let j=1;j<ts.length;j+=2){const op=ts[j],f=(x:number)=>avaliar(ts[j-1],x)-avaliar(ts[j+1],x)
  const c=f(0),a=(f(1)+f(-1)-2*c)/2,b=(f(1)-f(-1))/2
  const valor=(x:number)=>(a*x+b)*x+c
  preds.push(x=>op==='<'?valor(x)<0:op==='>'?valor(x)>0:op==='\\le'?valor(x)<=0:valor(x)>=0)
  if(a!==0){const d=b*b-4*a*c;if(d>=0)pontos.push((-b-Math.sqrt(d))/(2*a),(-b+Math.sqrt(d))/(2*a))}else if(b!==0)pontos.push(-c/b)
 }
 return {testar:(x:number)=>preds.every(fn=>fn(x)),pontos}
}
function lerConjunto(src:string){
 const s=limpar(src).replace(/\$/g,'')
 if(s==='\\mathbb{R}'||s==='Todososreais')return {testar:()=>true,pontos:[] as number[]}
 if(s==='\\varnothing'||s==='Nenhumasolução')return {testar:()=>false,pontos:[] as number[]}
 const ps:number[]=[],fs:((x:number)=>boolean)[]=[]
 for(const pedaco of s.split('\\cup')){
  if(pedaco.startsWith('\\{')){const n=Number(pedaco.slice(2,-2));expect(Number.isFinite(n)).toBe(true);ps.push(n);fs.push(x=>x===n);continue}
  const m=pedaco.match(/^([\[\]])(.+);(.+)([\[\]])$/);expect(m,pedaco).not.toBeNull()
  const [,l,a,b,r]=m!,lo=a==='-\\infty'?-Infinity:Number(a),hi=b==='+\\infty'?Infinity:Number(b)
  expect(lo).not.toBeNaN();expect(hi).not.toBeNaN();expect(lo).toBeLessThan(hi)
  if(Number.isFinite(lo))ps.push(lo);if(Number.isFinite(hi))ps.push(hi)
  fs.push(x=>(l==='['?x>=lo:x>lo)&&(r===']'?x<=hi:x<hi))
 }
 return {testar:(x:number)=>fs.some(fn=>fn(x)),pontos:ps}
}
function amostras(xs:number[]) {
 const ps=[...new Set([-1e5,1e5,-30,30,0,...xs.filter(Number.isFinite)])].sort((a,b)=>a-b)
 return [...ps,...ps.slice(1).map((x,j)=>(x+ps[j])/2),...xs.flatMap(x=>[x-1e-5,x+1e-5])]
}

describe('Inequações: conjuntos conferidos pelo enunciado',()=>{
 it('cobre as sete aulas com três níveis e esboços completos',()=>{
  expect(AULAS_AF_U05.map(a=>a.id)).toEqual(getUnit('AF.U5')!.lessons.map(a=>a.id))
  expect(GERADORES_AF_U05).toHaveLength(21)
  for(const a of AULAS_AF_U05){expect(a.cartoes.filter(c=>c.tipo==='sua-vez').flatMap(c=>c.geradores).map(id=>GERADORES_AF_U05.find(g=>g.id===id)?.nivel)).toEqual([1,2,3]);for(const c of a.cartoes){expect(c.esboco?.length).toBeGreaterThan(0);if('visual'in c&&c.visual)expect(c.visual.esboco?.length).toBeGreaterThan(0)}}
 })
 it('os feedbacks das bordas distinguem incluir um ponto proibido de excluir um permitido',()=>{
  for(const g of GERADORES_AF_U05.filter(g=>g.aula==='AF.U5.A1'&&g.nivel<3))for(let seed=0;seed<100;seed++){
   const i=g.gerar(rng(seed)),os=i.opcoes!.map(lerConjunto),certa=os[Number(i.resposta)]
   const xs=amostras(os.flatMap(o=>o.pontos))
   for(const [j,o]of os.entries()){
    const erro=i.erros[String(j)]
    if(erro!=='inequacao-inclui-a-borda'&&erro!=='ineq-exclui-igualdade')continue
    const extras=xs.filter(x=>o.testar(x)&&!certa.testar(x)),faltam=xs.filter(x=>!o.testar(x)&&certa.testar(x))
    if(erro==='inequacao-inclui-a-borda'){expect(extras.length).toBeGreaterThan(0);expect(faltam).toHaveLength(0)}
    else{expect(faltam.length).toBeGreaterThan(0);expect(extras).toHaveLength(0)}
   }
  }
 })

 for(const g of GERADORES_AF_U05)it(`${g.id}: 300 sementes e extremos do RNG`,()=>{
  const extremos:Rng[]=[false,true].map(max=>({next:()=>max?1-Number.EPSILON:0,int:(a,b)=>max?b:a,pick:xs=>xs[max?xs.length-1:0]}))
  for(const r of [...Array.from({length:300},(_,j)=>rng(j*971+43)),...extremos]){
   const i=g.gerar(r)
   if(g.nivel>1)expect(i.visual).toBeUndefined()
   if(g.aula==='AF.U5.A7'){
    const dinheiro=[...i.enunciado.matchAll(/R\$ (\d+)/g)].map(m=>Number(m[1]))
    if(g.nivel===1){const [teto,taxa,preco]=dinheiro,permitidos=Array.from({length:100},(_,j)=>j).filter(x=>taxa+preco*x<=teto);expect(i.resposta).toBe(Math.max(...permitidos))}
    else if(g.nivel===2){const [inicio,mensal,meta]=dinheiro,estrito=i.enunciado.includes('mais de'),mes=Array.from({length:100},(_,j)=>j).find(x=>estrito?inicio+mensal*x>meta:inicio+mensal*x>=meta);expect(i.resposta).toBe(mes)}
    else{const d=Number(i.enunciado.match(/x \+ (\d+)/)![1]),area=Number(i.enunciado.match(/([\d,]+) m²/)![1].replace(',','.')),estrito=i.enunciado.includes('menor que'),xs=Array.from({length:100},(_,j)=>j+1).filter(x=>estrito?x*(x+d)<area:x*(x+d)<=area);expect(i.resposta).toBe(Math.max(...xs))}
   }else{
    const trechos=[...i.enunciado.matchAll(/\$([^$]+)\$/g)].map(m=>lerCondicao(m[1]))
    const certo=(x:number)=>i.enunciado.includes('**OU**')?trechos.some(f=>f.testar(x)):trechos.every(f=>f.testar(x))
    if(i.formato==='numero')expect(i.resposta).toBe(Array.from({length:101},(_,j)=>j-50).filter(certo).length)
    else{
     const os=i.opcoes!.map(lerConjunto),ps=amostras([...trechos.flatMap(t=>t.pontos),...os.flatMap(o=>o.pontos)])
     const marcas=os.map(o=>ps.map(x=>o.testar(x)))
     const esperado=ps.map(certo),validas=marcas.map(xs=>xs.every((v,j)=>v===esperado[j]))
     expect(validas.filter(Boolean),i.enunciado).toHaveLength(1);expect(validas[Number(i.resposta)]).toBe(true)
     // Duas alternativas com a mesma faixa também seriam repetidas, mesmo
     // se usassem notações diferentes, como união de faixas sobrepostas.
     expect(new Set(marcas.map(m=>JSON.stringify(m))).size).toBe(marcas.length)
    }
   }
  }
 })
})
