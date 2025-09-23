import { DataTable } from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { API_URLS } from "@/constants/api";
import { useAlert } from "@/context/AlertContext";
import { useStockColumns } from "@/stock/columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

export default function StockPage() {
  const columns = useStockColumns();
  const { showAlert } = useAlert();
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState("");

  const [threshold, setThreshold] = useState(5);
  const [filterGold, setFilterGold] = useState(false);
  const [filterSilver, setFilterSilver] = useState(false);
  const [filterCopper, setFilterCopper] = useState(false);

  const token = localStorage.getItem("access_token");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);
  const { data, isLoading, isError } = useQuery<any>({
    queryKey: [
      "stock",
      pageIndex,
      debouncedSearch,
      threshold,
      filterGold,
      filterSilver,
      filterCopper,
    ],

    queryFn: async () => {
      const res = await axios.get(API_URLS.STOCK_ALL_PAGINATED, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          skip: pageIndex * 10,
          take: 10,
          search: debouncedSearch || undefined,
          threshold,
          gold: filterGold,
          silver: filterSilver,
          copper: filterCopper,
        },
      });
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) {
    showAlert("error", "Failed", "Failed to fetch stock");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock</h1>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          Show stock ≤
          <Input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(+e.target.value)}
            className="w-16"
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={filterGold}
            onChange={(e) => setFilterGold(e.target.checked)}
          />
          Gold
        </label>
        <label>
          <input
            type="checkbox"
            checked={filterSilver}
            onChange={(e) => setFilterSilver(e.target.checked)}
          />
          Silver
        </label>
        <label>
          <input
            type="checkbox"
            checked={filterCopper}
            onChange={(e) => setFilterCopper(e.target.checked)}
          />
          Copper
        </label>
      </div>
      <DataTable
        columns={columns}
        data={data.data ?? []}
        total={data?.total ?? 0}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
        search={search}
        onSearchChange={setSearch}
        createUrl="/admin/stock/new"
      />
    </div>
  );
}
