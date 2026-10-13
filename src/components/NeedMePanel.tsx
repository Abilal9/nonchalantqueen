import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import './NeedMePanel.css'

type NeedMePanelProps = {
  onClose: () => void
}

const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/ahmad.anas.ab@gmail.com'

const REQUESTS = [
  { id: 'talk', label: 'I need to talk' },
  { id: 'hug', label: 'I need a hug' },
  { id: 'hungry', label: 'I’m hungry' },
  { id: 'pickup', label: 'Come get me' },
  { id: 'plan', label: 'Plan something for us' },
  { id: 'annoyed', label: 'I’m annoyed at you' },
  { id: 'surprise', label: 'Surprise me' },
  { id: 'want', label: 'I want something' },
  { id: 'other', label: 'Other' },
] as const

type RequestId = (typeof REQUESTS)[number]['id']

const MOODS = ['🥺', '😡', '😔', '🥰', '😴', '🤭'] as const
type Mood = (typeof MOODS)[number]

const SPECIFIC_DATE = 'A specific date'
const SIMPLE_WHEN = ['Now', 'Soon', 'Today', 'Whenever', 'Surprise me', SPECIFIC_DATE] as const
const PLAN_FEELING = ['Food', 'Dessert', 'Activity', 'Stay in', 'Anything'] as const
const PLAN_ENERGY = ['Lazy', 'Normal', 'Let’s go somewhere'] as const
const PLAN_WHEN = ['Now', 'Soon', 'Tonight', 'This week', 'Surprise me', SPECIFIC_DATE] as const
const PLAN_CONTROL = ['I have requests', 'You decide everything'] as const
const ANNOYED_SEVERITY = [
  'Minor stupidity',
  'You should know what you did',
  'I’m actually upset',
  'Thin ice',
] as const
const ANNOYED_RESPONSE = [
  'Talk to me',
  'Apologize',
  'Come see me',
  'Food',
  'Flowers',
  'Give me some space',
  'Figure it out yourself',
] as const
const ANNOYED_CONTACT = ['Now', 'Soon', 'Later', 'I’ll contact you', SPECIFIC_DATE] as const
const WANT_KIND = [
  'Food',
  'Flowers',
  'Something I saw',
  'Gift',
  'Trip idea',
  'Random craving',
  'Other',
] as const

type Answers = {
  request: RequestId | ''
  simpleWhen: (typeof SIMPLE_WHEN)[number] | ''
  feeling: (typeof PLAN_FEELING)[number] | ''
  energy: (typeof PLAN_ENERGY)[number] | ''
  planWhen: (typeof PLAN_WHEN)[number] | ''
  craving: string
  control: (typeof PLAN_CONTROL)[number] | ''
  severity: (typeof ANNOYED_SEVERITY)[number] | ''
  response: (typeof ANNOYED_RESPONSE)[number] | ''
  contact: (typeof ANNOYED_CONTACT)[number] | ''
  annoyedNote: string
  kind: (typeof WANT_KIND)[number] | ''
  what: string
  link: string
  wantNote: string
  mood: Mood | ''
  message: string
  whenDate: string
}

const emptyAnswers = (): Answers => ({
  request: '',
  simpleWhen: '',
  feeling: '',
  energy: '',
  planWhen: '',
  craving: '',
  control: '',
  severity: '',
  response: '',
  contact: '',
  annoyedNote: '',
  kind: '',
  what: '',
  link: '',
  wantNote: '',
  mood: '',
  message: '',
  whenDate: '',
})

type Status = 'idle' | 'submitting' | 'success' | 'error'

function requestLabel(id: RequestId) {
  return REQUESTS.find((item) => item.id === id)?.label ?? id
}

function branchOf(id: RequestId) {
  if (id === 'plan') return 'plan'
  if (id === 'annoyed') return 'annoyed'
  if (id === 'want') return 'want'
  return 'simple'
}

function isSerious(answers: Answers) {
  return (
    answers.request === 'annoyed' &&
    (answers.severity === 'I’m actually upset' || answers.severity === 'Thin ice')
  )
}

