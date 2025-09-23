import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { API_URLS } from "@/constants/api";
import axios from "axios";
import { useAlert } from "@/context/AlertContext";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Sale } from "@/types/Sale";
import { useAuth } from "@/context/AuthContext";

export function useSaleColumns(): ColumnDef<Sale>[] {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  return [
    {
      accessorKey: "customerName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.customerName ?? "-"}</span>
      ),
    },
    {
      accessorKey: "customerPhone",
      header: "Phone",
      cell: ({ row }) => row.original.customerPhone ?? "-",
    },
    {
      accessorKey: "saleItems",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.sales;
        return (
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="border rounded-md p-2 text-sm bg-muted/30"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{item.productName}</span>
                  <span className="text-muted-foreground">{item.material}</span>
                </div>
                <div className="flex justify-between">
                  <span>Qty:</span>
                  <span>{item.qty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>{item.discount ?? 0}%</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Subtotal:</span>
                  <span>
                    $
                    {(
                      item.qty *
                      item.price *
                      (1 - (item.discount ?? 0) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "totalBeforeDiscount",
      header: "Total (Before)",
      cell: ({ row }) => `$${row.original.totalBeforeDiscount.toFixed(2)}`,
    },
    {
      accessorKey: "globalDiscount",
      header: "Global Discount",
      cell: ({ row }) => `${row.original.globalDiscount ?? 0}%`,
    },
    {
      accessorKey: "totalAfterDiscount",
      header: "Total (After)",
      cell: ({ row }) => `$${row.original.totalAfterDiscount.toFixed(2)}`,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : "-",
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        row.original.updatedAt
          ? new Date(row.original.updatedAt).toLocaleDateString()
          : "-",
    },
    // {
    //   id: "actions",
    //   enableHiding: false,
    //   cell: ({ row }) => {
    //     const sale = row.original;
    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <MoreHorizontal className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem
    //             onClick={() => navigate(`/admin/sales/${sale.id}`)}
    //           >
    //             View / Edit
    //           </DropdownMenuItem>

    //           <ConfirmDialog
    //             title="Delete sale?"
    //             description="Are you sure you want to delete this sale? This action cannot be undone."
    //             confirmLabel="Delete"
    //             cancelLabel="Cancel"
    //             onConfirm={async () => {
    //               const token = localStorage.getItem("access_token");
    //               const res = await axios.delete(
    //                 `${API_URLS.SALES}/${sale.id}`,
    //                 {
    //                   headers: { Authorization: `Bearer ${token}` },
    //                 }
    //               );
    //               if (res.status === 200) {
    //                 window.location.reload();
    //                 showAlert(
    //                   "success",
    //                   "Sale Deleted",
    //                   "Sale was deleted successfully!"
    //                 );
    //               } else {
    //                 showAlert("error", "Failed", "Failed to delete sale");
    //               }
    //             }}
    //             trigger={
    //               <DropdownMenuItem
    //                 className="text-red-600"
    //                 onSelect={(e) => e.preventDefault()}
    //                 asChild
    //               >
    //                 <div>Delete</div>
    //               </DropdownMenuItem>
    //             }
    //           />
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const sale = row.original;
        const isAdmin = user?.role?.toLowerCase() === "admin";

        // check ownership and 24h window
        const isCreator = sale.createdById === user?.id;
        const within24h =
          sale.createdAt &&
          new Date().getTime() - new Date(sale.createdAt).getTime() <
            24 * 60 * 60 * 1000;

        const canEdit = isAdmin || (isCreator && within24h);
        const canDelete = isAdmin || (isCreator && within24h);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              {canEdit && (
                <DropdownMenuItem
                  onClick={() => navigate(`/admin/sales/${sale.id}`)}
                >
                  View / Edit
                </DropdownMenuItem>
              )}

              {canDelete && (
                <ConfirmDialog
                  title="Delete sale?"
                  description="Are you sure you want to delete this sale? This action cannot be undone."
                  confirmLabel="Delete"
                  cancelLabel="Cancel"
                  onConfirm={async () => {
                    const token = localStorage.getItem("access_token");
                    try {
                      const res = await axios.delete(
                        `${API_URLS.SALES}/${sale.id}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      if (res.status === 200) {
                        window.location.reload();
                        showAlert(
                          "success",
                          "Sale Deleted",
                          "Sale was deleted successfully!"
                        );
                      } else {
                        showAlert("error", "Failed", "Failed to delete sale");
                      }
                    } catch {
                      showAlert("error", "Failed", "Failed to delete sale");
                    }
                  }}
                  trigger={
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={(e) => e.preventDefault()}
                      asChild
                    >
                      <div>Delete</div>
                    </DropdownMenuItem>
                  }
                />
              )}

              {/* Always allow view-only if neither edit nor delete */}
              {!canEdit && !canDelete && (
                <DropdownMenuItem
                  onClick={() => navigate(`/admin/sales/${sale.id}`)}
                >
                  View
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
