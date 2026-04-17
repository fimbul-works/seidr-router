import type { CleanupFunction } from "@fimbul-works/seidr";
import { $div, mount, wrapComponent } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { getUrl } from "./get-url";
import { useParams } from "./hooks/use-params";
import { matchRoute } from "./match-route";
import type { RouteDefinition } from "./types";

describeDualMode("matchRoute", () => {
  const comp = () => $div();
  let unmount: CleanupFunction;

  afterEach(() => {
    unmount?.();
    getCurrentParams().value = {};
  });

  it("should match simple path", () => {
    const route: RouteDefinition = { path: "/home", component: comp };
    const match = matchRoute("/home", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.index).toBe(0);
    expect(match?.params).toEqual({});
  });

  it("should match route with search parameters and hash", () => {
    const route: RouteDefinition = { path: "/home", component: comp };
    const match = matchRoute("/home?foo=bar#baz", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.index).toBe(0);
    expect(match?.params).toEqual({});
  });

  it("should match route with parameters", () => {
    const route: RouteDefinition = {
      path: "/user/:id",
      component: () => {
        const params = useParams();
        return $div({ textContent: params.as((p) => p.id) });
      },
    };
    const match = matchRoute("/user/123", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.params).toEqual({ id: "123" });
  });

  it("should match regex route", () => {
    const route: RouteDefinition = {
      path: /^\/post\/(?<slug>[a-z-]+)$/,
      component: () => {
        const params = useParams();
        return $div({ textContent: params.as((p) => p.slug) });
      },
    };
    const match = matchRoute("/post/hello-world", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.params).toEqual({ slug: "hello-world" });
  });

  it("should prioritize earlier routes", () => {
    const route1: RouteDefinition = { path: "/user/new", component: comp };
    const route2: RouteDefinition = {
      path: "/user/:id",
      component: () => {
        const params = useParams();
        return $div({ textContent: params.as((p) => p.id) });
      },
    };

    const match = matchRoute("/user/new", [route1, route2]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route1);
    expect(match?.params).toEqual({});
  });

  it("should return null for no match", () => {
    const route: RouteDefinition = { path: "/home", component: comp };
    const match = matchRoute("/about", [route]);

    expect(match).toBeNull();
  });

  it("should handle trailing slashes", () => {
    const route: RouteDefinition = { path: "/home", component: comp };
    const match = matchRoute("/home/", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
  });

  it("should render component with captured params via useParams", async () => {
    const route: RouteDefinition = {
      path: "/user/:id",
      component: () => {
        const params = useParams();
        return $div({ textContent: params.as((p) => `User: ${p.id}`) });
      },
    };

    const match = matchRoute("/user/42", [route]);
    expect(match).not.toBeNull();

    if (!match) {
      throw new Error("Route parameters should match");
    }

    // Set the global params that useParams will pick up
    getCurrentParams().value = match.params;

    const container = $div();
    const factory = wrapComponent(match.route.component);

    const component = factory();
    unmount = mount(component, container);

    expect(container.textContent).toBe("User: 42");
  });
});
