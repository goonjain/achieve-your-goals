import { SatelliteDish, ShieldAlert } from "lucide-react";
import { Panel } from "./primitives";
import type { NavSnapshot } from "@/lib/nav/types";

function formatTime(ts: number | null) {
  if (!ts) return "--:--:--";
  return new Date(ts).toISOString().slice(11, 19);
}

export function GnssStatusCard({ snapshot }: { snapshot: NavSnapshot }) {
  const { frame, gnss } = snapshot;
  const outage = frame.outage_status.active;

  return (
    <Panel title="GNSS Status" bodyClassName="space-y-3">
      <div
        className={
          outage
            ? "rounded-md border-2 border-destructive bg-destructive/8 px-3 py-3"
            : "rounded-md border-2 border-success bg-success/8 px-3 py-3"
        }
      >
        <div className="flex items-center gap-2">
          {outage ? (
            <ShieldAlert className="size-5 text-destructive" />
          ) : (
            <SatelliteDish className="size-5 text-success" />
          )}
          <span
            className={
              outage
                ? "readout text-lg text-destructive"
                : "readout text-lg text-success"
            }
          >
            {outage ? "GNSS SIGNAL LOST" : "CONNECTED"}
          </span>
        </div>
        <p className="mt-1.5 text-xs font-semibold text-muted-foreground">
          {outage
            ? "Positioning maintained without satellite fix."
            : "Satellite fix nominal, fusion cross-checking IMU."}
        </p>
      </div>

      <div
        className={
          outage
            ? "rounded-md bg-warning px-3 py-2 text-center text-warning-foreground"
            : "rounded-md bg-primary px-3 py-2 text-center text-primary-foreground"
        }
      >
        <div className="font-mono text-[0.6rem] font-bold tracking-[0.16em] opacity-80">MODE</div>
        <div className="readout text-sm" style={{ color: "inherit" }}>
          {outage ? "GNSS-DENIED / DEAD RECKONING" : "NORMAL NAVIGATION"}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <Row label="Satellites" value={outage ? "0" : String(gnss.satellites)} danger={outage} />
        <Row
          label="GPS accuracy"
          value={outage ? "N/A" : `${gnss.accuracy.toFixed(1)} m`}
          danger={outage}
        />
        <Row label="Last GNSS fix" value={formatTime(gnss.last_fix_at)} />
        <Row
          label="Outage duration"
          value={`${frame.outage_status.duration_s.toFixed(1)} s`}
          danger={outage}
        />
      </dl>
    </Panel>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-panel px-2.5 py-2">
      <dt className="label-caps">{label}</dt>
      <dd className={danger ? "readout mt-0.5 text-sm text-destructive" : "readout mt-0.5 text-sm"}>
        {value}
      </dd>
    </div>
  );
}
