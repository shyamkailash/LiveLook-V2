import { Navigate, Outlet } from "react-router-dom";
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen";
import { routes } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export function PublicRoute() {
  const { loading, user } = useAuth();
  if (loading) return <AppLoadingScreen exiting={false} />;
  return user ? <Navigate to={routes.dashboard} replace /> : <Outlet />;
}
