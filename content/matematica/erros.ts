import type { ErroComum } from '@/lib/formation/schema'
import { ERROS_U03 } from './erros-u03'
import { ERROS_U04 } from './erros-u04'
import { ERROS_U05 } from './erros-u05'
import { ERROS_U06 } from './erros-u06'
import { ERROS_U07A } from './erros-u07a'
import { ERROS_U07B } from './erros-u07b'
import { ERROS_U08A } from './erros-u08a'
import { ERROS_U08B } from './erros-u08b'
import { ERROS_U09A } from './erros-u09a'
import { ERROS_U09B } from './erros-u09b'
import { ERROS_U10A } from './erros-u10a'
import { ERROS_U10B } from './erros-u10b'
import { ERROS_U11A } from './erros-u11a'
import { ERROS_U11B } from './erros-u11b'
import { ERROS_U12A } from './erros-u12a'
import { ERROS_U12B } from './erros-u12b'
import { ERROS_U13A } from './erros-u13a'
import { ERROS_U13B } from './erros-u13b'
import { ERROS_U14A } from './erros-u14a'
import { ERROS_U14B } from './erros-u14b'
import { ERROS_U15A } from './erros-u15a'
import { ERROS_U15B } from './erros-u15b'
import { ERROS_U16A } from './erros-u16a'
import { ERROS_U16B } from './erros-u16b'
import { ERROS_U17 } from './erros-u17'
import { ERROS_U18A } from './erros-u18a'
import { ERROS_U18B } from './erros-u18b'
import { ERROS_U19A } from './erros-u19a'
import { ERROS_U19B } from './erros-u19b'
import { ERROS_U20 } from './erros-u20'
import { ERROS_AF_U01A } from './erros-af-u01a'
import { ERROS_AF_U01B } from './erros-af-u01b'
import { ERROS_AF_U02A } from './erros-af-u02a'
import { ERROS_AF_U02B } from './erros-af-u02b'
import { ERROS_AF_U03A } from './erros-af-u03a'
import { ERROS_AF_U03B } from './erros-af-u03b'
import { ERROS_AF_U04A } from './erros-af-u04a'
import { ERROS_AF_U04B } from './erros-af-u04b'

// Catálogo de erros comuns da formação. Cada erro tem um id estável, usado
// por opções de cartões e por exercícios para diagnosticar o que o aluno
// pensou. Um erro aparece aqui uma vez só, mesmo que volte em várias aulas.

