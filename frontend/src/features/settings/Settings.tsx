import { useState } from "react";
import {
  Cpu,
  Info,
  Save,
  Server,
} from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/store/settingsStore";

type SettingsForm = {
  notifications: boolean;
  screenshotInterval: number;
  streamFps: number;
  imageQuality: number;
  aiSensitivity: number;
  autoRefresh: boolean;
  highlightSuspicious: boolean;
  apiUrl: string;
  websocketUrl: string;
  reconnectTimeout: number;
  heartbeatInterval: number;
};

const SETTINGS_KEY = "livelook-settings";

function getSavedSettings(): Partial<SettingsForm> {
  try {
    const saved = window.localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) as Partial<SettingsForm> : {};
  } catch {
    return {};
  }
}

export function Settings() {
  const { aiSensitivity, setAiSensitivity } = useSettingsStore();
  const saved = getSavedSettings();
  const [settings, setSettings] = useState<SettingsForm>({
    notifications: saved.notifications ?? true,
    screenshotInterval: saved.screenshotInterval ?? 30,
    streamFps: saved.streamFps ?? 24,
    imageQuality: saved.imageQuality ?? 82,
    aiSensitivity: saved.aiSensitivity ?? aiSensitivity,
    autoRefresh: saved.autoRefresh ?? true,
    highlightSuspicious: saved.highlightSuspicious ?? true,
    apiUrl: saved.apiUrl ?? "http://localhost:8080/api",
    websocketUrl: saved.websocketUrl ?? "ws://localhost:8080/monitoring",
    reconnectTimeout: saved.reconnectTimeout ?? 8,
    heartbeatInterval: saved.heartbeatInterval ?? 15,
  });

  function update<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setAiSensitivity(settings.aiSensitivity);
    toast.success("Settings Saved");
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Settings" title="Control Plane Configuration" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SettingsCard icon={Server} title="Server">
          <TextRow label="API URL" value={settings.apiUrl} onChange={(value) => update("apiUrl", value)} />
          <TextRow label="WebSocket URL" value={settings.websocketUrl} onChange={(value) => update("websocketUrl", value)} />
          <NumberRow label="Reconnect Timeout" suffix="sec" value={settings.reconnectTimeout} onChange={(value) => update("reconnectTimeout", value)} />
          <NumberRow label="Heartbeat Interval" suffix="sec" value={settings.heartbeatInterval} onChange={(value) => update("heartbeatInterval", value)} />
        </SettingsCard>
        <SettingsCard icon={Cpu} title="Monitoring">
          <NumberRow label="Screenshot Interval" suffix="sec" value={settings.screenshotInterval} onChange={(value) => update("screenshotInterval", value)} />
          <NumberRow label="Stream FPS" value={settings.streamFps} onChange={(value) => update("streamFps", value)} />
          <RangeRow label="Image Quality" value={settings.imageQuality} onChange={(value) => update("imageQuality", value)} />
          <RangeRow label="AI Detection Sensitivity" value={settings.aiSensitivity} onChange={(value) => update("aiSensitivity", value)} />
          <ToggleRow label="Auto Refresh" checked={settings.autoRefresh} onChange={(value) => update("autoRefresh", value)} />
          <ToggleRow label="Highlight Suspicious Devices" checked={settings.highlightSuspicious} onChange={(value) => update("highlightSuspicious", value)} />
          <ToggleRow label="Notifications" checked={settings.notifications} onChange={(value) => update("notifications", value)} />
        </SettingsCard>

        <SettingsCard icon={Info} title="About" className="xl:col-span-2">
          <div className="grid gap-3 md:grid-cols-4">
            <AboutItem label="Application Version" value="0.1.0" />
            <AboutItem label="Build Version" value="Vite 6" />
            <AboutItem label="Developer" value="LiveLook Systems" />
            <AboutItem label="License" value="Internal Use" />
          </div>
        </SettingsCard>
      </div>

      <div className="sticky bottom-0 flex justify-end border-t border-divider bg-background/85 py-4 backdrop-blur-xl">
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function SettingsCard({
  children,
  className,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  icon: typeof Server;
  title: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-3">
        <Badge tone="accent">
          <Icon className="h-3.5 w-3.5" />
        </Badge>
        <h2 className="text-lg font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function RowShell({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-4 rounded-lg bg-secondary px-4 py-3 text-sm">
      <span className="font-medium text-text">{label}</span>
      {children}
    </label>
  );
}

function TextRow({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div className="grid gap-2 rounded-lg bg-secondary p-3 text-sm">
      <span className="font-medium text-text">{label}</span>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function NumberRow({ label, suffix, value, onChange }: { label: string; suffix?: string; value: number; onChange: (value: number) => void }) {
  return (
    <RowShell label={label}>
      <div className="flex items-center gap-2">
        <Input className="w-24" min={0} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
        {suffix ? <span className="text-muted">{suffix}</span> : null}
      </div>
    </RowShell>
  );
}

function ToggleRow({ label, checked, onChange, icon: Icon }: { label: string; checked: boolean; onChange: (value: boolean) => void; icon?: typeof Server }) {
  return (
    <RowShell label={label}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-muted" /> : null}
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 [accent-color:var(--color-accent)]" />
      </div>
    </RowShell>
  );
}

function RangeRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="rounded-lg bg-secondary px-4 py-3 text-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="font-medium text-text">{label}</span>
        <span className="text-muted">{value}%</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full [accent-color:var(--color-accent)]" />
    </div>
  );
}

function AboutItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-semibold text-text">{value}</p>
    </div>
  );
}
