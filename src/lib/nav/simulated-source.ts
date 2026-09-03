import {
  buildRoute,
  metresBetween,
  offsetMetres,
  sampleRoute,
  snapToRoute,
  type RoutePoint,
} from "./route-geometry";
import type {
  ErrorSample,
  ImuSample,
  LatLng,
  NavDataSource,
  NavSnapshot,
  PipelineStageId,
} from "./types";

const HZ = 10;
const DT = 1 / HZ;
const MAX_HISTORY = 400;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Deterministic-ish demo engine. Produces GNSS, raw dead-reckoning,
 * EKF-fused and map-matched solutions plus derived telemetry.
 * All values are SIMULATED for demonstration purposes.
 */
export class SimulatedNavSource implements NavDataSource {
  private route: RoutePoint[] = buildRoute();
  private listeners = new Set<(s: NavSnapshot) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private snapshot: NavSnapshot;

  // internal integration state
  private index = 0;
  private t = 0;
  private speed = 64;
  private accel = 0;
  private driftEast = 0;
  private driftNorth = 0;
  private outageStartIndex = 0;
  private errorSum = 0;
  private errorCount = 0;
  private maxError = 0;

  constructor() {
    this.snapshot = this.buildInitialSnapshot();
  }

  private buildInitialSnapshot(): NavSnapshot {
    const p = this.route[0]!;
    return {
      running: false,
      frame: {
        timestamp: Date.now(),
        latitude: p.lat,
        longitude: p.lng,
        speed: 0,
        heading: p.heading,
        position_confidence: 0.98,
        gnss_status: "connected",
        outage_status: {
          active: false,
          started_at: null,
          duration_s: 0,
          distance_m: 0,
          recovered_at: null,
        },
        sensor_status: {
          accelerometer: "active",
          gyroscope: "active",
          magnetometer: "active",
          gnss: "available",
          ai_speed_estimator: "active",
          error_state_ekf: "active",
          map_matcher: "idle",
        },
        position_error: 1.4,
      },
      gnss: { satellites: 14, accuracy: 3.2, last_fix_at: Date.now() },
      ai: {
        vehicle_state: "IDLE",
        estimated_speed: 0,
        longitudinal_acceleration: 0,
        sensor_reliability: 0.95,
        vibration_level: "LOW",
        motion_classification: "VEHICLE STOPPED",
      },
      route: this.route.map((r) => ({ lat: r.lat, lng: r.lng })),
      gnss_track: [{ lat: p.lat, lng: p.lng }],
      raw_dr_track: [{ lat: p.lat, lng: p.lng }],
      fused_track: [{ lat: p.lat, lng: p.lng }],
      outage_segment: [],
      error_history: [],
      imu_history: [],
      metrics: {
        final_position_error: 0,
        rmse: 0,
        drift_percent: 0,
        max_error: 0,
        outage_distance_m: 0,
        outage_duration_s: 0,
      },
      active_stages: ["sensors", "preprocessing", "integrity", "ekf", "position", "confidence"],
    };
  }

  subscribe(listener: (s: NavSnapshot) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this.snapshot;
  }

  private emit() {
    for (const l of this.listeners) l(this.snapshot);
  }

  start() {
    if (this.timer) return;
    this.snapshot = { ...this.snapshot, running: true };
    this.emit();
    this.timer = setInterval(() => this.tick(), 1000 / HZ);
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.snapshot = { ...this.snapshot, running: false };
    this.emit();
  }

  triggerOutage() {
    if (this.snapshot.frame.outage_status.active) return;
    if (!this.timer) this.start();
    this.driftEast = 0;
    this.driftNorth = 0;
    this.outageStartIndex = this.index;
    const now = Date.now();
    this.snapshot = {
      ...this.snapshot,
      frame: {
        ...this.snapshot.frame,
        gnss_status: "lost",
        outage_status: {
          active: true,
          started_at: now,
          duration_s: 0,
          distance_m: 0,
          recovered_at: null,
        },
      },
      outage_segment: [],
    };
    this.emit();
  }

