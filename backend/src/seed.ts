import 'dotenv/config';
import mongoose from 'mongoose';
import { KnowledgeNodeSchema } from './schemas/knowledge-node.schema';
import { AssessmentQuestionSchema } from './schemas/assessment-question.schema';

const knowledgeNodes = [
  {
    nodeId: 'M1',
    label: 'Conceitos Básicos de Matrizes',
    description: 'Definição de matriz, tipos de matrizes (quadrada, identidade, nula, diagonal, triangular), ordem e elementos.',
    order: 1,
    category: 'matrices',
    prerequisites: [],
  },
  {
    nodeId: 'M2',
    label: 'Operações com Matrizes',
    description: 'Adição, subtração, multiplicação por escalar e multiplicação de matrizes. Propriedades das operações.',
    order: 2,
    category: 'matrices',
    prerequisites: ['M1'],
  },
  {
    nodeId: 'M3',
    label: 'Determinantes',
    description: 'Cálculo de determinantes de matrizes 2x2 e 3x3 (Regra de Sarrus), propriedades dos determinantes, cofatores.',
    order: 3,
    category: 'matrices',
    prerequisites: ['M2'],
  },
  {
    nodeId: 'M4',
    label: 'Sistemas Lineares',
    description: 'Representação matricial de sistemas lineares, Regra de Cramer, escalonamento, classificação (SPD, SPI, SI).',
    order: 4,
    category: 'matrices',
    prerequisites: ['M3'],
  },
  {
    nodeId: 'V1',
    label: 'Conceitos Básicos de Vetores',
    description: 'Definição de vetor, grandezas vetoriais e escalares, representação geométrica, vetor nulo.',
    order: 5,
    category: 'vectors',
    prerequisites: ['M4'],
  },
  {
    nodeId: 'V2',
    label: 'Representação Vetorial',
    description: 'Coordenadas de um vetor no plano e no espaço, vetores unitários, componentes cartesianas.',
    order: 6,
    category: 'vectors',
    prerequisites: ['V1'],
  },
  {
    nodeId: 'V3',
    label: 'Operações com Vetores',
    description: 'Adição, subtração de vetores, multiplicação por escalar, combinação linear.',
    order: 7,
    category: 'vectors',
    prerequisites: ['V2'],
  },
  {
    nodeId: 'V4',
    label: 'Módulo de Vetores',
    description: 'Cálculo do módulo (norma) de um vetor, distância entre pontos, vetores unitários (normalização).',
    order: 8,
    category: 'vectors',
    prerequisites: ['V3'],
  },
  {
    nodeId: 'V5',
    label: 'Produto Escalar',
    description: 'Definição do produto escalar, cálculo algébrico e geométrico, propriedades.',
    order: 9,
    category: 'vectors',
    prerequisites: ['V4'],
  },
  {
    nodeId: 'V6',
    label: 'Ângulo entre Vetores',
    description: 'Cálculo do ângulo entre dois vetores usando produto escalar, vetores paralelos.',
    order: 10,
    category: 'vectors',
    prerequisites: ['V5'],
  },
  {
    nodeId: 'V7',
    label: 'Ortogonalidade',
    description: 'Vetores ortogonais, projeção ortogonal, base ortogonal e ortonormal.',
    order: 11,
    category: 'vectors',
    prerequisites: ['V6'],
  },
];

