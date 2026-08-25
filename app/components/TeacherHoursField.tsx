import type { CreateTeacherHours, SchoolGroup } from "~/types"
import type { ValuableProps } from "./xui"
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
import { groupToStr, setArrayItemField } from "~/lib/utils"

type Props = Omit<ValuableProps<CreateTeacherHours[]>, "onBlur" | "onFocus"> & {
  groups: SchoolGroup[]
  onChange: (value: SetStateAction<CreateTeacherHours[]>) => void
}

export default function TeacherHoursField({ value, onChange, groups }: Props) {
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
    onChange((prev) => [
      ...prev,
      {
        groupId: group.value!.id,
        hours: hours.value!,
      },
    ])

    group.reset()
    hours.reset()
  }

  return (
    <FieldSet className="gap-3 rounded-lg border bg-muted/20 p-4">
      <FieldLegend className="text-sm font-semibold">
        Настройка часов
      </FieldLegend>
      <Table className="overflow-hidden [&_tr]:border-0">
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="hover:bg-transparent has-aria-expanded:bg-transparent data-[state=selected]:bg-transparent">
            <TableHead className="py-2 align-top">
              <ComboboxField
                items={groups}
                value={group.value}
                onChange={(v) =>
                  (!v || value.findIndex((s) => s.groupId === v.id) === -1) &&
                  group.setValue(v)
                }
                error={group.error}
                itemToKey={(item) => item.id}
                itemToStringValue={(item) => groupToStr(item)}
                filter={(item) =>
                  value.findIndex((i) => i.groupId === item.id) === -1
                }
                placeholder="10Е"
                label="Класс"
                autoHighlight
              />
            </TableHead>
            <TableHead className="py-2 align-top">
              <InputField
                min={1}
                nullable
                value={hours.value}
                onChange={hours.setValue}
                error={hours.error}
                label="Часы"
              />
            </TableHead>
            <TableHead className="w-px py-2 align-top whitespace-nowrap">
              <Button className="mt-6.5" size="icon" onClick={handleAdd}>
                <Plus />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="no-scrollbar max-h-[50vh] gap-2 overflow-x-hidden overflow-y-auto">
          {value.map((item, index) => (
            <TableRow
              key={item.groupId}
              className="hover:bg-transparent has-aria-expanded:bg-transparent data-[state=selected]:bg-transparent"
            >
              <TableCell>
                <ComboboxField
                  items={groups}
                  value={groups.find((g) => g.id === item.groupId) ?? null}
                  filter={(item) =>
                    value.findIndex((i) => i.groupId === item.id) === -1
                  }
                  onChange={(v) =>
                    v &&
                    value.findIndex((s) => s.groupId === v.id) === -1 &&
                    onChange((prev) =>
                      setArrayItemField(prev, index, "groupId", v.id)
                    )
                  }
                  itemToKey={(item) => item.id}
                  itemToStringValue={(item) => groupToStr(item)}
                  placeholder="10Е"
                  autoHighlight
                />
              </TableCell>
              <TableCell>
                <InputField
                  min={1}
                  value={item.hours}
                  onChange={(v) =>
                    onChange((prev) =>
                      setArrayItemField(prev, index, "hours", v)
                    )
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() =>
                    onChange((prev) => prev.filter((_, idx) => index !== idx))
                  }
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </FieldSet>
  )
}
