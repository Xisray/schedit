import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  filterFn_includesString,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { useState } from "react"
import { SelectCell } from "~/components/table/cell-components"
import {
  ColumnHeader,
  SelectAllHeader,
} from "~/components/table/header-components"
import { DataTablePagination } from "~/components/table/data-table-pagination"

export interface ColumnMeta {
  className?: string
}

export const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  rowExpandingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  columnMeta: metaHelper<ColumnMeta>(),
})

export type DataTableFeatures = typeof features

const {
  useAppTable: useTable,
  useTableContext,
  useCellContext,
  useHeaderContext,
  createAppColumnHelper,
} = createTableHook({
  features,
  cellComponents: {
    SelectCell,
  },
  headerComponents: {
    SelectAllHeader,
    ColumnHeader,
  },
  tableComponents: {
    DataTablePagination,
  },
})

export {
  useTableContext,
  useCellContext,
  useHeaderContext,
  createAppColumnHelper,
}

export function useAppTable<TData extends RowData>(
  data: readonly TData[],
  columns: readonly ColumnDef<DataTableFeatures, TData>[]
) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sortingState, setSortingState] = useState<SortingState>([])
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>(
    {}
  )

  return useTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSortingState,
    onRowSelectionChange: setRowSelectionState,
    state: {
      columnFilters,
      sorting: sortingState,
      rowSelection: rowSelectionState,
    },
    enableColumnFilters: true,
    enableRowSelection: true,
    enableSorting: true,
  })
}
