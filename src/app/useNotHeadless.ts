import { useSyncExternalStore } from "react";

// Client-only "is this a real (non-automation) browser?" flag. The server snapshot
// is false so nothing renders during SSR and the first hydration pass (no mismatch);
// the client snapshot then reads navigator.webdriver, which is true under Playwright
// / headless automation. Used to keep the analytics loaders (Plausible, Meta Pixel)
// from firing pageviews for bots — the lint-clean equivalent of a useEffect+setState
// mounted gate (which trips react-hooks/set-state-in-effect).
const subscribe = () => () => {};

export function useNotHeadless() {
  return useSyncExternalStore(
    subscribe,
    () => !navigator.webdriver,
    () => false,
  );
}
