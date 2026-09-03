# Navigation Intelligence System — SIH26168 Dashboard

A single-page  engineering dashboard (white background or light color background with bsuitable and matching bold dark color fonts)  that demonstrates continuous vehicle positioning during a GNSS outage, driven by a simulated navigation engine that can later be swapped for real data from your Python engine or Android app.

## Layout (one page, `/`)

```text
HEADER  NAVIGATION INTELLIGENCE SYSTEM | SIH26168        ONLINE · MODE · 10 Hz · clock
--------------------------------------------------------------------------------
| LIVE MAP (largest panel)                     | GNSS STATUS card              |
|  OSM tiles, dark theme                       | CONNECTED / SIGNAL LOST       |
|  3 trajectory layers + vehicle marker        | sats, accuracy, last fix,     |
|  outage segment highlighted, zoom/pan        | outage timer, mode badge      |
|                                              | SIMULATION CONTROLS           |
|                                              | SENSOR HEALTH (7 modules)     |
--------------------------------------------------------------------------------
GNSS OUTAGE TIMELINE: AVAILABLE -> OUTAGE -> DEAD RECKONING -> RECOVERED
--------------------------------------------------------------------------------
TELEMETRY cards: speed, heading, lat, lon, confidence, position error
--------------------------------------------------------------------------------
| AI MOTION INTELLIGENCE + mini chart | ERROR vs TIME graph (outage shaded)    |
--------------------------------------------------------------------------------
TRAJECTORY ANALYSIS chart (truth / GNSS / raw DR / AI+EKF / +map matching)
--------------------------------------------------------------------------------
PERFORMANCE METRICS cards      |  SYSTEM PIPELINE (8 active-looking stages)
```

## Behaviour

- Simulation runs at 10 Hz over a synthetic road route (Jaipur-area coordinates, 26.x / 75.x).
- Controls: Start, Trigger GNSS Outage, Restore GNSS, Reset.
- On outage: GNSS card turns to SIGNAL LOST, map switches to the dead-reckoning + fused layers with the outage stretch highlighted, outage timer runs, pipeline highlights AI + IMU + EKF + Map Matching, confidence decays and position error grows for raw DR while the fused track stays near the road.
- On restore: status returns to CONNECTED, error snaps back, timer stops, timeline shows RECOVERED.
- Every panel carries a clear "SIMULATED / DEMO DATA" label so nothing reads as a real measured result.

## Design

Dark automotive/instrumentation aesthetic: near-black layered surfaces, thin cool-grey borders, subtle glass sheen, mono-style numeric readouts, restrained cyan/amber/red accents for nominal / degraded / lost states. Semantic tokens only, defined in `src/styles.css` — no hardcoded colors in components.

## Technical section

- Route: rewrite `src/routes/index.tsx` as the dashboard, with its own `head()` metadata.
- Data layer: `src/lib/nav/types.ts` (the `NavFrame` shape you specified: timestamp, latitude, longitude, speed, heading, position_confidence, gnss_status, outage_status, sensor_status, position_error) plus `src/lib/nav/engine.ts` (a `NavDataSource` interface) and `simulated-source.ts`. A `useNavStream()` hook consumes the source, so a WebSocket/HTTP source can be dropped in without touching UI.
- Map: Leaflet + OSM tiles (`leaflet` + `react-leaflet`), loaded via `React.lazy` behind `<ClientOnly>` so SSR is not broken; polylines for the three trajectories, marker for the vehicle.
- Charts: Recharts (already installed) for the error graph, IMU/speed mini chart, and trajectory analysis.
- Components under `src/components/nav/`: Header, MapPanel, GnssStatusCard, SensorHealth, TelemetryGrid, AiMotionPanel, OutageTimeline, TrajectoryAnalysis, ErrorChart, PerformanceMetrics, PipelinePanel, SimulationControls.
- No backend needed for this phase; all state is client-side.