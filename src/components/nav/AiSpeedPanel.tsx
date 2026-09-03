import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { DemoTag, Metric, Panel, StatusPill } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

export function AiSpeedPanel({ snapshot }: { snapshot: NavSnapshot }) {
  const ai = snapshot.ai;
  const data = snapshot.imu_history.slice(-140);
  const outage = snapshot.frame.outage_status.active;
  const outageStart = data.find((d) => d.gnss_speed === null)?.t;
  const outageEnd = data[data.length - 1]?.t;

  return (
    <Panel
      title="AI Speed Estimator"
      subtitle="Learned speed from IMU signatures — independent of satellite fix"
      right={
        <div className="flex items-center gap-2">
          <StatusPill status={ai.model_status} label="MODEL ACTIVE" />
          <DemoTag />
        </div>
      }
      bodyClassName="space-y-3"
    >
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Metric label="AI estimated speed" value={ai.estimated_speed.toFixed(1)} unit="km/h" />
        <Metric
          label="Estimated acceleration"
          value={`${ai.longitudinal_acceleration >= 0 ? "+" : ""}${ai.longitudinal_acceleration.toFixed(2)}`}
          unit="m/s²"
        />
        <Metric
          label="Speed confidence"
          value={`${Math.round(ai.speed_confidence * 100)}%`}
          tone="success"
        />
        <Metric label="Model status" value="ACTIVE" tone="success" />
      </div>

      <div className="rounded-md border border-border bg-panel p-2">
        <div className="label-caps mb-1 flex items-center justify-between px-1">
          <span>AI estimated speed vs GNSS reference speed</span>
          <span className="flex gap-2 font-mono text-[0.58rem]">
            <span className="text-track-fused">AI</span>
            <span className="text-track-gnss">GNSS ref</span>
          </span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="t" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" domain={[0, 110]} />
              {outage && outageStart !== undefined && outageEnd !== undefined ? (
                <ReferenceArea
                  x1={outageStart}
                  x2={outageEnd}
                  fill="var(--destructive)"
                  fillOpacity={0.07}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="ai_speed"
                stroke="var(--track-fused)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="gnss_speed"
                stroke="var(--track-gnss)"
                strokeWidth={1.6}
                strokeDasharray="4 3"
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-[0.68rem] font-medium text-muted-foreground">
        {outage
          ? "GNSS speed is unavailable and is NOT fed into the estimator during the outage — the AI speed trace continues from IMU signals alone."
          : "GNSS speed is shown as a reference for evaluation only; the estimator is driven by IMU signals."}
      </p>
    </Panel>
  );
}
