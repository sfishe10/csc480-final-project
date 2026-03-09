import { useState } from 'react'
import './App.css'
import dogImage from './assets/landing-dog.png'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

// Map quiz option values to matcher ontology trait names (normalized form)
const TRAIT_VALUE_MAP = {
  living_situation: {
    apartment: 'good_for_apartment',
    house_small_yard: 'good_for_small_homes',
    house_medium_big_yard: 'good_for_small_homes',
    ranch_property: 'thrives_on_ranch',
  },
  free_time: {
    very_little: 'good_for_low_free_time',
    some: 'calm_and_obedient',
    decent: 'calm_and_obedient',
    a_lot: 'high_time_commitment_dog',
  },
}

const IMPORTANCE_LEVELS = [
  { label: '1', value: 1, weight: 1 },
  { label: '2', value: 2, weight: 2 },
  { label: '3', value: 3, weight: 3 },
  { label: '4', value: 4, weight: 4 },
  { label: '5', value: 5, weight: 5 },
]

const QUESTIONS = [
  {
    id: 'living_situation',
    prompt: 'What best describes your living situation?',
    skipImportance: true,
    options: [
      { label: 'Apartment', value: 'apartment' },
      { label: 'House (small or no backyard)', value: 'house_small_yard' },
      { label: 'House (medium or large backyard)', value: 'house_medium_big_yard' },
      { label: 'Ranch / Large Property', value: 'ranch_property' },
    ],
  },
  {
    id: 'free_time',
    prompt: 'How much free time do you have?',
    skipImportance: true,
    options: [
      { label: 'Very little (0 - 10 hours / week)', value: 'very_little' },
      { label: 'Some (10 - 20 hours / week)', value: 'some' },
      { label: 'A decent amount (20 – 30 hours / week)', value: 'decent' },
      { label: 'A lot (30+ hours)', value: 'a_lot' },
    ],
  },
  {
    id: 'shedding',
    prompt: 'What is your preferred shedding characteristic in a dog?',
    options: [
      { label: 'Sheds frequently', value: 'Sheds_Frequent' },
      { label: 'Sheds infrequently', value: 'Sheds_Infrequent' },
      { label: 'Sheds occasionally', value: 'Sheds_Occasional' },
      { label: 'Sheds regularly', value: 'Sheds_Regularly' },
      { label: 'Sheds seasonal', value: 'Sheds_Seasonal' },
    ],
  },
  {
    id: 'demeanor',
    prompt: 'What is your preferred demeanor in a dog?',
    options: [
      { label: 'Alert & responsive', value: 'Alert_Responsive' },
      { label: 'Aloof / wary', value: 'Aloof_Wary' },
      { label: 'Friendly', value: 'Friendly' },
      { label: 'Outgoing', value: 'Outgoing' },
      { label: 'Reserved with strangers', value: 'Reserved_with_Strangers' },
    ],
  },
  {
    id: 'coat_type',
    prompt: 'What is your preferred coat type in a dog?',
    options: [
      { label: 'Corded coat', value: 'Corded_Coat' },
      { label: 'Curly coat', value: 'Curly_Coat' },
      { label: 'Double coat', value: 'Double_Coat' },
      { label: 'Hairless coat', value: 'Hairless_Coat' },
      { label: 'Rough coat', value: 'Rough_Coat' },
      { label: 'Silky coat', value: 'Silky_Coat' },
      { label: 'Smooth coat', value: 'Smooth_Coat' },
      { label: 'Wavy coat', value: 'Wavy_Coat' },
      { label: 'Wiry coat', value: 'Wiry_Coat' },
    ],
  },
  {
    id: 'coat_length',
    prompt: 'What is your preferred coat length in a dog?',
    options: [
      { label: 'Long coat', value: 'Long_Coat' },
      { label: 'Medium coat', value: 'Medium_Coat' },
      { label: 'Short coat', value: 'Short_Coat' },
    ],
  },
  {
    id: 'children',
    prompt: 'What is your preferred compatibility with children in a dog?',
    options: [
      { label: 'Bad with children', value: 'Bad_With_Children' },
      { label: 'Ok with children', value: 'Ok_With_Children' },
      { label: 'Good with children', value: 'Good_With_Children' },
    ],
  },
  {
    id: 'other_dogs',
    prompt: 'What is your preferred compatibility with other dogs?',
    options: [
      { label: 'Bad with other dogs', value: 'Bad_With_Other_Dogs' },
      { label: 'Ok with other dogs', value: 'Ok_With_Other_Dogs' },
      { label: 'Good with other dogs', value: 'Good_With_Other_Dogs' },
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

function buildPreferencesFromAnswers(answers) {
  return answers
    .map((a, idx) => {
      const q = QUESTIONS[idx]
      let trait = a?.option?.value
      const importance = a?.importance?.value
      if (!trait || (!q?.skipImportance && importance == null)) return null
      const mapped = TRAIT_VALUE_MAP[q?.id]?.[trait]
      if (mapped) trait = mapped
      else trait = String(trait).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      return q?.skipImportance
        ? { trait, importance: 3 }
        : { trait, importance }
    })
    .filter(Boolean)
}

function App() {
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))
  const [finished, setFinished] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState(null)
  const [expandedBreed, setExpandedBreed] = useState(null)

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
    const question = QUESTIONS[currentIndex]
    const isReady = question?.skipImportance
      ? Boolean(current?.option)
      : Boolean(current?.option && current?.importance)
    if (!isReady) return

    const isLastQuestion = currentIndex === QUESTIONS.length - 1

    if (isLastQuestion) {
      setFinished(true)
      const preferences = buildPreferencesFromAnswers(answers)
      if (preferences.length > 0) {
        setMatchLoading(true)
        setMatchError(null)
        setMatchResult(null)
        fetch(`${API_BASE}/api/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences }),
        })
          .then((res) => {
            if (!res.ok) return res.json().then((d) => { throw new Error(d.error || res.statusText) })
            return res.json()
          })
          .then((data) => {
            setMatchResult(data)
            setMatchLoading(false)
          })
          .catch((err) => {
            setMatchError(err.message || 'Match request failed')
            setMatchLoading(false)
          })
      }
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
    setMatchResult(null)
    setMatchError(null)
    setMatchLoading(false)
    setExpandedBreed(null)
  }

  const toggleBreedExpanded = (breed) => {
    setExpandedBreed((prev) => (prev === breed ? null : breed))
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
                    const canGoNext = currentQuestion.skipImportance
                      ? Boolean(selectedOption)
                      : Boolean(selectedOption && selectedImportance)
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

                  {!currentQuestion.skipImportance && (
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
                  )}

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
                    {matchLoading
                      ? 'Finding your best breed matches…'
                      : matchError
                        ? 'Something went wrong when matching.'
                        : matchResult
                          ? 'Here are your top breed matches.'
                          : 'Here are your answers.'}
                  </p>

                  {matchLoading && (
                    <div className="quiz-results-loading" aria-live="polite">
                      Loading…
                    </div>
                  )}

                  {matchError && (
                    <p className="quiz-results-error" role="alert">
                      {matchError}
                    </p>
                  )}

                  {matchResult?.ranked?.length > 0 && (
                    <ol className="quiz-results-list">
                      {matchResult.ranked.slice(0, 5).map((item, i) => {
                        const isExpanded = expandedBreed === item.breed
                        const hasDescription = item.description?.trim()
                        const headerContent = (
                          <>
                            <span className="quiz-results-rank">{i + 1}.</span>
                            <span className="quiz-results-breed">{item.breed}</span>
                            <span className="quiz-results-score">
                              Score: {item.score}
                              {item.matched_traits?.length > 0 && (
                                <span className="quiz-results-traits">
                                  {' '}({item.matched_traits.join(', ')})
                                </span>
                              )}
                            </span>
                            {hasDescription && (
                              <span className="quiz-results-chevron" aria-hidden>
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            )}
                          </>
                        )
                        return (
                          <li key={item.breed} className="quiz-results-item">
                            {hasDescription ? (
                              <button
                                type="button"
                                className="quiz-results-item-header"
                                onClick={() => toggleBreedExpanded(item.breed)}
                                aria-expanded={isExpanded}
                                aria-controls={`breed-desc-${i}`}
                                id={`breed-header-${i}`}
                              >
                                {headerContent}
                              </button>
                            ) : (
                              <div className="quiz-results-item-header quiz-results-item-header--static">
                                {headerContent}
                              </div>
                            )}
                            {hasDescription && isExpanded && (
                              <div
                                id={`breed-desc-${i}`}
                                className="quiz-results-description"
                                role="region"
                                aria-labelledby={`breed-header-${i}`}
                              >
                                <img
                                  src={`/one_per_breed/${encodeURIComponent(item.breed)}/000001.jpg`}
                                  alt={`${item.breed} dog`}
                                  className="quiz-results-breed-image"
                                  onError={(e) => { e.target.style.display = 'none' }}
                                />
                                {item.description}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ol>
                  )}

                  {matchResult && !matchLoading && !matchError && !matchResult.ranked?.length && (
                    <p className="quiz-results-empty">No breeds matched your preferences.</p>
                  )}

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
