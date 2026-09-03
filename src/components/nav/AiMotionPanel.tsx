import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Metric, Panel, DemoTag } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

export function AiMotionPanel({ snapshot }: { snapshot: NavSnapshot }) {
  const ai = snapshot.ai;
  const data = snapshot.imu_history.slice(-120);

  return (
    <Panel title="AI Motion Intelligence" right={<DemoTag />} bodyClassName="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        <Metric label="Vehicle State" value={ai.vehicle_state} />
        <Metric label="AI Estimated Speed" value={ai.estimated_speed.toFixed(1)} unit="km/h" />
        <Metric
          label="Est. Long. Accel"
          value={ai.longitudinal_acceleration.toFixed(2)}
          unit="m/s²"
        />
        <Metric
          label="Sensor Reliability"
          value={`${Math.round(ai.sensor_reliability * 100)}%`}
          tone={ai.sensor_reliability > 0.85 ? "success" : "warning"}
        />
        <Metric label="Vibration Level" value={ai.vibration_level} />
        <Metric label="Motion Class" value={ai.motion_classification} />
      </div>

      <div className="h-40 rounded-md border border-border bg-panel p-2">
        <div className="label-caps mb-1 px-1">IMU acceleration vs AI estimated speed</div>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
            <YAxis
              yAxisId="a"
              tick={{ fontSize: 10 }}
              stroke="var(--track-raw)"
              domain={[-4, 4]}
            />
            <YAxis
              yAxisId="b"
              orientation="right"
              tick={{ fontSize: 10 }}
              stroke="var(--track-fused)"
              domain={[0, 100]}
            />
            <Line
              yAxisId="a"
              type="monotone"
              dataKey="accel"
              stroke="var(--track-raw)"
              strokeWidth={1.6}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="b"
              type="monotone"
              dataKey="ai_speed"
              stroke="var(--track-fused)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
