import type { Seidr } from "@fimbul-works/seidr";
import { initRouter } from "../init-router.js";
import { browserRouter } from "../router/browser-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";

/**
 * Returns the current route parameters as a derived Seidr.
 *
 * @returns {Seidr<Record<string, string>>} Derived Seidr of the current route parameters
 */
export const useRouteParams = (): Seidr<Record<string, string>> => {
  initRouter();
  return (getNearestRouter()?.routerParams || browserRouter().routeParams).as((params) => params);
};
