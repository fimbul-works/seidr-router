import { Seidr } from "@fimbul-works/seidr";

/**
 * Returns a derived Seidr of the parsed parameters for the current route.
 * If the route has no parameters, it returns an empty object.
 *
 * @returns {Seidr<Record<string, string>>} Derived Seidr of the current route parameters
 */
export const useParams = (): Seidr<Record<string, string>> => {
  // TODO: impement
  return new Seidr({});
};