function todayIso(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function formatPickedDate(value: string) {
  const date = parseIsoDate(value)
  if (!date) return value
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function specificDateIssue(choice: string, date: string) {
  if (choice !== SPECIFIC_DATE) return null
  const picked = parseIsoDate(date)
  if (!picked) return 'Pick the date.'
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const chosen = Date.UTC(picked.getFullYear(), picked.getMonth(), picked.getDate())
  if (chosen < today) return 'That date has already passed.'
  return null
}

function whenLabel(choice: string, date: string) {
  return choice === SPECIFIC_DATE ? formatPickedDate(date) : choice
}

function isAcceptableUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true
  if (/\s/.test(trimmed)) return false
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const url = new URL(withProtocol)
    return url.hostname.includes('.') && !url.hostname.startsWith('.')
  } catch {
    return false
  }
}

function validate(answers: Answers): string | null {
  if (!answers.request) return 'Pick what you need from me first.'

  const branch = branchOf(answers.request)
  if (branch === 'simple') {
    if (!answers.simpleWhen) return 'Tell me when.'
    const dateIssue = specificDateIssue(answers.simpleWhen, answers.whenDate)
    if (dateIssue) return dateIssue
  }
  if (branch === 'plan') {
    if (!answers.feeling || !answers.energy || !answers.planWhen || !answers.control) {
      return 'A few answers are still missing.'
    }
    const dateIssue = specificDateIssue(answers.planWhen, answers.whenDate)
    if (dateIssue) return dateIssue
  }
  if (branch === 'annoyed') {
    if (!answers.severity || !answers.response || !answers.contact) {
      return isSerious(answers)
        ? 'I just need those answers so I know how to show up.'
        : 'A few answers are still missing.'
    }
    const dateIssue = specificDateIssue(answers.contact, answers.whenDate)
    if (dateIssue) return dateIssue
  }
  if (branch === 'want') {
    if (!answers.kind) return 'Tell me what kind of thing.'
    if (!answers.what.trim()) return 'Tell me what it is.'
    if (!isAcceptableUrl(answers.link)) return 'That link looks a little off.'
  }
  return null
}

function buildPayload(answers: Answers): Record<string, string> {
  const request = answers.request as RequestId
  const label = requestLabel(request)
  const fields: Record<string, string> = {
    'Request Type': label,
  }

  const branch = branchOf(request)
  if (branch === 'simple') fields['When'] = whenLabel(answers.simpleWhen, answers.whenDate)
  if (branch === 'plan') {
    fields['Feeling'] = answers.feeling
    fields['Energy'] = answers.energy
    fields['When'] = whenLabel(answers.planWhen, answers.whenDate)
    if (answers.craving.trim()) fields['Craving'] = answers.craving.trim()
    fields['Control'] = answers.control
    if (answers.message.trim()) fields['Message'] = answers.message.trim()
  }
  if (branch === 'annoyed') {
    fields['Severity'] = answers.severity
    fields['Requested Response'] = answers.response
    fields['Contact'] = whenLabel(answers.contact, answers.whenDate)
    if (answers.annoyedNote.trim()) fields['Message'] = answers.annoyedNote.trim()
  }
  if (branch === 'want') {
    fields['Kind'] = answers.kind
    fields['What'] = answers.what.trim()
    if (answers.link.trim()) fields['Link'] = answers.link.trim()
    if (answers.wantNote.trim()) fields['Message'] = answers.wantNote.trim()
  }
  if (branch === 'simple' && answers.message.trim()) fields['Message'] = answers.message.trim()
  if (answers.mood) fields['Mood'] = answers.mood

  return {
    ...fields,
    _subject: `Niso needs you: ${label}`,
    _template: 'table',
    _captcha: 'false',
  }
}

