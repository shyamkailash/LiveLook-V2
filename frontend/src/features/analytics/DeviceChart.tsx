import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { chartColors } from "@/constants/colors";
import type { DistributionPoint } from "@/types/analytics";

export function DeviceChart({ data }: { data: DistributionPoint[] }) {
  return (
    <ChartPanel title="Risk Distribution">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={98} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.map((item) => (
          <span key={item.name} className="rounded-md bg-secondary px-3 py-2 text-sm text-muted">{item.name}: {item.value}</span>
        ))}
      </div>
    </ChartPanel>
  );
}
