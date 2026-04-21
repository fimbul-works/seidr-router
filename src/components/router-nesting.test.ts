import { $, component, mount } from "@fimbul-works/seidr";
import { clearTestAppState, describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it } from "vitest";
import { usePathname, useRouterParams } from "../hooks/index.js";
import { clearRouterState } from "../test/index.js";
import { Router } from "./router.js";

describeDualMode("Router Nesting", ({ getDocument }) => {
  let container: HTMLElement;
  let doc: Document;

  beforeEach(() => {
    doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
    clearRouterState();
    clearTestAppState();
  });

  afterEach(() => {
    if (container.parentNode) {
      doc.body.removeChild(container);
    }
  });

  it("should match nested routes relative to parent", () => {
    const SettingsPage = () => $("div", { textContent: "Settings Page" });
    const ProfilePage = () => $("div", { textContent: "Profile Page" });

    const UserDashboard = () =>
      Router([
        { path: "/settings", component: SettingsPage },
        { path: "/profile", component: ProfilePage },
      ]);

    const App = () => Router([{ path: "/user/:id", component: UserDashboard }], { url: "/user/123/settings" });

    mount(App, container);

    expect(container.textContent).toContain("Settings Page");
  });

  it("should return localized pathname via usePathname", () => {
    let rootPath = "";
    let midPath = "";
    let leafPath = "";

    const Leaf = component(() => {
      leafPath = usePathname().value;
      return $("div", { textContent: "Leaf" });
    }, "Leaf");

    const Mid = component(() => {
      midPath = usePathname().value;
      return Router([{ path: "/c", component: Leaf }]);
    }, "Mid");

    const App = component(() => {
      // Wrapped in a root Router to provide context for usePathname
      return Router(
        [
          {
            path: "*",
            component: component(() => {
              rootPath = usePathname().value;
              return Router([{ path: "/a/:any", component: Mid }]);
            }),
          },
        ],
        { url: "/a/b/c" },
      );
    }, "App");

    mount(App, container);

    expect(rootPath).toBe("/a/b/c");
    expect(midPath).toBe("/a/b/c");
    expect(leafPath).toBe("/c");
  });

  it("should return localized params via useRouterParams", () => {
    let userParams: any = {};
    let orderParams: any = {};

    const OrderDetails = component(() => {
      orderParams = useRouterParams().value;
      return $("div", { textContent: "Order" });
    }, "OrderDetails");

    const UserDashboard = component(() => {
      userParams = useRouterParams().value;
      return Router([{ path: "/order/:orderId", component: OrderDetails }]);
    }, "UserDashboard");

    const App = component(
      () => Router([{ path: "/user/:userId", component: UserDashboard }], { url: "/user/123/order/456" }),
      "App",
    );

    mount(App, container);

    expect(userParams).toEqual({ userId: "123" });
    expect(orderParams).toEqual({ orderId: "456" });
  });
});
