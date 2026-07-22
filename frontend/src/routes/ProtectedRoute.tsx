import { Navigate, Outlet } from "react-router-dom";
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen";
import { routes } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return <AppLoadingScreen exiting={false} />;
  return user ? (children ?? <Outlet />) : <Navigate to={routes.login} replace />;
}
