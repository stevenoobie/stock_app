import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { API_URLS } from "@/constants/api";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { useProductColumns } from "@/products/columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProductsPage() {
  const columns = useProductColumns();
  const { showAlert } = useAlert();
  const [pageIndex, setPageIndex] = useState(0);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const token = localStorage.getItem("access_token");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const { isAdmin } = useAuth();

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
    queryKey: ["products", pageIndex, debouncedSearch],

    queryFn: async () => {
      const res = await axios.get(API_URLS.PRODUCTS_ALL_PAGINATED, {
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

  if (isLoading) return;
  if (isError) {
    showAlert("error", "Failed", "Failed to fetch products");
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(API_URLS.PRODUCTS_IMPORT, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      showAlert("success", "Success", "Products imported successfully");
      navigate("/admin/products", { replace: true });
    } catch (err: any) {
      showAlert(
        "error",
        "Error",
        err?.response?.data?.message || "Failed to import products"
      );
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(`${API_URLS.PRODUCTS_TEMPLATE}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_template.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {isAdmin ? (
        <div className="flex items-center gap-3">
          {/* Upload Excel */}
          <label className=" rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90  cursor-pointer">
            Upload Template
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          {/* Download Template */}
          <Button type="button" onClick={handleDownloadTemplate}>
            Download Template
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={data.data ?? []}
        total={data?.total ?? 0}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
        search={search}
        onSearchChange={setSearch}
        createUrl="/admin/products/new"
        allowCreate={isAdmin}
      />
    </div>
  );
}
