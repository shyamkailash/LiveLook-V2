import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <Outlet />
    </main>
  );
}
