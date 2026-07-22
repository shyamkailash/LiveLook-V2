import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ExportReport } from "@/features/reports/ExportReport";
import { getReportSummary } from "@/services/reports.service";

export function Reports() {
  const { data } = useQuery({ queryKey: ["report-summary"], queryFn: getReportSummary });
  const summary = [
    `${data?.systemsReviewed ?? 0} systems reviewed`,
    `${data?.alertsGenerated ?? 0} alerts generated`,
    `${data?.criticalEvents ?? 0} critical events`,
    `${data?.screenshotsQueued ?? 0} screenshots queued`,
  ];

  return (
    <div>
      <SectionHeader eyebrow="Reports" title="Session Evidence Center" />
      <div className="grid grid-cols-[1fr_360px] gap-5">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold">Latest Session Summary</h2>
            <div className="mt-5 grid grid-cols-4 gap-4 text-sm">
              {summary.map((item) => (
                <div key={item} className="rounded-lg border border-border bg-secondary p-4 text-muted">{item}</div>
              ))}
            </div>
          </CardContent>
        </Card>
        <ExportReport />
      </div>
    </div>
  );
}
