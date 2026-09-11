import { Problem, StoredMistake } from '../types'

// Leitner box configuration: 3 levels before graduation.
// Level 0 = just failed, due next session.
// Level 1..2 = intervals that grow between reviews.
// Level 3 = graduated (removed from vault).
export const MAX_REPETITION_LEVEL = 3
export const GRADUATION_CONSECUTIVE_CORRECT = 3

// Interval (ms) per Leitner box before a mistake becomes due again.
// Box 0 -> due immediately next session; box 1 -> 1 day; box 2 -> 3 days.
const BOX_INTERVAL_MS: Record<number, number> = {
  0: 0,
  1: 24 * 60 * 60 * 1000,
  2: 3 * 24 * 60 * 60 * 1000,
}

const VAULT_STORAGE_KEY = 'mistake-vault'

function now(): number {
  return Date.now()
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Build a StoredMistake entry from a problem the learner got wrong.
 * If a mistake for the same operand/operation already exists, the new
 * incorrect answer is appended and the box is reset to 0 (due next session).
 */
export function recordMistake(
  vault: StoredMistake[],
  problem: Problem,
  providedAnswer: number
): StoredMistake[] {
  const existing = vault.find(
    (m) =>
      m.num1 === problem.operand1 &&
      m.num2 === problem.operand2 &&
      m.operation === problem.operation
  )

  if (existing) {
    return vault.map((m) =>
      m.id === existing.id
        ? {
            ...m,
            incorrectAnswers: m.incorrectAnswers.includes(providedAnswer)
              ? m.incorrectAnswers
              : [...m.incorrectAnswers, providedAnswer],
            repetitionLevel: 0,
            nextReviewTimestamp: 0,
          }
        : m
    )
  }

  const mistake: StoredMistake = {
    id: generateId(),
    problemId: problem.id,
    num1: problem.operand1,
    num2: problem.operand2,
    operation: problem.operation,
    incorrectAnswers: [providedAnswer],
    repetitionLevel: 0,
    consecutiveCorrect: 0,
    nextReviewTimestamp: 0,
    lastReviewedAt: null,
    addedAt: now(),
  }
  return [mistake, ...vault]
}

/**
 * Mark a stored mistake as reviewed. On a correct answer, the learner
 * advances toward graduation; on an incorrect answer, the box resets.
 * Returns the updated vault with graduated mistakes removed.
 */
export function reviewMistake(
  vault: StoredMistake[],
  mistakeId: string,
  correct: boolean
): StoredMistake[] {
  return vault
    .map((m) => {
      if (m.id !== mistakeId) return m
      if (correct) {
        const consecutiveCorrect = m.consecutiveCorrect + 1
        const level = Math.min(m.repetitionLevel + 1, MAX_REPETITION_LEVEL - 1)
        const interval = BOX_INTERVAL_MS[level] ?? 0
        return {
          ...m,
          consecutiveCorrect,
          repetitionLevel: level,
          lastReviewedAt: now(),
          nextReviewTimestamp: now() + interval,
        }
      }
      return {
        ...m,
        consecutiveCorrect: 0,
        repetitionLevel: 0,
        lastReviewedAt: now(),
        nextReviewTimestamp: 0,
      }
    })
    .filter((m) => m.consecutiveCorrect < GRADUATION_CONSECUTIVE_CORRECT)
}

/**
 * Remove a graduated/explicitly cleared mistake from the vault.
 */
export function removeMistake(
  vault: StoredMistake[],
  mistakeId: string
): StoredMistake[] {
  return vault.filter((m) => m.id !== mistakeId)
}

/**
 * Mistakes due for review at the given timestamp (defaults to now).
 * Level-0 mistakes are always due; higher boxes are due once their
 * nextReviewTimestamp has passed.
 */
export function getDueMistakes(
  vault: StoredMistake[],
  timestamp: number = now()
): StoredMistake[] {
  return vault.filter((m) => timestamp >= m.nextReviewTimestamp)
}

/**
 * Convert a stored mistake into a Problem for a Remediation Challenge session.
 */
export function mistakeToProblem(mistake: StoredMistake): Problem {
  const { num1, num2, operation } = mistake
  let correctAnswer: number
  switch (operation) {
    case 'addition':
      correctAnswer = num1 + num2
      break
    case 'subtraction':
      correctAnswer = num1 - num2
      break
    case 'multiplication':
      correctAnswer = num1 * num2
      break
    case 'division':
      correctAnswer = num2 !== 0 ? Number((num1 / num2).toFixed(2)) : 0
      break
  }
  return {
    id: mistake.problemId,
    operand1: num1,
    operand2: num2,
    operation,
    correctAnswer,
  }
}

/**
 * Build a Remediation Challenge problem set from the due mistakes in the vault.
 * Pads with random problems if the vault is too small to fill the requested count.
 */
export function buildRemediationProblems(
  vault: StoredMistake[],
  count: number,
  fallbackGenerator: (n: number) => Problem[] = () => []
): Problem[] {
  const due = getDueMistakes(vault)
  const problems = due.slice(0, count).map(mistakeToProblem)
  if (problems.length < count) {
    const extra = fallbackGenerator(count - problems.length)
    return [...problems, ...extra]
  }
  return problems
}

/**
 * Count non-graduated mistakes still in the vault.
 */
export function getVaultSize(vault: StoredMistake[]): number {
  return vault.length
}

/**
 * Count mistakes currently due for review.
 */
export function getDueCount(vault: StoredMistake[], timestamp: number = now()): number {
  return getDueMistakes(vault, timestamp).length
}

// --- localStorage persistence ------------------------------------------------

export function loadMistakeVault(): StoredMistake[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as StoredMistake[]
  } catch {
    return []
  }
}

export function saveMistakeVault(vault: StoredMistake[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault))
  } catch {
    // Ignore quota / serialization errors.
  }
}

export function clearMistakeVault(): StoredMistake[] {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(VAULT_STORAGE_KEY)
    } catch {
      // Ignore.
    }
  }
  return []
}

export const VAULT_KEY = VAULT_STORAGE_KEY
