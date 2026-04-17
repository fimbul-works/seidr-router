import {
  type Component,
  type ComponentFactoryFunction,
  component,
  getLastNode,
  isFn,
  mountComponent,
  noHydrate,
  type Seidr,
  useScope,
  wrapComponent,
  wrapSeidr,
} from "@fimbul-works/seidr";
import { useParams, usePathname } from "../hooks/index.js";
import { matchRoute } from "../match-route.js";
import type { RouteDefinition } from "../types";

/**
 * Router component props.
 */
export interface RouterProps<C extends ComponentFactoryFunction = ComponentFactoryFunction> {
  routes: Array<RouteDefinition> | Seidr<Array<RouteDefinition>>;
  fallback?: C | Seidr<C | undefined>;
}

/**
 * Router component - renders the first matching route or a fallback.
 */
export const Router = <C extends ComponentFactoryFunction = ComponentFactoryFunction>(
  routes: Array<RouteDefinition> | Seidr<Array<RouteDefinition>>,
  fallback?: C | Seidr<C | undefined>,
): Component =>
  component(({ routes: routesProp, fallback: fallbackProp }: RouterProps<C>) => {
    const routerComponent = useScope()!;
    const routes = wrapSeidr(routesProp, noHydrate);
    const fallback = wrapSeidr(fallbackProp, noHydrate);
    const currentPath = usePathname();
    const currentParams = useParams();

    let currentComponent: Component | undefined;
    let currentFactory: ComponentFactoryFunction | undefined;
    let currentRouteIndex = -100;

    const matchCurrentPath = (): { index: number; params: Record<string, string> } => {
      const match = matchRoute(currentPath.value, routes.value);
      return match
        ? {
            index: match.index,
            params: match.params,
          }
        : { index: -1, params: {} };
    };

    const getMatchedFactory = (index: number) =>
      index > -1 ? routes.value[index].component : isFn(fallback.value) ? fallback.value : undefined;

    const updateComponent = (index: number) => {
      currentFactory = getMatchedFactory(index);
      if (currentFactory) {
        currentComponent = wrapComponent(currentFactory, "Route")(undefined, routerComponent, currentPath.value);
      } else {
        currentComponent = undefined;
      }
    };

    const { index: initialIndex, params: initialParams } = matchCurrentPath();

    if (initialIndex > -1 && initialParams) {
      currentRouteIndex = initialIndex;
    }
    updateComponent(currentRouteIndex);

    if (currentComponent) {
      routerComponent.addChild(currentComponent);
      if (routerComponent.parentNode) {
        mountComponent(currentComponent, routerComponent.endMarker || null, routerComponent.parentNode);
      }
    }

    const updateRoutes = () => {
      const { index: matchedIndex, params: matchedParams } = matchCurrentPath();
      const matchedFactory = getMatchedFactory(matchedIndex);

      // If route hasn't changed, only update params and skip re-render
      if (matchedFactory === currentFactory) {
        currentRouteIndex = matchedIndex;
        return;
      }

      // 1. Resolve anchor point before unmounting
      const lastNode = currentComponent ? getLastNode(currentComponent) : null;
      const anchor = lastNode?.nextSibling || routerComponent.endMarker || null;
      const parent = lastNode?.parentNode || routerComponent.endMarker?.parentNode || routerComponent.parentNode;

      // 2. Full swap
      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = undefined;
      }

      // Update index and parameters
      currentRouteIndex = matchedIndex;
      updateComponent(matchedIndex);

      if (currentComponent) {
        routerComponent.addChild(currentComponent);
        routerComponent.element = currentComponent;
        mountComponent(currentComponent, anchor, parent!);
      } else {
        routerComponent.element = undefined;
      }
    };

    routerComponent.onUnmount(currentPath.observe(updateRoutes));
    routerComponent.onUnmount(routes.observe(updateRoutes));
    routerComponent.onUnmount(fallback.observe(updateRoutes));
    routerComponent.onUnmount(() => currentComponent?.unmount());

    routerComponent.element = currentComponent;
    return currentComponent;
  }, "Router")({ routes, fallback });
