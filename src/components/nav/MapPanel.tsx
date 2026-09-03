import { Suspense, lazy } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Panel, DemoTag } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

// Leaflet touches `window` at import time -> only load it in the browser.
const LeafletMap = lazy(() => import("./LeafletMap"));

const LEGEND = [
  { label: "GNSS trajectory", varName: "var(--track-gnss)", dashed: false },
  { label: "Raw dead reckoning", varName: "var(--track-raw)", dashed: true },
  { label: "AI + EKF + Map-Matched", varName: "var(--track-fused)", dashed: false },
  { label: "GNSS outage stretch", varName: "var(--destructive)", dashed: false },
];

export function MapPanel({ snapshot }: { snapshot: NavSnapshot }) {
  const outage = snapshot.frame.outage_status.active;

  return (
    <Panel
      title="Live Navigation Map"
      subtitle="Offline OpenStreetMap road network · vehicle map matching"
      right={<DemoTag />}
      className="min-h-[520px]"
      bodyClassName="relative p-0"
    >
      <div className="absolute inset-0">
        <ClientOnly
          fallback={
            <div className="flex h-full items-center justify-center text-xs font-bold text-muted-foreground">
              INITIALISING MAP ENGINE…
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-xs font-bold text-muted-foreground">
                LOADING ROAD NETWORK…
              </div>
            }
          >
            <LeafletMap snapshot={snapshot} />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="pointer-events-none absolute top-3 left-3 z-[500] space-y-2">
        <div className="panel px-3 py-2">
          <div className="label-caps mb-1.5">Trajectory layers</div>
          <ul className="space-y-1">
            {LEGEND.map((l) => (
              <li key={l.label} className="flex items-center gap-2">
                <span
                  className="h-0.5 w-6 rounded"
                  style={{
                    background: l.dashed
                      ? `repeating-linear-gradient(90deg, ${l.varName} 0 4px, transparent 4px 8px)`
                      : l.varName,
                    height: l.dashed ? "2px" : "3px",
                  }}
                />
                <span className="font-mono text-[0.65rem] font-bold text-foreground">
                  {l.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {outage ? (
          <div className="rounded-md border-2 border-destructive bg-card px-3 py-2">
            <div className="readout text-xs text-destructive">GNSS DENIED — OUTAGE ACTIVE</div>
            <div className="font-mono text-[0.65rem] font-bold text-foreground">
              AI + IMU + EKF + MAP MATCHING ACTIVE
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
