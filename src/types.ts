import type { ComponentFactoryFunction } from "@fimbul-works/seidr";

/**
 * Route definition for Router.
 */
export type RouteDefinition = [pattern: string | RegExp, factory: ComponentFactoryFunction];
