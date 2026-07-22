import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  onClick,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  onClick?: () => void;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}) {
  const content = (
    <CardContent>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-text">{value}</p>
        </div>
        <Badge tone={tone}>
          <Icon className="h-3.5 w-3.5" />
        </Badge>
      </div>
      <p className="mt-4 text-sm text-muted">{helper}</p>
    </CardContent>
  );

  if (onClick) {
    return (
      <button className="block w-full text-left" onClick={onClick}>
        <Card className="metric-shift h-full cursor-pointer">{content}</Card>
      </button>
    );
  }

  return (
    <Card className="metric-shift">
      {content}
    </Card>
  );
}
