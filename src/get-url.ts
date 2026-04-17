import { getAppState, type Seidr, SeidrError } from "@fimbul-works/seidr";
import { DATA_KEY_ROUTER_URL } from "./constants.js";

/**
 * Get the current URL as a Seidr observable.
 *
 * @returns {Seidr<URL>} The current URL Seidr
 */
export function getUrl(): Seidr<URL> {
  // @ts-expect-error
  if (__SEIDR_DEV__ && !getAppState().hasData(DATA_KEY_ROUTER_URL)) {
    throw new SeidrError("Router is not initialized");
  }
  return getAppState().getData<Seidr<URL>>(DATA_KEY_ROUTER_URL)!;
}
