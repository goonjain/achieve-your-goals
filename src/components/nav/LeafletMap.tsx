import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Polyline, TileLayer, Marker, useMap, ZoomControl } from "react-leaflet";
import type { LatLng, NavSnapshot } from "@/lib/nav/types";

function toTuple(p: LatLng): [number, number] {
  return [p.lat, p.lng];
}

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function FollowVehicle({ position }: { position: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([position.lat, position.lng], { animate: true, duration: 0.4 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.round(position.lat * 10000), Math.round(position.lng * 10000)]);
  return null;
}

export default function LeafletMap({ snapshot }: { snapshot: NavSnapshot }) {
  const f = snapshot.frame;
  const outage = f.outage_status.active;

  const colors = useMemo(
    () => ({
      truth: cssVar("--track-truth", "#6b7280"),
      gnss: cssVar("--track-gnss", "#2f5fd0"),
      raw: cssVar("--track-raw", "#d97706"),
      fused: cssVar("--track-fused", "#15803d"),
      danger: cssVar("--destructive", "#dc2626"),
    }),
    [],
  );

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        html: `<div style="width:22px;height:22px;border-radius:9999px;border:3px solid white;background:${
          outage ? colors.raw : colors.gnss
        };box-shadow:0 0 0 4px ${outage ? colors.raw : colors.gnss}33, 0 2px 6px rgba(0,0,0,.35)"></div>`,
      }),
    [outage, colors],
  );

  return (
    <MapContainer
      center={toTuple({ lat: f.latitude, lng: f.longitude })}
      zoom={16}
      zoomControl={false}
      className="h-full w-full"
      preferCanvas
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="topright" />

      {/* Offline OSM road network reference */}
      <Polyline
        positions={snapshot.route.map(toTuple)}
        pathOptions={{ color: colors.truth, weight: 8, opacity: 0.18 }}
      />

      {/* GNSS outage stretch */}
      {snapshot.outage_segment.length > 1 ? (
        <Polyline
          positions={snapshot.outage_segment.map(toTuple)}
          pathOptions={{ color: colors.danger, weight: 14, opacity: 0.16 }}
        />
      ) : null}

      {/* GNSS trajectory */}
      <Polyline
        positions={snapshot.gnss_track.map(toTuple)}
        pathOptions={{ color: colors.gnss, weight: 3, opacity: 0.9 }}
      />

      {/* Raw / uncorrected dead reckoning */}
      <Polyline
        positions={snapshot.raw_dr_track.map(toTuple)}
        pathOptions={{ color: colors.raw, weight: 3, dashArray: "6 6", opacity: 0.95 }}
      />

      {/* AI + EKF + map-matched */}
      <Polyline
        positions={snapshot.fused_track.map(toTuple)}
        pathOptions={{ color: colors.fused, weight: 4.5, opacity: 0.95 }}
      />

      <Marker position={toTuple({ lat: f.latitude, lng: f.longitude })} icon={icon} />
      <FollowVehicle position={{ lat: f.latitude, lng: f.longitude }} />
    </MapContainer>
  );
}
