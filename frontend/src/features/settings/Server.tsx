import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Server() {
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold">Server</h2></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Input defaultValue="http://localhost:8080/api" />
        <Input defaultValue="ws://localhost:8080/monitoring" />
      </CardContent>
    </Card>
  );
}
