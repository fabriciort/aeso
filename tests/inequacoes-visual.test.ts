import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { AULAS_AF_U05 } from '@/content/matematica/algebra/u05'
import { initMexa, kindOf, mexaStage, solveMexa } from '@/components/aula/mexa'
import { comparar, espelhoJogavel, faixasJogaveis, intervaloValido, pertence, polinomio, relTex, valorEm, type EspelhoState, type FaixasState } from '@/components/aula/visual/inequacao-geo'
import type { Mexa } from '@/lib/formation/schema'
const cards=AULAS_AF_U05.flatMap(a=>a.cartoes).filter((c):c is Mexa=>c.tipo==='mexa')
const faixa=cards.find(c=>kindOf(c)==='testarFaixa')!,espelho=cards.find(c=>kindOf(c)==='espelharOrdem')!

describe('Reta das inequações',()=>{
 it('distingue bordas abertas e fechadas, pontos, vazio e todos',()=>{
  expect(pertence([{de:2,ate:5,incluiAte:true}],2)).toBe(false)
  expect(pertence([{de:2,ate:5,incluiAte:true}],2.0001)).toBe(true)
  expect(pertence([{de:2,ate:5,incluiAte:true}],5)).toBe(true)
  expect(pertence([{de:2,ate:5,incluiAte:true}],5.0001)).toBe(false)
  expect(pertence([{de:3,ate:3,incluiDe:true,incluiAte:true}],3)).toBe(true)
  expect(pertence([],0)).toBe(false)
  expect(pertence([{de:null,ate:null}],-1e15)).toBe(true)
  expect(pertence([{de:null,ate:null}],Infinity)).toBe(false)
 })
 it('completa por exploração sem penalidade, ignora repetições e valores fora dos controles',()=>{
  let st=initMexa(faixa);const stage=()=>mexaStage(faixa,st,n=>{st=n})
  const xs=(faixa.visual.estado.faixas as FaixasState).candidatos!
  stage().interact!.reta!.onTestarFaixa!(xs[0]);stage().interact!.reta!.onTestarFaixa!(xs[0])
  expect(st.order).toHaveLength(1);expect(st.done).toBe(false);expect(st.wrong).toBe(0)
  stage().interact!.reta!.onTestarFaixa!(NaN);stage().interact!.reta!.onTestarFaixa!(999)
  expect(st.order).toHaveLength(1)
  for(const x of xs)stage().interact!.reta!.onTestarFaixa!(x)
  expect(st.done).toBe(true)
  stage().interact!.reta!.onTestarFaixa!(xs[1]);expect(st.done).toBe(true)
  const s=solveMexa(faixa,initMexa(faixa));expect(s.order).toHaveLength(xs.length)
 })
 it('a reflexão exige observar fatores positivos e negativos, e a conquista permanece ao comparar de novo',()=>{
  let st=initMexa(espelho);const stage=()=>mexaStage(espelho,st,n=>{st=n})
  stage().interact!.reta!.onFatorOrdem!(0);expect(st.order).toHaveLength(0)
  const es=espelho.visual.estado.espelho as EspelhoState
  for(const k of es.fatores){stage().interact!.reta!.onFatorOrdem!(k);const s=stage().visual.estado.espelho as EspelhoState;const [a,b]=s.par;expect(k>0?a*k<b*k:a*k>b*k).toBe(true)}
  expect(st.done).toBe(true);expect(st.wrong).toBe(0)
  stage().interact!.reta!.onFatorOrdem!(1);expect(st.done).toBe(true)
  expect(solveMexa(espelho,initMexa(espelho)).order).toHaveLength(es.fatores.length)
  const outra:Mexa={...espelho,visual:{...espelho.visual,estado:{espelho:{...es,fatores:[2,-2]}}}}
  expect(solveMexa(outra,initMexa(outra)).pick).toBe(-2)
 })
 it('as regiões de cada visual correspondem à comparação original, inclusive nas raízes',()=>{
  for(const c of AULAS_AF_U05.flatMap(a=>a.cartoes))if('visual'in c&&c.visual?.estado.faixas){
   const s=c.visual.estado.faixas as FaixasState
   if(s.rotulo)expect(()=>katex.renderToString(s.rotulo!,{throwOnError:true})).not.toThrow()
   if(s.teste){const ts=s.teste;for(let x=s.de;x<=s.ate;x+=0.25)expect(pertence(s.intervalos,x),JSON.stringify({s,x})).toBe(comparar(valorEm(ts.coeficientes,x),ts.relacao,ts.direita))}
  }
 })
 it('recusa intervalos impossíveis, testes incoerentes e fatores zero',()=>{
  expect(intervaloValido({de:3,ate:1})).toBe(false)
  expect(intervaloValido({de:3,ate:3})).toBe(false)
  expect(intervaloValido({de:3,ate:3,incluiDe:true,incluiAte:true})).toBe(true)
  const f=faixa.visual.estado.faixas as FaixasState
  expect(faixasJogaveis(f)).toBe(true)
  expect(faixasJogaveis({...f,candidatos:[20,20]})).toBe(false)
  expect(faixasJogaveis({...f,teste:{coeficientes:[0,-1,0],relacao:'>',direita:20}})).toBe(false)
  expect(faixasJogaveis({...f,de:Infinity})).toBe(false)
  const e=espelho.visual.estado.espelho as EspelhoState
  expect(espelhoJogavel({...e,fatores:[0,1,-1]})).toBe(false)
  expect(espelhoJogavel({...e,fatores:[1,2]})).toBe(false)
 })
 it('o quadrado repetido não troca sinal; a inversão preserva o empate',()=>{
  for(const x of [-3,1.999,2,2.001,6])expect(valorEm([1,-4,4],x)).toBeGreaterThanOrEqual(-1e-12)
  expect(comparar(6,'>=',6)).toBe(true);expect(comparar(-2,'<=',-2)).toBe(true)
  for(const cs of [[1,-4,4],[-1,5,-4],[0,-2,0]] as [number,number,number][]){for(const op of ['<','<=','>','>='] as const)expect(()=>katex.renderToString(`${polinomio(cs)}${relTex(op)}0`,{throwOnError:true})).not.toThrow()}
 })
})
