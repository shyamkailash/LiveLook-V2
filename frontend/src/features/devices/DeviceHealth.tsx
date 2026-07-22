import { Progress } from "@/components/ui/progress";
import type { Device } from "@/types/device";

export function DeviceHealth({ device }: { device: Device }) {
  return (
    <div className="space-y-3">
      <Metric label="CPU" value={device.cpu} />
      <Metric label="Memory" value={device.memory} />
      <Metric label="Storage" value={device.storage} />
      <Metric label="Health" value={device.health} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
