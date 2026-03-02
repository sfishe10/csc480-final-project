import { useState } from 'react'
import './App.css'
import dogImage from './assets/landing-dog.png'

const IMPORTANCE_LEVELS = [
  { label: '1', value: 1, weight: 1 },
  { label: '2', value: 2, weight: 2 },
  { label: '3', value: 3, weight: 3 },
  { label: '4', value: 4, weight: 4 },
  { label: '5', value: 5, weight: 5 },
]

const QUESTIONS = [
  {
    id: 'experience',
    prompt: 'How experienced are you with owning dogs?',
    options: [
      { label: 'First-time owner', value: 'first_time' },
      { label: 'Some experience', value: 'some' },
      { label: 'Very experienced', value: 'experienced' },
    ],
  },
  {
    id: 'home',
    prompt: 'What best describes your living space?',
    options: [
      { label: 'Apartment / small space', value: 'apartment' },
      { label: 'House with a small yard', value: 'small_yard' },
      { label: 'House with a big yard', value: 'big_yard' },
      { label: 'Rural / lots of space', value: 'rural' },
    ],
  },
  {
    id: 'activity',
    prompt: 'How active do you want your dog to be?',
    options: [
      { label: 'Low energy', value: 'low' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'High energy', value: 'high' },
      { label: 'Athlete / adventure buddy', value: 'very_high' },
    ],
  },
  {
    id: 'size',
    prompt: 'What size dog do you prefer?',
    options: [
      { label: 'Small', value: 'small' },
      { label: 'Medium', value: 'medium' },
      { label: 'Large', value: 'large' },
      { label: 'No preference', value: 'any' },
    ],
  },
  {
    id: 'time',
    prompt: 'How much time can you dedicate daily to your dog?',
    options: [
      { label: 'Less than 1 hour', value: 'lt_1h' },
      { label: '1–2 hours', value: '1_2h' },
      { label: '2–3 hours', value: '2_3h' },
      { label: '3+ hours', value: '3ph' },
    ],
  },
  {
    id: 'grooming',
    prompt: 'How much grooming are you willing to do?',
    options: [
      { label: 'Minimal', value: 'minimal' },
      { label: 'Some brushing', value: 'some' },
      { label: 'Regular grooming', value: 'regular' },
      { label: 'Doesn’t matter', value: 'any' },
    ],
  },
  {
    id: 'shedding',
    prompt: 'How important is low shedding?',
    options: [
      { label: 'Very important', value: 'very_important' },
      { label: 'Somewhat important', value: 'somewhat' },
      { label: 'Not important', value: 'not_important' },
    ],
  },
  {
    id: 'kids',
    prompt: 'Are there children in your household?',
    options: [
      { label: 'Yes (young kids)', value: 'young' },
      { label: 'Yes (older kids)', value: 'older' },
      { label: 'No', value: 'none' },
    ],
  },
  {
    id: 'pets',
    prompt: 'Do you have other pets?',
    options: [
      { label: 'No other pets', value: 'none' },
      { label: 'Yes (dogs)', value: 'dogs' },
      { label: 'Yes (cats)', value: 'cats' },
      { label: 'Yes (other)', value: 'other' },
    ],
  },
  {
    id: 'training',
    prompt: 'How much training are you willing to do?',
    options: [
      { label: 'Basic training only', value: 'basic' },
      { label: 'Some training', value: 'some' },
      { label: 'Lots of training', value: 'lots' },
      { label: 'I enjoy advanced training', value: 'advanced' },
    ],
  },
]

