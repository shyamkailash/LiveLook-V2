import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PublicRoute } from "@/routes/PublicRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { routes } from "@/constants/routes";
import { LoginPage } from "@/features/auth/LoginPage";
import { ForgotPassword } from "@/features/auth/ForgotPassword";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { MonitoringGrid } from "@/features/monitoring/MonitoringGrid";
import { DevicesPage } from "@/features/devices/DevicesPage";
import { Sessions } from "@/features/sessions/Sessions";
import { AlertsPage } from "@/features/alerts/AlertsPage";
import { Analytics } from "@/features/analytics/Analytics";
import { Reports } from "@/features/reports/Reports";
import { Settings } from "@/features/settings/Settings";
import { Profile } from "@/features/profile/Profile";
import { NotFound } from "@/features/not-found/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={routes.login} element={<LoginPage />} />
            <Route path={routes.signup} element={<LoginPage initialMode="signup" />} />
            <Route path={routes.forgotPassword} element={<ForgotPassword />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to={routes.login} replace />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={routes.dashboard} element={<Dashboard />} />
            <Route path={routes.monitoring} element={<MonitoringGrid />} />
            <Route path={routes.liveMonitoring} element={<MonitoringGrid />} />
            <Route path={routes.students} element={<MonitoringGrid />} />
            <Route path={routes.sessions} element={<Sessions />} />
            <Route path={routes.policies} element={<Sessions />} />
            <Route path={routes.events} element={<AlertsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path={routes.analytics} element={<Analytics />} />
            <Route path={routes.devices} element={<DevicesPage />} />
            <Route path={routes.reports} element={<Reports />} />
            <Route path={routes.settings} element={<Settings />} />
            <Route path={routes.profile} element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={routes.login} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
