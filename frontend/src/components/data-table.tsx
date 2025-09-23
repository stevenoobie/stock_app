import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Check, Settings2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  createUrl?: string;
  allowCreate?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  pageIndex,
  onPageChange,
  search,
  onSearchChange,
  createUrl,
  allowCreate = true,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / 10),
  });

  return (
    <div>
      {/* Search & Add */}
      <div className="flex items-center py-2 gap-2">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        {createUrl && allowCreate && (
          <a href={createUrl}>
            <Button type="button">+</Button>
          </a>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Settings2 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-10">
            {table
              .getAllLeafColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize cursor-pointer flex flex-row gap-2 align-middle"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.getIsVisible() && (
                    <Check className="h-4 w-4 fill-green-100" />
                  )}
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 py-4">
        <Button
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          Previous
        </Button>

        {(() => {
          const totalPages = Math.ceil(total / 10);
          const pages: (number | string)[] = [];

          pages.push(0);

          if (pageIndex > 3) pages.push("...");

          for (
            let i = Math.max(1, pageIndex - 2);
            i <= Math.min(totalPages - 2, pageIndex + 2);
            i++
          ) {
            pages.push(i);
          }

          if (pageIndex < totalPages - 4) pages.push("...");

          if (totalPages > 1) pages.push(totalPages - 1);

          return pages.map((p, idx) =>
            typeof p === "number" ? (
              <Button
                key={idx}
                size="sm"
                variant={pageIndex === p ? "default" : "outline"}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </Button>
            ) : (
              <span key={idx} className="px-2">
                {p}
              </span>
            )
          );
        })()}

        <Button
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={(pageIndex + 1) * 10 >= total}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