function ArrowRightIcon(props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function App() {
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))
  const [finished, setFinished] = useState(false)

  const handleStart = () => {
    setStarted(true)
  }

  const handleSelectOption = (option) => {
    const updated = [...answers]
    const prev = updated[currentIndex]
    updated[currentIndex] = {
      option,
      importance: prev?.importance ?? null,
    }
    setAnswers(updated)
  }

  const handleSelectImportance = (importance) => {
    const updated = [...answers]
    const prev = updated[currentIndex]
    updated[currentIndex] = {
      option: prev?.option ?? null,
      importance,
    }
    setAnswers(updated)
  }

  const handleNext = () => {
    const current = answers[currentIndex]
    const isReady = Boolean(current?.option && current?.importance)
    if (!isReady) return

    const isLastQuestion = currentIndex === QUESTIONS.length - 1

    if (isLastQuestion) {
      setFinished(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleRestart = () => {
    setStarted(false)
    setFinished(false)
    setCurrentIndex(0)
    setAnswers(Array(QUESTIONS.length).fill(null))
  }

  return (
    <>
      {!started && !finished && (
        <div className="landing-root">
          <div className="landing-bg" aria-hidden="true">
            <div className="landing-emoji landing-emoji--1">🐾</div>
            <div className="landing-emoji landing-emoji--2">🦴</div>
            <div className="landing-emoji landing-emoji--3">🐕</div>
            <div className="landing-emoji landing-emoji--4">🐾</div>
            <div className="landing-emoji landing-emoji--5">🦴</div>
            <div className="landing-emoji landing-emoji--6">🐾</div>
            <div className="landing-emoji landing-emoji--7">🐕</div>
            <div className="landing-emoji landing-emoji--8">🦴</div>
            <div className="landing-emoji landing-emoji--9">🐕</div>
          </div>

          <nav className="landing-nav">
            <div className="landing-nav-inner">
              <h1 className="landing-brand">Find Your Fetch</h1>
              <div className="quiz-nav-progress">
                Question {currentIndex + 1} of {QUESTIONS.length}
              </div>
            </div>
          </nav>

          <main className="landing-main">
            <div className="landing-content">
              <div className="landing-dog-wrap">
                <img
                  src={dogImage}
                  alt="Service Dog"
                  className="landing-dog-image"
                  loading="eager"
                />
              </div>

              <h2 className="landing-headline">Discover Your Perfect Dog.</h2>
              <p className="landing-subheadline">
                Answer 10 quick questions. Get your ideal breed match — powered by
                AI.
              </p>

              <button className="landing-cta" onClick={handleStart}>
                Start the Quiz
                <ArrowRightIcon className="landing-cta-icon" />
              </button>

              <div className="landing-stats" aria-label="Quick stats">
                <div className="landing-chip">200+ Breeds</div>
                <div className="landing-dot" aria-hidden="true">
                  ·
                </div>
                <div className="landing-chip">10 Questions</div>
                <div className="landing-dot" aria-hidden="true">
                  ·
                </div>
                <div className="landing-chip">Instant Results</div>
              </div>
            </div>
          </main>
        </div>
      )}

      {(started || finished) && (
        <div className="quiz-root">
          <div className="landing-bg" aria-hidden="true">
            <div className="landing-emoji landing-emoji--1">🐾</div>
            <div className="landing-emoji landing-emoji--2">🦴</div>
            <div className="landing-emoji landing-emoji--3">🐕</div>
            <div className="landing-emoji landing-emoji--4">🐾</div>
            <div className="landing-emoji landing-emoji--5">🦴</div>
            <div className="landing-emoji landing-emoji--6">🐾</div>
            <div className="landing-emoji landing-emoji--7">🐕</div>
            <div className="landing-emoji landing-emoji--8">🦴</div>
            <div className="landing-emoji landing-emoji--9">🐕</div>
          </div>

          <nav className="landing-nav">
            <div className="landing-nav-inner">
              <h1 className="landing-brand">Find Your Fetch</h1>
              <p className="landing-tagline">AI-Powered Breed Matching</p>
            </div>
          </nav>

          <main className="quiz-main">
            <div className="quiz-content">
              {started && !finished && (
                <section key={currentIndex} className="quiz-card">
                  {(() => {
                    const currentQuestion = QUESTIONS[currentIndex]
                    const selected = answers[currentIndex]
                    const selectedOption = selected?.option ?? null
                    const selectedImportance = selected?.importance ?? null
                    const canGoNext = Boolean(selectedOption && selectedImportance)
                    return (
                      <>
                  <div className="quiz-card-top">
                    <div className="quiz-progress-chip">
                      Question <strong>{currentIndex + 1}</strong> /{' '}
                      {QUESTIONS.length}
                    </div>
                    <div
                      className="quiz-progress-bar"
                      role="progressbar"
                      aria-valuenow={currentIndex + 1}
                      aria-valuemin={1}
                      aria-valuemax={QUESTIONS.length}
                      aria-label="Quiz progress"
                    >
                      <div
                        className="quiz-progress-fill"
                        style={{
                          width: `${
                            ((currentIndex + 1) / QUESTIONS.length) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <h2 className="quiz-question">{currentQuestion.prompt}</h2>
                  <p className="quiz-instruction">Choose one option.</p>

                  <div className="quiz-options" aria-label="Answer options">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`quiz-option-button${
                          selectedOption?.value === option.value
                            ? ' quiz-option-button--selected'
                            : ''
                        }`}
                        onClick={() => handleSelectOption(option)}
                      >
                        <span className="quiz-option-label">{option.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="quiz-importance">
                    <div className="quiz-importance-label">
                      How important is this to you?
                    </div>
                    <div className="quiz-importance-scale">
                      <span className="quiz-importance-text">Not Important</span>
                      <div
                        className="quiz-importance-circles"
                        role="group"
                        aria-label="Importance 1 to 5"
                      >
                        {IMPORTANCE_LEVELS.map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            className={`quiz-importance-circle${
                              selectedImportance?.value === level.value
                                ? ' quiz-importance-circle--selected'
                                : ''
                            }`}
                            onClick={() => handleSelectImportance(level)}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                      <span className="quiz-importance-text">
                        Very Important
                      </span>
                    </div>
                  </div>

                  <div className="quiz-footer">
                    <button
                      type="button"
                      className="quiz-nav-button quiz-nav-button--secondary"
                      onClick={handleBack}
                      disabled={currentIndex === 0}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="quiz-nav-button quiz-nav-button--primary"
                      onClick={handleNext}
                      disabled={!canGoNext}
                    >
                      {currentIndex === QUESTIONS.length - 1 ? 'Finish' : 'Next'}
                      <ArrowRightIcon className="quiz-nav-icon" />
                    </button>
                  </div>
                      </>
                    )
                  })()}
                </section>
              )}

              {finished && (
                <section className="quiz-card quiz-card--results">
                  <h2 className="quiz-results-title">All done!</h2>
                  <p className="quiz-results-subtitle">
                    Here are your answers (in order of the questions).
                  </p>

                  <pre className="quiz-results-output">
{JSON.stringify(
  answers.map((a, idx) => ({
    questionId: QUESTIONS[idx].id,
    question: QUESTIONS[idx].prompt,
    optionValue: a?.option?.value ?? null,
    optionLabel: a?.option?.label ?? null,
    importance: a?.importance?.value ?? null,
    importanceWeight: a?.importance?.weight ?? null,
  })),
  null,
  2
)}
                  </pre>

                  <button className="landing-cta" onClick={handleRestart}>
                    Start Over
                    <ArrowRightIcon className="landing-cta-icon" />
                  </button>
                </section>
              )}
            </div>
          </main>
        </div>
      )}
    </>
  )
}

export default App
