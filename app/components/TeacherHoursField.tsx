import type { CreateTeacherHours, SchoolGroup } from "~/types"
import type { ErrorField, ValuableProps } from "./xui"
import { FieldLegend, FieldSet } from "./ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import ComboboxField from "./fields/combobox-field"
import { useErrorField } from "~/hooks/useErrorField"
import InputField from "./fields/input-field"
import { Button } from "./ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { SetStateAction } from "react"
import FieldError from "./xui/field-error"
import { useKeyedArray } from "~/hooks/useKeyedArray"

type Props = Omit<ValuableProps<CreateTeacherHours[]>, "onBlur" | "onFocus"> & {
  groups: SchoolGroup[]
  onChange: (value: SetStateAction<CreateTeacherHours[]>) => void
  error: ErrorField
}

export default function TeacherHoursField({
  value,
  onChange,
  groups,
  error,
}: Props) {
  const array = useKeyedArray(value, onChange)
  const group = useErrorField<SchoolGroup | null>(null)
  const hours = useErrorField<number | null>(null)

  const handleAdd = () => {
    if (!group.value) {
      group.setError("Выберите класс")
      return
    }

    if (hours.value === null || hours.value < 1) {
      hours.setError("Укажите количество часов")
      return
    }

    array.append({
      groupId: group.value!.id,
      hours: hours.value!,
    })

    group.reset()
    hours.reset()
  }

  return (
    <FieldSet
      className="gap-3 rounded-lg border bg-muted/20 p-4"
      aria-invalid={!!error}
    >
      <FieldLegend className="text-sm font-semibold">
        Настройка часов
      </FieldLegend>
      <Table className="overflow-hidden [&_tr]:border-0">
        <TableHeader className="[&_tr]:border-0">
          <TableRow>
            <TableHead>
              <ComboboxField
                items={groups}
                value={group.value}
                onChange={group.setValue}
                error={group.error}
                placeholder="10Е"
                autoHighlight
              />
            </TableHead>
            <TableHead>
              <InputField
                min={1}
                nullable
                value={hours.value}
                onChange={hours.setValue}
                error={hours.error}
                label="Часы"
              />
            </TableHead>
            <TableHead>
              <Button className="mt-6" onClick={handleAdd}>
                <Plus />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="no-scrollbar max-h-[50vh] gap-2 overflow-x-hidden overflow-y-auto">
          {array.items.map((item, index) => (
            <TableRow key={item.key}>
              <TableCell>
                <ComboboxField
                  items={groups}
                  value={
                    groups.find((g) => g.id === item.value.groupId) ?? null
                  }
                  onChange={(v) =>
                    v && array.update(item.key, { groupId: v.id })
                  }
                  placeholder="10Е"
                  autoHighlight
                />
              </TableCell>
              <TableCell>
                <InputField
                  min={1}
                  value={item.value.hours}
                  onChange={(v) => array.update(item.key, { hours: v })}
                  label="Часы"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="icon-lg"
                  onClick={() => array.remove(item.key)}
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FieldError error={error} />
    </FieldSet>
  )
}
