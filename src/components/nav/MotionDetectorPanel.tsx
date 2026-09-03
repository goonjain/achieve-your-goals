import { Activity, ArrowDown, Gauge, RotateCw, Waves } from "lucide-react";
import { DemoTag, Metric, Panel } from "./primitives";
import { cn } from "@/lib/utils";
import type { MotionState, NavSnapshot } from "@/lib/nav/types";

const STATE_TONE: Record<MotionState, string> = {
  STATIONARY: "text-muted-foreground",
  MOVING: "text-primary",
  ACCELERATING: "text-success",
  CRUISING: "text-success",
  BRAKING: "text-warning",
  TURNING: "text-track-gnss",
  BUMP: "text-destructive",
  "HIGH VIBRATION": "text-destructive",
};

const TIMELINE: MotionState[] = [
  "STATIONARY",
  "ACCELERATING",
  "CRUISING",
  "BRAKING",
  "TURNING",
];

const CHAIN = [
  "Raw IMU signal",
  "Noise / vibration analysis",
  "Motion detector",
  "Vehicle state",
  "AI speed estimator",
  "Navigation fusion",
];

export function MotionDetectorPanel({ snapshot }: { snapshot: NavSnapshot }) {
  const ai = snapshot.ai;
  const state = ai.vehicle_state;
  const tone = STATE_TONE[state];

  return (
    <Panel
      title="AI Motion Detector"
      subtitle="Classifies how vehicle motion should be interpreted by the fusion engine"
      right={<DemoTag />}
      bodyClassName="space-y-4"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="rounded-lg border-2 border-foreground bg-panel px-4 py-4">
          <div className="label-caps">Detected vehicle state</div>
          <div className="mt-2 flex items-center gap-2.5">
            <span
              className={cn(
                "size-4 shrink-0 animate-pulse rounded-full",
                state === "BUMP" || state === "HIGH VIBRATION"
                  ? "bg-destructive"
                  : state === "BRAKING"
                    ? "bg-warning"
                    : state === "STATIONARY"
                      ? "bg-muted-foreground"
                      : "bg-success",
              )}
            />
            <span className={cn("readout text-2xl leading-none md:text-3xl", tone)}>{state}</span>
          </div>
          <div className="mt-3">
            <div className="label-caps flex items-center justify-between">
              <span>Motion confidence</span>
              <span className="readout text-xs">{Math.round(ai.motion_confidence * 100)}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all duration-300"
                style={{ width: `${ai.motion_confidence * 100}%` }}
              />
            </div>
          </div>
          <p className="mt-3 text-[0.7rem] leading-snug font-medium text-muted-foreground">
            Motion classification helps determine how sensor measurements should be interpreted
            during navigation.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <Metric
            label="Longitudinal accel"
            value={`${ai.longitudinal_acceleration >= 0 ? "+" : ""}${ai.longitudinal_acceleration.toFixed(2)}`}
            unit="m/s²"
          />
          <Metric
            label="Lateral accel"
            value={ai.lateral_acceleration.toFixed(2)}
            unit="m/s²"
          />
          <Metric
            label="Angular velocity"
            value={ai.angular_velocity.toFixed(3)}
            unit="rad/s"
          />
          <Metric
            label="Vibration level"
            value={ai.vibration_level}
            tone={ai.vibration_level === "HIGH" ? "danger" : "default"}
          />
          <Metric
            label="Motion confidence"
            value={`${Math.round(ai.motion_confidence * 100)}%`}
            tone="success"
          />
          <Metric label="Motion class" value={ai.motion_classification} />
        </div>
      </div>

      <MotionTimeline snapshot={snapshot} />

      <div className="rounded-md border border-border bg-muted/40 p-3">
        <div className="label-caps mb-2">Motion detection logic chain</div>
        <ol className="flex flex-wrap items-center gap-1.5">
          {CHAIN.map((step, i) => (
            <li key={step} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded border px-2 py-1 font-mono text-[0.62rem] font-bold tracking-[0.08em] uppercase",
                  i === 2
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-panel text-foreground",
                )}
              >
                {step}
              </span>
              {i < CHAIN.length - 1 ? (
                <ArrowDown className="size-3 -rotate-90 text-muted-foreground" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}

const STATE_ICON: Partial<Record<MotionState, typeof Gauge>> = {
  STATIONARY: Waves,
  ACCELERATING: Activity,
  CRUISING: Gauge,
  BRAKING: Activity,
  TURNING: RotateCw,
};

function MotionTimeline({ snapshot }: { snapshot: NavSnapshot }) {
  const current = snapshot.ai.vehicle_state;
  const history = snapshot.motion_history.slice(-8);

  return (
    <div className="rounded-md border border-border bg-panel p-3">
      <div className="label-caps mb-2">Motion state machine</div>
      <div className="flex flex-wrap items-stretch gap-1.5">
        {TIMELINE.map((state, i) => {
          const Icon = STATE_ICON[state] ?? Gauge;
          const isCurrent = state === current;
          return (
            <div key={state} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex min-w-[7.5rem] flex-col gap-1 rounded-md border-2 px-2.5 py-2 transition-colors",
                  isCurrent
                    ? "border-success bg-success/10"
                    : "border-dashed border-border bg-muted/40",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5",
                    isCurrent ? "text-success" : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "readout text-[0.7rem]",
                    isCurrent ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {state}
                </span>
              </div>
              {i < TIMELINE.length - 1 ? (
                <ArrowDown className="size-3 -rotate-90 text-muted-foreground" />
              ) : null}
            </div>
          );
        })}
        {!TIMELINE.includes(current) ? (
          <div className="flex min-w-[7.5rem] flex-col gap-1 rounded-md border-2 border-destructive bg-destructive/10 px-2.5 py-2">
            <Activity className="size-3.5 text-destructive" />
            <span className="readout text-[0.7rem] text-destructive">{current}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="label-caps">Recent transitions</span>
        {history.length === 0 ? (
          <span className="font-mono text-[0.62rem] font-bold text-muted-foreground">
            AWAITING SIMULATION START
          </span>
        ) : (
          history.map((event, i) => (
            <span
              key={`${event.t}-${i}`}
              className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.6rem] font-bold tracking-[0.06em] text-muted-foreground"
            >
              {event.t.toFixed(0)}s {event.state}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
