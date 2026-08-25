import { type ReactNode } from "react"
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Combobox as ShadcnCombobox,
} from "../ui/combobox"
import type { ValuableProps } from "."

export type ComboboxProps<T> = ValuableProps<T | null> & {
  items: T[]

  itemToKey?: (item: T) => string | number
  itemToStringValue?: (item: T) => string

  children?: (item: T) => ReactNode
  filter?: (item: T) => boolean

  open?: boolean
  autoHighlight?: boolean
  showClear?: boolean
  showTrigger?: boolean

  emptyMessage?: string
  placeholder?: string

  className?: string
  // inputClassName?: string

  sideOffset?: number
}

export default function Combobox<T>({
  items,
  itemToKey,
  itemToStringValue,
  children,
  filter,
  open,
  autoHighlight,
  emptyMessage = "Нет результата",
  // inputClassName,
  sideOffset,

  value,
  onChange,

  invalid,

  ...props
}: ComboboxProps<T> & {
  id?: string
  invalid?: boolean
}) {
  return (
    <ShadcnCombobox
      items={items}
      itemToStringValue={itemToStringValue}
      itemToStringLabel={itemToStringValue}
      open={open}
      autoHighlight={autoHighlight}
      value={value}
      onValueChange={(e) => {
        onChange(e as T | null)
      }}
    >
      <ComboboxInput
        {...props}
        aria-invalid={invalid}
        onBlur={(e) => {
          const query = e.target.value.trim().toLowerCase()

          if (!query) {
            onChange(null)
            return
          }

          const matchedItem = items.find((item) => {
            const itemString = itemToStringValue
              ? itemToStringValue(item)
              : String(item)
            return itemString.trim().toLowerCase() === query
          })

          if (matchedItem !== undefined && matchedItem !== value) {
            onChange(matchedItem as T | null)
          }
        }}
      />
      <ComboboxContent sideOffset={sideOffset} showTrigger={props.showTrigger}>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(item) =>
            !filter || filter(item) ? (
              <ComboboxItem key={itemToKey?.(item) ?? item} value={item}>
                {children?.(item) ?? itemToStringValue?.(item) ?? item}
              </ComboboxItem>
            ) : null
          }
        </ComboboxList>
      </ComboboxContent>
    </ShadcnCombobox>
  )
}
