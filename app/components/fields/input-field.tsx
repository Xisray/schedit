import { CircleXIcon } from "lucide-react"
import { FieldBase, type ValuableField } from "."
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group"
import type { ChangeEvent } from "react"

type BaseValue = string | number
type Nullable<T> = T | null

type StringConstraints = {
  minLength?: number
  maxLength?: number
  pattern?: string
}

type NumberConstraints = {
  min?: number
  max?: number
  step?: number
}

type ConstraintsFor<T extends BaseValue> = T extends number
  ? NumberConstraints
  : StringConstraints

export type InputFieldProps<
  T extends BaseValue,
  N extends boolean = false,
> = ValuableField<N extends true ? Nullable<T> : T> & {
  className?: string
  nullable?: N
  showClear?: boolean
  placeholder?: string
}

export default function InputField<
  T extends BaseValue,
  N extends boolean = false,
>({
  id,
  label,
  description,
  error,
  orientation,
  labelPosition,

  value,
  onChange,
  onBlur,
  onFocus,

  className,
  nullable,
  showClear = false,
  disabled,
  required,
  placeholder,

  ...props
}: ConstraintsFor<T> & InputFieldProps<T, N>) {
  const isNumberField = typeof value === "number"
  type OutValue = N extends true ? Nullable<T> : T
  const type = isNumberField ? "number" : "text"
  const emptyValue = (
    nullable ? null : isNumberField ? 0 : ""
  ) as N extends true ? Nullable<T> : T

  const handleClear = () => {
    onChange(emptyValue)
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const raw = e.target.value

    if (raw === "") {
      onChange(emptyValue)
      return
    }

    if (isNumberField) {
      const parsed = e.target.valueAsNumber
      if (Number.isNaN(parsed)) return
      onChange(parsed as OutValue)
      return
    }

    onChange(raw as OutValue)
  }

  const hasValue = value !== "" && value !== null && value !== undefined

  return (
    <FieldBase
      id={id}
      label={label}
      description={description}
      error={error}
      orientation={orientation}
      labelPosition={labelPosition}
    >
      <InputGroup>
        <InputGroupInput
          id={id}
          type={type}
          aria-invalid={!!error}
          onChange={handleChange}
          value={value ?? ""}
          className={className}
          {...props}
        />
        {showClear && hasValue && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Clear"
              title="Clear"
              size="icon-xs"
              onClick={handleClear}
            >
              <CircleXIcon className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </FieldBase>
  )
}
