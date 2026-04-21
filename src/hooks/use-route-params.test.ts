import { $, component, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { beforeEach, expect, it } from "vitest";
import { Router } from "../components/router";
import { useRouteParams } from "./use-route-params";

describeDualMode("useRouteParams", ({ getDocument }) => {
  let container: HTMLElement;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
  });

  it("should return parsed parameters from the current route", () => {
    let result: any;

    const UserComponent = component(() => {
      result = useRouteParams();
      return $("div", { textContent: result.as((p: any) => `User ${p.id}`) });
    });

    const App = () => Router([{ path: "/user/:id", component: UserComponent }], { url: "/user/123" });

    mount(App, container);

    expect(result.value).toEqual({ id: "123" });
    expect(container.textContent).toBe("User 123");
  });

  it("should return empty object if no params in matching route", () => {
    let result: any;
    const Home = component(() => {
      result = useRouteParams();
      return $("div");
    });

    const App = () => Router([{ path: "/", component: Home }]);

    mount(App, container);
    expect(result.value).toEqual({});
  });

  it("should return empty object if called outside of Router (fallback to global)", () => {
    let result: any;
    const TestComponent = component(() => {
      result = useRouteParams();
      return $("div");
    });

    mount(TestComponent, container);
    expect(result.value).toEqual({});
  });
});
