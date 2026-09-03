/**
 * Canonical data contract for the navigation dashboard.
 *
 * The UI only ever reads these shapes, so the simulated source can later be
 * replaced by a live source (WebSocket / HTTP polling from the Python
 * navigation engine, or an Android app) without touching any component.
 */

export type GnssStatus = "connected" | "lost";

export type ModuleStatus = "active" | "available" | "lost" | "idle" | "degraded";

export interface SensorStatus {
  accelerometer: ModuleStatus;
  gyroscope: ModuleStatus;
  magnetometer: ModuleStatus;
  gnss: ModuleStatus;
  ai_speed_estimator: ModuleStatus;
  error_state_ekf: ModuleStatus;
  map_matcher: ModuleStatus;
}

export interface OutageStatus {
  active: boolean;
  started_at: number | null;
  duration_s: number;
  distance_m: number;
  recovered_at: number | null;
}

export interface AiMotionState {
  vehicle_state: "IDLE" | "ACCELERATING" | "CRUISING" | "BRAKING" | "TURNING";
  estimated_speed: number;
  longitudinal_acceleration: number;
  sensor_reliability: number;
  vibration_level: "LOW" | "MEDIUM" | "HIGH";
  motion_classification: "VEHICLE STOPPED" | "VEHICLE MOVING";
}

/** The frame emitted by the navigation engine, ~10 Hz. */
export interface NavFrame {
  timestamp: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  position_confidence: number;
  gnss_status: GnssStatus;
  outage_status: OutageStatus;
  sensor_status: SensorStatus;
  position_error: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GnssMeta {
  satellites: number;
  accuracy: number;
  last_fix_at: number | null;
}

export interface ErrorSample {
  t: number;
  outage: boolean;
  gnss: number | null;
  raw_dr: number;
  ekf: number;
  map_matched: number;
}

export interface ImuSample {
  t: number;
  accel: number;
  ai_speed: number;
}

export interface PerformanceMetrics {
  final_position_error: number;
  rmse: number;
  drift_percent: number;
  max_error: number;
  outage_distance_m: number;
  outage_duration_s: number;
}

export type PipelineStageId =
  | "sensors"
  | "preprocessing"
  | "ai_motion"
  | "integrity"
  | "ekf"
  | "map_matching"
  | "position"
  | "confidence";

/** Full snapshot the dashboard renders from. */
export interface NavSnapshot {
  running: boolean;
  frame: NavFrame;
  gnss: GnssMeta;
  ai: AiMotionState;
  route: LatLng[];
  gnss_track: LatLng[];
  raw_dr_track: LatLng[];
  fused_track: LatLng[];
  outage_segment: LatLng[];
  error_history: ErrorSample[];
  imu_history: ImuSample[];
  metrics: PerformanceMetrics;
  active_stages: PipelineStageId[];
}

/** Swap-in point for a real data source. */
export interface NavDataSource {
  subscribe(listener: (snapshot: NavSnapshot) => void): () => void;
  getSnapshot(): NavSnapshot;
  start(): void;
  pause(): void;
  triggerOutage(): void;
  restoreGnss(): void;
  reset(): void;
}
