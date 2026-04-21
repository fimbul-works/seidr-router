import type { Seidr } from "@fimbul-works/seidr";
import { getRouterState } from "../get-router-state.js";
import { initRouter } from "../init-router.js";
import { browserRouter } from "../router/browser-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";

/**
 * Returns the current search parameters as a derived Seidr and a setter function.
 *
 * @returns {[Seidr<Record<string, string>>, (name: string, value: string) => void]} Tuple of [params, setParam]
 */
export const useSearchParams = (): [Seidr<Record<string, string>>, (name: string, value: string) => void] => {
  initRouter();

  const routerState = getRouterState();
  const node = getNearestRouter();
  const router = node ? node.router : browserRouter();

  const setParam = (name: string, value: string) => {
    const url = new URL(routerState.url.value.href);
    url.searchParams.set(name, value);
    router.push(url.pathname + url.search + url.hash);
  };

  return [router.searchParams.as((params) => params), setParam];
};
