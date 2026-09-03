import { Metric, Panel, DemoTag } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

export function TelemetryGrid({ snapshot }: { snapshot: NavSnapshot }) {
  const f = snapshot.frame;
  const confidence = f.position_confidence;
  const outage = f.outage_status.active;

  return (
    <Panel
      title="Live Vehicle Telemetry"
      subtitle="Continuous state output of the fusion engine"
      right={<DemoTag />}
      bodyClassName="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6"
    >
      <Metric label="Speed" value={f.speed.toFixed(1)} unit="km/h" />
      <Metric label="Heading" value={`${f.heading.toFixed(1)}°`} />
      <Metric label="Latitude" value={f.latitude.toFixed(6)} unit="N" />
      <Metric label="Longitude" value={f.longitude.toFixed(6)} unit="E" />
      <Metric
        label="Position Confidence"
        value={`${Math.round(confidence * 100)}%`}
        tone={confidence > 0.85 ? "success" : confidence > 0.65 ? "warning" : "danger"}
        hint={outage ? "Decaying during outage" : "GNSS-aided"}
      />
      <Metric
        label="Position Error"
        value={f.position_error.toFixed(1)}
        unit="m"
        tone={f.position_error < 5 ? "success" : f.position_error < 12 ? "warning" : "danger"}
        hint="AI + EKF + map-matched"
      />
    </Panel>
  );
}
