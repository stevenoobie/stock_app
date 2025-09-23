import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PlusCircle, XCircle } from "lucide-react";
import ProductSelect from "@/components/product-select";
import { useState } from "react";
import type { Product } from "@/types/Product";

export type Row = {
  productId: number;
  productName: string;
  isFirst?: boolean;
  material?: "gold" | "silver" | "copper";
  quantity: number;
  price: number;
  discount: number;
};

interface SaleRowProps {
  row: Row;
  index: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange?: (index: number, field: keyof Row, value: any) => void;
  disabled: boolean;
  products: Product[];
}

export default function SaleRow(props: SaleRowProps) {
  const { row, index, onAdd, onRemove, onChange, disabled, products } = props;
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined
  );

  const handleProductSelect = (product: Product | undefined) => {
    setSelectedProduct(product);
    onChange?.(index, "productId", product?.id);
    onChange?.(index, "productName", product?.name || "");

    if (product) {
      // update price depending on current material
      switch (row.material) {
        case "gold":
          onChange?.(index, "price", product.gold.price);
          break;
        case "silver":
          onChange?.(index, "price", product.silver.price);
          break;
        case "copper":
          onChange?.(index, "price", product.copper.price);
          break;
        default:
          onChange?.(index, "price", 0);
      }
    }
  };

  const handleMaterialChange = (val: Row["material"] | undefined) => {
    onChange?.(index, "material", val);

    if (selectedProduct) {
      switch (val) {
        case "gold":
          onChange?.(index, "price", selectedProduct.gold.price);

          break;
        case "silver":
          onChange?.(index, "price", selectedProduct.silver.price);
          break;
        case "copper":
          onChange?.(index, "price", selectedProduct.copper.price);
          break;
        default:
          onChange?.(index, "price", 0);
      }
    }
  };

  return (
    <div className="flex items-end gap-2 border-b pb-2">
      {/* Product */}
      <div className="flex-1">
        <Label className="mb-3">Product</Label>
        <ProductSelect
          products={products}
          value={row.productId}
          disabled={disabled}
          onSelect={handleProductSelect}
        />
      </div>

      {/* Material */}
      <div>
        <Label className="mb-3">Material</Label>
        <Select
          value={row.material}
          disabled={disabled}
          onValueChange={(val) => handleMaterialChange(val as Row["material"])}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="copper">Copper</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quantity */}
      <div>
        <Label className="mb-3">Qty</Label>
        <Input
          type="number"
          value={row.quantity}
          disabled={disabled}
          onChange={(e) =>
            onChange?.(index, "quantity", Number(e.target.value))
          }
          className="w-20"
        />
      </div>

      {/* Price */}
      <div>
        <Label className="mb-3">Price</Label>
        <Input
          type="number"
          value={row.price}
          disabled={disabled}
          onChange={(e) => onChange?.(index, "price", Number(e.target.value))}
          className="w-24"
        />
      </div>

      {/* Discount */}
      <div>
        <Label className="mb-3">Discount %</Label>
        <Input
          type="number"
          value={row.discount}
          disabled={disabled}
          onChange={(e) =>
            onChange?.(index, "discount", Number(e.target.value))
          }
          className="w-24"
        />
      </div>

      {!disabled ? (
        row.isFirst ? (
          <Button type="button" variant="ghost" onClick={onAdd}>
            <PlusCircle className="w-6 h-6 text-green-600" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={() => onRemove(index)}>
            <XCircle className="w-6 h-6 text-red-600" />
          </Button>
        )
      ) : null}
    </div>
  );
}
