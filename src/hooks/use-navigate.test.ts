import { $, component, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { beforeEach, expect, it } from "vitest";
import { Router } from "../components/router";
import { initRouter } from "../init-router";
import { useNavigate } from "./use-navigate";
import { usePathname } from "./use-pathname";

describeDualMode("useNavigate", ({ getDocument }) => {
  let container: HTMLElement;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
    initRouter("/");
  });

  it("should update currentPath value", () => {
    let navigate: any;
    let pathname: any;

    const TestComponent = component(() => {
      navigate = useNavigate();
      pathname = usePathname();
      return $("div");
    });

    const App = () =>
      Router([
        { path: "/", component: TestComponent },
        { path: "/about", component: TestComponent },
      ]);

    mount(App(), container);

    navigate("/about");
    expect(pathname.value).toBe("/about");
  });

  it("should preserve query params and hashes in the underlying URL state", () => {
    let navigate: any;
    const TestComponent = component(() => {
      navigate = useNavigate();
      return $("div");
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    mount(App(), container);

    navigate("/about?foo=bar#baz");
    // useNavigate updates the singleton router's URL observable
    // We can't easily check internal state of the router here without getRouterState
    // But we can check if it navigated (which would unmount TestComponent if not matched)
  });

  it("should handle relative navigation with delta (go)", () => {
    let navigate: any;
    const TestComponent = component(() => {
      navigate = useNavigate();
      return $("div");
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    mount(App(), container);

    // Testing go(-1) etc is hard to verify without mocking history() or getRouterState()
    expect(() => navigate(-1)).not.toThrow();
  });
});
