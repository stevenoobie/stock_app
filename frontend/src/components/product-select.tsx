import { useState } from "react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/Product";

interface ProductSelectProps {
  products: Product[];
  value?: number;
  disabled: boolean;
  onSelect: (product: Product | undefined) => void;
}

export default function ProductSelect({
  products,
  value,
  disabled,
  onSelect,
}: ProductSelectProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Select
      value={value ? value.toString() : undefined}
      disabled={disabled}
      onValueChange={(val) =>
        onSelect(val ? products.find((p) => p.id === parseInt(val)) : undefined)
      }
    >
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select a product" />
      </SelectTrigger>
      <SelectContent>
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        {filteredProducts.map((p) => (
          <SelectItem key={p.id} value={p.id.toString()}>
            {p.name} ({p.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