  restoreGnss() {
    if (!this.snapshot.frame.outage_status.active) return;
    this.driftEast = 0;
    this.driftNorth = 0;
    this.snapshot = {
      ...this.snapshot,
      frame: {
        ...this.snapshot.frame,
        gnss_status: "connected",
        outage_status: {
          ...this.snapshot.frame.outage_status,
          active: false,
          recovered_at: Date.now(),
        },
      },
    };
    this.emit();
  }

  reset() {
    this.pause();
    this.index = 0;
    this.t = 0;
    this.speed = 64;
    this.accel = 0;
    this.driftEast = 0;
    this.driftNorth = 0;
    this.errorSum = 0;
    this.errorCount = 0;
    this.maxError = 0;
    this.snapshot = this.buildInitialSnapshot();
    this.emit();
  }

  private tick() {
    const s = this.snapshot;
    this.t += DT;

    // --- simulated longitudinal dynamics -----------------------------------
    const target = 58 + Math.sin(this.t / 9) * 14 + Math.sin(this.t / 3.3) * 3;
    this.accel = clamp((target - this.speed) * 0.35, -2.6, 2.4);
    this.speed = clamp(this.speed + this.accel * DT * 3, 0, 96);

    const metresPerTick = (this.speed / 3.6) * DT;
    const stepMetres = metresBetween(this.route[0]!, this.route[1]!);
    this.index = this.index + metresPerTick / stepMetres;
    if (this.index >= this.route.length - 2) this.index = 0;

    const truth = sampleRoute(this.route, this.index);
    const truthPos: LatLng = { lat: truth.lat, lng: truth.lng };
    const outage = s.frame.outage_status.active;

    // --- solutions ---------------------------------------------------------
    // GNSS: small noise while available, frozen at last fix during outage.
    const gnssPos = outage
      ? s.gnss_track[s.gnss_track.length - 1] ?? truthPos
      : offsetMetres(truthPos, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);

    // Raw dead reckoning: unbounded bias-driven random walk during outage.
    if (outage) {
      this.driftEast += 0.42 + (Math.random() - 0.4) * 0.35;
      this.driftNorth += 0.30 + (Math.random() - 0.45) * 0.32;
    } else {
      this.driftEast *= 0.75;
      this.driftNorth *= 0.75;
    }
    const rawPos = offsetMetres(truthPos, this.driftEast, this.driftNorth);

    // AI + Error-State EKF: bounded growth, NHC keeps lateral error small.
    const outageSeconds = outage
      ? (Date.now() - (s.frame.outage_status.started_at ?? Date.now())) / 1000
      : 0;
    const ekfMag = outage ? 0.9 + outageSeconds * 0.28 : 1.1;
    const ekfPos = offsetMetres(
      truthPos,
      Math.sin(this.t / 4) * ekfMag,
      Math.cos(this.t / 5) * ekfMag * 0.8,
    );

    // Map matching snaps the EKF solution back onto the offline road network.
    const matchedPos = snapToRoute(this.route, ekfPos, this.index);

    const rawError = metresBetween(truthPos, rawPos);
    const ekfError = metresBetween(truthPos, ekfPos);
    const matchedError = metresBetween(truthPos, matchedPos) + 0.6;
    const gnssError = outage ? null : metresBetween(truthPos, gnssPos);
    const activeError = outage ? matchedError : Math.min(matchedError, 3.9);

    this.errorSum += activeError * activeError;
    this.errorCount += 1;
    this.maxError = Math.max(this.maxError, activeError);

    // --- tracks ------------------------------------------------------------
    const push = (arr: LatLng[], p: LatLng) => {
      const next = arr.length > 900 ? arr.slice(-900) : arr.slice();
      next.push(p);
      return next;
    };

    const gnssTrack = outage ? s.gnss_track : push(s.gnss_track, gnssPos);
    const rawTrack = push(s.raw_dr_track, rawPos);
    const fusedTrack = push(s.fused_track, matchedPos);
    const outageSegment = outage ? push(s.outage_segment, truthPos) : s.outage_segment;

    const outageDistance = outage
      ? Math.max(0, truth.distance - sampleRoute(this.route, this.outageStartIndex).distance)
      : s.frame.outage_status.distance_m;

    const confidence = outage
      ? clamp(0.94 - outageSeconds * 0.011, 0.42, 0.99)
      : clamp(0.93 + Math.sin(this.t / 6) * 0.05, 0.85, 0.99);

    const errorSample: ErrorSample = {
      t: Number(this.t.toFixed(1)),
      outage,
      gnss: gnssError,
      raw_dr: rawError,
      ekf: ekfError,
      map_matched: matchedError,
    };
    const imuSample: ImuSample = {
      t: Number(this.t.toFixed(1)),
      accel: Number((this.accel + (Math.random() - 0.5) * 0.25).toFixed(3)),
      ai_speed: Number((this.speed - 0.6 + (Math.random() - 0.5) * 1.1).toFixed(2)),
    };
    const trim = <T,>(arr: T[], sample: T) =>
      [...(arr.length >= MAX_HISTORY ? arr.slice(-MAX_HISTORY + 1) : arr), sample];

    const activeStages: PipelineStageId[] = outage
      ? [
          "sensors",
          "preprocessing",
          "ai_motion",
          "integrity",
          "ekf",
          "map_matching",
          "position",
          "confidence",
        ]
      : ["sensors", "preprocessing", "ai_motion", "integrity", "ekf", "position", "confidence"];

    const vehicleState =
      this.speed < 2
        ? "IDLE"
        : this.accel > 0.6
          ? "ACCELERATING"
          : this.accel < -0.6
            ? "BRAKING"
            : "CRUISING";

    this.snapshot = {
      ...s,
      running: true,
      frame: {
        timestamp: Date.now(),
        latitude: matchedPos.lat,
        longitude: matchedPos.lng,
        speed: Number(this.speed.toFixed(1)),
        heading: Number(truth.heading.toFixed(1)),
        position_confidence: Number(confidence.toFixed(3)),
        gnss_status: outage ? "lost" : "connected",
        outage_status: {
          ...s.frame.outage_status,
          duration_s: outage
            ? Number(outageSeconds.toFixed(1))
            : s.frame.outage_status.duration_s,
          distance_m: Number(outageDistance.toFixed(0)),
        },
        sensor_status: {
          accelerometer: "active",
          gyroscope: "active",
          magnetometer: outage ? "active" : "active",
          gnss: outage ? "lost" : "available",
          ai_speed_estimator: "active",
          error_state_ekf: "active",
          map_matcher: outage ? "active" : "idle",
        },
        position_error: Number(activeError.toFixed(2)),
      },
      gnss: {
        satellites: outage ? 0 : 12 + Math.round(Math.sin(this.t / 5) * 3),
        accuracy: outage ? 0 : Number((3.1 + Math.random() * 1.4).toFixed(1)),
        last_fix_at: outage ? s.gnss.last_fix_at : Date.now(),
      },
      ai: {
        vehicle_state: vehicleState,
        estimated_speed: imuSample.ai_speed,
        longitudinal_acceleration: imuSample.accel,
        sensor_reliability: Number((outage ? 0.9 : 0.94).toFixed(2)),
        vibration_level: this.speed > 78 ? "MEDIUM" : "LOW",
        motion_classification: this.speed > 1.5 ? "VEHICLE MOVING" : "VEHICLE STOPPED",
      },
      gnss_track: gnssTrack,
      raw_dr_track: rawTrack,
      fused_track: fusedTrack,
      outage_segment: outageSegment,
      error_history: trim(s.error_history, errorSample),
      imu_history: trim(s.imu_history, imuSample),
      metrics: {
        final_position_error: Number(activeError.toFixed(2)),
        rmse: Number(Math.sqrt(this.errorSum / Math.max(1, this.errorCount)).toFixed(2)),
        drift_percent: Number(
          ((activeError / Math.max(1, outageDistance || truth.distance)) * 100).toFixed(2),
        ),
        max_error: Number(this.maxError.toFixed(2)),
        outage_distance_m: Number(outageDistance.toFixed(0)),
        outage_duration_s: outage
          ? Number(outageSeconds.toFixed(1))
          : s.metrics.outage_duration_s,
      },
      active_stages: activeStages,
    };

    this.emit();
  }
}

let singleton: SimulatedNavSource | null = null;

export function getNavSource(): SimulatedNavSource {
  if (!singleton) singleton = new SimulatedNavSource();
  return singleton;
}
