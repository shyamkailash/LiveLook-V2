import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/constants/routes";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="grid min-h-[calc(100vh-160px)] place-items-center">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-border bg-surface text-muted">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="mt-6 text-[15px] font-semibold uppercase tracking-[0.22em] text-muted">404</p>
          <h1 className="mt-3 text-[30px] font-bold text-text">Page not found</h1>
          <p className="mx-auto mt-3 max-w-md text-[16px] text-muted">
            The requested console page is not available in AI SYSTEM MONITOR.
          </p>
          <div className="mt-7 flex justify-center gap-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate(routes.dashboard)}>
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
