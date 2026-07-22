import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSettingsStore } from "@/store/settingsStore";

export function Appearance() {
  const { compactDensity, setCompactDensity } = useSettingsStore();
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold">Appearance</h2></CardHeader>
      <CardContent>
        <label className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 text-sm">
          Compact density
          <input type="checkbox" checked={compactDensity} onChange={(event) => setCompactDensity(event.target.checked)} className="h-4 w-4 [accent-color:var(--color-accent)]" />
        </label>
      </CardContent>
    </Card>
  );
}
