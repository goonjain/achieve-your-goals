import { Metric, Panel, DemoTag } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

export function PerformanceMetrics({ snapshot }: { snapshot: NavSnapshot }) {
  const m = snapshot.metrics;
  return (
    <Panel
      title="Performance Metrics"
      subtitle="Placeholder values from the demo run — replace with logged experiment results"
      right={<DemoTag />}
      bodyClassName="grid grid-cols-2 gap-2 md:grid-cols-3"
    >
      <Metric label="Final Position Error" value={m.final_position_error.toFixed(2)} unit="m" />
      <Metric label="RMSE" value={m.rmse.toFixed(2)} unit="m" />
      <Metric label="Drift" value={`${m.drift_percent.toFixed(2)}%`} hint="of distance travelled" />
      <Metric label="Maximum Error" value={m.max_error.toFixed(2)} unit="m" />
      <Metric label="Distance in Outage" value={m.outage_distance_m.toFixed(0)} unit="m" />
      <Metric label="Outage Duration" value={m.outage_duration_s.toFixed(1)} unit="s" />
    </Panel>
  );
}
