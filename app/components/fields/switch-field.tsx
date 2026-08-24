import type { ValuableField } from "."
import { Switch } from "../ui/switch"
import ToggleField from "./toggle-field"

export default function SwitchField({
  orientation = "horizontal",
  ...props
}: ValuableField<boolean>) {
  return <ToggleField component={Switch} {...props} orientation={orientation} />
}
