import { Button } from "@/components/ui/button";
import SaleRow from "@/sales/sale-row";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { API_URLS } from "@/constants/api";
import { useAlert } from "@/context/AlertContext";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import type { SaleRow as SaleRowType } from "@/types/SaleRow";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/Role";

function SaleForm() {
  const { saleId } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [rows, setRows] = useState<SaleRowType[]>([
    {
      id: crypto.randomUUID(),
      productId: 0,
      productName: "",
      material: "silver",
      quantity: 1,
      price: 0,
      discount: 0,
      isFirst: true,
    },
  ]);

  const saleSchema = z.object({
    customerName: z.string().nullable(),
    customerPhone: z.string().nullable(),
    row: z.array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        price: z.number().min(0),
        discount: z.number().min(0).max(100),
      })
    ),
    globalDiscount: z.number().min(0).max(100).default(0),
  });

  type SaleFormSchema = z.infer<typeof saleSchema>;

  const form = useForm<SaleFormSchema>({
    defaultValues: {
      customerName: null,
      customerPhone: null,
      row: [{ productId: 0, quantity: 1, price: 0, discount: 0 }],
      globalDiscount: 0,
    },
  });

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(API_URLS.PRODUCTS_ALL_WITH_STOCK, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) {
          setProducts(res.data);
        }
      } catch (err) {
        showAlert("error", "Failed to fetch products", "Error");
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!saleId) return;
    const fetchSale = async () => {
      try {
        const res = await axios.get(`${API_URLS.SALES}/${saleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sale = res.data;

        if (res.status === 200) {
          const isAdmin =
            user?.role?.toLowerCase() === Role.Admin.toLowerCase();
          const isCreator = user?.id === sale.createdById;
          const createdAt = new Date(sale.createdAt);
          const within24h =
            Date.now() - createdAt.getTime() <= 24 * 60 * 60 * 1000;
          if (isAdmin || (isCreator && within24h)) {
            setIsReadOnly(false);
          } else {
            setIsReadOnly(true);
          }

          form.reset({
            customerName: sale.customerName ?? null,
            customerPhone: sale.customerPhone ?? null,
            globalDiscount: sale.globalDiscount ?? 0,
            row: sale.sales.map((item: any) => ({
              productId: item.productId,
              quantity: item.qty,
              price: item.price,
              discount: item.discount ?? 0,
            })),
          });

          setRows(
            sale.sales.map((item: any, idx: number) => ({
              index: idx,
              productId: item.productId,
              productName: item.productName ?? "",
              material: item.material ?? "silver",
              quantity: item.qty,
              price: item.price,
              discount: item.discount ?? 0,
              isFirst: idx === 0,
            }))
          );
        }
      } catch (err) {
        showAlert("error", "Failed to fetch sale", "Error");
      }
    };
    fetchSale();
  }, [saleId]);

  const onAddRow = () => {
    setRows([
      ...rows,
      {
        id: crypto.randomUUID(),
        productId: 0,
        productName: "",
        material: "silver",
        quantity: 1,
        price: 0,
        discount: 0,
        isFirst: false,
      },
    ]);
  };
  const onRemoveRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const onChange = (
    index: number,
    field: keyof SaleRowType,
    value: string | number
  ) => {
    setRows((prevRows) => {
      const row = prevRows[index];
      if (!row) return prevRows;

      const updatedRows = [...prevRows];
      updatedRows[index] = { ...row, [field]: value };

      return updatedRows;
    });
  };

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalBeforeDiscount = summary.reduce(
      (sum, item) => sum + item.priceBeforeDiscount,
      0
    );
    const totalAfterDiscount = totalBeforeDiscount - globalDiscountAmount;

    const sales = rows.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      material: row.material!,
      qty: row.quantity,
      price: row.price,
      rowDiscount: row.discount,
    }));

    const payload = {
      customerName: form.getValues().customerName,
      customerPhone: form.getValues().customerPhone,
      globalDiscount: +form.getValues().globalDiscount,
      totalBeforeDiscount,
      totalAfterDiscount,
      sales,
    };

    try {
      let res;
      if (saleId) {
        res = await axios.put(`${API_URLS.SALES}/${saleId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post(API_URLS.SALES, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.status === 201 || res.status === 200) {
        showAlert(
          "success",
          `Sale ${saleId ? "updated" : "added"} successfully`,
          "Success"
        );
        navigate("/admin/sales", { replace: true });
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        showAlert("error", "Out of stock", error.response.data.message);
        return;
      }
      showAlert("error", "Failed to save sale", "Error");
    }
  };

  const globalDiscount = form.watch("globalDiscount") ?? 0;

  const {
    summary,
    totalBeforeDiscount,
    globalDiscountAmount,
    totalAfterDiscount,
  } = useMemo(() => {
    const summary: Array<{
      name: string;
      material: string;
      qty: number;
      priceBeforeDiscount: number;
      rowDiscount: number;
      priceAfterDiscount: number;
    }> = [];

    rows.forEach((row) => {
      const product = products.find((p) => p.id === row.productId);
      if (!product) return;

      const priceBeforeDiscount = row.price * row.quantity;
      const rowDiscount = row.discount ?? 0;
      const discountAmount = (priceBeforeDiscount * rowDiscount) / 100;
      const priceAfterDiscount = priceBeforeDiscount - discountAmount;

      summary.push({
        name: product.name,
        material: row.material ?? "",
        qty: row.quantity,
        priceBeforeDiscount,
        rowDiscount,
        priceAfterDiscount,
      });
    });

    const totalBeforeDiscount = summary.reduce(
      (sum, item) => sum + item.priceAfterDiscount,
      0
    );

    const globalDiscountAmount = (totalBeforeDiscount * globalDiscount) / 100;
    const totalAfterDiscount = totalBeforeDiscount - globalDiscountAmount;

    return {
      summary,
      totalBeforeDiscount,
      globalDiscountAmount,
      totalAfterDiscount,
    };
  }, [rows, globalDiscount, products]);

  return (
    <Form {...form}>
      <form onSubmit={submitAction}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-8">
            <FormField
              control={form.control}
              disabled={isReadOnly}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormDescription>
                    Enter the name of the customer
                  </FormDescription>
                  <FormControl>
                    <Input
                      className="min-w-8"
                      placeholder="Customer Name(Optional)"
                      {...field}
                      value={typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              disabled={isReadOnly}
              name="customerPhone"
              render={({ field }) => (
                <FormItem className="min-w-8">
                  <FormLabel>Customer Phone</FormLabel>
                  <FormDescription>
                    Enter the phone number of the customer
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder="Customer Phone(Optional)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              disabled={isReadOnly}
              name="globalDiscount"
              render={({ field }) => (
                <FormItem className="min-w-8">
                  <FormLabel>Global Discount %</FormLabel>
                  <FormDescription>Enter the Discount</FormDescription>
                  <FormControl>
                    <Input
                      placeholder="Global Discount(Optional)"
                      type="number"
                      {...field}
                      value={field.value ?? 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>

          {/* Sale Rows */}
          {products.length > 0 &&
            rows.length > 0 &&
            rows.map((row, idx) => (
              <SaleRow
                key={row.id}
                row={row}
                disabled={isReadOnly}
                index={idx}
                onAdd={onAddRow}
                onRemove={onRemoveRow}
                products={products}
                onChange={onChange}
              />
            ))}

          {/* Summary Section */}
          <div className="border rounded-lg p-4 shadow-sm bg-gray-50 mt-4">
            <h3 className="font-semibold mb-2">Sale Summary</h3>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Product</th>
                  <th className="text-center">Material</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-center">Discount %</th>
                  <th className="text-right">Price(after Discount %)</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((item, idx) => (
                  <tr key={idx}>
                    <td className="tex-left">{item.name}</td>
                    <td className="text-center">{item.material}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-right">
                      {item.priceBeforeDiscount.toFixed(2)}
                    </td>
                    <td className="text-center">{item.rowDiscount}%</td>
                    <td className="text-right">
                      {item.priceAfterDiscount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-2 border-t pt-2 text-sm">
              <div className="flex justify-between">
                <span>Total before global discount:</span>
                <span>{totalBeforeDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Global discount:</span>
                <span>-{globalDiscountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total after discount:</span>
                <span>{totalAfterDiscount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {!isReadOnly ? (
            <Button className="w-fit" type="submit">
              {saleId ? "Update Sale" : "Add Sale"}
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}

export default SaleForm;
