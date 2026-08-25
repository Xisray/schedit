export type FieldErrors<T extends Record<string, any> = Record<string, any>> =
  Partial<Record<keyof T, string>>

export class ValidationException<
  T extends Record<string, any> = Record<string, any>,
> extends Error {
  readonly errors: FieldErrors<T>

  constructor(errors: FieldErrors<T>, message = "Ошибка валидации данных") {
    super(message)
    this.name = "ValidationException"
    this.errors = errors

    Object.setPrototypeOf(this, ValidationException.prototype)
  }

  hasError(field: keyof T): boolean {
    return Boolean(this.errors[field])
  }

  getFirstError(): string | undefined {
    const values = Object.values(this.errors)
    return values.length > 0 ? (values[0] as string) : undefined
  }
}