function ChoiceGroup<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
}: {
  legend: string
  hint?: string
  options: readonly T[]
  value: T | ''
  onChange: (next: T) => void
}) {
  return (
    <fieldset className="need-me__field">
      <legend className="need-me__legend">{legend}</legend>
      {hint && <p className="need-me__hint">{hint}</p>}
      <div className="need-me__choices">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`need-me__choice${value === option ? ' need-me__choice--on' : ''}`}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function WhenChoices<T extends string>({
  legend,
  options,
  value,
  date,
  onChange,
  onDateChange,
}: {
  legend: string
  options: readonly T[]
  value: T | ''
  date: string
  onChange: (next: T) => void
  onDateChange: (next: string) => void
}) {
  const dateId = `${legend.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-date`
  return (
    <fieldset className="need-me__field">
      <legend className="need-me__legend">{legend}</legend>
      <div className="need-me__choices">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`need-me__choice${value === option ? ' need-me__choice--on' : ''}`}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {value === SPECIFIC_DATE && (
        <label className="need-me__date" htmlFor={dateId}>
          <span className="need-me__legend">Which day?</span>
          <input
            id={dateId}
            className="need-me__input need-me__input--date"
            type="date"
            value={date}
            min={todayIso()}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </label>
      )}
    </fieldset>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
  multiline?: boolean
  type?: 'text' | 'url'
}) {
  const id = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return (
    <label className="need-me__field" htmlFor={id}>
      <span className="need-me__legend">{label}</span>
      {multiline ? (
        <textarea
          id={id}
          className="need-me__textarea"
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="need-me__input"
          type={type === 'url' ? 'text' : type}
          inputMode={type === 'url' ? 'url' : undefined}
          autoCapitalize={type === 'url' ? 'off' : undefined}
          spellCheck={type === 'url' ? false : undefined}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  )
}

export default function NeedMePanel({ onClose }: NeedMePanelProps) {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [status, setStatus] = useState<Status>('idle')
  const [issue, setIssue] = useState('')
  const [seriousDelivery, setSeriousDelivery] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setIssue('')
    if (status === 'error') setStatus('idle')
  }

  const branch = answers.request ? branchOf(answers.request) : null
  const serious = isSerious(answers)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'submitting') return

    const problem = validate(answers)
    if (problem) {
      setIssue(problem)
      setStatus('idle')
      return
    }

    setSeriousDelivery(isSerious(answers))
    setStatus('submitting')
    setIssue('')

    try {
      const response = await fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(buildPayload(answers)),
      })

      const result = (await response.json().catch(() => null)) as {
        success?: string | boolean
        message?: string
      } | null

      if (!response.ok || result?.success === false || result?.success === 'false') {
        throw new Error(result?.message || `FormSubmit responded with ${response.status}`)
      }

      if (mounted.current) setStatus('success')
    } catch (error) {
      console.error('Summon Bibi submission failed', error)
      if (!mounted.current) return
      setStatus('error')
    }
  }

  const sendAnother = () => {
    setAnswers(emptyAnswers())
    setIssue('')
    setSeriousDelivery(false)
    setStatus('idle')
  }

  let followUp: ReactNode = null
  if (branch === 'simple') {
    followUp = (
      <>
        <WhenChoices
          legend="When?"
          options={SIMPLE_WHEN}
          value={answers.simpleWhen}
          date={answers.whenDate}
          onChange={(value) => set('simpleWhen', value)}
          onDateChange={(value) => set('whenDate', value)}
        />
        <ChoiceGroup
          legend="Mood, if you feel like it"
          options={MOODS}
          value={answers.mood}
          onChange={(value) => set('mood', answers.mood === value ? '' : value)}
        />
        <TextField
          label="Anything else Her Majesty would like to add?"
          value={answers.message}
          onChange={(value) => set('message', value)}
          placeholder={answers.request === 'other' ? 'Tell me what you need' : 'Optional'}
          multiline
        />
      </>
    )
  } else if (branch === 'plan') {
    followUp = (
      <>
        <ChoiceGroup
          legend="What are you feeling?"
          options={PLAN_FEELING}
          value={answers.feeling}
          onChange={(value) => set('feeling', value)}
        />
        <ChoiceGroup
          legend="Energy level"
          options={PLAN_ENERGY}
          value={answers.energy}
          onChange={(value) => set('energy', value)}
        />
        <WhenChoices
          legend="When?"
          options={PLAN_WHEN}
          value={answers.planWhen}
          date={answers.whenDate}
          onChange={(value) => set('planWhen', value)}
          onDateChange={(value) => set('whenDate', value)}
        />
        <TextField
          label="Anything you're craving?"
          value={answers.craving}
          onChange={(value) => set('craving', value)}
          placeholder="Optional"
        />
        <ChoiceGroup
          legend="How much control do you want?"
          options={PLAN_CONTROL}
          value={answers.control}
          onChange={(value) => set('control', value)}
        />
        <ChoiceGroup
          legend="Mood, if you feel like it"
          options={MOODS}
          value={answers.mood}
          onChange={(value) => set('mood', answers.mood === value ? '' : value)}
        />
        <TextField
          label="Anything else Her Majesty would like to add?"
          value={answers.message}
          onChange={(value) => set('message', value)}
          placeholder="Optional"
          multiline
        />
      </>
    )
  } else if (branch === 'annoyed') {
    followUp = (
      <>
        <ChoiceGroup
          legend="How bad is it?"
          hint={
            answers.severity === 'I’m actually upset'
              ? 'I’m not going to make light of this.'
              : undefined
          }
          options={ANNOYED_SEVERITY}
          value={answers.severity}
          onChange={(value) => set('severity', value)}
        />
        <ChoiceGroup
          legend="What do you want from me?"
          options={ANNOYED_RESPONSE}
          value={answers.response}
          onChange={(value) => set('response', value)}
        />
        <WhenChoices
          legend="When should I contact you?"
          options={ANNOYED_CONTACT}
          value={answers.contact}
          date={answers.whenDate}
          onChange={(value) => set('contact', value)}
          onDateChange={(value) => set('whenDate', value)}
        />
        <ChoiceGroup
          legend="Mood, if you feel like it"
          options={MOODS}
          value={answers.mood}
          onChange={(value) => set('mood', answers.mood === value ? '' : value)}
        />
        <TextField
          label="Anything you want to say?"
          value={answers.annoyedNote}
          onChange={(value) => set('annoyedNote', value)}
          placeholder={serious ? 'Say whatever you need to' : 'Optional'}
          multiline
        />
      </>
    )
  } else if (branch === 'want') {
    followUp = (
      <>
        <ChoiceGroup
          legend="What kind of thing?"
          options={WANT_KIND}
          value={answers.kind}
          onChange={(value) => set('kind', value)}
        />
        <TextField
          label="What is it?"
          value={answers.what}
          onChange={(value) => set('what', value)}
          placeholder="The thing itself"
        />
        <TextField
          label="Link"
          value={answers.link}
          onChange={(value) => set('link', value)}
          placeholder="Optional"
          type="url"
        />
        <ChoiceGroup
          legend="Mood, if you feel like it"
          options={MOODS}
          value={answers.mood}
          onChange={(value) => set('mood', answers.mood === value ? '' : value)}
        />
        <TextField
          label="Anything else?"
          value={answers.wantNote}
          onChange={(value) => set('wantNote', value)}
          placeholder="Optional"
          multiline
        />
      </>
    )
  }

  const submitLabel =
    status === 'submitting' ? 'Sending…' : status === 'error' ? 'Try again ♡' : 'Send to my person ♡'

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div
        className="panel panel--need-me"
        role="dialog"
        aria-labelledby="need-me-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="panel__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {status === 'success' ? (
          <div className="need-me__success" role="status">
            <h2 id="need-me-title" className="panel__title">
              {seriousDelivery
                ? 'Your request has been delivered ♡'
                : 'Your request has been delivered to boyfriend management ♡'}
            </h2>
            <p className="need-me__success-copy">
              {seriousDelivery
                ? 'Bibi has been notified. He’ll take this seriously.'
                : 'Bibi has been notified of Her Majesty’s requirements.'}
            </p>
            {!seriousDelivery && (
              <p className="need-me__success-note">
                Response times may vary depending on how much trouble he’s in.
              </p>
            )}
            <div className="need-me__success-actions">
              <button type="button" className="need-me__submit" onClick={sendAnother}>
                Send another request
              </button>
              <button type="button" className="need-me__text-btn" onClick={onClose}>
                Back to the page
              </button>
            </div>
          </div>
        ) : (
          <form className="need-me" onSubmit={handleSubmit} noValidate>
            <h2 id="need-me-title" className="panel__title">
              Summon Bibi
            </h2>
            <p className="panel__subtitle">Tell me what you need. I’ll take it from there.</p>

            <fieldset className="need-me__body" disabled={status === 'submitting'}>
              <ChoiceGroup
                legend="What do you need from me?"
                options={REQUESTS.map((item) => item.label)}
                value={answers.request ? requestLabel(answers.request) : ''}
                onChange={(label) => {
                  const next = REQUESTS.find((item) => item.label === label)
                  if (next) set('request', next.id)
                }}
              />

              {branch && (
                <div key={answers.request} className="need-me__branch">
                  {followUp}
                </div>
              )}

              {issue && (
                <p className="need-me__issue" role="alert">
                  {issue}
                </p>
              )}
              {status === 'error' && (
                <p className="need-me__issue" role="alert">
                  Boyfriend management seems temporarily unavailable. Try again in a second ♡
                </p>
              )}

              <button
                type="submit"
                className="need-me__submit"
                disabled={status === 'submitting'}
                aria-busy={status === 'submitting'}
              >
                {submitLabel}
              </button>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  )
}
