import { DifficultyLevel, OperationType, Problem } from './types'

export function generateProblem(
  difficulty: DifficultyLevel,
  operation: Exclude<OperationType, 'mixed'>
): Problem {
  const ranges = {
    beginner: { min: 1, max: 10 },
    intermediate: { min: 10, max: 99 },
    advanced: { min: 10, max: 999 }
  }

  const range = ranges[difficulty]
  let operand1: number
  let operand2: number
  let correctAnswer: number

  switch (operation) {
    case 'addition':
      operand1 = randomInt(range.min, range.max)
      operand2 = randomInt(range.min, range.max)
      correctAnswer = operand1 + operand2
      break

    case 'subtraction':
      operand1 = randomInt(range.min, range.max)
      operand2 = randomInt(range.min, difficulty === 'beginner' ? operand1 : range.max)
      if (operand2 > operand1 && difficulty === 'beginner') {
        [operand1, operand2] = [operand2, operand1]
      }
      correctAnswer = operand1 - operand2
      break

    case 'multiplication':
      const multRange = difficulty === 'beginner' 
        ? { min: 1, max: 12 }
        : difficulty === 'intermediate'
        ? { min: 2, max: 20 }
        : { min: 5, max: 50 }
      operand1 = randomInt(multRange.min, multRange.max)
      operand2 = randomInt(multRange.min, multRange.max)
      correctAnswer = operand1 * operand2
      break

    case 'division':
      if (difficulty === 'beginner') {
        operand2 = randomInt(2, 12)
        const quotient = randomInt(1, 12)
        operand1 = operand2 * quotient
        correctAnswer = quotient
      } else if (difficulty === 'intermediate') {
        operand2 = randomInt(2, 20)
        const quotient = randomInt(2, 50)
        operand1 = operand2 * quotient
        correctAnswer = quotient
      } else {
        operand1 = randomInt(100, 999)
        operand2 = randomInt(2, 99)
        correctAnswer = Math.round((operand1 / operand2) * 100) / 100
      }
      break
  }

  return {
    id: crypto.randomUUID(),
    operand1,
    operand2,
    operation,
    correctAnswer
  }
}

export function generateProblems(
  count: number,
  difficulty: DifficultyLevel,
  operationType: OperationType
): Problem[] {
  const problems: Problem[] = []
  const operations: Exclude<OperationType, 'mixed'>[] = 
    operationType === 'mixed' 
      ? ['addition', 'subtraction', 'multiplication', 'division']
      : [operationType as Exclude<OperationType, 'mixed'>]

  for (let i = 0; i < count; i++) {
    const operation = operations[Math.floor(Math.random() * operations.length)]
    problems.push(generateProblem(difficulty, operation))
  }

  return problems
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getOperationSymbol(operation: Exclude<OperationType, 'mixed'>): string {
  const symbols = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷'
  }
  return symbols[operation]
}

export function checkAnswer(problem: Problem, userAnswer: number): boolean {
  if (problem.operation === 'division' && problem.correctAnswer % 1 !== 0) {
    return Math.abs(userAnswer - problem.correctAnswer) < 0.01
  }
  return userAnswer === problem.correctAnswer
}

export function getHints(problem: Problem, step: number): string[] {
  const { operand1, operand2, operation } = problem
  const hints: Record<string, string[]> = {
    addition: [
      `Start by looking at the ones place: ${operand1 % 10} + ${operand2 % 10}`,
      `Add the tens place: ${Math.floor(operand1 / 10)} + ${Math.floor(operand2 / 10)}`,
      `Combine your results to get the final answer`
    ],
    subtraction: [
      `Look at the ones place: ${operand1 % 10} - ${operand2 % 10}`,
      operand1 % 10 < operand2 % 10 ? 'You need to borrow from the tens place' : 'No borrowing needed here',
      `Now subtract the tens place and combine`
    ],
    multiplication: [
      `Think of this as ${operand1} groups of ${operand2}`,
      `Or break it down: ${operand1} × ${Math.floor(operand2 / 2)} = ${operand1 * Math.floor(operand2 / 2)}, then add more`,
      `Multiply and combine your results`
    ],
    division: [
      `How many times does ${operand2} fit into ${operand1}?`,
      `Try estimating: ${operand2} × 10 = ${operand2 * 10}`,
      `Divide step by step to find the exact answer`
    ]
  }

  return hints[operation].slice(0, step)
}
