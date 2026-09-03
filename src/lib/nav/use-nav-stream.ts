import { useEffect, useMemo, useState } from "react";
import { getNavSource } from "./simulated-source";
import type { NavDataSource, NavSnapshot } from "./types";

/**
 * Consumes a NavDataSource. Swap `getNavSource()` for a live WebSocket/HTTP
 * source and the whole dashboard keeps working unchanged.
 */
export function useNavStream(): { snapshot: NavSnapshot; source: NavDataSource } {
  const source = useMemo(() => getNavSource(), []);
  const [snapshot, setSnapshot] = useState<NavSnapshot>(() => source.getSnapshot());

  useEffect(() => {
    setSnapshot(source.getSnapshot());
    return source.subscribe(setSnapshot);
  }, [source]);

  return { snapshot, source };
}
