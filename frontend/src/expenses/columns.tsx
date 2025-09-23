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
import type { Expense } from "@/types/Expense";
import { useNavigate } from "react-router-dom";
import { API_URLS } from "@/constants/api";
import axios from "axios";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Role } from "@/types/Role";

export function useExpensesColumn(): ColumnDef<Expense>[] {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  return [
    {
      accessorKey: "title",
      header: () => <h1>Title</h1>,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "description",
      header: () => <h1>Description</h1>,
      enableHiding: true,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>${row.original.amount.toFixed(2)}</span>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const expense = row.original;
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
                onClick={() => navigate(`/admin/expenses/${expense.id}`)}
              >
                Edit
              </DropdownMenuItem>
              {user?.role === Role.User ? (
                <ConfirmDialog
                  title="Delete expense?"
                  description="Are you sure you want to delete this expense? This action cannot be undone."
                  confirmLabel="Delete"
                  cancelLabel="Cancel"
                  onConfirm={async () => {
                    const token = localStorage.getItem("access_token");
                    const res = await axios.delete(
                      `${API_URLS.EXPENSES}/${expense.id}`,
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
                        "Expense Deleted",
                        "Expense was deleted successfully!"
                      );
                    } else {
                      showAlert("error", "Failed", "Failed to delete expense");
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
