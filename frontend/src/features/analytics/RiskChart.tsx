import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { colors } from "@/constants/colors";
import type { TrendPoint } from "@/types/analytics";

export function RiskChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartPanel title="Alert Trends">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#333333" vertical={false} />
            <XAxis dataKey="label" stroke={colors.muted} />
            <YAxis stroke={colors.muted} />
            <Line type="monotone" dataKey="critical" stroke={colors.danger} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="warning" stroke={colors.warning} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="low" stroke={colors.success} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}