const ERROS_BASE: ErroComum[] = [
  {
    id: 'valor-de-face',
    nome: 'lê o algarismo, não o valor da casa',
    causa: 'Trata cada algarismo como o próprio número, sem considerar a posição.',
    exemplo: 'Em 4.072, diz que o 7 vale 7.',
    desmonte: 'Acender a casa das dezenas e mostrar as 7 barras de 10 embaixo dela: 7 dezenas são 70.',
  },
  {
    id: 'casa-errada',
    nome: 'erra a casa por uma posição',
    causa: 'Conta as casas a partir do lado errado, ou pula uma.',
    exemplo: 'Em 4.072, diz que o 7 vale 700.',
    desmonte: 'Rotular as casas da direita para a esquerda (U, D, C, M) e contar junto com o aluno.',
  },
  {
    id: 'concatena-casas',
    nome: 'escreve as casas coladas',
    causa: 'Escreve o número como se fala, juntando os pedaços: "seiscentos" (600) e "nove" (9).',
    exemplo: '"Seiscentos e nove" vira 6009.',
    desmonte: 'Montar no quadro posicional: 6 centenas, 0 dezenas, 9 unidades. O número tem três casas, não quatro.',
  },
  {
    id: 'esquece-zero',
    nome: 'esquece o zero que guarda o lugar',
    causa: 'Acha que o zero "não vale nada" e pode sumir.',
    exemplo: '"Seiscentos e nove" vira 69.',
    desmonte: 'Tirar o zero do quadro: o 6 escorrega para as dezenas e as 6 placas viram 6 barras. Sobram 69, um número bem menor.',
  },
  {
    id: 'estudo-so-observar',
    nome: 'confunde reconhecer uma resposta com conseguir resolver',
    causa: 'A familiaridade ao reler ou assistir é tratada como evidência de que consegue produzir os passos sozinho.',
    exemplo: 'Lê uma resolução, ela parece conhecida e segue sem fazer uma tentativa própria.',
    desmonte: 'Cobrir a resolução e abrir uma questão nova da mesma ideia; comparar uma folha apenas relida com uma folha que contém passos produzidos pelo aluno.',
  },
  {
    id: 'estudo-sem-papel',
    nome: 'trata o papel como condição para começar',
    causa: 'Confunde a recomendação de caderno quadriculado com uma exigência que impede estudar quando não tem papel.',
    exemplo: 'Adia uma tentativa mesmo tendo uma forma de escrever no rascunho da tela.',
    desmonte: 'Mostrar a mesma tentativa registrada no papel e no rascunho da tela: ambos permitem guardar os passos e comparar depois.',
  },
  {
    id: 'estudo-dica-resposta',
    nome: 'usa resolução como substituta da tentativa',
    causa: 'Abre ou copia a resposta antes de tentar e conta a cópia como se tivesse resolvido sem apoio.',
    exemplo: 'Copia a solução completa ao travar e considera esse registro um acerto independente.',
    desmonte: 'Separar visualmente tentativa própria, tentativa com pista e cópia da resolução; depois fechar o apoio e pedir uma questão nova da mesma ideia.',
  },
  {
    id: 'estudo-voz-obrigatoria',
    nome: 'supõe que ouvir a Vega é obrigatório',
    causa: 'Confunde uma opção de acesso por áudio com um requisito para participar da aula.',
    exemplo: 'Quer estudar em silêncio, mas acha que precisa ligar a voz para continuar.',
    desmonte: 'Manter texto, visuais e tarefas visíveis com a voz desligada; ligar e desligar o áudio sem mudar a tarefa ou abrir a resolução.',
  },
  {
    id: 'estudo-sem-revisao',
    nome: 'trata conclusão da aula como lembrança permanente',
    causa: 'Acha que uma ideia vista ou corrigida não precisa voltar em tentativas futuras.',
    exemplo: 'Pula toda questão antiga porque já terminou aquela aula uma vez.',
    desmonte: 'Trazer uma questão antiga com a resposta coberta, registrar a tentativa e só então conferir; a evidência vem do que consegue recuperar agora.',
  },
  {
    id: 'estudo-pula-sem-tentar',
    nome: 'confunde o atalho Já sei isso com prova de domínio',
    causa: 'Trata a autodeclaração de conhecimento como suficiente para marcar domínio, sem verificar numa tentativa.',
    exemplo: 'Escolhe Já sei isso e considera a habilidade dominada sem resolver uma questão.',
    desmonte: 'Desenhar o atalho indo à Sua vez, sem selo de domínio, e uma seta de retorno à explicação após a tentativa.',
  },
  {
    id: 'diagnostico-resposta-ajudada',
    nome: 'usa resposta após ajuda como evidência do ponto de partida',
    causa: 'Não distingue uma primeira tentativa sem ajuda de uma resposta produzida depois de ver dica ou resolução.',
    exemplo: 'No diagnóstico, copia a resolução e registra essa resposta no lugar da primeira tentativa.',
    desmonte: 'Preservar duas folhas separadas, primeira resposta e tentativa com apoio; a resposta posterior não sobrescreve o registro inicial.',
  },
  {
    id: 'diagnostico-generaliza-dominio',
    nome: 'generaliza uma amostra para toda a formação',
    causa: 'Supõe que acertar alguns itens da U1 comprova domínio de assuntos que não foram avaliados.',
    exemplo: 'Acerta cinco perguntas de numeração e conclui que já domina frações, operações e álgebra.',
    desmonte: 'Delimitar as cinco perguntas dentro da U1 e deixar operações, frações e álgebra sem avaliação; recomendar confirmar a U1 na prática, sem selo global de domínio.',
  },
  {
    id: 'conta-grupos-como-unidades',
    nome: 'conta grupos como unidades soltas',
    causa: 'Conta cada barra, placa ou caixa como uma unidade, esquecendo quantas unidades o grupo contém.',
    exemplo: 'Duas barras de dez e sete cubos são registrados como 9 unidades, em vez de 27.',
    desmonte: 'Abrir as duas barras em dez cubos cada, mantendo os sete cubos soltos. Contrastar nove objetos desenhados com 27 unidades; a embalagem muda, a quantidade não.',
  },
  {
    id: 'troca-incompleta',
    nome: 'faz uma troca que não conserva a quantidade',
    causa: 'Não confere os dez grupos exatos necessários à troca, ou deixa algum grupo desaparecer ao reorganizar as peças.',
    exemplo: 'Troca 9 unidades por 1 dezena; ou, ao reorganizar 13 dezenas em 1 centena, deixa só 2 dezenas fora da placa.',
    desmonte: 'Usar molduras de dez encaixes e acompanhar cada peça antes e depois. Em 9 unidades, um encaixe fica vazio; em 13 dezenas, dez entram na placa e três permanecem fora.',
  },
  {
    id: 'sobra-na-casa-errada',
    nome: 'põe a sobra numa ordem diferente',
    causa: 'Confunde a quantidade de grupos completos com a quantidade de unidades restantes, ou muda o valor das peças que sobraram.',
    exemplo: 'Duas dezenas e sete unidades viram 72; ou três barras e sete cubos são registrados como sete dezenas e três unidades.',
    desmonte: 'Conservar o tipo de cada peça e rotular D nas barras e U nos cubos. Alinhar os algarismos com esses conjuntos: duas barras de dez e sete cubos ocupam D=2 e U=7.',
  },
  {
    id: 'descarta-sobra',
    nome: 'descarta as unidades que sobram',
    causa: 'Considera apenas os grupos completos e trata as peças restantes como se não fizessem parte da quantidade.',
    exemplo: 'Duas dezenas e sete unidades são registradas como 20, ignorando as sete peças soltas.',
    desmonte: 'Manter as sobras no palco e contorná-las; abrir os grupos e juntar todas as unidades para conferir que as peças soltas também entram no total.',
  },
  {
    id: 'classe-errada',
    nome: 'confunde milhares, milhões e bilhões',
    causa: 'Lê ou escreve um grupo de algarismos com o nome de outra classe, conta os trios pelo lado errado ou ignora uma classe vazia.',
    exemplo: 'Chama 1.000.000.000 de um milhão; ou põe o 3 de três milhões na classe dos milhares.',
    desmonte: 'Alinhar as unidades à direita e marcar trios: unidades, milhares, milhões, bilhões. Comparar um milhão e um bilhão no mesmo quadro; o 1 ocupa classes diferentes.',
  },
  {
    id: 'separador-decimal',
    nome: 'confunde o separador de milhar com o decimal',
    causa: 'Interpreta a pontuação usando outra convenção de idioma, sem conferir o formato indicado na fonte.',
    exemplo: 'Num arquivo explicitamente em inglês, lê 12,500 como doze vírgula quinhentos, em vez de doze mil e quinhentos.',
    desmonte: 'Ligar a etiqueta de idioma ao separador entre 12 e 500: português 12.500 e inglês 12,500 mostram a mesma quantidade. Alertar que, no padrão brasileiro, a vírgula é decimal; não supor um formato quando o idioma é desconhecido.',
  },
  {
    id: 'compara-pela-ultima-casa',
    nome: 'compara só o último algarismo',
    causa: 'Decide qual natural é maior pelas unidades e ignora as casas de maior valor.',
    exemplo: 'Diz que 479 é maior que 482 porque 9 é maior que 2.',
    desmonte: 'Alinhar as casas: as centenas empatam e as dezenas já decidem, 8 é maior que 7. Na reta, 482 fica à direita de 479.',
  },
  {
    id: 'ignora-quantidade-casas',
    nome: 'ignora a quantidade de algarismos dos naturais',
    causa: 'Compara algarismos isolados de naturais com quantidades diferentes de casas, sem considerar seu valor posicional.',
    exemplo: 'Escolhe 89 em vez de 104, apesar de 104 já ter uma centena inteira.',
    desmonte: 'Colocar 100 como referência: 89 fica antes e 104 depois. Alinhar as casas e mostrar que 104 tem uma centena, ausente em 89. Contar só algarismos, sem zeros à esquerda.',
  },
  {
    id: 'inverte-reta',
    nome: 'lê a reta no sentido contrário',
    causa: 'Associa o lado esquerdo ao maior valor ou organiza uma ordem crescente da direita para a esquerda.',
    exemplo: 'Na reta orientada para a direita, escolhe 7 como maior que 12.',
    desmonte: 'Percorrer os inteiros de 7 até 12 na reta; a contagem cresce para a direita. Ler a ordem crescente da esquerda para a direita.',
  },
  {
    id: 'intervalos-desiguais',
    nome: 'muda o valor de intervalos iguais',
    causa: 'Atribui avanços numéricos diferentes a distâncias iguais em uma mesma escala de reta.',
    exemplo: 'Em uma reta de dez em dez, rotula três marcas igualmente espaçadas como 0, 10 e 50.',
    desmonte: 'Usar o trecho de 0 a 10 como gabarito de comprimento; o intervalo seguinte termina em 20. Para chegar a 50 são necessários cinco intervalos desse tamanho.',
  },
  {
    id: 'arredonda-sempre-para-cima',
    nome: 'sempre sobe ao arredondar',
    causa: 'Trata arredondar como avançar para o próximo múltiplo, mesmo quando a marca menor está mais próxima.',
    exemplo: 'Arredonda 243 à dezena como 250.',
    desmonte: 'Marcar 240, 243, 245 e 250 numa mesma escala: 243 fica antes do meio e o trecho até 240 é mais curto. Contrastar com 247, que fica depois do meio.',
  },
  {
    id: 'olha-casa-errada',
    nome: 'usa outra casa para decidir o arredondamento',
    causa: 'Olha sempre a unidade ou o primeiro algarismo, sem relacionar a casa decisiva à precisão pedida.',
    exemplo: 'Arredonda 2.460 à centena como 2.400 porque a unidade é zero.',
    desmonte: 'Marcar 2.400 e 2.500 e o meio 2.450: 2.460 está depois do meio. Realçar a dezena 6, primeira casa à direita da centena; unidade para dezena, dezena para centena, centena para milhar.',
  },
  {
    id: 'empate-para-baixo',
    nome: 'escolhe o menor no empate',
    causa: 'Aplica outra convenção ou sempre corta as casas, em vez de escolher o maior no empate declarado pela formação.',
    exemplo: 'Arredonda 995 à dezena como 990.',
    desmonte: 'Mostrar 995 no meio exato entre 990 e 1.000 e dois trechos de mesmo comprimento. Relembrar a convenção: escolher o maior no empate; o destino pode abrir uma nova casa.',
  },
  {
    id: 'estimativa-exata',
    nome: 'confunde aproximação com igualdade',
    causa: 'Usa = entre o valor original e um arredondamento diferente ou acredita que o arredondamento altera a quantidade real.',
    exemplo: 'Escreve 243 = 200 ao arredondar à centena e diz que a viagem ficou menor.',
    desmonte: 'Conservar o ponto exato 243 e um marcador aproximado em 200 em posições diferentes. Escrever 243 ≈ 200; mostrar dois rótulos 200 no mesmo ponto para justificar 200 = 200.',
  },
  {
    id: 'aproximacao-garante-limite',
    nome: 'toma um valor aproximado como garantia de limite',
    causa: 'Compara o número arredondado com um teto ou quantidade disponível e ignora que o valor exato pode ser maior.',
    exemplo: 'Com 104 convites e 100 envelopes, diz que há um envelope por convite porque 104 arredonda para 100.',
    desmonte: 'Marcar os valores exatos na reta: 104 fica à direita de 100. A aproximação ajuda a avaliar o tamanho, mas a garantia exige comparar as quantidades exatas.',
  },
  // ---------------------------------------------------------------- unidade 2: adição e subtração
  {
    id: 'operacao-trocada',
    nome: 'escolhe a operação pela palavra, não pela situação',
    causa: 'Procura uma palavra-chave ("mais", "ganhou") e soma, ou vê "sobra" e subtrai, sem imaginar se a quantidade aumenta, diminui ou se a pergunta é a distância entre duas.',
    exemplo: '"Ana tem 43 figurinhas e Beto tem 28. Quantas Ana tem a mais?" vira 43 + 28 = 71.',
    desmonte: 'Pôr os dois números na reta: "a mais" é a distância entre eles, de 28 até 43. A resposta tem de ser menor que 43.',
  },
  {
    id: 'perde-o-resto',
    nome: 'completa a dezena e esquece o que sobrou',
    causa: 'Usa parte da segunda parcela para chegar ao número redondo, mas depois soma a parcela inteira, ou nada.',
    exemplo: '38 + 25: pula até 40 e soma 25 de novo, achando 65.',
    desmonte: 'Mostrar os saltos na reta: dos 25, 2 foram para chegar a 40. Sobram 23, e o segundo salto é de 23.',
  },
  {
    id: 'esquece-reserva',
    nome: 'esquece o vai um',
    causa: 'Escreve só o algarismo das unidades da soma de uma casa e não leva a dezena formada para a casa seguinte.',
    exemplo: '147 + 85 = 222, em vez de 232.',
    desmonte: 'Nos blocos, 7 + 5 = 12 cubos: 10 deles viram uma barra, que sobe para as dezenas. Sem ela, faltam 10.',
  },
  {
    id: 'escreve-numero-inteiro-na-casa',
    nome: 'escreve dois algarismos numa casa só',
    causa: 'Escreve a soma de uma coluna inteira embaixo dela, sem trocar 10 unidades por 1 dezena.',
    exemplo: '58 + 27: escreve 15 nas unidades e 7 nas dezenas, achando 715.',
    desmonte: 'Cada casa guarda um algarismo só, de 0 a 9. 715 é setecentos e quinze, muito mais que 58 + 27, que fica perto de 60 + 30 = 90.',
  },
  {
    id: 'subtrai-menor-do-maior',
    nome: 'subtrai o menor do maior em cada coluna',
    causa: 'Acha que a subtração de uma coluna sempre tira o algarismo menor do maior, não importa qual está em cima.',
    exemplo: '52 − 17: faz 7 − 2 = 5 nas unidades e acha 45.',
    desmonte: 'Os 7 têm de sair das 2 unidades de cima. Não dá sem abrir uma dezena. Conferir: 45 + 17 = 62, não 52.',
  },
  {
    id: 'esquece-que-desagrupou',
    nome: 'abre uma dezena e não tira ela da casa de cima',
    causa: 'Ganha 10 unidades emprestadas, mas continua usando o algarismo antigo na casa de onde elas saíram.',
    exemplo: '52 − 17: faz 12 − 7 = 5, mas depois 5 − 1 = 4, achando 45.',
    desmonte: 'Nos blocos, a barra aberta virou 10 cubos: sobraram 4 barras, não 5. Riscar o 5 e escrever 4 em cima.',
  },
  {
    id: 'zero-nao-empresta',
    nome: 'acha que a casa com zero não pode emprestar',
    causa: 'Vê um zero no meio do número de cima e não sabe de onde tirar a dezena, então pula a casa ou inverte a conta.',
    exemplo: '304 − 128: diz que não dá, ou faz 8 − 4 nas unidades.',
    desmonte: 'Abrir 1 centena em 10 dezenas, e uma dessas dezenas em 10 unidades: 304 vira 2 centenas, 9 dezenas e 14 unidades.',
  },
  {
    id: 'estimativa-ordem-errada',
    nome: 'estima com a casa errada',
    causa: 'Arredonda e soma, mas perde um zero ou ganha um a mais, e não percebe que o resultado ficou dez vezes maior ou menor.',
    exemplo: '298 + 413 fica perto de 7.000, ou de 70.',
    desmonte: 'Os dois números estão entre 200 e 500: a soma tem de ficar entre 400 e 1.000. Só 700 cabe.',
  },
  {
    id: 'inversa-errada',
    nome: 'confere com a conta errada',
    causa: 'Para conferir uma subtração, soma o total com a parte tirada, ou repete a mesma conta, em vez de desfazer o que foi feito.',
    exemplo: 'Para conferir 84 − 29 = 55, faz 84 + 29.',
    desmonte: 'Na reta: de 84 você voltou 29 e caiu em 55. Para desfazer, saia do 55 e ande 29 para a frente: chega de volta ao 84.',
  },
]

export const ERROS: ErroComum[] = [...ERROS_BASE, ...ERROS_U03, ...ERROS_U04, ...ERROS_U05, ...ERROS_U06, ...ERROS_U07A, ...ERROS_U07B, ...ERROS_U08A, ...ERROS_U08B, ...ERROS_U09A, ...ERROS_U09B, ...ERROS_U10A, ...ERROS_U10B, ...ERROS_U11A, ...ERROS_U11B, ...ERROS_U12A, ...ERROS_U12B, ...ERROS_U13A, ...ERROS_U13B, ...ERROS_U14A, ...ERROS_U14B, ...ERROS_U15A, ...ERROS_U15B, ...ERROS_U16A, ...ERROS_U16B, ...ERROS_U17, ...ERROS_U18A, ...ERROS_U18B, ...ERROS_U19A, ...ERROS_U19B, ...ERROS_U20, ...ERROS_AF_U01A, ...ERROS_AF_U01B, ...ERROS_AF_U02A, ...ERROS_AF_U02B, ...ERROS_AF_U03A, ...ERROS_AF_U03B, ...ERROS_AF_U04A, ...ERROS_AF_U04B]

export function getErro(id: string): ErroComum | undefined {
  return ERROS.find((e) => e.id === id)
}
