export type ErrorField = string | Error | null

export type ValuableProps<T> = {
  value: T
  onChange: (value: T) => void
  onBlur?: () => void
  onFocus?: () => void
  disabled?: boolean
  required?: boolean
}
