import { getAppState, getRootComponent, isClient, isStr, Seidr, SeidrError } from "@fimbul-works/seidr";
import { DATA_KEY_ROUTER, DUMMY_BASE_URL, SEIDR_ID_ROUTER_URL } from "./constants.js";
import { browserRouter } from "./router/browser-router.js";
import type { PopstateListener, RouterState, RouterTreeNode } from "./types.js";

/**
 * Initialize the router state.
 * Use the spread operator with renderToString and hydrate to prepare the router.
 *
 * @param {string | URL | Location} initialUrl - Initial URL for the router (default: current window location or "/")
 * @param {string} [base=DUMMY_BASE_URL] - Base URL for resolving relative URLs, default `DUMMY_BASE_URL`
 * @returns {Record<string, any>} Initial state for the router
 */
export const initRouter = (
  initialUrl?: string | URL | Location,
  base: string = isClient() ? window.location.href : DUMMY_BASE_URL,
) => {
  /**
   * Normalize the initial URL input to a URL object.
   * @param {string | URL | Location} url
   * @returns {URL} Normalized URL object
   * @throws {SeidrError} If the input URL is invalid
   */
  const getUrlObject = (url: string | URL | Location): URL => {
    if (url instanceof URL) {
      return url;
    }

    if (isStr(url)) {
      return new URL(url, base);
    }

    if (isClient() && typeof Location !== "undefined" && url instanceof Location) {
      return new URL(url.href, base);
    }

    throw new SeidrError("Invalid URL provided to initRouter");
  };

  const appState = getAppState();
  if (appState.hasData(DATA_KEY_ROUTER)) {
    if (initialUrl !== undefined) {
      appState.getData<RouterState>(DATA_KEY_ROUTER)!.url.value = getUrlObject(initialUrl);
    }
    return;
  }

  // Fallback to default if not provided
  if (initialUrl === undefined) {
    initialUrl = isClient() ? window.location.href : "/";
  }

  const url = new Seidr<URL>(getUrlObject(initialUrl), { id: SEIDR_ID_ROUTER_URL, hydrate: false });
  const popstateListeners = new Set<PopstateListener>();

  // Define event handlers for URL changes
  const popstate = () => (url.value = new URL(window.location.href, base));

  // Setup event listeners for client-side navigation
  if (isClient()) {
    window.addEventListener("popstate", popstate);
  }

  // Observe URL changes and notify listeners
  const cleanup = url.observe((url) => popstateListeners.forEach((fn) => fn(url.pathname + url.search)));

  // Cleanup on unmount
  if (process.env.VITEST) {
    try {
      getRootComponent()?.onUnmount(cleanup);
    } catch {}
  } else {
    getRootComponent()?.onUnmount(cleanup);
  }

  // Store state in AppState
  appState.setData<RouterState>(DATA_KEY_ROUTER, {
    url,
    tree: new Map<string, RouterTreeNode>(),
    parentMap: new Map<string, RouterTreeNode>(),
    popstateListeners,
  });

  // Eagerly initialize the browser router singleton
  browserRouter();

  appState.defineDataStrategy<string>(
    DATA_KEY_ROUTER,
    // Capture function: store current URL and other serializable state
    () => url.value.href,
    // Restore function: restore URL from captured data
    (urlStr: string) => (url.value = new URL(urlStr, base)),
  );
};
