import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, DemoTag } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

export function TrajectoryAnalysis({ snapshot }: { snapshot: NavSnapshot }) {
  const data = snapshot.error_history.slice(-200).map((d) => ({ ...d, reference: 0 }));

  return (
    <Panel
      title="Trajectory Analysis"
      subtitle="Deviation of each solution from the reference / ground-truth track"
      right={<DemoTag />}
      bodyClassName="h-[320px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="var(--muted-foreground)"
            label={{ value: "deviation (m)", angle: -90, position: "insideLeft", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
          <ReferenceLine y={0} stroke="var(--track-truth)" strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="reference"
            name="Ground truth / reference"
            stroke="var(--track-truth)"
            strokeWidth={1}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="gnss"
            name="GNSS"
            stroke="var(--track-gnss)"
            strokeWidth={1.6}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="raw_dr"
            name="Raw dead reckoning"
            stroke="var(--track-raw)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="ekf"
            name="AI + EKF"
            stroke="var(--chart-4)"
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="map_matched"
            name="AI + EKF + map matching"
            stroke="var(--track-fused)"
            strokeWidth={2.4}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  );
}
