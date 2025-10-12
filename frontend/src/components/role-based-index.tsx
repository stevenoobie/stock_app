import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function RoleBasedIndex() {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  return isAdmin ? (
    <Navigate to="stats" replace />
  ) : (
    <Navigate to="sales" replace />
  );
}
