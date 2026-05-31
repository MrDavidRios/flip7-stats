import {
  Table as ShadcnTable,
  TableHeader as ShadcnTableHeader,
  TableBody as ShadcnTableBody,
  TableFooter as ShadcnTableFooter,
  TableHead as ShadcnTableHead,
  TableRow as ShadcnTableRow,
  TableCell as ShadcnTableCell,
  TableCaption as ShadcnTableCaption,
} from "@/components/ui/table"
import type { ComponentProps } from "react"

type TableProps = ComponentProps<typeof ShadcnTable>
type TableHeaderProps = ComponentProps<typeof ShadcnTableHeader>
type TableBodyProps = ComponentProps<typeof ShadcnTableBody>
type TableFooterProps = ComponentProps<typeof ShadcnTableFooter>
type TableHeadProps = ComponentProps<typeof ShadcnTableHead>
type TableRowProps = ComponentProps<typeof ShadcnTableRow>
type TableCellProps = ComponentProps<typeof ShadcnTableCell>
type TableCaptionProps = ComponentProps<typeof ShadcnTableCaption>

export function Table(props: TableProps) {
  return <ShadcnTable {...props} />
}

export function TableHeader(props: TableHeaderProps) {
  return <ShadcnTableHeader {...props} />
}

export function TableBody(props: TableBodyProps) {
  return <ShadcnTableBody {...props} />
}

export function TableFooter(props: TableFooterProps) {
  return <ShadcnTableFooter {...props} />
}

export function TableHead(props: TableHeadProps) {
  return <ShadcnTableHead {...props} />
}

export function TableRow(props: TableRowProps) {
  return <ShadcnTableRow {...props} />
}

export function TableCell(props: TableCellProps) {
  return <ShadcnTableCell {...props} />
}

export function TableCaption(props: TableCaptionProps) {
  return <ShadcnTableCaption {...props} />
}
