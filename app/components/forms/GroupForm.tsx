import { useLiveQuery } from "dexie-react-hooks"
import { useState, type SubmitEvent } from "react"
import { useErrorField } from "~/hooks/useErrorField"
import { groupToStr, parseGroupTemplate, resolveError } from "~/lib/utils"
import { groupService } from "~/services"
import type { CreateDayConfig, Id } from "~/types"
import { Field, FieldGroup } from "../ui/field"
import InputField from "../fields/input-field"
import CheckField from "../fields/check-field"
import DayConfigsField from "../DayConfigsField"
import { Button } from "../ui/button"
import { Edit2, Plus } from "lucide-react"
import { useField } from "~/hooks/useField"

type Props = {
  groupId?: Id
}

export default function GroupForm({ groupId }: Props) {
  const selectedGroup = useLiveQuery(
    () => groupId && groupService.get(groupId),
    [groupId]
  )

  const isCreating = !selectedGroup

  const group = useErrorField(selectedGroup ? groupToStr(selectedGroup) : "")

  const useDefaultDayConfig = useField(true)

  const dayConfigs = useField(
    (selectedGroup?.dayConfigs as CreateDayConfig[]) ?? []
  )

  const showScheduleEditor = !isCreating || !useDefaultDayConfig.value

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    const groupTrimmed = group.value.trim()
    const groups = parseGroupTemplate(groupTrimmed)

    if (groups.length === 0) {
      group.setError("Укажите корректный класс")
      return
    }
    try {
      if (!isCreating) {
        if (groups.length > 1) {
          group.setError(
            "При редактировании нельзя указывать несколько классов"
          )
          return
        }
        groupService.patch(groupId!, groups[0], dayConfigs.value)
        group.setError(null)
      } else {
        groupService.bulkAdd(groups, dayConfigs.value)
        group.reset()
        dayConfigs.reset()
      }
    } catch (e) {
      group.setError(resolveError(e))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="@container grid gap-4 sm:gap-5">
      <FieldGroup>
        <InputField
          value={group.value}
          onChange={group.setValue}
          error={group.error}
          label="Класс(ы)"
          placeholder="Например: 10А"
          required
        />
        {isCreating && (
          <CheckField
            id="use-default-day-config"
            value={useDefaultDayConfig.value}
            onChange={useDefaultDayConfig.setValue}
            label="Использовать стандартные значения расписания"
          />
        )}
        {showScheduleEditor && (
          <DayConfigsField
            value={dayConfigs.value}
            onChange={dayConfigs.setValue}
          />
        )}
        <Field className="w-fit self-center">
          <Button type="submit" disabled={!!group.error}>
            {isCreating ? (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Добавить
              </>
            ) : (
              <>
                <Edit2 className="mr-1 h-4 w-4" />
                Изменить
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
