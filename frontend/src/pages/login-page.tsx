import { LoginForm } from "@/components/login-form";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useAlert } from "@/context/AlertContext";
import { API_URLS } from "@/constants/api";

function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const { showAlert } = useAlert();

  const navigate = useNavigate();

  if (isLoggedIn) {
    return <Navigate to="/admin" replace />;
  }
  const handleLogin = async (username: string, password: string) => {
    const res = await fetch(API_URLS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json(); // parse response body
      if (data.access_token) {
        login(data.access_token, data.refresh_token);
        navigate("/admin", { replace: true });
        showAlert("success", "Welcome", "You have logged in successfully!");
      }
    } else {
      showAlert("error", "Login failed", "Invalid credentials");
    }
  };

  return (
    <div className="mt-20">
      <LoginForm onLogin={handleLogin}></LoginForm>
    </div>
  );
}
export default LoginPage;
