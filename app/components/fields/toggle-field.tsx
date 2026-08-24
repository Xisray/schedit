import { FieldBase, type ValuableField } from "."
import { Checkbox } from "../ui/checkbox"
import type { Switch } from "../ui/switch"

type ToggleComponent = typeof Checkbox | typeof Switch

type ToggleFieldBaseProps = ValuableField<boolean> & {
  component: ToggleComponent
}

export default function ToggleField({
  id,
  label,
  description,
  error,
  orientation,
  labelPosition,
  value,
  component: Component,
  ...props
}: ToggleFieldBaseProps) {
  return (
    <FieldBase
      id={id}
      label={label}
      description={description}
      error={error}
      orientation={orientation}
      labelPosition={labelPosition}
    >
      <Component id={id} checked={value} {...props} />
    </FieldBase>
  )
}
