import {
  type Component,
  type ComponentFactoryFunction,
  component,
  getLastNode,
  isSeidr,
  mountComponent,
  Seidr,
  useScope,
  wrapComponent,
  wrapSeidr,
} from "@fimbul-works/seidr";
import { getRouterState } from "../get-router-state.js";
import { initRouter } from "../init-router.js";
import { matchRoute } from "../match-route.js";
import { browserRouter } from "../router/browser-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";
import { registerRouter } from "../router-tree/register-router.js";
import type { Route, RouteMatch, RouterInterface } from "../types";

/**
 * Router component options.
 */
export interface RouterOptions {
  router?: RouterInterface;
  url?: string | URL;
}

/**
 * Router component - renders the first matching route.
 * Use a wildcard route ("*") as the last entry for fallback behavior.
 *
 * @param {Array<Route> | Seidr<Array<Route>>} routes - Array of route definitions or a Seidr that resolves to it
 * @param {RouterOptions} [options={}] - Optional router options. If not provided, browserRouter() will be used.
 * @param {string} [name="Router"] - Optional name for the component (used for debugging)
 * @returns {Component} The Router component instance
 */
export const Router = (
  routes: Array<Route> | Seidr<Array<Route>>,
  options: RouterOptions = {},
  name: string = "Router",
): Component =>
  component(() => {
    initRouter(options.url);

    const routerComponent = useScope()!;
    const routesObservable = wrapSeidr(routes, { hydrate: false });
    const routerInstance = options.router || browserRouter();
    const parentNode = getNearestRouter();

    // Disable hydration for routes
    if (isSeidr(routesObservable)) {
      routesObservable.options.hydrate = false;
    }

    // Calculate the matched path prefix from ancestors
    let parentPrefix = "";
    if (parentNode) {
      // Find all ancestors and join their matched paths
      // This allows nested routers to skip the portion of the path already consumed
      let current = parentNode;
      const prefixes = [current.matchedPath];
      while (current.parentId) {
        const state = getRouterState();
        const parent = state.tree.get(current.parentId);
        if (!parent) {
          break;
        }
        prefixes.unshift(parent.matchedPath);
        current = parent;
      }
      parentPrefix = prefixes.join("").replace(/\/+$/, "");
    }

    // The local path is the router's pathname minus the prefix from parent routers
    const currentPath = routerInstance.pathname.as((path) => {
      if (path.startsWith(parentPrefix)) {
        const local = path.slice(parentPrefix.length);
        return local.startsWith("/") ? local : `/${local}`;
      }
      return "/";
    });

    const currentParams = new Seidr<Record<string, string>>({}, { hydrate: false });
    let currentRouteIndex = -1;
    let currentMatchedPath = "";
    let currentComponent: Component | null = null;
    let currentFactory: ComponentFactoryFunction | null = null;

    /**
     * Match the current path against the provided routes.
     */
    const matchCurrentPath = (): RouteMatch =>
      matchRoute(currentPath.value, routesObservable.value) || { index: -1, params: {}, matchedPath: "" };

    /**
     * Get the component factory for the matched route index.
     */
    const getMatchedFactory = (index: number) => (index > -1 ? routesObservable.value[index].component : null);

    /**
     * Update the currently rendered component.
     */
    const updateComponent = (index: number) => {
      currentFactory = getMatchedFactory(index);
      currentComponent = currentFactory
        ? wrapComponent(currentFactory, `${name}Route`)(undefined, routerComponent)
        : null;
    };

    // Initial match
    const {
      index: initialIndex,
      route: initialRoute,
      params: initialParams,
      matchedPath: initialMatched,
    } = matchCurrentPath();

    if (initialIndex > -1 && initialParams) {
      currentRouteIndex = initialIndex;
      currentParams.value = initialParams;
      currentMatchedPath = initialMatched;
    }

    // Register in the router tree BEFORE creating child components
    const routerNode = registerRouter(routerComponent, {
      component: routerComponent,
      route: initialRoute,
      router: routerInstance,
      pathname: currentPath,
      routerParams: currentParams,
      childrenIds: new Set<string>(),
      matchedPath: currentMatchedPath,
    });

    updateComponent(currentRouteIndex);

    if (currentComponent) {
      routerComponent.addChild(currentComponent);
      if (routerComponent.parentNode) {
        mountComponent(currentComponent, routerComponent.endMarker || null, routerComponent.parentNode);
      }
    }

    /**
     * Update the rendered route component.
     */
    const updateRoutes = (): void => {
      const {
        index: matchedIndex,
        route: matchedRoute,
        params: matchedParams,
        matchedPath: matchedPathValue,
      } = matchCurrentPath();
      const matchedFactory = getMatchedFactory(matchedIndex);

      // Update node data even if component doesn't change
      routerNode.matchedPath = matchedPathValue;
      routerNode.route = matchedRoute;

      if (matchedFactory === currentFactory) {
        currentRouteIndex = matchedIndex;
        currentParams.value = matchedParams;
        return;
      }

      const lastNode = currentComponent ? getLastNode(currentComponent) : null;
      const anchor = lastNode?.nextSibling || routerComponent.endMarker || null;
      const parent = lastNode?.parentNode || routerComponent.endMarker?.parentNode || routerComponent.parentNode;

      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
      }

      currentRouteIndex = matchedIndex;
      currentParams.value = matchedParams;
      updateComponent(matchedIndex);

      if (currentComponent) {
        routerComponent.addChild(currentComponent);
        routerComponent.element = currentComponent;
        mountComponent(currentComponent, anchor, parent!);
      } else {
        routerComponent.element = null;
      }
    };

    routerComponent.element = currentComponent;
    routerComponent.onUnmount(currentPath.observe(updateRoutes));
    routerComponent.onUnmount(routesObservable.observe(updateRoutes));
    routerComponent.onUnmount(() => currentComponent?.unmount());

    return currentComponent;
  }, name)();
