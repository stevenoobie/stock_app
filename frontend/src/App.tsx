import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import { ProtectedRoute } from "./components/protected-route";
import { AuthProvider } from "./context/AuthContext";
import AdminPanel from "./pages/admin-panel";
import LoginPage from "./pages/login-page";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertProvider } from "./context/AlertContext";
import ProductsPage from "./pages/products-page";
import SingleProductPage from "./pages/single-product-page";
import StockPage from "./pages/stock-page";
import SingleStockPage from "./pages/single-stock-page";
import SalesPage from "./pages/sales-page";
import SaleForm from "./sales/sale-form";
import StatsPage from "./pages/stats-page";
import ExpensesPage from "./pages/expenses-page";
import ExpenseForm from "./expenses/expense-form";
import UnauthorizedPage from "./pages/unauthorized-page";
import { AdminRoute } from "./components/admin-route";
import { RoleBasedIndex } from "./components/role-based-index";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AlertProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route index element={<LoginPage />} />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RoleBasedIndex />} />
                <Route path="products" element={<ProductsPage />} />

                <Route
                  path="products/new"
                  element={
                    <AdminRoute>
                      <SingleProductPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="products/:id"
                  element={
                    <AdminRoute>
                      <SingleProductPage />
                    </AdminRoute>
                  }
                />

                <Route path="sales" element={<SalesPage />} />

                <Route path="sales/new" element={<SaleForm />} />
                <Route path="sales/:saleId" element={<SaleForm />} />

                <Route
                  path="stats/*"
                  element={
                    <AdminRoute>
                      <StatsPage />
                    </AdminRoute>
                  }
                />

                <Route
                  path="stock"
                  element={
                    <AdminRoute>
                      <StockPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="stock/new"
                  element={
                    <AdminRoute>
                      <SingleStockPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="stock/:id"
                  element={
                    <AdminRoute>
                      <SingleStockPage />
                    </AdminRoute>
                  }
                />

                <Route
                  path="expenses"
                  element={
                    <AdminRoute>
                      <ExpensesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="expenses/new"
                  element={
                    <AdminRoute>
                      <ExpenseForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="expenses/:id"
                  element={
                    <AdminRoute>
                      <ExpenseForm />
                    </AdminRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
