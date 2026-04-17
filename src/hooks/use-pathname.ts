import type { Seidr } from "@fimbul-works/seidr";
import { getUrl } from "../get-url.js";

/**
 * Returns the current path as a derived Seidr.
 * This cannot be changed directly by the user.
 *
 * @returns {Seidr<string>} Derived Seidr of the current path
 */
export const usePathname = (): Seidr<string> => getUrl().as((url) => url.pathname);
