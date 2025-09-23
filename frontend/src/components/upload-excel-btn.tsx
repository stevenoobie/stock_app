import { API_URLS } from "@/constants/api";
import axios from "axios";

function ImportProductsButton() {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    await axios.post(API_URLS.PRODUCTS_IMPORT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Products imported!");
  };

  return <input type="file" accept=".xlsx" onChange={handleFileChange} />;
}
export default ImportProductsButton;
