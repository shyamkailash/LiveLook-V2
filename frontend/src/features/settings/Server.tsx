import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Server() {
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold">Server</h2></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Input defaultValue={import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"} />
        <Input defaultValue={import.meta.env.VITE_WS_TEACHER_URL ?? "ws://localhost:8000/ws/teacher"} />
      </CardContent>
    </Card>
  );
}
