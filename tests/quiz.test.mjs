import test from 'node:test'
import assert from 'node:assert/strict'
import { quizQuestions, scoreQuiz, solarSystemQuizQuestions } from '../src/quiz.ts'

test('every quiz question has distinct choices, one valid answer, and an explanation', () => {
  for (const questions of [quizQuestions, solarSystemQuizQuestions]) {
    assert.equal(questions.length, 6)
    for (const question of questions) {
      assert.equal(new Set(question.choices).size, question.choices.length)
      assert.ok(Number.isInteger(question.correct))
      assert.ok(question.correct >= 0 && question.correct < question.choices.length)
      assert.ok(question.explanation.length > 50)
    }
  }
})

test('solar system quiz scores the supplied answers rather than the Earth quiz answers', () => {
  const answers = [1, 1, 0, 0, 2, 1]
  assert.equal(scoreQuiz(answers, solarSystemQuizQuestions), 6)
  assert.equal(scoreQuiz(answers.slice(0, 2), solarSystemQuizQuestions), 2)
  assert.equal(scoreQuiz([0, 0, 1, 1, 0, 0], solarSystemQuizQuestions), 0)
  assert.notEqual(scoreQuiz(answers), 6)
})

test('unanswered questions never count as correct', () => {
  assert.equal(scoreQuiz([]), 0)
  assert.equal(scoreQuiz(Array(quizQuestions.length).fill(null)), 0)
})

test('score reflects correct, wrong, and partially completed attempts', () => {
  const correct = quizQuestions.map(question => question.correct)
  assert.equal(scoreQuiz(correct), 6)
  assert.equal(scoreQuiz(quizQuestions.map(question => (question.correct + 1) % question.choices.length)), 0)
  assert.equal(scoreQuiz(correct.slice(0, 3)), 3)
  assert.equal(scoreQuiz([correct[0], null, correct[2]]), 2)
})