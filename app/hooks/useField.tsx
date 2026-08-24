import { useState, useCallback, type SetStateAction } from "react"
import type { ErrorField } from "~/components/xui"

export interface FieldState<T> {
  value: T
  error: ErrorField
  setValue: (value: SetStateAction<T>) => void
  setError: (error: ErrorField) => void
  reset: (initial?: T) => void
}

export function useField<T>(initialValue: T): FieldState<T> {
  const [value, setValueState] = useState<T>(initialValue)
  const [error, setError] = useState<ErrorField>(null)

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setValueState(value)
    setError(null)
  }, [])

  const reset = useCallback(
    (initial = initialValue) => {
      setValueState(initial)
      setError(null)
    },
    [initialValue]
  )

  return { value, setValue, error, setError, reset }
}
