import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { colors } from "@/constants/colors";
import type { UsagePoint } from "@/types/analytics";

export function UsageChart({ data }: { data: UsagePoint[] }) {
  return (
    <ChartPanel title="CPU and Memory by Lab">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#333333" vertical={false} />
            <XAxis dataKey="label" stroke={colors.muted} />
            <YAxis stroke={colors.muted} />
            <Bar dataKey="cpu" fill={colors.accent} radius={[6, 6, 0, 0]} />
            <Bar dataKey="memory" fill={colors.success} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}
