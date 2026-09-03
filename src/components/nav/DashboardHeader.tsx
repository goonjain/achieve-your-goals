import { useEffect, useState } from "react";
import { Activity, Radio, Satellite } from "lucide-react";
import type { NavSnapshot } from "@/lib/nav/types";

export function DashboardHeader({ snapshot }: { snapshot: NavSnapshot }) {
  const [clock, setClock] = useState("--:--:--");
  const outage = snapshot.frame.outage_status.active;

  useEffect(() => {
    const update = () => setClock(new Date().toISOString().slice(11, 19) + " UTC");
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Satellite className="size-5" />
        </span>
        <div>
          <h1 className="text-lg leading-tight font-extrabold tracking-[-0.02em] text-foreground md:text-xl">
            NAVIGATION INTELLIGENCE SYSTEM
          </h1>
          <p className="font-mono text-[0.7rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            AI-ML Based Intelligent Dead Reckoning | SIH26168
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <HeaderStat
          icon={<Activity className="size-3.5 text-success" />}
          label="System"
          value="ONLINE"
          valueClass="text-success"
        />
        <HeaderStat
          icon={<Radio className={outage ? "size-3.5 text-warning" : "size-3.5 text-primary"} />}
          label="Current mode"
          value={outage ? "DEAD RECKONING" : "GNSS"}
          valueClass={outage ? "text-warning" : "text-primary"}
        />
        <HeaderStat label="Update rate" value="10 Hz" />
        <HeaderStat label="Timestamp" value={clock} />
      </div>
    </header>
  );
}

function HeaderStat({
  icon,
  label,
  value,
  valueClass = "text-foreground",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="label-caps">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5">
        {icon}
        <span className={`readout text-sm ${valueClass}`}>{value}</span>
      </div>
    </div>
  );
}
