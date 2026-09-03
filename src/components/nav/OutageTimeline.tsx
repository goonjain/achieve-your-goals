import { Check, CircleDot } from "lucide-react";
import { Panel } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

export function OutageTimeline({ snapshot }: { snapshot: NavSnapshot }) {
  const o = snapshot.frame.outage_status;
  const stage = o.active ? 2 : o.recovered_at ? 3 : 0;

  const steps = [
    { title: "GNSS AVAILABLE", detail: "Satellite fix aiding the filter" },
    { title: "GNSS OUTAGE DETECTED", detail: "Integrity monitor flags signal loss" },
    { title: "DEAD RECKONING", detail: "AI + IMU + EKF + map matching" },
    { title: "GNSS RECOVERED", detail: "Fusion re-anchored, drift reset" },
  ];

  return (
    <Panel title="GNSS Outage Timeline" bodyClassName="space-y-3">
      <ol className="grid gap-2 md:grid-cols-4">
        {steps.map((s, i) => {
          const current = o.active ? 2 : stage;
          const isCurrent = i === current;
          const done = i < current;
          return (
            <li
              key={s.title}
              className={[
                "rounded-md border-2 px-3 py-2.5",
                isCurrent
                  ? o.active
                    ? "border-warning bg-warning/10"
                    : "border-primary bg-primary/8"
                  : done
                    ? "border-success/50 bg-success/6"
                    : "border-border bg-panel",
              ].join(" ")}
            >
              <div className="flex items-center gap-1.5">
                {done ? (
                  <Check className="size-3.5 text-success" />
                ) : (
                  <CircleDot
                    className={
                      isCurrent
                        ? o.active
                          ? "size-3.5 animate-pulse text-warning"
                          : "size-3.5 text-primary"
                        : "size-3.5 text-muted-foreground"
                    }
                  />
                )}
                <span className="readout text-[0.72rem]">{s.title}</span>
              </div>
              <p className="mt-1 text-[0.68rem] font-medium text-muted-foreground">{s.detail}</p>
            </li>
          );
        })}
      </ol>

      <div
        className={
          o.active
            ? "rounded-md border-2 border-warning bg-warning/12 px-4 py-3 text-center"
            : "rounded-md border border-border bg-panel px-4 py-3 text-center"
        }
      >
        <div className="readout text-sm md:text-base">
          {o.active
            ? "AI + IMU + EKF + MAP MATCHING ACTIVE"
            : "GNSS-AIDED FUSION — DEAD RECKONING ON STANDBY"}
        </div>
        <div className="mt-1 font-mono text-[0.68rem] font-bold text-muted-foreground">
          OUTAGE ELAPSED {o.duration_s.toFixed(1)} s · DISTANCE COVERED WITHOUT GNSS{" "}
          {o.distance_m.toFixed(0)} m
        </div>
      </div>
    </Panel>
  );
}
