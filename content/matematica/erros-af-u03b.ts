import type { ErroComum } from '@/lib/formation/schema'

export const ERROS_AF_U03B: ErroComum[] = [
  {
    "id": "equacao-coeficiente-sem-sinal",
    "nome": "retira o sinal de um coeficiente",
    "causa": "Copia o módulo do coeficiente e troca o polinômio sem perceber.",
    "exemplo": "Em 2x² + 6x − 8, usa c = 8.",
    "desmonte": "O termo constante é −8: c inclui o sinal. Assim −4ac é positivo nesse exemplo."
  },
  {
    "id": "equacao-menos-b",
    "nome": "esquece o oposto de b",
    "causa": "Copia b no numerador da fórmula, ignorando o menos que está antes dele.",
    "exemplo": "Com b = −6, usa −b = −6.",
    "desmonte": "−b é −(−6), que vale +6. Escreva b entre parênteses antes de trocar o sinal."
  },
  {
    "id": "equacao-divide-so-radical",
    "nome": "divide só a raiz por dois a",
    "causa": "Lê a barra de fração como se ela estivesse apenas embaixo do último termo.",
    "exemplo": "(−6 + 10)/4 vira −6 + 10/4.",
    "desmonte": "O numerador inteiro está sobre 4. Some primeiro: −6 + 10 = 4; depois divida: 4/4 = 1."
  },
  {
    "id": "delta-negativo-raizes-negativas",
    "nome": "interpreta delta negativo como raízes negativas",
    "causa": "Confunde o sinal do radicando com o sinal das raízes.",
    "exemplo": "Δ = −4 significa duas raízes negativas.",
    "desmonte": "O quadrado (2ax + b)² teria de ser −4. Não existe x real que faça isso."
  },
  {
    "id": "delta-nao-quadrado-sem-raizes",
    "nome": "confunde raiz não inteira com inexistência",
    "causa": "Só aceita raízes que consegue obter como inteiros.",
    "exemplo": "Δ = 8 não permite raízes reais.",
    "desmonte": "√8 existe na reta real, entre 2 e 3. Delta positivo dá duas raízes, mesmo que sejam irracionais."
  },
  {
    "id": "equacao-aceita-medida-negativa",
    "nome": "aceita uma raiz negativa como comprimento",
    "causa": "Confere a conta, mas não volta ao significado da incógnita.",
    "exemplo": "Largura de um terreno: x = −8 m.",
    "desmonte": "Largura é positiva. A equação pode aceitar −8, mas o terreno pede a outra raiz. Confira os dois lados e a área."
  },
  {
    "id": "problema-area-soma-lados",
    "nome": "soma os lados para calcular a área",
    "causa": "Escolhe adição sem relacionar os dois comprimentos pela multiplicação.",
    "exemplo": "Terreno x por x + 3 de área 40 vira 2x + 3 = 40.",
    "desmonte": "Conte as fileiras de quadrados: a área é largura vezes comprimento, x(x + 3)."
  },
  {
    "id": "moldura-conta-uma-faixa",
    "nome": "conta a moldura em uma ponta só",
    "causa": "Acrescenta uma largura, esquecendo que a borda ocupa as duas pontas da dimensão.",
    "exemplo": "Foto de 4 por 6 com moldura x: lados 4 + x e 6 + x.",
    "desmonte": "Percorra o lado de fora no desenho: x + 4 + x. Em cada dimensão entram duas faixas."
  },
  {
    "id": "problema-descarta-negativo-sempre",
    "nome": "descarta toda raiz negativa sem ler o contexto",
    "causa": "Generaliza a restrição de comprimento para qualquer problema.",
    "exemplo": "Dois inteiros consecutivos de produto 6: rejeita −3 e −2.",
    "desmonte": "−3 e −2 são consecutivos e seu produto é 6. O enunciado fala de inteiros e permite negativos."
  }
]
