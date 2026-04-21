import { $, component, mount } from "@fimbul-works/seidr";
import { clearTestAppState, describeDualMode } from "@fimbul-works/seidr/testing";
import { beforeEach, expect, it } from "vitest";
import { Router } from "../components/router";
import { getRouterState } from "../get-router-state";
import { clearRouterState } from "../test";
import { useNavigate } from "./use-navigate";
import { useSearchParams } from "./use-search-params";

describeDualMode("useSearchParams", ({ getDocument, isSSR }) => {
  let container: HTMLElement;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
    clearRouterState();
    clearTestAppState();
  });

  it("should return reactive query params", () => {
    let params: any;
    let navigate: any;

    const TestComponent = component(() => {
      [params] = useSearchParams();
      navigate = useNavigate();
      return $("div");
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    mount(App, container);

    navigate("/?q=hello");
    expect(params.value.q).toBe("hello");
  });

  it("should update query params and reflect in Seidr", () => {
    let params: any;
    let setParam: any;

    const TestComponent = component(() => {
      [params, setParam] = useSearchParams();
      return $("div");
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    mount(App, container);

    expect(params.value.new).toBeUndefined();

    setParam("new", "value");

    if (!isSSR) {
      expect(window.location.search).toContain("new=value");
    }
    expect(getRouterState().url.value.search).toContain("new=value");

    // The params Seidr should be updated automatically
    expect(params.value.new).toBe("value");
  });
});
