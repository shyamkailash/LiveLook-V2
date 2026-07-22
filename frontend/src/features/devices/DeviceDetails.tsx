import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { DeviceHealth } from "@/features/devices/DeviceHealth";
import type { Device } from "@/types/device";
import { Camera, Expand, MessageSquareWarning, PlugZap } from "lucide-react";
import { toast } from "sonner";

export function DeviceDetails({ device }: { device: Device }) {
  return (
    <Card>
      <CardContent>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{device.pcName}</h2>
            <p className="text-sm text-muted">{device.lab} - {device.os}</p>
          </div>
          <span className="flex items-center gap-2 text-sm text-muted">
            <StatusIndicator state={device.connection} />
            {device.connection}
          </span>
        </div>
        <DeviceHealth device={device} />
        <p className="mt-5 text-sm text-muted">Agent {device.agentVersion}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => toast.success(`Screenshot Taken: ${device.pcName}`)}>
            <Camera className="h-4 w-4" />Screenshot
          </Button>
          <Button variant="secondary" onClick={() => toast.success(`${device.pcName} opened in fullscreen`)}>
            <Expand className="h-4 w-4" />Fullscreen
          </Button>
          <Button variant="secondary" onClick={() => toast.success(`Warning sent to current user on ${device.pcName}`)}>
            <MessageSquareWarning className="h-4 w-4" />Warning
          </Button>
          <Button variant="danger" onClick={() => toast.error(`${device.pcName} disconnect command queued`)}>
            <PlugZap className="h-4 w-4" />Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
