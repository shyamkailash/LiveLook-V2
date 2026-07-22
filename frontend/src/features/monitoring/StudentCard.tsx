import { Camera, Lock, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/dialogs/Modal";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Tooltip } from "@/components/ui/tooltip";
import { DevicePreview } from "@/features/monitoring/DevicePreview";
import type { MonitoringStudent } from "@/types/monitoring";

export function StudentCard({
  student,
  onExpand,
  onSelect,
}: {
  student: MonitoringStudent;
  onExpand: (student: MonitoringStudent) => void;
  onSelect: (student: MonitoringStudent) => void;
}) {
  const clickTimer = useRef<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [screenshotOpen, setScreenshotOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState({
    title: "Teacher Notice",
    message: `Please return focus to ${student.currentApp}.`,
  });

  useEffect(() => {
    if (!contextMenu) return;
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [contextMenu]);

  useEffect(() => {
    return () => {
      if (clickTimer.current) window.clearTimeout(clickTimer.current);
    };
  }, []);

  function openDetails() {
    onSelect(student);
  }

  function openFullscreen() {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    onExpand(student);
  }

  function handleCardClick() {
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      openDetails();
      clickTimer.current = null;
    }, 180);
  }

  function captureScreenshot() {
    setScreenshotOpen(true);
    toast.success("Screenshot captured.");
  }

  function sendMessage() {
    setMessageOpen(false);
    toast.success("Message Sent");
  }

  function lockDevice() {
    setLockOpen(false);
    toast.success("Device locked successfully.");
  }

  function copyDeviceId() {
    void navigator.clipboard?.writeText(student.id);
    toast.success("Device ID copied");
  }

  function runContextAction(action: () => void) {
    setContextMenu(null);
    action();
  }

  function stopAction(event: React.MouseEvent) {
    event.stopPropagation();
  }

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div
          className="h-full cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onDoubleClick={openFullscreen}
          onContextMenu={(event) => {
            event.preventDefault();
            setContextMenu({ x: event.clientX, y: event.clientY });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") openDetails();
          }}
        >
          <Card className="monitor-card group h-full overflow-hidden">
            <div className="px-4 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Live desktop stream</span>
                <span>{student.connection === "offline" ? "offline" : student.frame ? "live" : "waiting"}</span>
              </div>
              <DevicePreview student={student} />
            </div>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[16px] font-bold text-text">{student.pcName}</h3>
                  <p className="mt-1 text-[13px] text-muted">Device ID {student.systemNumber}</p>
                </div>
                <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-[13px] font-medium text-white/85">
                  Risk {student.risk}
                </span>
              </div>

              <div className="space-y-2 text-[14px] text-muted">
                <p className="truncate"><span className="text-text">Student</span> {student.name}</p>
                <p className="truncate"><span className="text-text">Application</span> {student.currentApp}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-[14px] text-muted">
                  <span className="flex items-center gap-2">
                    <StatusIndicator state={student.connection} />
                    {student.connection}
                  </span>
                  <span>CPU <b className="font-medium text-text">{student.cpu}%</b></span>
                  <span>RAM <b className="font-medium text-text">{student.ram}%</b></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-white/35" style={{ width: `${Math.min(student.cpu, 100)}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 transition duration-200 group-hover:opacity-100" onClick={stopAction}>
                <Tooltip label="Capture screenshot">
                  <Button variant="ghost" size="icon" onClick={captureScreenshot}>
                    <Camera className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip label="Message student">
                  <Button variant="ghost" size="icon" onClick={() => setMessageOpen(true)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip label="Lock device">
                  <Button variant="ghost" size="icon" onClick={() => setLockOpen(true)}>
                    <Lock className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {contextMenu ? (
        <div
          className="fixed z-[70] w-52 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-pro"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <ContextAction label="Open Details" onClick={() => runContextAction(openDetails)} />
          <ContextAction label="Screenshot" onClick={() => runContextAction(captureScreenshot)} />
          <ContextAction label="Lock Device" onClick={() => runContextAction(() => setLockOpen(true))} />
          <ContextAction label="Message" onClick={() => runContextAction(() => setMessageOpen(true))} />
          <ContextAction label="Copy Device ID" onClick={() => runContextAction(copyDeviceId)} />
        </div>
      ) : null}

      <Modal open={screenshotOpen} title="Screenshot Preview" onClose={() => setScreenshotOpen(false)} className="max-w-3xl">
        <div className="p-5">
          <DevicePreview student={student} large />
          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>{student.pcName}</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </Modal>

      <Modal open={messageOpen} title="Teacher Message" onClose={() => setMessageOpen(false)} className="max-w-lg">
        <div className="space-y-4 p-5">
          <Input value={messageDraft.title} onChange={(event) => setMessageDraft((current) => ({ ...current, title: event.target.value }))} />
          <textarea
            value={messageDraft.message}
            onChange={(event) => setMessageDraft((current) => ({ ...current, message: event.target.value }))}
            className="min-h-32 w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-[15px] text-text shadow-inset outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/20"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setMessageOpen(false)}>Cancel</Button>
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </Modal>

      <Modal open={lockOpen} title="Lock Device" onClose={() => setLockOpen(false)} className="max-w-md">
        <div className="space-y-5 p-5">
          <p className="text-[15px] text-muted">Confirm lock command for <span className="font-semibold text-text">{student.pcName}</span>.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setLockOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={lockDevice}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function ContextAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="block w-full rounded-md px-3 py-2 text-left text-sm text-text transition hover:bg-hover"
      onClick={() => {
        onClick();
      }}
    >
      {label}
    </button>
  );
}
