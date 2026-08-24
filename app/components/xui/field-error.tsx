import React from "react"
import type { ErrorField } from "~/hooks/useField"
import { FieldError as ShadcnFieldError } from "../ui/field"

type Props = {
  error?: ErrorField
}

export default function FieldError({ error }: Props) {
  if (!error) return null

  return (
    <ShadcnFieldError>
      {error instanceof Error ? error.message : error}
    </ShadcnFieldError>
  )
}
