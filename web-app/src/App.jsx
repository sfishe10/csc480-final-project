import { useState } from 'react'
import './App.css'

const QUESTIONS = [
  '[insert question 1 here]',
  '[insert question 2 here]',
  '[insert question 3 here]',
  '[insert question 4 here]',
  '[insert question 5 here]',
  '[insert question 6 here]',
  '[insert question 7 here]',
  '[insert question 8 here]',
  '[insert question 9 here]',
  '[insert question 10 here]',
]

function App() {
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))
  const [finished, setFinished] = useState(false)

  const handleStart = () => {
    setStarted(true)
  }

  const handleAnswer = (value) => {
    const updated = [...answers]
    updated[currentIndex] = value
    setAnswers(updated)

    const isLastQuestion = currentIndex === QUESTIONS.length - 1

    if (isLastQuestion) {
      setFinished(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleRestart = () => {
    setStarted(false)
    setFinished(false)
    setCurrentIndex(0)
    setAnswers(Array(QUESTIONS.length).fill(null))
  }

  return (
    <div className="app-root">
      <div className="card">
        {!started && !finished && (
          <>
            <h1>Simple 1–5 Questionnaire</h1>
            <p className="card-subtitle">
              You&apos;ll be shown 10 questions, one at a time. Answer each by
              selecting a value from 1 to 5.
            </p>
            <button className="primary-button" onClick={handleStart}>
              Get Started
            </button>
          </>
        )}

        {started && !finished && (
          <div key={currentIndex} className="question-panel">
            <div className="progress">
              Question {currentIndex + 1} of {QUESTIONS.length}
            </div>
            <h2 className="question-text">{QUESTIONS[currentIndex]}</h2>
            <p className="scale-label">Select a number from 1 (low) to 5 (high)</p>
            <div className="scale-buttons">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={`scale-button${
                    answers[currentIndex] === value ? ' scale-button--selected' : ''
                  }`}
                  onClick={() => handleAnswer(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {finished && (
          <>
            <h1>All Done!</h1>
            <p className="card-subtitle">
              Here are your answers (in order of the questions):
            </p>
            <pre className="answers-output">
{JSON.stringify(answers, null, 2)}
            </pre>
            <button className="primary-button" onClick={handleRestart}>
              Start Over
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default App
