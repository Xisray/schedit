import { useTableContext } from "~/hooks/table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { cn } from "~/lib/utils"

export default function DataTable() {
  const table = useTableContext()

  return (
    <>
      <div className="rounded-lg border">
        <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers
                .filter((header) => header.column.getIsVisible())
                .map((header) => (
                  <table.AppHeader header={header} key={header.id}>
                    {(h) => (
                      <TableHead
                        colSpan={h.colSpan}
                        className={cn(
                          "relative",
                          {
                            "border-r": h.id !== "actions",
                            "text-center *:[[role=checkbox]]:mx-auto":
                              h.column.id === "select",
                          },
                          header.column.columnDef.meta?.className
                        )}
                      >
                        {h.isPlaceholder ? null : <h.FlexRender />}
                      </TableHead>
                    )}
                  </table.AppHeader>
                ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              aria-selected={row.getIsSelected()}
            >
              {row.getVisibleCells().map((cell) => (
                <table.AppCell cell={cell} key={cell.id}>
                  {(c) => (
                    <TableCell
                      className={cn(
                        c.column.id === "actions" ? "" : "border-r",
                        c.column.id === "select" &&
                          "text-center *:[[role=checkbox]]:mx-auto"
                      )}
                    >
                      <c.FlexRender />
                    </TableCell>
                  )}
                </table.AppCell>
              ))}
            </TableRow>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="text-center text-muted-foreground"
              >
                Нет результата
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
      <table.DataTablePagination />
    </>
  )
}
