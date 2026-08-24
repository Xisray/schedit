import type { ValuableField } from "."
import { Checkbox } from "../ui/checkbox"
import ToggleField from "./toggle-field"

export default function CheckField({
  orientation = "horizontal",
  labelPosition = "after",
  ...props
}: ValuableField<boolean>) {
  return (
    <ToggleField
      component={Checkbox}
      {...props}
      orientation={orientation}
      labelPosition={labelPosition}
    />
  )
}
