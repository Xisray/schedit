import type { CreateDayConfig, Room } from "~/types"
import type { ValuableProps } from "./xui"
import { FieldGroup, FieldLegend, FieldSet } from "./ui/field"
import { DAYS_NAMES } from "~/constants"
import SwitchField from "./fields/switch-field"
import InputField from "./fields/input-field"
import ComboboxField from "./fields/combobox-field"
import { createDayConfig } from "~/lib/utils"
import type { SetStateAction } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { roomService } from "~/services"

export default function DayConfigsField({
  value,
  onChange,
  disabled,
  required,
}: Omit<ValuableProps<CreateDayConfig[]>, "onBlur" | "onFocus"> & {
  onChange: (value: SetStateAction<CreateDayConfig[]>) => void
}) {
  const rooms = useLiveQuery(() => roomService.getAll(), [], [] as Room[])
  const handleToggleDay = (dayIndex: number, enabled: boolean) => {
    if (enabled)
      onChange((prev) => [...prev, createDayConfig(dayIndex, 1, 5, 6)])
    else onChange((prev) => prev.filter((day, index) => day.dayId !== dayIndex))
  }
  const handleScheduleChange = <K extends keyof CreateDayConfig>(
    dayIndex: number,
    field: K,
    val: CreateDayConfig[K]
  ) => {
    onChange((prev) =>
      prev.map((day, _) =>
        day.dayId === dayIndex ? { ...day, [field]: val } : day
      )
    )
  }

  return (
    <FieldSet
      className="gap-3 rounded-lg border bg-muted/20 p-4"
      disabled={disabled}
    >
      <FieldLegend className="text-sm font-semibold">
        Расписание на неделю (6 дней)
      </FieldLegend>

      <FieldGroup className="no-scrollbar max-h-[50vh] overflow-x-hidden overflow-y-auto px-2">
        {DAYS_NAMES.map((day, dayIndex) => {
          const dayConfig = value.find((dc) => dc.dayId === dayIndex)
          return (
            <FieldGroup key={dayIndex}>
              <SwitchField
                value={!!dayConfig}
                onChange={(v) => handleToggleDay(dayIndex, v)}
                label={<span className="text-sm font-medium">{day.name}</span>}
                description={
                  dayConfig ? "Учебный день" : "Выходной / Нет уроков"
                }
              />
              {dayConfig && (
                <FieldGroup className="flex-col @sm:flex-row">
                  <InputField
                    value={dayConfig.firstLesson}
                    onChange={(v) =>
                      handleScheduleChange(dayIndex, "firstLesson", v)
                    }
                    min={1}
                    label="1-й урок (№)"
                    required={required}
                  />
                  <InputField
                    value={dayConfig.minLessons}
                    onChange={(v) =>
                      handleScheduleChange(dayIndex, "minLessons", v)
                    }
                    min={1}
                    label="Уроков (мин)"
                    required={required}
                  />
                  <InputField
                    value={dayConfig.maxLessons}
                    onChange={(v) =>
                      handleScheduleChange(dayIndex, "maxLessons", v)
                    }
                    min={1}
                    label="Уроков (макс)"
                    required={required}
                  />
                  <ComboboxField
                    value={rooms.find((r) => r.id === dayConfig.roomId) ?? null}
                    onChange={(v) =>
                      handleScheduleChange(dayIndex, "roomId", v?.id ?? null)
                    }
                    items={rooms}
                    itemToStringValue={(item) => item.name}
                    itemToKey={(item) => item.id}
                    placeholder="Напр. 204"
                    label="Кабинет"
                    autoHighlight
                  />
                </FieldGroup>
              )}
            </FieldGroup>
          )
        })}
      </FieldGroup>
    </FieldSet>
  )
}
