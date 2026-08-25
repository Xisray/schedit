import { useLiveQuery } from "dexie-react-hooks"
import { DoorClosed, Users } from "lucide-react"
import RoomForm from "~/components/forms/RoomForm"
import { Badge } from "~/components/ui/badge"
import ItemsList from "~/components/view/ItemsList"
import DialogWrapper from "~/components/wraps/DialogWrapper"
import { useField } from "~/hooks/useField"
import { roomService } from "~/services"
import type { Room } from "~/types"

export default function Rooms() {
  const rooms = useLiveQuery(() => roomService.getAll(), [], [])

  const selected = useField<Room | null>(null)
  const open = useField(false)

  return (
    <>
      <ItemsList
        items={rooms}
        clear={roomService.clear}
        getKey={(item) => item.id}
        title={`Список кабинетов (${rooms.length})`}
        onEdit={(item) => {
          selected.setValue(item)
          open.setValue(true)
        }}
        onAdd={() => {
          selected.setValue(null)
          open.setValue(true)
        }}
        remove={(item) => roomService.remove(item.id)}
      >
        {(item) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DoorClosed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Кабинет
              </span>
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-sm font-semibold"
              >
                {item.name}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Вместимость:
              </span>
              <span className="text-sm font-bold text-foreground">
                {item.capacity === 0 ? "1/2" : item.capacity}
              </span>
            </div>
          </div>
        )}
      </ItemsList>
      <DialogWrapper
        title="Редактирование"
        description=""
        open={open.value}
        onOpenChange={open.setValue}
      >
        <RoomForm room={selected.value} onSubmit={() => open.setValue(false)} />
      </DialogWrapper>
    </>
  )
}
