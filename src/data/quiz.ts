export type AllCorrectQuestion = {
  id: string
  type: 'all-correct'
  prompt: string
  options: string[]
  successMessage: string
}

export type OneCorrectQuestion = {
  id: string
  type: 'one-correct'
  prompt: string
  options: { label: string; correct: boolean }[]
  successMessage: string
}

export type TrueFalseQuestion = {
  id: string
  type: 'true-false'
  prompt: string
  successMessage: string
}

export type QuizQuestion = AllCorrectQuestion | OneCorrectQuestion | TrueFalseQuestion

const HER_NAMES = ['Nisreen', 'Niso Mango', 'My nonchalant queen', 'Nisreen Kanbar'] as const

function oneCorrect(
  id: string,
  prompt: string,
  correctName: (typeof HER_NAMES)[number],
  successMessage: string,
): OneCorrectQuestion {
  return {
    id,
    type: 'one-correct',
    prompt,
    successMessage,
    options: HER_NAMES.map((name) => ({ label: name, correct: name === correctName })),
  }
}

export const QUIZ_ROUND_SIZE = 10

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'beauty-mc',
    type: 'all-correct',
    prompt: "Who's my favorite person in the whole world?",
    options: [...HER_NAMES],
    successMessage: 'You know me so well. Obviously. ♥',
  },
  oneCorrect('favourite', 'Who do I like the most?', 'Nisreen', 'You got it. ♥'),
  {
    id: 'beauty-tf',
    type: 'true-false',
    prompt: 'Is Nisreen my favorite person in the world?',
    successMessage: "That's the only answer. ♥",
  },
  {
    id: 'queen-mc',
    type: 'all-correct',
    prompt: "Who's my nonchalant queen?",
    options: [...HER_NAMES],
    successMessage: 'Every single one counts. ♥',
  },
  oneCorrect('pick-her', 'Who do I pick every single time?', 'Niso Mango', 'You know the answer. ♥'),
  {
    id: 'special-tf',
    type: 'true-false',
    prompt: 'Do I want you to always feel loved and special?',
    successMessage: 'Always. ♥',
  },
  {
    id: 'heart-mc',
    type: 'all-correct',
    prompt: 'Who makes my heart do the thing?',
    options: [...HER_NAMES],
    successMessage: 'All valid answers. ♥',
  },
  oneCorrect('only-one', "Who's the main character in my life?", 'Nisreen Kanbar', 'Star of the show. ♥'),
  {
    id: 'perfect-tf',
    type: 'true-false',
    prompt: 'Do I think Niso Mango is absolutely perfect?',
    successMessage: 'Facts only. ♥',
  },
  {
    id: 'love-mc',
    type: 'all-correct',
    prompt: 'Who deserves all my love?',
    options: [...HER_NAMES],
    successMessage: 'Could not agree more. ♥',
  },
]

export function shuffleOptions<T>(items: readonly T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

export function buildQuizRound(): QuizQuestion[] {
  return shuffleOptions(quizQuestions)
}
