import { useState, useCallback, type SetStateAction, useRef } from "react"

export interface FieldState<T> {
  value: T
  setValue: (value: SetStateAction<T>) => void
  reset: (initial?: T) => void
}

export function useField<T>(initialValue: T): FieldState<T> {
  const initialRef = useRef(initialValue)
  const [value, setValue] = useState<T>(initialValue)

  const reset = useCallback((initial?: T) => {
    setValue(initial !== undefined ? initial : initialRef.current)
  }, [])

  return { value, setValue, reset }
}
