import { Play, Pause, RotateCcw, SatelliteDish, SignalZero } from "lucide-react";
import { Panel, DemoTag } from "./primitives";
import { Button } from "@/components/ui/button";
import type { NavDataSource, NavSnapshot } from "@/lib/nav/types";

export function SimulationControls({
  snapshot,
  source,
}: {
  snapshot: NavSnapshot;
  source: NavDataSource;
}) {
  const outage = snapshot.frame.outage_status.active;

  return (
    <Panel title="Simulation Controls" right={<DemoTag />} bodyClassName="grid grid-cols-2 gap-2">
      <Button
        onClick={() => (snapshot.running ? source.pause() : source.start())}
        className="justify-start font-bold"
      >
        {snapshot.running ? <Pause className="size-4" /> : <Play className="size-4" />}
        {snapshot.running ? "Pause" : "Start Simulation"}
      </Button>
      <Button
        variant="destructive"
        disabled={outage}
        onClick={() => source.triggerOutage()}
        className="justify-start font-bold"
      >
        <SignalZero className="size-4" />
        Trigger GNSS Outage
      </Button>
      <Button
        variant="outline"
        disabled={!outage}
        onClick={() => source.restoreGnss()}
        className="justify-start font-bold"
      >
        <SatelliteDish className="size-4" />
        Restore GNSS
      </Button>
      <Button
        variant="secondary"
        onClick={() => source.reset()}
        className="justify-start font-bold"
      >
        <RotateCcw className="size-4" />
        Reset
      </Button>
    </Panel>
  );
}
