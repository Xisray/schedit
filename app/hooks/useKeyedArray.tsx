import { useCallback, useEffect, useState, type SetStateAction } from "react"

type KeyedItem<T> = {
  key: string
  value: T
}

function createKey() {
  return crypto.randomUUID()
}

export function useKeyedArray<T extends object>(
  value: T[],
  onChange: (value: SetStateAction<T[]>) => void
) {
  const [items, setItems] = useState<KeyedItem<T>[]>(() =>
    value.map((value) => ({
      key: createKey(),
      value,
    }))
  )

  useEffect(() => {
    setItems((prev) =>
      value.map((value, index) => ({
        value,
        key: prev[index]?.key ?? createKey(),
      }))
    )
  }, [value])

  const commit = useCallback(
    (updater: (prev: KeyedItem<T>[]) => KeyedItem<T>[]) => {
      setItems((prev) => {
        const next = updater(prev)

        onChange(next.map(({ value }) => value))

        return next
      })
    },
    [onChange]
  )

  const append = useCallback(
    (value: T) => {
      commit((prev) => [
        ...prev,
        {
          key: createKey(),
          value,
        },
      ])
    },
    [commit]
  )

  const remove = useCallback(
    (key: string) => {
      commit((prev) => prev.filter((item) => item.key !== key))
    },
    [commit]
  )

  const update = useCallback(
    (key: string, patch: Partial<T>) => {
      commit((prev) =>
        prev.map((item) =>
          item.key === key
            ? {
                ...item,
                value: {
                  ...item.value,
                  ...patch,
                },
              }
            : item
        )
      )
    },
    [commit]
  )

  return {
    items,
    append,
    remove,
    update,
  }
}
