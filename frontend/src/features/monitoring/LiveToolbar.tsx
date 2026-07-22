import { Filter, Grid3X3, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/common/Search";

export function LiveToolbar({
  query,
  onQuery,
  density,
  onDensity,
  criticalOnly,
  onCriticalOnly,
  onRefresh,
}: {
  query: string;
  onQuery: (query: string) => void;
  density: "comfortable" | "compact";
  onDensity: () => void;
  criticalOnly: boolean;
  onCriticalOnly: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <Search placeholder="Filter systems" value={query} onChange={onQuery} />
        <Button variant={density === "compact" ? "primary" : "secondary"} size="icon" aria-label="Grid density" onClick={onDensity}>
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button variant={criticalOnly ? "primary" : "secondary"} size="icon" aria-label="Filter" onClick={onCriticalOnly}>
          <Filter className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Refresh"
          onClick={() => {
            onRefresh();
            toast.success("Live monitoring grid refreshed");
          }}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
