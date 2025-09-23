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
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/Role";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Stock } from "@/types/Stock";

export function useStockColumns(): ColumnDef<Stock>[] {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  return [
    {
      accessorKey: "productName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.productName}</span>
      ),
    },
    {
      accessorKey: "productCode",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "gold",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gold
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "silver",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Silver
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      enableHiding: true,
    },
    {
      accessorKey: "copper",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Copper
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      enableHiding: true,
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          createdAt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          updatedAt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate(`/admin/stock/${+product.id}`)}
              >
                Edit
              </DropdownMenuItem>
              {user?.role === Role.User ? (
                <ConfirmDialog
                  title="Delete stock?"
                  description="Are you sure you want to delete this stock? This action cannot be undone."
                  confirmLabel="Delete"
                  cancelLabel="Cancel"
                  onConfirm={async () => {
                    const token = localStorage.getItem("access_token");
                    const res = await axios.delete(
                      `${API_URLS.STOCK}/${product.id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (res.status === 200) {
                      window.location.reload();
                      showAlert(
                        "success",
                        "Product Deleted",
                        "Product was deleted successfully!"
                      );
                    } else {
                      showAlert("error", "Failed", "Failed to delete product");
                    }
                  }}
                  trigger={
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={(e) => e.preventDefault()}
                      asChild
                    >
                      <div className="">Delete</div>
                    </DropdownMenuItem>
                  }
                />
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
