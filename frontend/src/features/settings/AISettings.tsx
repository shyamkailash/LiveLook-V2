import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSettingsStore } from "@/store/settingsStore";

export function AISettings() {
  const { aiSensitivity, setAiSensitivity } = useSettingsStore();
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold">AI</h2></CardHeader>
      <CardContent className="space-y-3">
        <input
          type="range"
          min={0}
          max={100}
          value={aiSensitivity}
          onChange={(event) => setAiSensitivity(Number(event.target.value))}
          className="w-full [accent-color:var(--color-accent)]"
        />
        <Progress value={aiSensitivity} />
        <p className="text-sm text-muted">Sensitivity {aiSensitivity}%</p>
      </CardContent>
    </Card>
  );
}
