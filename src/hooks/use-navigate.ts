import { isClient, isNum, SeidrError } from "@fimbul-works/seidr";
import { getUrl } from "../get-url.js";

/**
 * Interface for the navigate function.
 * @param {string | number} to - Path to navigate to or number of entries to go back/forward
 * @param {boolean} replace - Whether to replace the current history entry
 */
export type NavigateFn = (to: string | number, replace?: boolean) => void;

/**
 * Returns the navigate function.
 * @returns {NavigateFn} navigate function
 */
export const useNavigate = (): NavigateFn => {
  return (to: string | number, replace = false): void => {
    // Backwards and forwards navigation
    if (isNum(to)) {
      if (isClient()) {
        window.history.go(to);
      }
      return;
    }

    // Handle string path
    const observable = getUrl();
    const url = observable.value;
    const nextUrl = new URL(to, url.href);

    if (nextUrl.origin !== url.origin) {
      throw new SeidrError("Cross-origin navigation is not allowed");
    }

    observable.value = nextUrl;

    // Handle client-side navigation
    if (isClient()) {
      if (nextUrl.href !== url.href) {
        window.history[replace ? "replaceState" : "pushState"]({}, "", nextUrl.href);
      }
    }
  };
};
