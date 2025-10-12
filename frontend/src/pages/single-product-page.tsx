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
import axios from "axios";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

function SingleProductPage() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { id } = useParams();
  const productSchema = z.object({
    name: z.string().min(2).max(50),
    code: z.string().min(1).max(20),
    price_gold: z.number().nonnegative(),
    price_silver: z.number().nonnegative(),
    price_copper: z.number().nonnegative(),
    weight_gold: z.number().nonnegative(),
    weight_silver: z.number().nonnegative(),
    weight_copper: z.number().nonnegative(),
    quantity_gold: z.number().int().nonnegative(),
    quantity_silver: z.number().int().nonnegative(),
    quantity_copper: z.number().int().nonnegative(),
  });
  type ProductFormValues = z.infer<typeof productSchema>;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      code: "",
      price_gold: 0,
      price_silver: 0,
      price_copper: 0,
      weight_gold: 0,
      weight_silver: 0,
      weight_copper: 0,
      quantity_gold: 0,
      quantity_silver: 0,
      quantity_copper: 0,
    },
  });

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${API_URLS.PRODUCTS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const product = res.data;
        form.reset({
          name: product.name,
          code: product.code,
          price_gold: product.gold?.price ?? 0,
          weight_gold: product.gold?.weight ?? 0,
          quantity_gold: product.gold?.quantity ?? 0,
          price_silver: product.silver?.price ?? 0,
          weight_silver: product.silver?.weight ?? 0,
          quantity_silver: product.silver?.quantity ?? 0,
          price_copper: product.copper?.price ?? 0,
          weight_copper: product.copper?.weight ?? 0,
          quantity_copper: product.copper?.quantity ?? 0,
        });
      } catch (err) {
        showAlert("error", "Failed", "Failed to load product data");
      }
    };

    fetchProduct();
  }, [id, form, showAlert]);

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      const formData = {
        name: data.name,
        code: data.code,
        gold: {
          price: data.price_gold,
          weight: data.weight_gold,
          quantity: data.quantity_gold,
        },
        silver: {
          price: data.price_silver,
          weight: data.weight_silver,
          quantity: data.quantity_silver,
        },
        copper: {
          price: data.price_copper,
          weight: data.weight_copper,
          quantity: data.quantity_copper,
        },
      };

      const token = localStorage.getItem("access_token");

      const url = id
        ? `${API_URLS.PRODUCTS}/${id}` // update
        : `${API_URLS.PRODUCTS}`; // create

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
          `Product was successfully ${id ? "updated" : "created"}!`
        );
        navigate("/admin/products", { replace: true });
      } else {
        showAlert("error", "Failed", "Product failed to save!");
      }
    } catch (err) {
      showAlert("error", "Failed", "Product failed to save!");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-row gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Horus Ring" {...field} />
                  </FormControl>
                  <FormDescription>This is the product name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="IA-1" {...field} />
                  </FormControl>
                  <FormDescription>This is the product code.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-6">
            {/* Gold */}
            <div className="flex flex-col gap-6">
              <h1>Gold</h1>
              <FormField
                control={form.control}
                name="price_gold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product price(Gold).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight_gold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight(gm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product weight(Gold).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity_gold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product quantity(Gold).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Silver */}
            <div className="flex flex-col gap-6">
              <h1>Silver</h1>
              <FormField
                control={form.control}
                name="price_silver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product price(Silver).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight_silver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight(gm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product weight(Silver).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity_silver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product quantity(Silver).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Copper */}
            <div className="flex flex-col gap-6">
              <h1>Copper</h1>
              <FormField
                control={form.control}
                name="price_copper"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product price(Copper).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight_copper"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight(gm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product weight(Copper).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity_copper"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the product quantity(Copper).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <Button type="submit">{id ? "Update" : "Create"} Product</Button>
      </form>
    </Form>
  );
}

export default SingleProductPage;
