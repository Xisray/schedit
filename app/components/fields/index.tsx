import type { ReactNode } from "react"
import { Field, FieldDescription, FieldLabel } from "../ui/field"
import { cn } from "~/lib/utils"
import type { ErrorField, ValuableProps } from "../xui"
import FieldError from "../xui/field-error"

export type ValuableField<T> = FieldBaseProps & ValuableProps<T>

export type FieldBaseProps = {
  id?: string
  label?: ReactNode
  description?: ReactNode
  error?: ErrorField
  orientation?: "vertical" | "horizontal"
  labelPosition?: "before" | "after"
}

export function FieldBase({
  id,
  label,
  description,
  error = null,
  children,
  orientation = "vertical",
  labelPosition = "before",
}: FieldBaseProps & { children?: ReactNode }) {
  return (
    <Field orientation={orientation}>
      {label && (
        <FieldLabel
          htmlFor={id}
          className={cn(labelPosition === "after" ? "order-last" : "")}
        >
          {label}
        </FieldLabel>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      {children}
      <FieldError error={error} />
    </Field>
  )
}
