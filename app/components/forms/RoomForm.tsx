import { useLiveQuery } from "dexie-react-hooks"
import { useState, type SubmitEvent } from "react"
import type { CreateEntity, Id, Room } from "~/types"
import { Field, FieldGroup } from "../ui/field"
import { cn, resolveError } from "~/lib/utils"
import { useField } from "~/hooks/useField"
import InputField from "../fields/input-field"
import { Button } from "../ui/button"
import { Edit2, Plus } from "lucide-react"
import { roomService } from "~/services"
import { db } from "~/db"

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
  roomId?: Id | null
}

export function RoomForm({ roomId = null }: Props) {
  const selectedRoom = useLiveQuery(
    async () => (roomId ? ((await roomService.get(roomId)) ?? null) : null),
    [roomId]
  )

  const isCreating = !selectedRoom

  const room = useField(selectedRoom?.name ?? "")
  const [capacity, setCapacity] = useState(selectedRoom?.capacity ?? 1)

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const roomTrimmed = room.value.trim()
    try {
      if (!isCreating) {
        await roomService.patch(roomId!, { name: roomTrimmed, capacity })
        room.setError(null)
        return
      }

      const rooms = parseRoomRanges(roomTrimmed)

      if (rooms.length === 0) {
        room.setError("Укажите корректный номер кабинета")
        return
      }

      await roomService.bulkAdd(
        rooms.map((room) => ({
          name: room,
          capacity,
        }))
      )
      room.reset()
      setCapacity(1)
    } catch (e) {
      room.setError(resolveError(e))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="@container grid gap-4 sm:gap-5">
      <FieldGroup className={cn("flex flex-col")}>
        <FieldGroup className="flex w-full flex-col @sm:flex-row">
          <InputField
            value={room.value}
            onChange={room.setValue}
            error={room.error}
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
          <Button type="submit" disabled={!!room.error}>
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
