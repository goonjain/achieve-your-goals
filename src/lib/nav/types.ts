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

/** Motion states classified by the AI motion detector. */
export type MotionState =
  | "STATIONARY"
  | "MOVING"
  | "ACCELERATING"
  | "CRUISING"
  | "BRAKING"
  | "TURNING"
  | "BUMP"
  | "HIGH VIBRATION";

export interface AiMotionState {
  vehicle_state: MotionState;
  motion_confidence: number;
  estimated_speed: number;
  speed_confidence: number;
  longitudinal_acceleration: number;
  lateral_acceleration: number;
  angular_velocity: number;
  sensor_reliability: number;
  vibration_level: "LOW" | "MEDIUM" | "HIGH";
  motion_classification: "VEHICLE STOPPED" | "VEHICLE MOVING";
  model_status: ModuleStatus;
}

/** Per-sensor reliability scores (0..1) driving the fusion weighting. */
export interface SensorReliability {
  accelerometer: number;
  gyroscope: number;
  magnetometer: number;
  gnss: number;
  ai_speed: number;
  overall: number;
}

export type Contribution = "NONE" | "LOW" | "MEDIUM" | "HIGH";

/** Adaptive fusion engine state. */
export interface FusionState {
  ekf: ModuleStatus;
  imu_contribution: Contribution;
  imu_weight: number;
  gnss_contribution: Contribution;
  gnss_weight: number;
  ai_speed_contribution: Contribution;
  ai_speed_weight: number;
  map_constraint: ModuleStatus;
  nhc_constraint: ModuleStatus;
}

/** Map matching / non-holonomic constraint state. */
export interface MapMatchState {
  status: ModuleStatus;
  nhc: ModuleStatus;
  nearest_road: string;
  road_heading: number;
  distance_from_road: number;
  match_confidence: number;
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

/** One 10 Hz sample of raw IMU signals plus derived speed estimates. */
export interface ImuSample {
  t: number;
  /** longitudinal acceleration (legacy field, kept for existing charts) */
  accel: number;
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  accel_mag: number;
  gyro_mag: number;
  ai_speed: number;
  /** null while GNSS is unavailable — never used as an estimator input then */
  gnss_speed: number | null;
}

/** One entry of the motion state machine timeline. */
export interface MotionEvent {
  t: number;
  state: MotionState;
  confidence: number;
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
