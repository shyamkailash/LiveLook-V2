import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Modal } from "@/components/dialogs/Modal";
import { FullscreenMonitorOverlay, FullscreenView } from "@/features/monitoring/FullscreenView";
import { LiveToolbar } from "@/features/monitoring/LiveToolbar";
import { RiskBadge } from "@/features/monitoring/RiskBadge";
import { StudentCard } from "@/features/monitoring/StudentCard";
import { useMonitoring } from "@/hooks/useMonitoring";

export function MonitoringGrid() {
  const { data, isLoading, refetch } = useMonitoring();
  const [query, setQuery] = useState("");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [detailsKey, setDetailsKey] = useState<string | null>(null);
  const [fullscreenKey, setFullscreenKey] = useState<string | null>(null);

  const students = useMemo(() => {
    const normalized = query.toLowerCase();
    return (data ?? []).filter((student) => {
      const matchesQuery = [student.name, student.pcName, student.rollNumber, student.currentApp].join(" ").toLowerCase().includes(normalized);
      const matchesRisk = !criticalOnly || student.riskLevel === "critical" || student.riskLevel === "high";
      return matchesQuery && matchesRisk;
    });
  }, [criticalOnly, data, query]);
  const detailsStudent = (data ?? []).find((student) => student.id === detailsKey) ?? null;
  const fullscreenStudent = (data ?? []).find((student) => student.id === fullscreenKey) ?? null;

  if (isLoading) return null;

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
            <StudentCard
              key={student.id}
              student={student}
              onExpand={(selected) => setFullscreenKey(selected.id)}
              onSelect={(selected) => setDetailsKey(selected.id)}
            />
          ))}
          {!students.length ? (
            <div className="col-span-full grid min-h-64 place-items-center rounded-[20px] border border-dashed border-border bg-surface/40 p-8 text-center text-muted">
              <div>
                <p className="text-lg font-semibold text-text">Waiting for Student Agents</p>
                <p className="mt-2 text-sm">Connected students will appear here automatically.</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Modal
        open={Boolean(detailsStudent)}
        title={detailsStudent ? detailsStudent.pcName : "Device Details"}
        onClose={() => setDetailsKey(null)}
        headerAction={detailsStudent ? <RiskBadge level={detailsStudent.riskLevel} score={detailsStudent.risk} /> : null}
        className="h-[90vh] w-[90vw] max-w-[1500px] overflow-hidden rounded-[20px]"
      >
        <div className="h-[calc(90vh-86px)] overflow-hidden p-6">
          <FullscreenView student={detailsStudent} />
        </div>
      </Modal>
      <FullscreenMonitorOverlay student={fullscreenStudent} onClose={() => setFullscreenKey(null)} />
    </div>
  );
}
