import { Subscribe } from "@tanstack/react-table"
import { useCellContext, useTableContext } from "~/hooks/table"
import { Checkbox } from "../ui/checkbox"

export function SelectCell(): React.ReactNode {
  const cell = useCellContext()
  const table = useTableContext()
  const row = cell.row

  return (
    <Subscribe source={table.atoms.rowSelection}>
      {() => (
        <Checkbox
          checked={row.getIsSelected()}
          indeterminate={!row.getIsSelected() && row.getIsSomeSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      )}
    </Subscribe>
  )
}
