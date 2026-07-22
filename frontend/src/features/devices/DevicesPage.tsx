import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/common/SectionHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { DeviceDetails } from "@/features/devices/DeviceDetails";
import { getDevices } from "@/services/device";
import { getStudents } from "@/services/monitoring";

export function DevicesPage() {
  const { data = [] } = useQuery({ queryKey: ["devices"], queryFn: getDevices, refetchInterval: 5000 });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: getStudents, refetchInterval: 5000 });
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const studentByPc = new Map(students.map((student) => [student.pcName, student]));
  const selectedDevice = data.find((device) => device.id === selectedDeviceId) ?? data[0];

  return (
    <div>
      <SectionHeader eyebrow="Devices" title="Windows Agent Fleet" />
      <div className="grid grid-cols-[1fr_360px] gap-5">
        <div className="space-y-5">
          <DataTable headers={["Computer", "Lab", "Department", "Current User", "Application", "Status", "CPU", "Memory", "Connection", "Agent", "Last Seen"]}>
            {!data.length ? (
              <tr>
                <td colSpan={11} className="px-5 py-10 text-center text-muted">
                  No connected Windows agents yet.
                </td>
              </tr>
            ) : null}
            {data.map((device) => (
              <tr
                key={device.id}
                className={selectedDevice?.id === device.id ? "cursor-pointer bg-selection hover:bg-selection" : "cursor-pointer hover:bg-hover"}
                onClick={() => setSelectedDeviceId(device.id)}
              >
                {(() => {
                  const student = studentByPc.get(device.pcName);
                  return (
                    <>
                <td className="px-4 py-3 font-medium">{device.pcName}</td>
                <td className="px-4 py-3 text-muted">{device.lab}</td>
                <td className="px-4 py-3 text-muted">{student?.department ?? "-"}</td>
                <td className="px-4 py-3 text-muted">{student?.name ?? "No active user"}</td>
                <td className="px-4 py-3 text-muted">{student?.currentApp ?? "No active session"}</td>
                <td className="px-4 py-3 text-muted">{student?.status ?? "idle"}</td>
                <td className="px-4 py-3 text-muted">{device.cpu}%</td>
                <td className="px-4 py-3 text-muted">{device.memory}%</td>
                <td className="px-4 py-3"><Badge tone={device.connection === "online" ? "success" : device.connection === "offline" ? "danger" : "warning"}>{device.connection}</Badge></td>
                <td className="px-4 py-3 text-muted">{device.agentVersion}</td>
                <td className="px-4 py-3 text-muted">{student?.lastSeen ?? "Unknown"}</td>
                    </>
                  );
                })()}
              </tr>
            ))}
          </DataTable>
        </div>
        <aside className="space-y-5">
          {selectedDevice ? <DeviceDetails device={selectedDevice} /> : null}
        </aside>
      </div>
    </div>
  );
}
