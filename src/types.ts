import type { ComponentFactoryFunction } from "@fimbul-works/seidr";

/**
 * Route definition for Router.
 */
export type RouteDefinition = { path: string | RegExp; component: ComponentFactoryFunction };

/**
 * Node in the route tree used for nested routes.
 */
export type RouterTreeNode = {
  /** Route path */
  path: string | RegExp;
  /** Route component */
  component: ComponentFactoryFunction;
  /** Parent router ID, if any */
  parentId?: string;
  /** Child router IDs */
  childrenIds: string[];
};

/**
 * Match result for a route, containing the index of the matched route and the extracted parameters.
 */
export interface RouteMatch {
  /** Routee index */
  index: number;
  /** Route definition */
  route: RouteDefinition;
  /** Extracted route parameters */
  params: Record<string, string>;
}
