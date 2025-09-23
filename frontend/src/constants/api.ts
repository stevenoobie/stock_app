const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_URLS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  USERS: `${API_BASE_URL}/users`,
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCTS_IMPORT: `${API_BASE_URL}/products/import`,
  PRODUCTS_TEMPLATE: `${API_BASE_URL}/products/template`,
  PRODUCTS_ALL_PAGINATED: `${API_BASE_URL}/products/all`,
  PRODUCTS_ALL_WITH_STOCK: `${API_BASE_URL}/products/all/stock`,
  STOCK: `${API_BASE_URL}/stock`,
  STOCK_ALL_PAGINATED: `${API_BASE_URL}/stock/all`,
  SALES: `${API_BASE_URL}/sales`,
  SALES_ALL_PAGINATED: `${API_BASE_URL}/sales/all`,
  EXPENSES: `${API_BASE_URL}/expenses`,
  EXPENSES_ALL_PAGINATED: `${API_BASE_URL}/expenses/all`,
};
