import { useLiveQuery } from "dexie-react-hooks"
import { type SubmitEvent } from "react"
import { useErrorField } from "~/hooks/useErrorField"
import { useField } from "~/hooks/useField"
import { groupService, roomService, teacherService } from "~/services"
import type { CreateEntity, Teacher, TeacherExtended } from "~/types"
import { FieldGroup } from "../ui/field"
import InputField from "../fields/input-field"
import ComboboxField from "../fields/combobox-field"
import TeacherHoursField from "../TeacherHoursField"
import { Edit2, Plus } from "lucide-react"
import { groupToStr, resolveError } from "~/lib/utils"
import { Button } from "../ui/button"
import { ValidationException } from "~/lib/errors"

type Props = {
  teacher?: TeacherExtended | null
  onSubmit?: () => void
}

export default function TeacherForm({ teacher = null, onSubmit }: Props) {
  const groups = useLiveQuery(() => groupService.getAll(), [], [])
  const rooms = useLiveQuery(() => roomService.getAll(), [], [])
  const isCreating = !teacher

  const name = useErrorField(teacher?.name ?? "")
  const group = useErrorField(teacher?.groupId ?? null)
  const room = useField(teacher?.roomId ?? null)
  const hours = useField(teacher?.hours ?? [])

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const trimmedName = name.value.trim()
    const entity: CreateEntity<Teacher> = {
      name: trimmedName,
      groupId: group.value,
      roomId: room.value,
    }
    try {
      if (isCreating) await teacherService.add(entity, hours.value)
      else await teacherService.patch(teacher.id, entity, hours.value)
      name.reset()
      group.reset()
      room.reset()
      hours.reset()
      onSubmit?.()
    } catch (e) {
      if (e instanceof ValidationException) {
        if (e.errors.name) {
          name.setError(e.errors.name)
        } else if (e.errors.groupId) {
          group.setError(e.errors.groupId)
        }
      } else {
        name.setError(resolveError(e))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="@container grid gap-4 sm:gap-5">
      <FieldGroup>
        <FieldGroup className="flex flex-col @sm:flex-row">
          <InputField
            value={name.value}
            onChange={name.setValue}
            error={name.error}
            label="Имя"
            placeholder="ФИО"
            required
          />
          <ComboboxField
            value={groups.find((g) => g.id === group.value) ?? null}
            onChange={(v) => group.setValue(v?.id ?? null)}
            items={groups}
            itemToKey={(item) => item.id}
            itemToStringValue={(item) => groupToStr(item)}
            placeholder="9А"
            label="Класс"
            autoHighlight
          />
          <ComboboxField
            value={rooms.find((r) => r.id === room.value) ?? null}
            onChange={(v) => room.setValue(v?.id ?? null)}
            items={rooms}
            itemToKey={(item) => item.id}
            itemToStringValue={(item) => item.name}
            placeholder="402"
            label="Кабинет"
            autoHighlight
          />
        </FieldGroup>
        <TeacherHoursField
          value={hours.value}
          onChange={hours.setValue}
          groups={groups}
        />
        <Button type="submit" className="self-center sm:w-fit">
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
      </FieldGroup>
    </form>
  )
}
