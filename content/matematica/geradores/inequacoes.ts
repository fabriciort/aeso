import type { Gerador, Item, Rng } from '@/lib/formation/schema'
import { n, polinomio, relTex, t, type Intervalo, type Relacao } from '@/components/aula/visual/inequacao-geo'
import { conjunto, escolha, I, numero, visual } from './inequacoes-apoio'
type Nivel=1|2|3
const rels:Relacao[]=['<','<=','>','>=']
const inverte=(op:Relacao):Relacao=>op==='<'?'>':op==='>'?'<':op==='<='?'>=':'<='
const fechado=(op:Relacao)=>op.includes('=')
function semirreta(l:number,op:Relacao):Intervalo[]{return op.startsWith('<')?[I(null,l,false,fechado(op))]:[I(l,null,fechado(op))]}
function respostaFaixa(r:Rng,is:Intervalo[],dicas:Item['dicas'],enunciado:string,nivel:Nivel,extras:[Intervalo[],string][]=[]):Item {
 const erradas:[string,string][]=[...extras.map(([xs,e]):[string,string]=>[conjunto(xs),e]),[conjunto([]),'ineq-descarta-solucoes'],[conjunto([I(null,null)]),'ineq-aceita-todos']]
 return {enunciado,...escolha(r,conjunto(is),erradas),dicas,...(nivel===1?{visual:visual(is)}:{})}
}
function intervalos(r:Rng,nv:Nivel):Item {
 const lo=r.int(-5,2),hi=lo+r.int(2,6),l=r.pick([true,false]),h=r.pick([true,false])
 if(nv===3){const a=lo+0.5,b=hi+0.5;const qtd=Math.floor(b)-Math.ceil(a)+1
  return numero(`Quantos **inteiros** satisfazem $${t(a)}<x<${t(b)}$?`,qtd,['Inteiros ficam nas marcas sem parte decimal; confira os dois limites.',`O primeiro é ${Math.ceil(a)}; o último, ${Math.floor(b)}.`,`Conte de ${Math.ceil(a)} até ${Math.floor(b)}: ${qtd} inteiros.`],[[qtd+1,'inequacao-inclui-a-borda'],[qtd-1,'ineq-exclui-igualdade']])}
 if(nv===2){const op=r.pick(rels),is=semirreta(lo,op)
  return respostaFaixa(r,is,['Leia o sentido e confira se a igualdade é permitida.',`A borda ${n(lo)} ${fechado(op)?'entra':'fica de fora'}. Infinito nunca é incluído.`,`A solução é ${conjunto(is)}.`],`Escreva como intervalo: $x${relTex(op)}${lo}$.`,nv,[[semirreta(lo,inverte(op)),'inequacao-sentido-trocado'],[semirreta(lo,op==='<'?'<=':op==='<='?'<':op==='>'?'>=':'>'),fechado(op)?'ineq-exclui-igualdade':'inequacao-inclui-a-borda']])}
 const is=[I(lo,hi,l,h)]
 return respostaFaixa(r,is,['A solução precisa respeitar as duas bordas.',`${n(lo)} ${l?'entra':'fica de fora'}; ${n(hi)} ${h?'entra':'fica de fora'}.`,`O intervalo é ${conjunto(is)}.`],`Qual intervalo representa $${lo}${l?'\\le ':'<'}x${h?'\\le':'<'}${hi}$?`,nv,[[[I(lo,hi,!l,h)],l?'ineq-exclui-igualdade':'inequacao-inclui-a-borda'],[[I(lo,hi,l,!h)],h?'ineq-exclui-igualdade':'inequacao-inclui-a-borda']])
}
function linear(r:Rng,nv:Nivel):Item {
 const limite=nv===3?r.int(-9,9)/2:r.int(-5,6),a=nv===1?1:r.int(2,4),b=r.int(-5,5),d=nv===2?r.int(1,a-1):0
 const op=r.pick(rels),c=(a-d)*limite+b,is=semirreta(limite,op)
 const esq=polinomio([0,a,b]),dir=d?polinomio([0,d,c]):t(c)
 return respostaFaixa(r,is,['Faça a mesma operação nos dois lados para isolar x.',`Tire ${d?`${d}x e `:''}${n(b)} dos dois lados: $${a-d}x${relTex(op)}${t(c-b)}$.`,`Divida por ${a-d}, positivo: $x${relTex(op)}${t(limite)}$. Confira a borda na original.`],`Resolva: $${esq}${relTex(op)}${dir}$.`,nv,[[semirreta(limite,inverte(op)),'ineq-inverte-positivo'],[[I(limite,limite,true,true)],'inequacao-como-equacao']])
}
function negativo(r:Rng,nv:Nivel):Item {
 const limite=nv===3?r.int(-9,9)/2:r.int(-5,5),a=-r.int(1,4),b=r.int(-4,4),op=r.pick(rels),novo=inverte(op)
 const esq=nv===3?`${a}(x${b<0?'-':'+'}${Math.abs(b)})`:polinomio([0,a,b])
 const c=nv===3?a*(limite+b):a*limite+b,resto=nv===3?c/a-b:(c-b)/a,is=semirreta(resto,novo)
 return respostaFaixa(r,is,['Um divisor negativo reflete a reta: inverta o sentido da desigualdade.',nv===3?`Divida por ${n(a)}: $x${b<0?'-':'+'}${Math.abs(b)}${relTex(novo)}${t(c/a)}$.`:`Subtraia ${n(b)}: $${a}x${relTex(op)}${t(c-b)}$.`, `Isolando x e respeitando a inversão, $x${relTex(novo)}${t(resto)}$. Teste um número da faixa.`],`Resolva: $${esq}${relTex(op)}${t(c)}$.`,nv,[[semirreta(resto,op),'ineq-nao-inverte-negativo'],[[I(resto,resto,true,true)],'inequacao-como-equacao']])
}
function condicoes(r:Rng,nv:Nivel):Item {
 const a=r.int(-5,1),b=a+r.int(2,6)
 if(nv===3){const k=-2,c=r.int(-3,3),l=k*b+c,u=k*a+c,is=[I(a,b,false,true)]
  return respostaFaixa(r,is,['A cadeia pede as duas condições ao mesmo tempo.',`Subtraia ${n(c)} dos três membros e divida por −2, invertendo as duas comparações.`,`A ordem final é $${a}<x\\le${b}$: ${conjunto(is)}.`],`Resolva a cadeia $${l}\\le ${polinomio([0,k,c])}<${u}$.`,nv,[[[I(a,b,true,false)],'ineq-nao-inverte-negativo'],[[I(null,a),I(b,null)],'ineq-confunde-e-ou']])}
 const uniao=nv===2,is=uniao?[I(null,a),I(b,null)]:[I(a,b,true,false)]
 return respostaFaixa(r,is,[uniao?'OU reúne quem atende a pelo menos uma condição.':'E seleciona apenas quem atende às duas condições.',uniao?`As faixas são à esquerda de ${n(a)} ou à direita de ${n(b)}.`:`A faixa começa em ${n(a)}, incluído, e termina antes de ${n(b)}.`,`O conjunto é ${conjunto(is)}.`],uniao?`Resolva $x<${a}$ **OU** $x>${b}$.`:`Resolva $x\\ge${a}$ **E** $x<${b}$.`,nv,[[uniao?[I(a,b)]:[I(null,b),I(a,null,true)],'ineq-confunde-e-ou'],[[I(a,b,true,true)],'inequacao-inclui-a-borda']])
}
function regioes(p:number,q:number,a:number,op:Relacao):Intervalo[]{
 const z=fechado(op),querPos=op.startsWith('>'),fora=querPos===(a>0)
 return fora?[I(null,p,false,z),I(q,null,z)]:[I(p,q,z,z)]
}
function produto(r:Rng,nv:Nivel):Item {
 const p=r.int(-5,1),q=p+r.int(2,6),a=nv===3?-r.int(1,3):1,op=nv===1?'<':r.pick(rels),is=regioes(p,q,a,op)
 const fator=(v:number)=>`(x${v<0?'+':'-'}${Math.abs(v)})`
 return respostaFaixa(r,is,['Localize os zeros dos fatores e compare seus sinais em cada faixa.',`Os zeros são ${n(p)} e ${n(q)}. ${a<0?'O fator negativo da frente troca o sinal do produto.':'Sinais iguais dão positivo; opostos, negativo.'}`,`As raízes ${fechado(op)?'entram, pois zero é permitido':'ficam fora, pois a comparação é estrita'}. Solução: ${conjunto(is)}.`],`Resolva $${a===1?'':a}${fator(p)}${fator(q)}${relTex(op)}0$.`,nv,[[regioes(p,q,a,inverte(op)),'ineq-produto-escolhe-meio'],[[I(p,p,true,true),I(q,q,true,true)],'ineq-so-raizes']])
}
function quadratica(r:Rng,nv:Nivel):Item {
 const p=r.int(-4,4),op=r.pick(rels)
 if(nv===1){const q=p+r.int(2,5),is=regioes(p,q,1,op)
  return respostaFaixa(r,is,['Ache as raízes e fatie a reta antes de escolher o sinal.',`A expressão fatora em $(x${p<0?'+':'-'}${Math.abs(p)})(x${q<0?'+':'-'}${Math.abs(q)})$.`,`Os zeros são ${n(p)} e ${n(q)}. Solução: ${conjunto(is)}.`],`Resolva $${polinomio([1,-p-q,p*q])}${relTex(op)}0$.`,nv,[[regioes(p,q,1,inverte(op)),'ineq-produto-escolhe-meio'],[[I(p,p,true,true),I(q,q,true,true)],'ineq-so-raizes']])}
 if(nv===2){const is=op==='>='?[I(null,null)]:op==='>'?[I(null,p),I(p,null)]:op==='<='?[I(p,p,true,true)]:[]
  return respostaFaixa(r,is,['Reconheça um quadrado perfeito. Ele nunca é negativo.',`A expressão é $(x${p<0?'+':'-'}${Math.abs(p)})^2$. Só zera em ${n(p)}.`,`Leia ${relTex(op)} 0: a solução é ${conjunto(is)}.`],`Resolva $${polinomio([1,-2*p,p*p])}${relTex(op)}0$.`,nv,[[[I(p,null)],'ineq-raiz-dupla-troca'],[[I(p,p,true,true)],'ineq-so-raizes']])}
 const a=r.pick([-1,1]),k=r.int(1,5),is=(op.startsWith('>')===(a>0))?[I(null,null)]:[]
 return respostaFaixa(r,is,['Complete o quadrado para saber o sinal, mesmo sem raízes reais.',`A expressão é $${a<0?'-':''}[(x${p<0?'+':'-'}${Math.abs(p)})^2+${k}]$.`,`O colchete é sempre positivo; a expressão é sempre ${a>0?'positiva':'negativa'}. Solução: ${conjunto(is)}.`],`Resolva $${polinomio([a,-2*p*a,a*(p*p+k)])}${relTex(op)}0$.`,nv,[[[I(p,p,true,true)],'ineq-so-raizes']])
}
function problemas(r:Rng,nv:Nivel):Item {
 if(nv===1){const taxa=r.int(2,10),preco=r.int(2,7),max=r.int(2,8),resto=r.int(0,preco-1),teto=taxa+preco*max+resto
  return numero(`Você tem R$ ${teto}. Há taxa de R$ ${taxa} e cada item inteiro custa R$ ${preco}. Qual é a quantidade **máxima**?`,max,['O gasto deve ser menor ou igual ao orçamento.',`$${taxa}+${preco}x\\le${teto}$, então $x\\le\\frac{${teto-taxa}}{${preco}}$.`,`Cabem ${max} itens: custam R$ ${taxa+preco*max}. ${max+1} custariam R$ ${taxa+preco*(max+1)}, acima do limite.`],[[max+1,'ineq-arredonda-limite'],[max-1,'ineq-ignora-extremo-pedido']],visual([I(0,max,true,true)],0,max+3))}
 if(nv===2){const inicio=r.int(1,5)*5,mensal=r.int(1,5)*5,lim=r.int(2,8),meta=inicio+mensal*lim,estrito=r.pick([true,false]),res=lim+(estrito?1:0)
  return numero(`Você tem R$ ${inicio} e guarda R$ ${mensal} por mês. Após quantos meses terá ${estrito?'**mais de**':'**pelo menos**'} R$ ${meta}, pela primeira vez?`,res,['Traduza a meta antes de calcular: ultrapassar exclui o empate, atingir pelo menos inclui.',`$${inicio}+${mensal}x${estrito?'>':'\\ge'}${meta}$ leva a $x${estrito?'>':'\\ge'}${lim}$.`,`O primeiro mês inteiro é ${res}, quando o saldo é R$ ${inicio+mensal*res}.`],[[lim,'inequacao-inclui-a-borda'],[res+1,'ineq-ignora-extremo-pedido']])}
 const p=r.int(4,12)/2,d=r.int(1,5),area=p*(p+d),estrito=r.pick([true,false]),res=estrito?Math.ceil(p)-1:Math.floor(p)
 return numero(`Um jardim tem lados x e x + ${d}, em metros. Área ${estrito?'**menor que**':'**no máximo**'} ${n(area)} m². Qual é o maior x **inteiro positivo**?`,res,
 ['Monte a área e respeite o tipo de limite. O comprimento x precisa ser positivo.',`$x(x+${d})${estrito?'<':'\\le'}${t(area)}$. A borda positiva é ${n(p)} m.`,`O maior inteiro permitido é ${res}. Confira ${res} · ${res+d} = ${res*(res+d)} e teste o próximo inteiro.`],[[res+1,'ineq-arredonda-limite'],[-res,'ineq-ignora-contexto']])
}
const temas=[['intervalos',intervalos],['linear',linear],['negativo',negativo],['condicoes',condicoes],['produto',produto],['quadratica',quadratica],['problemas',problemas]] as const
export const GERADORES_AF_U05:Gerador[]=temas.flatMap(([tema,fn],j)=>([1,2,3] as const).map(nivel=>({id:`inequacao-${tema}-n${nivel}`,aula:`AF.U5.A${j+1}`,nivel,gerar:(r:Rng)=>fn(r,nivel)})))
