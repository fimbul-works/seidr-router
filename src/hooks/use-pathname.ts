import type { Seidr } from "@fimbul-works/seidr";
import { initRouter } from "../init-router.js";
import { browserRouter } from "../router/browser-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";

/**
 * Returns the current path as a derived Seidr.
 * This cannot be changed directly by the user.
 *
 * @returns {Seidr<string>} Derived Seidr of the current path
 */
export const usePathname = (): Seidr<string> => {
  initRouter();
  return (getNearestRouter()?.pathname || browserRouter().pathname).as((pathname) => pathname);
};
