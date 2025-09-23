import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { Role } from "@/types/Role";

interface DecodedToken {
  exp: number;
  id: number;
  role: string;
  username: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  login: (access: string, refresh?: string) => void;
  logout: () => void;
  getToken: () => string | null;
  user: DecodedToken | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (access && !isExpired(access)) {
      setToken(access);
      setUser(jwtDecode<DecodedToken>(access));
    }
    setLoading(false);
  }, []);

  const login = (access: string, refresh?: string) => {
    localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
    setToken(access);
    setUser(jwtDecode<DecodedToken>(access));
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
  };

  const getToken = () => token;

  const isAdmin = user?.role?.toLowerCase() === Role.Admin.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        login,
        logout,
        getToken,
        user,
        loading,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

function isExpired(token: string) {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
