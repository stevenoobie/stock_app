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
import { API_URLS } from "@/constants/api";
import { useAlert } from "@/context/AlertContext";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import axios from "axios";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

function SingleStockPage() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { id } = useParams();
  const [products, setProducts] = useState<
    {
      id: number;
      name: string;
      code: string;
      stock?: {
        quantity_gold: number;
        quantity_silver: number;
        quantity_copper: number;
      };
    }[]
  >([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    code: string;
    stock?: {
      quantity_gold: number;
      quantity_silver: number;
      quantity_copper: number;
    };
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(!!id);

  const stockSchema = z.object({
    productId: z.number().int(),
    quantity_gold: z.number().int().nonnegative(),
    quantity_silver: z.number().int().nonnegative(),
    quantity_copper: z.number().int().nonnegative(),
  });
  type StockFormValues = z.infer<typeof stockSchema>;

  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      productId: undefined as unknown as number,
      quantity_gold: 0,
      quantity_silver: 0,
      quantity_copper: 0,
    },
  });

  async function fetchProductById(productId: number) {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${API_URLS.PRODUCTS}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const p = res.data;

      const productWithStock = {
        id: p.id,
        name: p.name,
        code: p.code,
        stock:
          p.stock ??
          (p.quantity_gold !== undefined
            ? {
                quantity_gold: p.quantity_gold,
                quantity_silver: p.quantity_silver,
                quantity_copper: p.quantity_copper,
              }
            : undefined),
      };
      return productWithStock;
    } catch (err) {
      return undefined;
    }
  }

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchStock = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${API_URLS.STOCK}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const stock = res.data;

        const productWithStock = {
          ...stock.product,
          stock: {
            quantity_gold: stock.quantity_gold ?? 0,
            quantity_silver: stock.quantity_silver ?? 0,
            quantity_copper: stock.quantity_copper ?? 0,
          },
        };

        setProducts((prev) => {
          if (prev.some((p) => p.id === productWithStock.id)) return prev;
          return [productWithStock, ...prev];
        });

        setSelectedProduct(productWithStock);

        form.reset({
          productId: stock.productId,
          quantity_gold: stock.quantity_gold ?? 0,
          quantity_silver: stock.quantity_silver ?? 0,
          quantity_copper: stock.quantity_copper ?? 0,
        });
      } catch (err) {
        showAlert("error", "Failed", "Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [id, form, showAlert]);

  useEffect(() => {
    if (id) return;
    if (!productSearch) {
      setProducts([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${API_URLS.PRODUCTS}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: productSearch },
        });

        setProducts(res.data ?? []);
      } catch (err) {
        showAlert("error", "Failed", "Failed to fetch products");
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [productSearch, id, showAlert]);

  async function handleProductSelect(
    value: string,
    fieldOnChange: (v: number) => void
  ) {
    const numericId = Number(value);
    fieldOnChange(numericId);

    let prod = products.find((p) => p.id === numericId);

    if (!prod || !prod.stock) {
      const fetched = await fetchProductById(numericId);
      if (fetched) {
        prod = fetched;
        setProducts((prev) => {
          if (prev.some((p) => p.id === fetched.id)) return prev;
          return [fetched, ...prev];
        });
      } else if (!prod) {
        prod = {
          id: numericId,
          name: `#${numericId}`,
          code: `${numericId}`,
          stock: undefined,
        };
      }
    }

    setSelectedProduct(prod ?? null);

    if (prod?.stock) {
      form.setValue("quantity_gold", prod.stock.quantity_gold ?? 0);
      form.setValue("quantity_silver", prod.stock.quantity_silver ?? 0);
      form.setValue("quantity_copper", prod.stock.quantity_copper ?? 0);
    } else {
      form.setValue("quantity_gold", 0);
      form.setValue("quantity_silver", 0);
      form.setValue("quantity_copper", 0);
    }
  }

  const onSubmit: SubmitHandler<StockFormValues> = async (data) => {
    const productIdFromForm = Number(form.getValues("productId"));
    const productIdToSend =
      selectedProduct?.id ??
      (Number.isFinite(productIdFromForm) ? productIdFromForm : undefined);

    if (!productIdToSend) {
      showAlert(
        "error",
        "Validation",
        "Please select a product before saving."
      );
      return;
    }

    try {
      const formData = {
        productId: productIdToSend,
        quantity_gold: data.quantity_gold,
        quantity_silver: data.quantity_silver,
        quantity_copper: data.quantity_copper,
      };

      const token = localStorage.getItem("access_token");
      const url = id ? `${API_URLS.STOCK}/${id}` : `${API_URLS.STOCK}`;
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
          `Stock was successfully ${id ? "updated" : "created"}!`
        );
        navigate("/admin/stock", { replace: true });
      } else {
        showAlert("error", "Failed", "Stock failed to save!");
      }
    } catch (err: any) {
      showAlert("error", "Failed", err?.message ?? "Unknown error");
    }
  };

  if (loading) {
    return <div className="p-6">Loading stock...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-6 w-md">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <FormControl>
                  <div>
                    <Select
                      disabled={!!id}
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(val) =>
                        handleProductSelect(val, (n) => field.onChange(n))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product">
                          {selectedProduct
                            ? `${selectedProduct.name} (${selectedProduct.code})`
                            : "Select a product"}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent className="w-full">
                        {!id && (
                          <Input
                            placeholder="Search products..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="mb-2 w-full"
                          />
                        )}

                        {products.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No results
                          </div>
                        ) : (
                          products.map((p) => (
                            <SelectItem
                              className="w-full"
                              key={p.id}
                              value={p.id.toString()}
                            >
                              {p.name} ({p.code})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                    <div className="mt-2 text-sm text-gray-600">
                      {selectedProduct?.stock ? (
                        <>
                          Current Stock: Gold{" "}
                          {selectedProduct.stock.quantity_gold}, Silver{" "}
                          {selectedProduct.stock.quantity_silver}, Copper{" "}
                          {selectedProduct.stock.quantity_copper}
                        </>
                      ) : (
                        <>
                          Current Stock: Gold {form.getValues("quantity_gold")},
                          Silver {form.getValues("quantity_silver")}, Copper{" "}
                          {form.getValues("quantity_copper")}
                        </>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gold */}
          <FormField
            control={form.control}
            name="quantity_gold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription>Quantity (Gold).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Silver */}
          <FormField
            control={form.control}
            name="quantity_silver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Silver</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription>Quantity (Silver).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Copper */}
          <FormField
            control={form.control}
            name="quantity_copper"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Copper</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription>Quantity (Copper).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={!!id ? false : !form.getValues("productId")}
        >
          {id ? "Update" : "Create"} Stock
        </Button>
      </form>
    </Form>
  );
}

export default SingleStockPage;
