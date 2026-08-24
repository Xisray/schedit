import { useState, useCallback, type SetStateAction } from "react"
import type { ErrorField } from "~/components/xui"
import { useField, type FieldState } from "./useField"

export interface ErrorFieldState<T> extends FieldState<T> {
  error: ErrorField
  setError: (error: ErrorField) => void
}

export function useErrorField<T>(initialValue: T): ErrorFieldState<T> {
  const field = useField(initialValue)
  const [error, setError] = useState<ErrorField>(null)

  const setValue = useCallback(
    (value: SetStateAction<T>) => {
      field.setValue(value)
      setError(null)
    },
    [field.setValue]
  )

  const reset = useCallback(
    (initial?: T) => {
      field.reset(initial)
      setError(null)
    },
    [field.reset]
  )

  return {
    value: field.value,
    setValue,
    error,
    setError,
    reset,
  }
}
