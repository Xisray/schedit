import { useLiveQuery } from "dexie-react-hooks"
import { Plus, Trash2 } from "lucide-react"
import { createActionColumn, groupColumns } from "~/columns"
import InputField from "~/components/fields/input-field"
import GroupForm from "~/components/forms/GroupForm"
import DataTable from "~/components/table/data-table"
import { Button } from "~/components/ui/button"
import DialogWrapper from "~/components/wraps/DialogWrapper"
import { useAppTable } from "~/hooks/table"
import { useField } from "~/hooks/useField"
import { groupService } from "~/services"
import type { SchoolGroupExtended } from "~/types"

export default function Groups() {
  const groups = useLiveQuery(() => groupService.getAllExtended(), [], [])

  const selected = useField<SchoolGroupExtended | null>(null)
  const open = useField(false)

  const actionColumn = createActionColumn<SchoolGroupExtended>(
    (group) => {
      selected.setValue(group)
      open.setValue(true)
    },
    (group) => groupService.remove(group.id)
  )

  const table = useAppTable(groups, [...groupColumns, actionColumn])

  return (
    <>
      <table.AppTable>
        <div className="flex items-end gap-4">
          <InputField
            label="Поиск по классу"
            value={
              (table.getColumn("schoolClass")?.getFilterValue() as string) ?? ""
            }
            showClear
            onChange={(v) => table.getColumn("schoolClass")?.setFilterValue(v)}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            onClick={() => {
              groupService.bulkRemove(
                table
                  .getSelectedRowModel()
                  .rows.map((row: any) => row.original.id)
              )
              table.resetRowSelection()
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Удалить
          </Button>
          <Button
            variant="default"
            type="button"
            size="sm"
            onClick={() => {
              selected.setValue(null)
              open.setValue(true)
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Добавить
          </Button>
        </div>
        <DataTable />
      </table.AppTable>
      <DialogWrapper
        title={selected.value ? "Редактирование" : "Создание"}
        description="Задайте номер первого урока, количество уроков и кабинет для каждого дня недели."
        open={open.value}
        onOpenChange={open.setValue}
        className="sm:min-w-xl md:min-w-2xl"
      >
        <GroupForm
          group={selected.value}
          onSubmit={() => open.setValue(false)}
        />
      </DialogWrapper>
    </>
  )
}
