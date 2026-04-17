import { parseRouteParams } from "./parse-route-params.js";
import type { RouteDefinition, RouteMatch } from "./types.js";

/**
 * Matches a path against a list of routes.
 *
 * @param path The path to match
 * @param routes The list of routes to check
 * @returns The match result or null if no route matches
 */
export const matchRoute = (rawPath: string, routes: RouteDefinition[]): RouteMatch | null => {
  // Extract pathname from rawPath (remove query and hash)
  const pathname = rawPath.split(/[?#]/)[0];

  for (let index = 0; index < routes.length; index++) {
    const { path: pattern } = routes[index];
    let params: Record<string, string> | false = false;

    if (pattern instanceof RegExp) {
      const match = pathname.match(pattern);
      params = match ? (match.groups ? { ...match.groups } : {}) : false;
    } else {
      params = parseRouteParams(pattern, pathname);
    }

    if (params) {
      return {
        index,
        route: routes[index],
        params,
      };
    }
  }

  return null;
};
