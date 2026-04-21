import type { Component, ComponentFactoryFunction, Seidr } from "@fimbul-works/seidr";

/**
 * `window.onpopstate` listener type for router URL changes.
 */
export type PopstateListener = (url: string) => void;

/**
 * Route definition for Router.
 */
export interface Route {
  path: string | RegExp;
  component: ComponentFactoryFunction;
  exact?: boolean;
}

/**
 * History interface.
 */
export interface History {
  /**
   * Navigate to a new location.
   */
  push: (location: string) => void;

  /**
   * Replace the current location.
   */
  replace: (location: string) => void;

  /**
   * Navigate to a location by delta.
   */
  go: (delta: number) => void;
}

/**
 * Router interface.
 */
export interface RouterInterface {
  /**
   * Navigate to a new location.
   */
  push: (location: string) => void;

  /**
   * Replace the current location.
   */
  replace: (location: string) => void;

  /**
   * Navigate to a location by delta.
   */
  go: (delta: number) => void;

  /**
   * Current pathname.
   */
  pathname: Seidr<string>;

  /**
   * Current search parameters.
   */
  searchParams: Seidr<Record<string, string>>;

  /**
   * Current route parameters.
   */
  routeParams: Seidr<Record<string, string>>;
}

/**
 * Node in the route tree used for nested routes.
 */
export interface RouterTreeNode {
  /** Component instance of the router */
  component: Component;
  /** Route definition */
  route?: Route;
  /** Current path */
  pathname: Seidr<string>;
  /** Router instance */
  router: RouterInterface;
  /** Current parameters */
  routerParams: Seidr<Record<string, string>>;
  /** Parent router ID, if any */
  parentId?: string;
  /** Child router IDs */
  childrenIds: Set<string>;
  /** The portion of the path that was matched by this router */
  matchedPath: string;
}

/**
 * Match result for a route, containing the index of the matched route and the extracted parameters.
 */
export interface RouteMatch {
  /** Routee index */
  index: number;
  /** Route definition */
  route?: Route;
  /** Extracted route parameters */
  params: Record<string, string>;
  /** The portion of the path that was matched */
  matchedPath: string;
}
/**
 * Global router state stored in AppState.
 */
export interface RouterState {
  /** URL for the router */
  url: Seidr<URL>;
  /** Router tree nodes */
  tree: Map<string, RouterTreeNode>;
  /** Parent router map */
  parentMap: Map<string, RouterTreeNode | null>;
  /** Popstate listeners */
  popstateListeners: Set<PopstateListener>;
}
