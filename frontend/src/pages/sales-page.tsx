import { DataTable } from "@/components/data-table";
import { API_URLS } from "@/constants/api";
import { useAlert } from "@/context/AlertContext";
import { useSaleColumns } from "@/sales/columns"; // <-- import your sales columns
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

export default function SalesPage() {
  const columns = useSaleColumns();
  const { showAlert } = useAlert();
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState("");

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
    queryKey: ["sales", pageIndex, debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(API_URLS.SALES_ALL_PAGINATED, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          skip: pageIndex * 10,
          take: 10,
          search: debouncedSearch || undefined,
        },
      });
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) {
    showAlert("error", "Failed", "Failed to fetch sales");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales</h1>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
        search={search}
        onSearchChange={setSearch}
        createUrl="/admin/sales/new"
      />
    </div>
  );
}
