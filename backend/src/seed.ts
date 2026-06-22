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
  // M2 - Operações com Matrizes
  {
    questionId: 'q-m2-1',
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
  // M3 - Determinantes
  {
    questionId: 'q-m3-1',
    nodeId: 'M3',
    questionText: 'Qual o determinante da matriz [[3, 1], [2, 4]]?',
    options: JSON.stringify(['10', '12', '14', '5']),
    correctAnswer: '10',
    difficulty: 1,
  },
  // M4 - Sistemas Lineares
  {
    questionId: 'q-m4-1',
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
  // V3 - Operações com Vetores
  {
    questionId: 'q-v3-1',
    nodeId: 'V3',
    questionText: 'Dados u = (2, 3) e v = (1, -1), qual é u + v?',
    options: JSON.stringify(['(3, 2)', '(1, 4)', '(3, -3)', '(-1, 4)']),
    correctAnswer: '(3, 2)',
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
  // V5 - Produto Escalar
  {
    questionId: 'q-v5-1',
    nodeId: 'V5',
    questionText: 'O produto escalar de u = (2, 3) e v = (4, -1) é:',
    options: JSON.stringify(['5', '11', '8', '-5']),
    correctAnswer: '5',
    difficulty: 1,
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
