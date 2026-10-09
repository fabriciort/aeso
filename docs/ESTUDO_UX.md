# Estudo de caso: identidade e experiência

> Outubro de 2026. Revisão crítica das telas do Observatório (Início, Laboratórios, Matemática, capa e etapa de laboratório) no celular, procurando o que soa genérico e o que não guia o aluno.

## O problema: "cara de IA"

Vários padrões que quase toda interface gerada por IA repete apareciam por todo o app. Eles não erram sozinhos, mas juntos apagam a identidade.

| Padrão | Onde estava | Por que atrapalha |
|---|---|---|
| Rótulos em CAIXA ALTA espaçada | Acima de quase todo título e em toda etapa de laboratório | Gritam sem dizer nada; cansam quem já lê pouco |
| Bolinhas coloridas antes das palavras | Pílulas dos módulos, botões de unidade, opções da capa | Decoração sem significado |
| Arco-íris pastel | Uma cor por parte da Matemática, uma por laboratório | Muita cor, nenhuma com significado; nada parece "do AESo" |
| Etiquetas e metadados empilhados | Chips de conceito, "20 min · Graduação · 7 etapas" | Ruído visual antes do conteúdo |
| Brilhos, halos e anéis pulsando | Nós do mapa, cartões | Chamam atenção para tudo, então para nada |
| Fonte mono em números de interface | Nós do mapa | Ar de painel técnico, frio |
| Orbe de gradiente com ✨ | Vega | O maior clichê de "produto de IA" |
| Nenhuma ação óbvia | Matemática | O aluno chegava e não sabia o que fazer |

## A direção: identidade em quatro regras

1. **Preto, branco e uma luz.** A interface é monocromática. A única cor de destaque é o âmbar "luz de estrela" (`#f6b74e`), que já nasceu no AESo. Ele marca **só** o próximo passo: a unidade recomendada, o botão principal.
2. **Cor só com significado.** Concluído é branco sólido; próximo é âmbar; o resto é contorno discreto. Nenhuma cor decorativa.
3. **Tipografia faz o trabalho.** Títulos grandes, frases curtas em letra normal (sem caixa alta), números na mesma fonte do texto.
4. **Uma textura nossa: o papel quadriculado.** O aluno estuda com um caderno quadriculado; o mapa da formação fica sobre uma grade sutil do mesmo tipo. É um detalhe só nosso, ligado à pedagogia.

E uma regra de experiência:

5. **Sempre uma ação óbvia.** Toda tela de entrada mostra o próximo passo, grande, no topo. O aluno nunca precisa adivinhar por onde ir.

## O que já mudou

- **Rótulos:** caixa alta saiu do app inteiro: a classe `.eyebrow` e a legenda das etapas dos laboratórios agora usam letra normal.
- **Matemática:**
  - mapa monocromático, com o âmbar só nas unidades recomendadas;
  - papel quadriculado ao fundo;
  - sem halos pulsando e sem fonte mono;
  - pílulas dos módulos sem bolinhas;
  - painel da unidade neutro;
  - cartão **Próximo passo** no topo, que abre a unidade e rola o mapa até ela.
- **Início:** os atalhos dos módulos ficaram neutros.

## O que fica para depois (sem pressa, para não mexer demais)

| Item | Proposta | Quando |
|---|---|---|
| Vega (orbe de gradiente com ✨) | Um sinal próprio e simples, sem gradiente nem brilhinho (talvez uma estrela de quatro pontas desenhada à mão, ou só a letra V) | Decisão de marca: precisa de você |
| Capas dos laboratórios | Cada laboratório tem uma cor própria; avaliar se a cor de cada um continua (as capas são ilustrações, a cor ali pode ter sentido) ou se fica tudo na mesma luz | Ao revisar a área Laboratórios |
| Chips de conceito e metadados nos cartões de laboratório | Tirar ou reduzir a uma linha | Ao revisar a área Laboratórios |
| Início com muitas portas (busca, laboratório, objeto do dia, Matemática) | Um "Próximo passo" único no topo, como na Matemática, e o resto abaixo | Quando a formação tiver aulas |
| Opções da capa ("Voz da Vega •", "Tela cheia •") | Interruptores claros, sem bolinha | Ao revisar a capa |
| Cores das partes da Matemática nos dados (`Part.color`) | Não aparecem mais na interface; apagar se continuarem sem uso | Na próxima limpeza |
