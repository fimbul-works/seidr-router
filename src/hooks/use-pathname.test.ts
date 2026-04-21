import { $, component, mount } from "@fimbul-works/seidr";
import { clearTestAppState } from "@fimbul-works/seidr/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { Router } from "../components/router";
import { clearRouterState } from "../test";
import { useNavigate } from "./use-navigate";
import { usePathname } from "./use-pathname";

describe("usePathname", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    clearRouterState();
    clearTestAppState();
  });

  it("should return current path as a Seidr", () => {
    let result: any;

    const TestComponent = component(() => {
      result = usePathname();
      return $("div");
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    const cleanup = mount(App, container);
    expect(result.value).toBe("/");

    cleanup();
  });

  it("should be reactive when path changes", () => {
    let result: any;
    let navigate: any;

    const TestComponent = component(() => {
      result = usePathname();
      navigate = useNavigate();
      return $("div");
    });

    const App = () =>
      Router([
        { path: "/", component: TestComponent },
        { path: "/about", component: TestComponent },
      ]);

    const cleanup = mount(App, container);
    expect(result.value).toBe("/");

    navigate("/about");
    expect(result.value).toBe("/about");

    cleanup();
  });

  it("should be read-only (derived)", () => {
    let result: any;

    const TestComponent = component(() => {
      result = usePathname();
      return $("div");
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    const cleanup = mount(App, container);

    expect(() => {
      result.value = "/forbidden";
    }).toThrow();

    cleanup();
  });
});
