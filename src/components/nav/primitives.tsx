import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ModuleStatus } from "@/lib/nav/types";

export function Panel({
  title,
  subtitle,
  right,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("panel flex flex-col overflow-hidden", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-[0.8rem] font-extrabold tracking-[0.12em] text-foreground uppercase">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          {right}
        </header>
      ) : null}
      <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

const statusStyles: Record<ModuleStatus, { dot: string; text: string; label: string }> = {
  active: { dot: "bg-success", text: "text-success", label: "ACTIVE" },
  available: { dot: "bg-success", text: "text-success", label: "AVAILABLE" },
  idle: { dot: "bg-muted-foreground", text: "text-muted-foreground", label: "STANDBY" },
  degraded: { dot: "bg-warning", text: "text-warning", label: "DEGRADED" },
  lost: { dot: "bg-destructive", text: "text-destructive", label: "LOST" },
};

export function StatusPill({ status, label }: { status: ModuleStatus; label?: string }) {
  const s = statusStyles[status];
  return (
    <span className={cn("flex items-center gap-1.5 text-[0.7rem] font-bold", s.text)}>
      <span
        className={cn(
          "size-2 rounded-full",
          s.dot,
          status === "lost" || status === "active" ? "animate-pulse" : "",
        )}
      />
      <span className="font-mono tracking-[0.08em]">{label ?? s.label}</span>
    </span>
  );
}

export function Metric({
  label,
  value,
  unit,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "default" | "warning" | "danger" | "success";
  className?: string;
}) {
  const toneClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <div className={cn("rounded-md border border-border bg-panel px-3 py-2.5", className)}>
      <div className="label-caps">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn("readout text-xl leading-none md:text-2xl", toneClass)}>{value}</span>
        {unit ? <span className="text-xs font-semibold text-muted-foreground">{unit}</span> : null}
      </div>
      {hint ? <div className="mt-1 text-[0.68rem] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.6rem] font-bold tracking-[0.12em] text-muted-foreground",
        className,
      )}
    >
      SIMULATED DEMO DATA
    </span>
  );
}
