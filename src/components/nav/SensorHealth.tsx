import { Panel, StatusPill } from "./primitives";
import type { NavSnapshot, ModuleStatus } from "@/lib/nav/types";

const ROWS: { key: keyof NavSnapshot["frame"]["sensor_status"]; label: string }[] = [
  { key: "accelerometer", label: "Accelerometer" },
  { key: "gyroscope", label: "Gyroscope" },
  { key: "magnetometer", label: "Magnetometer" },
  { key: "gnss", label: "GNSS" },
  { key: "ai_speed_estimator", label: "AI Speed Estimator" },
  { key: "error_state_ekf", label: "Error-State EKF" },
  { key: "map_matcher", label: "Map Matcher" },
];

export function SensorHealth({ snapshot }: { snapshot: NavSnapshot }) {
  const status = snapshot.frame.sensor_status;
  return (
    <Panel title="Sensor Health" bodyClassName="divide-y divide-border py-0">
      {ROWS.map((row) => (
        <div key={row.key} className="flex items-center justify-between py-2">
          <span className="text-xs font-bold text-foreground">{row.label}</span>
          <StatusPill status={status[row.key] as ModuleStatus} />
        </div>
      ))}
    </Panel>
  );
}
