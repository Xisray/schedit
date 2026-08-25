import { Subscribe } from "@tanstack/react-table"
import { useHeaderContext, useTableContext } from "~/hooks/table"
import { Checkbox } from "../ui/checkbox"
import { cn } from "~/lib/utils"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

export function SelectAllHeader(): React.ReactNode {
  const table = useTableContext()

  return (
    <Subscribe source={table.atoms.rowSelection}>
      {() => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            !table.getIsAllPageRowsSelected() &&
            table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      )}
    </Subscribe>
  )
}

export function ColumnHeader({
  title,
  className,
}: {
  title?: string
  className?: string
}): React.ReactNode {
  const header = useHeaderContext()
  const table = useTableContext()
  const column = header.column

  const displayTitle = title ?? column.id

  const canSort = column.getCanSort()
  const canHide = column.getCanHide()

  if (!canSort && !canHide) {
    return <div className={cn(className)}>{displayTitle}</div>
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Subscribe
        source={table.store}
        selector={(s) => ({
          sorting: s.sorting,
        })}
      >
        {() => {
          const sorted = canSort ? column.getIsSorted() : false

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group h-8 data-[state=open]:bg-accent hover:bg-transparent"
                  />
                }
              >
                <span>{displayTitle}</span>
                {sorted === "desc" ? (
                  <ArrowDown className="size-4" />
                ) : sorted === "asc" ? (
                  <ArrowUp className="size-4" />
                ) : canSort ? (
                  <ChevronsUpDown className="size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[state=open]:opacity-100" />
                ) : null}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {canSort && (
                  <>
                    <DropdownMenuItem
                      onClick={() => column.toggleSorting(false)}
                    >
                      <ArrowUp className="mr-2 size-3.5 text-muted-foreground/70" />
                      Asc
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => column.toggleSorting(true)}
                    >
                      <ArrowDown className="mr-2 size-3.5 text-muted-foreground/70" />
                      Desc
                    </DropdownMenuItem>
                  </>
                )}
                {canHide && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => column.toggleVisibility(false)}
                    >
                      <EyeOff className="mr-2 size-3.5 text-muted-foreground/70" />
                      Hide
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }}
      </Subscribe>
    </div>
  )
}
