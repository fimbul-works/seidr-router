import { getAppState, isClient, isStr, noHydrate, Seidr } from "@fimbul-works/seidr";
import { DATA_KEY_ROUTER, DATA_KEY_ROUTER_TREE, DATA_KEY_ROUTER_URL, DUMMY_BASE_URL } from "./constants.js";

/**
 * Initialize the router state.
 * Use the spread operator with renderToString and hydrate to prepare the router.
 *
 * @param {string | URL | Location} url
 * @returns {Record<string, any>} Initial state for the router
 */
export const initRouter = (url: string | URL | Location = isClient() ? window.location.href : "/") => {
  // Normalize URL
  if (isStr(url)) {
    url = new URL(url, DUMMY_BASE_URL);
  } else if (isClient() && typeof Location !== "undefined" && url instanceof Location) {
    url = new URL(url.href);
  }

  // Define AppState
  const observable = new Seidr(url, { ...noHydrate, id: DATA_KEY_ROUTER_URL });
  const state = getAppState();
  state.setData(DATA_KEY_ROUTER_URL, observable);
  state.setData(DATA_KEY_ROUTER_TREE, new Map<string, any>());

  // Setup event listeners for client-side navigation
  const popstate = () => (observable.value = new URL(window.location.href));
  if (isClient()) {
    window.addEventListener("popstate", popstate);
  }

  // Define data strategy for the router
  state.defineDataStrategy<string>(
    DATA_KEY_ROUTER,
    // Capture function: store the URL as a string for hydration
    () => observable.value.href,
    // Restore function: convert the string back to a URL object
    (url) => {
      if (isStr(url)) {
        observable.value = new URL(url, DUMMY_BASE_URL);
      }
      // @ts-expect-error
      else if (__SEIDR_DEV__) {
        console.warn("[seidr-router] Missing router state captured during hydration");
      }
    },
    // Cleanup function: remove event listeners when the router is destroyed
    () => isClient() && window.removeEventListener("popstate", popstate),
  );

  // Return initial state
  return {
    [DATA_KEY_ROUTER]: url.href,
  };
};
