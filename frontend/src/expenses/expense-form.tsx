import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { API_URLS } from "@/constants/api";
import { useAlert } from "@/context/AlertContext";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

function ExpenseForm() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { id } = useParams();

  const expenseSchema = z.object({
    title: z.string().min(2).max(50),
    description: z.string().optional(),
    amount: z.coerce.number().min(0),
    date: z.date(),
  });

  type ExpenseFormValues = z.infer<typeof expenseSchema>;

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      date: new Date(),
    },
  });

  useEffect(() => {
    console.log("ExpenseForm mounted or id changed:", id);
    if (!id) return;

    const fetchExpense = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${API_URLS.EXPENSES}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const expense = res.data;
        form.reset({
          title: expense.title,
          description: expense.description,
          amount: expense.amount,
          date: new Date(expense.date), // ✅ ensure Date object
        });
        console.log("Fetched expense:", expense);
      } catch (err) {
        console.log(err);
        showAlert("error", "Failed", "Failed to load expense data");
      }
    };

    fetchExpense();
  }, [id, form, showAlert]);

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (data) => {
    try {
      const formData = {
        title: data.title,
        description: data.description,
        amount: data.amount,
        date: data.date.toISOString(),
      };

      const token = localStorage.getItem("access_token");

      const url = id ? `${API_URLS.EXPENSES}/${id}` : `${API_URLS.EXPENSES}`;

      const method = id ? "put" : "post";

      const res = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201 || res.status === 200) {
        showAlert(
          "success",
          "Saved",
          `Expense was successfully ${id ? "updated" : "created"}!`
        );
        navigate("/admin/expenses", { replace: true });
      } else {
        showAlert("error", "Failed", "Expense failed to save!");
      }
    } catch (err) {
      showAlert("error", "Failed", "Expense failed to save!");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-row gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Bill" {...field} />
                  </FormControl>
                  <FormDescription>This is the expense title.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Electricity" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the expense description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormDescription>Enter the expense amount.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the date of the expense.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">{id ? "Update" : "Create"} Expense</Button>
      </form>
    </Form>
  );
}

export default ExpenseForm;
