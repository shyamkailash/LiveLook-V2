import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { exportReport } from "@/services/reports.service";

export function ExportReport() {
  async function handleExport(format: "pdf" | "csv" | "xlsx") {
    const result = await exportReport(format);
    if (result.ok) {
      toast.success(`${format.toUpperCase()} report queued`);
      return;
    }

    toast.error("Report backend is not connected");
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Export Report</h2>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {(["pdf", "csv", "xlsx"] as const).map((format) => (
          <Button key={format} variant="secondary" onClick={() => handleExport(format)}>
            <Download className="h-4 w-4" />
            {format.toUpperCase()}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
