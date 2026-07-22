import { Camera, Expand, Lock, MessageSquareWarning, Power, X } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DevicePreview } from "@/features/monitoring/DevicePreview";
import { RiskBadge } from "@/features/monitoring/RiskBadge";
import type { MonitoringStudent } from "@/types/monitoring";

export function FullscreenView({
  student,
}: {
  student: MonitoringStudent | null;
}) {
  if (!student) {
    return (
      <Card className="flex h-full min-h-0 items-center justify-center p-8 text-center">
        <div>
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-selection text-accent">
            <Expand className="h-6 w-6" />
          </div>
          <h2 className="text-[22px] font-bold text-text">Device Inspector</h2>
          <p className="mt-2 text-[15px] text-muted">Select a device to inspect live activity and controls.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid h-full min-h-0 gap-6 overflow-hidden lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
      <section className="flex min-h-0 flex-col gap-6 overflow-y-auto pr-1">
        <div className="rounded-[20px] border border-border bg-surface/70 p-5 shadow-pro">
          <DevicePreview student={student} large />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="CPU" value={`${student.cpu}%`} />
          <Info label="Memory" value={`${student.ram}%`} />
          <Info label="Network" value={`${student.network} Mbps`} />
          <Info label="Risk Score" value={`${student.risk}%`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Button className="h-12 min-w-0" variant="secondary" onClick={() => toast.success(`Screenshot Taken: ${student.pcName}`)}>
            <Camera className="h-4 w-4 shrink-0" /><span className="truncate">Screenshot</span>
          </Button>
          <Button className="h-12 min-w-0" variant="secondary" onClick={() => toast.success(`Warning sent to ${student.name}`)}>
            <MessageSquareWarning className="h-4 w-4 shrink-0" /><span className="truncate">Warning</span>
          </Button>
          <Button className="h-12 min-w-0" variant="secondary" onClick={() => toast.success(`Device Locked: ${student.pcName}`)}>
            <Lock className="h-4 w-4 shrink-0" /><span className="truncate">Lock Device</span>
          </Button>
          <Button className="h-12 min-w-0" variant="danger" onClick={() => toast.error(`Monitoring ended for ${student.pcName}`)}>
            <Power className="h-4 w-4 shrink-0" /><span className="truncate">End Monitoring</span>
          </Button>
        </div>
      </section>

      <aside className="flex min-h-0 flex-col gap-6 overflow-y-auto pr-1">
        <PanelSection>
          <h2 className="text-[22px] font-bold">Device Information</h2>
          <dl className="mt-5 space-y-4 text-[16px]">
            <Row label="Student" value={student.name} />
            <Row label="Roll Number" value={student.rollNumber} />
            <Row label="Application" value={student.currentApp} />
            <Row label="Connection" value={student.connection} />
            <Row label="Last Seen" value={student.lastSeen} />
            <Row label="Agent Version" value="2.4.8" />
            <Row label="Operating System" value="Windows 11 Pro" />
            <Row label="IP Address" value={`192.168.1.${student.systemNumber.replace(/\D/g, "").slice(-2) || "24"}`} />
          </dl>
        </PanelSection>

        <PanelSection>
          <h2 className="text-[22px] font-bold">AI Activity</h2>
          <p className="mt-4 text-[16px] text-muted">{student.reason}</p>
          <div className="mt-5 space-y-4 text-[16px]">
            <Metric label="Mouse Activity" value={student.mouseActivity} />
            <Metric label="Keyboard Activity" value={student.keyboardActivity} />
            <Metric label="Risk Score" value={student.risk} />
            <Row label="Current Status" value={student.status} />
          </div>
        </PanelSection>

        <PanelSection>
          <h2 className="text-[22px] font-bold">Running Processes</h2>
          <div className="mt-5 max-h-[250px] overflow-y-auto overflow-x-hidden">
            <ProcessList processes={student.processes} />
          </div>
        </PanelSection>
      </aside>
    </div>
  );
}

export function FullscreenMonitorOverlay({
  student,
  onClose,
}: {
  student: MonitoringStudent | null;
  onClose: () => void;
}) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background p-6">
      <Card className="h-full overflow-hidden">
        <CardContent className="grid h-full grid-cols-[1fr_360px] gap-5 p-5">
          <section className="flex min-h-0 flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-muted">Fullscreen Live Device</p>
                <h1 className="text-[30px] font-bold text-text">{student.pcName} - {student.currentApp}</h1>
              </div>
              <div className="flex items-center gap-3">
                <RiskBadge level={student.riskLevel} score={student.risk} />
                <Button variant="secondary" size="icon" onClick={onClose} aria-label="Close fullscreen">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <DevicePreview student={student} fill />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Info label="CPU" value={`${student.cpu}%`} />
              <Info label="Memory" value={`${student.ram}%`} />
              <Info label="Risk" value={`${student.risk}%`} />
              <Info label="Network" value={`${student.network} Mbps`} />
            </div>
          </section>
          <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
            <PanelSection>
              <h2 className="text-[22px] font-bold">Device Information</h2>
              <dl className="mt-4 space-y-3 text-[15px]">
                <Row label="User" value={student.name} />
                <Row label="Roll Number" value={student.rollNumber} />
                <Row label="Application" value={student.currentApp} />
                <Row label="Connection" value={student.connection} />
                <Row label="Last Seen" value={student.lastSeen} />
              </dl>
            </PanelSection>
            <PanelSection>
              <h2 className="text-[22px] font-bold">AI Activity</h2>
              <p className="mt-3 text-[15px] text-muted">{student.reason}</p>
              <div className="mt-4 space-y-3">
                <Metric label="Mouse Activity" value={student.mouseActivity} />
                <Metric label="Keyboard Activity" value={student.keyboardActivity} />
              </div>
            </PanelSection>
            <PanelSection>
              <h2 className="text-[22px] font-bold">Running Processes</h2>
              <div className="mt-4 max-h-[220px] overflow-auto">
                <ProcessList processes={student.processes} />
              </div>
            </PanelSection>
            <PanelSection>
              <h2 className="text-[22px] font-bold">Teacher Controls</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Button className="h-12 w-full min-w-0" variant="secondary" onClick={() => toast.success(`Screenshot Taken: ${student.pcName}`)}>
                  <Camera className="h-4 w-4 shrink-0" /><span className="truncate">Screenshot</span>
                </Button>
                <Button className="h-12 w-full min-w-0" variant="secondary" onClick={() => toast.success(`Warning sent to ${student.name}`)}>
                  <MessageSquareWarning className="h-4 w-4 shrink-0" /><span className="truncate">Warning</span>
                </Button>
                <Button className="h-12 w-full min-w-0" variant="secondary" onClick={() => toast.success(`Device Locked: ${student.pcName}`)}>
                  <Lock className="h-4 w-4 shrink-0" /><span className="truncate">Lock Device</span>
                </Button>
                <Button className="h-12 w-full min-w-0" variant="danger" onClick={() => toast.error(`Monitoring ended for ${student.pcName}`)}>
                  <Power className="h-4 w-4 shrink-0" /><span className="truncate">End Session</span>
                </Button>
              </div>
            </PanelSection>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}

function PanelSection({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border bg-surface/70 p-6 shadow-pro">
      {children}
    </section>
  );
}

function ProcessList({ processes, className = "" }: { processes: string[]; className?: string }) {
  if (!processes.length) {
    return <p className={`rounded-lg border border-border px-3 py-3 text-[15px] text-muted ${className}`}>No process data available.</p>;
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-card/70 ${className}`}>
      {processes.map((process) => (
        <div key={process} className="flex min-h-12 items-center border-b border-divider px-3 py-3 text-[15px] font-medium text-text last:border-b-0">
          {process}
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[15px] text-muted">{label}</dt>
      <dd className="text-right font-semibold text-text">{value}</dd>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-surface/70 p-5 shadow-pro">
      <p className="text-[15px] text-muted">{label}</p>
      <p className="mt-2 text-[22px] font-bold text-text">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-muted">{label}</span>
        <span className="text-text">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
