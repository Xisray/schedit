import { type DisplayColumnDef, type RowData } from "@tanstack/react-table"
import type { SchoolGroupExtended } from "./types"
import { createAppColumnHelper } from "./hooks/table"
import { DAYS_NAMES } from "./constants"
import { Button } from "./components/ui/button"
import { Edit, Trash2 } from "lucide-react"

const columnHelper = createAppColumnHelper<SchoolGroupExtended>()

export const groupColumns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ header }) => <header.SelectAllHeader />,
    cell: ({ cell }) => <cell.SelectCell />,
    meta: {
      className: "w-px whitespace-nowrap",
    },
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor((row) => `${row.grade}${row.letter}`, {
    id: "schoolClass",
    header: ({ header }) => (
      <header.ColumnHeader
        title="Класс"
        className="items-center justify-center text-center"
      />
    ),
    cell: (info) => <p className="text-center">{info.getValue()}</p>,
    meta: {
      className: "items-center justify-center text-center",
    },
  }),
  ...DAYS_NAMES.map((day, index) =>
    columnHelper.accessor(
      (row) => row.dayConfigs.find((day) => day.dayId === index),
      {
        enableSorting: false,
        enableColumnFilter: false,
        id: `schedule_${index}`,
        header: day.name,
        meta: {
          className: "text-center",
        },
        cell: (info) => {
          const dayConfig = info.getValue()

          if (!dayConfig) {
            return (
              <div className="text-center text-muted-foreground">Выходной</div>
            )
          }

          return (
            <div className="min-w-32.5 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Первый урок</span>
                <span className="font-medium">{dayConfig.firstLesson}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Уроки</span>
                <span className="font-medium">
                  {dayConfig.minLessons}–{dayConfig.maxLessons}
                </span>
              </div>

              {dayConfig.room && (
                <div className="flex items-center justify-between gap-3 border-t pt-1.5">
                  <span className="text-xs text-muted-foreground">Кабинет</span>
                  <span className="text-xs font-medium">
                    {dayConfig.room.name}
                  </span>
                </div>
              )}
            </div>
          )
        },
      }
    )
  ),
])

export function createActionColumn<T extends RowData>(
  onEdit: (item: T) => void,
  onRemove: (item: T) => void
): any {
  const result: DisplayColumnDef<any, T> = {
    id: "actions",
    header: "Действия",
    meta: {
      className: "w-px whitespace-nowrap text-right",
    },
    cell: (info) => {
      const item = info.row.original

      return (
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(item)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  }
  return result
}
