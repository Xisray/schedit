import type { ComboboxProps } from "../xui/combobox"
import { FieldBase, type FieldBaseProps } from "."
import Combobox from "../xui/combobox"

type Props<T> = ComboboxProps<T> & FieldBaseProps

export default function ComboboxField<T>({
  id,
  label,
  description,
  error,
  orientation,
  labelPosition,
  ...props
}: Props<T>) {
  return (
    <FieldBase
      id={id}
      label={label}
      description={description}
      error={error}
      orientation={orientation}
      labelPosition={labelPosition}
    >
      <Combobox {...props} id={id} invalid={!!error} />
    </FieldBase>
  )
}
