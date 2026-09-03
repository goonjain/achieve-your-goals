import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, DemoTag } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

export function ErrorChart({ snapshot }: { snapshot: NavSnapshot }) {
  const data = snapshot.error_history.slice(-160);
  const outageStart = data.find((d) => d.outage)?.t;
  const outageEndIdx = [...data].reverse().find((d) => d.outage)?.t;

  return (
    <Panel
      title="Position Error vs Time"
      subtitle="Drift grows on raw inertial dead reckoning; fusion + map matching contains it"
      right={<DemoTag />}
      bodyClassName="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="rawFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--track-raw)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--track-raw)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fusedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--track-fused)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--track-fused)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 10 }}
            stroke="var(--muted-foreground)"
            label={{ value: "t (s)", position: "insideBottomRight", fontSize: 10 }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="var(--muted-foreground)"
            label={{ value: "error (m)", angle: -90, position: "insideLeft", fontSize: 10 }}
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
          {outageStart !== undefined && outageEndIdx !== undefined ? (
            <ReferenceArea
              x1={outageStart}
              x2={outageEndIdx}
              fill="var(--destructive)"
              fillOpacity={0.08}
              label={{ value: "GNSS OUTAGE", fontSize: 10, fontWeight: 800 }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="gnss"
            name="GNSS available"
            stroke="var(--track-gnss)"
            strokeWidth={1.6}
            fill="none"
            connectNulls={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="raw_dr"
            name="Raw dead reckoning"
            stroke="var(--track-raw)"
            strokeWidth={2}
            fill="url(#rawFill)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="map_matched"
            name="AI + EKF + map matching"
            stroke="var(--track-fused)"
            strokeWidth={2.4}
            fill="url(#fusedFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
}
