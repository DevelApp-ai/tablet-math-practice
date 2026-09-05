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
        correctAnswer = parseFloat((operand1 / operand2).toFixed(2))
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

  const usedProblems = new Set<string>()

  while (problems.length < count) {
    const operation = operations[Math.floor(Math.random() * operations.length)]
    const problem = generateProblem(difficulty, operation)
    const problemKey = `${problem.operand1}-${problem.operand2}-${problem.operation}`

    if (!usedProblems.has(problemKey)) {
      usedProblems.add(problemKey)
      problems.push(problem)
    }
  }

  return problems
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getOperationSymbol(operation: Exclude<OperationType, 'mixed'>): string {
  const symbols = {
    addition: '+',
    subtraction: '\u2212',
    multiplication: '\u00d7',
    division: '\u00f7'
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
  const { operand1, operand2, operation, correctAnswer } = problem
  const ones1 = operand1 % 10
  const ones2 = operand2 % 10
  const tens1 = Math.floor(operand1 / 10)
  const tens2 = Math.floor(operand2 / 10)

  const hints: Record<string, string[]> = {
    addition: [
      `What is ${ones1} + ${ones2}?`,
      `What is ${tens1} + ${tens2}?`,
      `Add them together: ${tens1 + tens2}0 + ${ones1 + ones2} = ${correctAnswer}`
    ],
    subtraction: [
      `What is ${ones1} - ${ones2}?`,
      ones1 < ones2
        ? `Since ${ones1} < ${ones2}, borrow 1 from the tens: (${ones1} + 10) - ${ones2} = ${ones1 + 10 - ones2}`
        : 'No borrowing needed here',
      ones1 < ones2
        ? `Now subtract the tens: ${tens1 - 1} - ${tens2}`
        : `Now subtract the tens: ${tens1} - ${tens2}`
    ],
    multiplication: [
      `Think of this as ${operand1} groups of ${operand2}`,
      `Break it down: ${operand1} \u00d7 ${Math.floor(operand2 / 2)} = ${operand1 * Math.floor(operand2 / 2)}, then add the rest`,
      `Or: ${Math.floor(operand1 / 2)} \u00d7 ${operand2} = ${Math.floor(operand1 / 2) * operand2}, plus ${operand1 % 2} \u00d7 ${operand2} = ${(operand1 % 2) * operand2}`
    ],
    division: [
      `How many times does ${operand2} fit into ${operand1}?`,
      `Try estimating: ${operand2} \u00d7 10 = ${operand2 * 10}, which is ${operand2 * 10 <= operand1 ? 'less than' : 'more than'} ${operand1}`,
      `Divide step by step: ${operand1} \u00f7 ${operand2} = ${correctAnswer}`
    ]
  }

  return hints[operation].slice(0, step)
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}
