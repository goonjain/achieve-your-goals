import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DemoTag, Metric, Panel } from "./primitives";
import type { ImuSample, NavSnapshot } from "@/lib/nav/types";

function Chart({
  data,
  series,
  domain,
}: {
  data: ImuSample[];
  series: { key: keyof ImuSample; color: string; label: string }[];
  domain: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="t" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" domain={domain} />
        {series.map((s) => (
          <Line
            key={String(s.key)}
            type="monotone"
            dataKey={s.key as string}
            name={s.label}
            stroke={s.color}
            strokeWidth={1.6}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ImuSignalsPanel({ snapshot }: { snapshot: NavSnapshot }) {
  const data = snapshot.imu_history.slice(-140);
  const latest = data[data.length - 1];

  return (
    <Panel
      title="Live IMU Signals"
      subtitle="Smartphone accelerometer & gyroscope stream at 10 Hz"
      right={<DemoTag />}
      bodyClassName="space-y-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric
          label="Acceleration magnitude"
          value={(latest?.accel_mag ?? 0).toFixed(2)}
          unit="m/s²"
        />
        <Metric
          label="Angular velocity magnitude"
          value={(latest?.gyro_mag ?? 0).toFixed(3)}
          unit="rad/s"
        />
      </div>

      <div className="rounded-md border border-border bg-panel p-2">
        <div className="label-caps mb-1 flex items-center justify-between px-1">
          <span>Accelerometer X / Y / Z</span>
          <span className="flex gap-2 font-mono text-[0.58rem]">
            <span className="text-track-raw">X</span>
            <span className="text-track-gnss">Y</span>
            <span className="text-track-fused">Z − g</span>
          </span>
        </div>
        <div className="h-32">
          <Chart
            data={data.map((d) => ({ ...d, az: Number((d.az - 9.81).toFixed(3)) }))}
            domain={[-6, 6]}
            series={[
              { key: "ax", color: "var(--track-raw)", label: "Accel X" },
              { key: "ay", color: "var(--track-gnss)", label: "Accel Y" },
              { key: "az", color: "var(--track-fused)", label: "Accel Z" },
            ]}
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-panel p-2">
        <div className="label-caps mb-1 flex items-center justify-between px-1">
          <span>Gyroscope X / Y / Z</span>
          <span className="flex gap-2 font-mono text-[0.58rem]">
            <span className="text-track-raw">X</span>
            <span className="text-track-gnss">Y</span>
            <span className="text-track-fused">Z</span>
          </span>
        </div>
        <div className="h-32">
          <Chart
            data={data}
            domain={[-0.5, 0.5]}
            series={[
              { key: "gx", color: "var(--track-raw)", label: "Gyro X" },
              { key: "gy", color: "var(--track-gnss)", label: "Gyro Y" },
              { key: "gz", color: "var(--track-fused)", label: "Gyro Z" },
            ]}
          />
        </div>
      </div>

      <p className="text-[0.68rem] font-medium text-muted-foreground">
        Simulated stream. The data layer is shaped for real smartphone IMU samples, so these charts
        will render live sensor output unchanged once the device feed is connected.
      </p>
    </Panel>
  );
}