const assessmentQuestions = [
  // M1 - Conceitos Básicos de Matrizes
  {
    questionId: 'q-m1-1',
    nodeId: 'M1',
    questionText: 'Qual é a ordem da matriz A = [[1, 2, 3], [4, 5, 6]]?',
    options: JSON.stringify(['2x3', '3x2', '2x2', '3x3']),
    correctAnswer: '2x3',
    difficulty: 1,
  },
  {
    questionId: 'q-m1-2',
    nodeId: 'M1',
    questionText: 'Uma matriz identidade 3x3 possui quais valores na diagonal principal?',
    options: JSON.stringify(['0', '1', '-1', '3']),
    correctAnswer: '1',
    difficulty: 1,
  },
  {
    questionId: 'q-m1-3',
    nodeId: 'M1',
    questionText: 'Uma matriz quadrada é aquela em que:',
    options: JSON.stringify([
      'O número de linhas é igual ao número de colunas',
      'Todos os elementos são iguais',
      'O determinante é zero',
      'Todos os elementos são positivos',
    ]),
    correctAnswer: 'O número de linhas é igual ao número de colunas',
    difficulty: 1,
  },
  // M2 - Operações com Matrizes
  {
    questionId: 'q-m2-1',
    nodeId: 'M2',
    questionText: 'Dadas A = [[1, 2], [3, 4]] e B = [[5, 6], [7, 8]], qual é A + B?',
    options: JSON.stringify([
      '[[6, 8], [10, 12]]',
      '[[4, 4], [4, 4]]',
      '[[5, 12], [21, 32]]',
      '[[6, 8], [9, 12]]',
    ]),
    correctAnswer: '[[6, 8], [10, 12]]',
    difficulty: 1,
  },
  {
    questionId: 'q-m2-2',
    nodeId: 'M2',
    questionText: 'Para que a multiplicação A·B seja possível, é necessário que:',
    options: JSON.stringify([
      'O número de colunas de A seja igual ao número de linhas de B',
      'A e B tenham a mesma ordem',
      'A e B sejam quadradas',
      'O determinante de A seja diferente de zero',
    ]),
    correctAnswer: 'O número de colunas de A seja igual ao número de linhas de B',
    difficulty: 2,
  },
  {
    questionId: 'q-m2-3',
    nodeId: 'M2',
    questionText: 'Se A = [[2, 0], [1, 3]] e k = 3, qual é k·A?',
    options: JSON.stringify([
      '[[6, 0], [3, 9]]',
      '[[5, 3], [4, 6]]',
      '[[6, 3], [3, 9]]',
      '[[2, 0], [1, 9]]',
    ]),
    correctAnswer: '[[6, 0], [3, 9]]',
    difficulty: 1,
  },
  // M3 - Determinantes
  {
    questionId: 'q-m3-1',
    nodeId: 'M3',
    questionText: 'Qual o determinante da matriz [[3, 1], [2, 4]]?',
    options: JSON.stringify(['10', '12', '14', '5']),
    correctAnswer: '10',
    difficulty: 1,
  },
  {
    questionId: 'q-m3-2',
    nodeId: 'M3',
    questionText: 'Se o determinante de uma matriz é zero, então:',
    options: JSON.stringify([
      'A matriz é singular (não inversível)',
      'A matriz é identidade',
      'A matriz é diagonal',
      'A matriz tem todos elementos positivos',
    ]),
    correctAnswer: 'A matriz é singular (não inversível)',
    difficulty: 2,
  },
  {
    questionId: 'q-m3-3',
    nodeId: 'M3',
    questionText: 'Qual o determinante da matriz [[1, 2, 3], [4, 5, 6], [7, 8, 9]]?',
    options: JSON.stringify(['0', '1', '-1', '6']),
    correctAnswer: '0',
    difficulty: 3,
  },
  // M4 - Sistemas Lineares
  {
    questionId: 'q-m4-1',
    nodeId: 'M4',
    questionText: 'Um sistema linear com determinante principal diferente de zero é classificado como:',
    options: JSON.stringify([
      'Sistema Possível e Determinado (SPD)',
      'Sistema Possível e Indeterminado (SPI)',
      'Sistema Impossível (SI)',
      'Sistema Homogêneo',
    ]),
    correctAnswer: 'Sistema Possível e Determinado (SPD)',
    difficulty: 2,
  },
  {
    questionId: 'q-m4-2',
    nodeId: 'M4',
    questionText: 'No sistema { x + y = 5, x - y = 1 }, quais são os valores de x e y?',
    options: JSON.stringify([
      'x = 3, y = 2',
      'x = 2, y = 3',
      'x = 4, y = 1',
      'x = 1, y = 4',
    ]),
    correctAnswer: 'x = 3, y = 2',
    difficulty: 1,
  },
  // V1 - Conceitos Básicos de Vetores
  {
    questionId: 'q-v1-1',
    nodeId: 'V1',
    questionText: 'Um vetor é definido por:',
    options: JSON.stringify([
      'Módulo, direção e sentido',
      'Apenas módulo',
      'Módulo e direção',
      'Direção e sentido',
    ]),
    correctAnswer: 'Módulo, direção e sentido',
    difficulty: 1,
  },
  {
    questionId: 'q-v1-2',
    nodeId: 'V1',
    questionText: 'O vetor nulo é aquele cujo módulo é:',
    options: JSON.stringify(['0', '1', '-1', 'Indefinido']),
    correctAnswer: '0',
    difficulty: 1,
  },
  // V2 - Representação Vetorial
  {
    questionId: 'q-v2-1',
    nodeId: 'V2',
    questionText: 'O vetor que vai do ponto A(1, 2) ao ponto B(4, 6) é:',
    options: JSON.stringify([
      '(3, 4)',
      '(5, 8)',
      '(4, 6)',
      '(-3, -4)',
    ]),
    correctAnswer: '(3, 4)',
    difficulty: 1,
  },
  {
    questionId: 'q-v2-2',
    nodeId: 'V2',
    questionText: 'Um vetor unitário tem módulo igual a:',
    options: JSON.stringify(['1', '0', '-1', '2']),
    correctAnswer: '1',
    difficulty: 1,
  },
  // V3 - Operações com Vetores
  {
    questionId: 'q-v3-1',
    nodeId: 'V3',
    questionText: 'Dados u = (2, 3) e v = (1, -1), qual é u + v?',
    options: JSON.stringify(['(3, 2)', '(1, 4)', '(3, -3)', '(-1, 4)']),
    correctAnswer: '(3, 2)',
    difficulty: 1,
  },
  {
    questionId: 'q-v3-2',
    nodeId: 'V3',
    questionText: 'Se v = (4, -2) e k = -2, qual é k·v?',
    options: JSON.stringify([
      '(-8, 4)',
      '(8, -4)',
      '(-8, -4)',
      '(2, -4)',
    ]),
    correctAnswer: '(-8, 4)',
    difficulty: 1,
  },
  // V4 - Módulo de Vetores
  {
    questionId: 'q-v4-1',
    nodeId: 'V4',
    questionText: 'Qual o módulo do vetor v = (3, 4)?',
    options: JSON.stringify(['5', '7', '25', '√7']),
    correctAnswer: '5',
    difficulty: 1,
  },
  {
    questionId: 'q-v4-2',
    nodeId: 'V4',
    questionText: 'Para normalizar um vetor, devemos:',
    options: JSON.stringify([
      'Dividir o vetor pelo seu módulo',
      'Multiplicar o vetor por zero',
      'Somar o vetor consigo mesmo',
      'Calcular o determinante',
    ]),
    correctAnswer: 'Dividir o vetor pelo seu módulo',
    difficulty: 2,
  },
  // V5 - Produto Escalar
  {
    questionId: 'q-v5-1',
    nodeId: 'V5',
    questionText: 'O produto escalar de u = (2, 3) e v = (4, -1) é:',
    options: JSON.stringify(['5', '11', '8', '-5']),
    correctAnswer: '5',
    difficulty: 1,
  },
  {
    questionId: 'q-v5-2',
    nodeId: 'V5',
    questionText: 'O produto escalar de dois vetores ortogonais é:',
    options: JSON.stringify(['0', '1', '-1', 'Indefinido']),
    correctAnswer: '0',
    difficulty: 2,
  },
  // V6 - Ângulo entre Vetores
  {
    questionId: 'q-v6-1',
    nodeId: 'V6',
    questionText: 'A fórmula do cosseno do ângulo entre dois vetores u e v é:',
    options: JSON.stringify([
      'cos(θ) = (u·v) / (|u|·|v|)',
      'cos(θ) = |u|·|v| / (u·v)',
      'cos(θ) = u + v',
      'cos(θ) = |u - v|',
    ]),
    correctAnswer: 'cos(θ) = (u·v) / (|u|·|v|)',
    difficulty: 2,
  },
  {
    questionId: 'q-v6-2',
    nodeId: 'V6',
    questionText: 'Se o ângulo entre dois vetores é 90°, então cos(θ) é:',
    options: JSON.stringify(['0', '1', '-1', '0.5']),
    correctAnswer: '0',
    difficulty: 1,
  },
  // V7 - Ortogonalidade
  {
    questionId: 'q-v7-1',
    nodeId: 'V7',
    questionText: 'Dois vetores são ortogonais quando:',
    options: JSON.stringify([
      'Seu produto escalar é zero',
      'São paralelos',
      'Têm o mesmo módulo',
      'Sua soma é zero',
    ]),
    correctAnswer: 'Seu produto escalar é zero',
    difficulty: 1,
  },
  {
    questionId: 'q-v7-2',
    nodeId: 'V7',
    questionText: 'A projeção ortogonal do vetor u sobre o vetor v é dada por:',
    options: JSON.stringify([
      'proj_v(u) = ((u·v) / (v·v)) · v',
      'proj_v(u) = u + v',
      'proj_v(u) = u × v',
      'proj_v(u) = |u| · |v|',
    ]),
    correctAnswer: 'proj_v(u) = ((u·v) / (v·v)) · v',
    difficulty: 3,
  },
];

async function main() {
  console.log('🌱 Seeding database with Mongoose...');

  const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/vga_its';
  await mongoose.connect(dbUrl);

  const KnowledgeNodeModel = mongoose.model('KnowledgeNode', KnowledgeNodeSchema);
  const AssessmentQuestionModel = mongoose.model('AssessmentQuestion', AssessmentQuestionSchema);

  // Clear data
  await KnowledgeNodeModel.deleteMany({});
  await AssessmentQuestionModel.deleteMany({});
  
  // Seed knowledge nodes
  for (const node of knowledgeNodes) {
    await KnowledgeNodeModel.create(node);
  }

  // Seed assessment questions
  for (const question of assessmentQuestions) {
    await AssessmentQuestionModel.create(question);
  }

  console.log('✅ Seed completed!');
  console.log(`   - ${knowledgeNodes.length} knowledge nodes created`);
  console.log(`   - ${assessmentQuestions.length} assessment questions created`);

  await mongoose.disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  });
