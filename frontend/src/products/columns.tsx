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
import type { Product } from "@/types/Product";
import { useNavigate } from "react-router-dom";
import { API_URLS } from "@/constants/api";
import axios from "axios";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function useProductColumns(): ColumnDef<Product>[] {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { isAdmin } = useAuth();
  return [
    {
      accessorKey: "name",
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
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "code",
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
      header: "Gold",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span>${product.gold.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span>{product.gold.weight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Qty:</span>
              <span>{product.gold.quantity}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "silver",
      header: "Silver",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span>${product.silver.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span>{product.silver.weight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Qty:</span>
              <span>{product.silver.quantity}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "copper",
      header: "Copper",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span>${product.copper.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span>{product.copper.weight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Qty:</span>
              <span>{product.copper.quantity}</span>
            </div>
          </div>
        );
      },
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
        if (!isAdmin) {
          return null;
        }
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
                onClick={() => navigate(`/admin/products/${+product.id}`)}
              >
                Edit
              </DropdownMenuItem>

              <ConfirmDialog
                title="Delete product?"
                description="Are you sure you want to delete this product? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={async () => {
                  const token = localStorage.getItem("access_token");
                  const res = await axios.delete(
                    `${API_URLS.PRODUCTS}/${product.id}`,
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
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
