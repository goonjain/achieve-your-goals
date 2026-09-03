import type { LatLng } from "./types";

/** Synthetic urban road network centred on Jaipur (26.x N / 75.x E). */
const ORIGIN: LatLng = { lat: 26.9124, lng: 75.7873 };

export interface RoutePoint extends LatLng {
  heading: number;
  /** cumulative distance along the route, in metres */
  distance: number;
}

export function metresBetween(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const x = dLng * Math.cos(lat);
  return Math.sqrt(dLat * dLat + x * x) * R;
}

export function offsetMetres(p: LatLng, east: number, north: number): LatLng {
  const dLat = north / 111320;
  const dLng = east / (111320 * Math.cos((p.lat * Math.PI) / 180));
  return { lat: p.lat + dLat, lng: p.lng + dLng };
}

/** Deterministic road polyline so every demo run looks identical. */
export function buildRoute(): RoutePoint[] {
  const points: RoutePoint[] = [];
  let lat = ORIGIN.lat;
  let lng = ORIGIN.lng;
  let heading = 62;
  let distance = 0;
  let prev: LatLng = { lat, lng };

  for (let i = 0; i < 260; i += 1) {
    // gentle curves plus a few junction-like turns
    heading += Math.sin(i / 15) * 4.2;
    if (i === 45 || i === 110 || i === 185) heading += 46;
    if (i === 75 || i === 150) heading -= 38;

    const step = 0.00042;
    lat += Math.cos((heading * Math.PI) / 180) * step;
    lng += Math.sin((heading * Math.PI) / 180) * step * 1.08;

    const point: LatLng = { lat, lng };
    distance += metresBetween(prev, point);
    prev = point;

    points.push({
      lat,
      lng,
      heading: ((heading % 360) + 360) % 360,
      distance,
    });
  }

  return points;
}

/** Interpolate a fractional index along the polyline. */
export function sampleRoute(route: RoutePoint[], index: number): RoutePoint {
  const clamped = Math.max(0, Math.min(route.length - 1.001, index));
  const i = Math.floor(clamped);
  const f = clamped - i;
  const a = route[i];
  const b = route[Math.min(route.length - 1, i + 1)];
  return {
    lat: a.lat + (b.lat - a.lat) * f,
    lng: a.lng + (b.lng - a.lng) * f,
    heading: a.heading + (b.heading - a.heading) * f,
    distance: a.distance + (b.distance - a.distance) * f,
  };
}

/** Cheap map-matching: snap an estimate onto the nearest road point. */
export function snapToRoute(route: RoutePoint[], p: LatLng, aroundIndex: number): LatLng {
  const from = Math.max(0, Math.floor(aroundIndex) - 12);
  const to = Math.min(route.length - 1, Math.ceil(aroundIndex) + 12);
  let best = route[from];
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = from; i <= to; i += 1) {
    const d = metresBetween(route[i], p);
    if (d < bestDist) {
      bestDist = d;
      best = route[i];
    }
  }
  return { lat: best.lat, lng: best.lng };
}
