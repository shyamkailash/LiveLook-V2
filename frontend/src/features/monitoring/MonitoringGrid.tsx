import { useMemo, useState } from "react";
import { Loader } from "@/components/common/Loader";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Modal } from "@/components/dialogs/Modal";
import { FullscreenMonitorOverlay, FullscreenView } from "@/features/monitoring/FullscreenView";
import { LiveToolbar } from "@/features/monitoring/LiveToolbar";
import { RiskBadge } from "@/features/monitoring/RiskBadge";
import { StudentCard } from "@/features/monitoring/StudentCard";
import { useMonitoring } from "@/hooks/useMonitoring";
import type { MonitoringStudent } from "@/types/monitoring";

export function MonitoringGrid() {
  const { data, isLoading, refetch } = useMonitoring();
  const [query, setQuery] = useState("");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [detailsStudent, setDetailsStudent] = useState<MonitoringStudent | null>(null);
  const [fullscreenStudent, setFullscreenStudent] = useState<MonitoringStudent | null>(null);

  const students = useMemo(() => {
    const normalized = query.toLowerCase();
    return (data ?? []).filter((student) => {
      const matchesQuery = [student.name, student.pcName, student.rollNumber, student.currentApp].join(" ").toLowerCase().includes(normalized);
      const matchesRisk = !criticalOnly || student.riskLevel === "critical" || student.riskLevel === "high";
      return matchesQuery && matchesRisk;
    });
  }, [criticalOnly, data, query]);

  if (isLoading) return <Loader />;

  return (
    <div className="flex h-[calc(100vh-112px)] min-h-0 flex-col">
      <SectionHeader eyebrow="Real-time classroom activity" title="Live Monitoring" />
      <div className="flex min-h-0 flex-1 flex-col">
        <LiveToolbar
          query={query}
          onQuery={setQuery}
          density={density}
          onDensity={() => setDensity((current) => (current === "comfortable" ? "compact" : "comfortable"))}
          criticalOnly={criticalOnly}
          onCriticalOnly={() => setCriticalOnly((current) => !current)}
          onRefresh={() => void refetch()}
        />
        <div
          className={
            density === "compact"
              ? "grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3 overflow-y-auto pr-1 transition-[grid-template-columns,gap] duration-200 ease-in-out"
              : "grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 overflow-y-auto pr-1 transition-[grid-template-columns,gap] duration-200 ease-in-out"
          }
        >
          {students.map((student) => (
            <StudentCard key={student.id} student={student} onExpand={setFullscreenStudent} onSelect={setDetailsStudent} />
          ))}
        </div>
      </div>
      <Modal
        open={Boolean(detailsStudent)}
        title={detailsStudent ? detailsStudent.pcName : "Device Details"}
        onClose={() => setDetailsStudent(null)}
        headerAction={detailsStudent ? <RiskBadge level={detailsStudent.riskLevel} score={detailsStudent.risk} /> : null}
        className="h-[90vh] w-[90vw] max-w-[1500px] overflow-hidden rounded-[20px]"
      >
        <div className="h-[calc(90vh-86px)] overflow-hidden p-6">
          <FullscreenView student={detailsStudent} />
        </div>
      </Modal>
      <FullscreenMonitorOverlay student={fullscreenStudent} onClose={() => setFullscreenStudent(null)} />
    </div>
  );
}
