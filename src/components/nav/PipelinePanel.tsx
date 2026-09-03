import { ChevronDown } from "lucide-react";
import { Panel, StatusPill } from "./primitives";
import type { NavSnapshot, PipelineStageId } from "@/lib/nav/types";

const STAGES: { id: PipelineStageId; label: string; detail: string }[] = [
  { id: "sensors", label: "IMU + GNSS", detail: "Accel · gyro · mag · satellite fix" },
  { id: "preprocessing", label: "Preprocessing & Calibration", detail: "Bias / scale-factor correction" },
  { id: "ai_motion", label: "AI Motion / Speed Estimation", detail: "Learned speed from IMU signature" },
  { id: "integrity", label: "GNSS Integrity Detection", detail: "Outage & spoof/degradation check" },
  { id: "ekf", label: "Adaptive Error-State EKF", detail: "State + error covariance propagation" },
  { id: "map_matching", label: "Map Matching + NHC", detail: "Offline OSM roads · non-holonomic constraints" },
  { id: "position", label: "Continuous Position", detail: "Seamless lat/lon output at 10 Hz" },
  { id: "confidence", label: "Confidence / Uncertainty", detail: "Position confidence estimate" },
];

export function PipelinePanel({ snapshot }: { snapshot: NavSnapshot }) {
  const active = new Set(snapshot.active_stages);
  const outage = snapshot.frame.outage_status.active;
  const highlighted = new Set<PipelineStageId>(
    outage ? ["ai_motion", "ekf", "map_matching", "sensors"] : [],
  );

  return (
    <Panel title="System Pipeline" subtitle="Navigation engine module chain" bodyClassName="space-y-0">
      {STAGES.map((s, i) => {
        const isActive = active.has(s.id);
        return (
          <div key={s.id}>
            <div
              className={[
                "flex items-center justify-between gap-3 rounded-md border-2 px-3 py-2",
                highlighted.has(s.id)
                  ? "border-warning bg-warning/10"
                  : isActive
                    ? "border-border bg-panel"
                    : "border-dashed border-border bg-muted/40",
              ].join(" ")}
            >
              <div>
                <div className="readout text-[0.72rem]">{s.label}</div>
                <div className="text-[0.66rem] font-medium text-muted-foreground">{s.detail}</div>
              </div>
              <StatusPill status={isActive ? "active" : "idle"} />
            </div>
            {i < STAGES.length - 1 ? (
              <div className="flex justify-center py-0.5">
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </div>
            ) : null}
          </div>
        );
      })}
    </Panel>
  );
}
