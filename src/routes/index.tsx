import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/nav/DashboardHeader";
import { MapPanel } from "@/components/nav/MapPanel";
import { GnssStatusCard } from "@/components/nav/GnssStatusCard";
import { SimulationControls } from "@/components/nav/SimulationControls";
import { SensorHealth } from "@/components/nav/SensorHealth";
import { TelemetryGrid } from "@/components/nav/TelemetryGrid";
import { OutageTimeline } from "@/components/nav/OutageTimeline";
import { AiMotionPanel } from "@/components/nav/AiMotionPanel";
import { ErrorChart } from "@/components/nav/ErrorChart";
import { TrajectoryAnalysis } from "@/components/nav/TrajectoryAnalysis";
import { PerformanceMetrics } from "@/components/nav/PerformanceMetrics";
import { PipelinePanel } from "@/components/nav/PipelinePanel";
import { useNavStream } from "@/lib/nav/use-nav-stream";

const TITLE = "Navigation Intelligence System — Dead Reckoning (SIH26168)";
const DESCRIPTION =
  "Live monitoring dashboard for an AI-ML based intelligent dead reckoning system: IMU fusion, adaptive error-state EKF, offline map matching and seamless navigation through GNSS outages.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { snapshot, source } = useNavStream();

  return (
    <main className="mx-auto flex max-w-[1700px] flex-col gap-3 p-3 md:gap-4 md:p-5">
      <DashboardHeader snapshot={snapshot} />

      <div className="grid gap-3 md:gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(320px,1fr)]">
        <MapPanel snapshot={snapshot} />
        <div className="flex flex-col gap-3 md:gap-4">
          <GnssStatusCard snapshot={snapshot} />
          <SimulationControls snapshot={snapshot} source={source} />
          <SensorHealth snapshot={snapshot} />
        </div>
      </div>

      <OutageTimeline snapshot={snapshot} />
      <TelemetryGrid snapshot={snapshot} />

      <div className="grid gap-3 md:gap-4 xl:grid-cols-2">
        <AiMotionPanel snapshot={snapshot} />
        <ErrorChart snapshot={snapshot} />
      </div>

      <TrajectoryAnalysis snapshot={snapshot} />

      <div className="grid gap-3 md:gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <PerformanceMetrics snapshot={snapshot} />
        <PipelinePanel snapshot={snapshot} />
      </div>

      <footer className="pb-4 text-center font-mono text-[0.66rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
        SIH 2026 · SIH26168 · All values shown are simulated demonstration data, not measured
        results
      </footer>
    </main>
  );
}
