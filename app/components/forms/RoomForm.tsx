import { useState, type SubmitEvent } from "react"
import type { Room } from "~/types"
import { Field, FieldGroup } from "../ui/field"
import { cn, resolveError } from "~/lib/utils"
import { useErrorField } from "~/hooks/useErrorField"
import InputField from "../fields/input-field"
import { Button } from "../ui/button"
import { Edit2, Plus } from "lucide-react"
import { roomService } from "~/services"

function parseRoomRanges(rooms: string): string[] {
  const result: string[] = []

  for (const rawToken of rooms.split(",")) {
    const token = rawToken.trim()
    if (!token) continue

    if (token.includes("-")) {
      const parts = token.split("-").map((p) => p.trim())

      if (parts.length !== 2) {
        result.push(token)
        continue
      }

      const isDigitsOnly = parts.every((part) => /^\d+$/.test(part))
      if (!isDigitsOnly) {
        result.push(token)
        continue
      }

      const start = Number(parts[0])
      const end = Number(parts[1])

      if (start > end) {
        result.push(token)
        continue
      }

      for (let room = start; room <= end; room++) {
        result.push(room.toString())
      }
    } else {
      result.push(token)
    }
  }

  return result
}

type Props = {
  room?: Room | null
  onSubmit?: () => void
}

export default function RoomForm({ room = null, onSubmit }: Props) {
  const isCreating = !room

  const roomName = useErrorField(room?.name ?? "")
  const [capacity, setCapacity] = useState(room?.capacity ?? 1)

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const roomTrimmed = roomName.value.trim()
    try {
      if (!isCreating) {
        await roomService.patch(room.id, { name: roomTrimmed, capacity })
        roomName.setError(null)
        onSubmit?.()
        return
      }

      const rooms = parseRoomRanges(roomTrimmed)

      if (rooms.length === 0) {
        roomName.setError("Укажите корректный номер кабинета")
        return
      }
      if (rooms.length === 1) {
        await roomService.add({
          name: rooms[0],
          capacity,
        })
      } else {
        await roomService.bulkAdd(
          rooms.map((room) => ({
            name: room,
            capacity,
          }))
        )
      }
      roomName.reset()
      setCapacity(1)
      onSubmit?.()
    } catch (e) {
      roomName.setError(resolveError(e))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="@container grid gap-4 sm:gap-5">
      <FieldGroup className={cn("flex flex-col")}>
        <FieldGroup className="flex w-full flex-col @sm:flex-row">
          <InputField
            value={roomName.value}
            onChange={roomName.setValue}
            error={roomName.error}
            label="Кабинет"
            placeholder="например, 204-А"
            required
          />
          <InputField
            value={capacity}
            onChange={setCapacity}
            label="Вместимость (мест)"
            placeholder="1"
            min={0}
            max={12}
            required
          />
        </FieldGroup>
        <Field className="w-fit self-center">
          <Button type="submit" disabled={!!roomName.error}>
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
