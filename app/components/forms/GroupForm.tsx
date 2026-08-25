import { type SubmitEvent } from "react"
import { useErrorField } from "~/hooks/useErrorField"
import { groupToStr, parseGroupTemplate, resolveError } from "~/lib/utils"
import { groupService } from "~/services"
import type { CreateDayConfig, SchoolGroupExtended } from "~/types"
import { Field, FieldGroup } from "../ui/field"
import InputField from "../fields/input-field"
import CheckField from "../fields/check-field"
import DayConfigsField from "../DayConfigsField"
import { Button } from "../ui/button"
import { Edit2, Plus } from "lucide-react"
import { useField } from "~/hooks/useField"

type Props = {
  group?: SchoolGroupExtended | null
  onSubmit?: () => void
}

export default function GroupForm({ group = null, onSubmit }: Props) {
  const isCreating = !group

  const groupName = useErrorField(group ? groupToStr(group) : "")

  const useDefaultDayConfig = useField(true)

  const dayConfigs = useField(
    (group?.dayConfigs.map(({ room, ...d }) => ({
      ...d,
      roomId: room?.id ?? null,
    })) as CreateDayConfig[]) ?? []
  )

  const showScheduleEditor = !isCreating || !useDefaultDayConfig.value

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const groupTrimmed = groupName.value.trim()
    const groups = parseGroupTemplate(groupTrimmed)

    if (groups.length === 0) {
      groupName.setError("Укажите корректный класс")
      return
    }
    try {
      if (!isCreating) {
        if (groups.length > 1) {
          groupName.setError(
            "При редактировании нельзя указывать несколько классов"
          )
          return
        }
        groupService.patch(group.id, groups[0], dayConfigs.value)
        groupName.setError(null)
      } else {
        if (groups.length === 1)
          await groupService.add(
            groups[0],
            useDefaultDayConfig.value ? undefined : dayConfigs.value
          )
        else
          await groupService.bulkAdd(
            groups,
            useDefaultDayConfig.value ? undefined : dayConfigs.value
          )
        groupName.reset()
        dayConfigs.reset()
      }
      onSubmit?.()
    } catch (e) {
      groupName.setError(resolveError(e))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="@container grid gap-4 sm:gap-5">
      <FieldGroup>
        <InputField
          value={groupName.value}
          onChange={groupName.setValue}
          error={groupName.error}
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
          <Button type="submit" disabled={!!groupName.error}>
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
