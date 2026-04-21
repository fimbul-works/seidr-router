import { $, type CleanupFunction, component, getAppState, mount, Seidr } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it } from "vitest";
import { DATA_KEY_BROWSER_ROUTER, DATA_KEY_HASH_ROUTER } from "../constants.js";
import { initRouter } from "../init-router.js";
import { browserRouter } from "./browser-router.js";
import { hashRouter } from "./hash-router.js";

describeDualMode("Router Singletons", ({ getDocument }) => {
  const comp = component(() => $("div"));
  let cleanup: CleanupFunction;

  beforeEach(() => {
    const doc = getDocument();
    const container = doc.createElement("div");
    doc.body.appendChild(container);
    initRouter("/");
    cleanup = mount(comp, container);
  });

  afterEach(() => {
    cleanup();
  });

  it("browserRouter should return the same instance", () => {
    const router1 = browserRouter();
    const router2 = browserRouter();

    expect(router1).toBe(router2);
    expect(getAppState().hasData(DATA_KEY_BROWSER_ROUTER)).toBe(true);
    expect(getAppState().getData(DATA_KEY_BROWSER_ROUTER)).toBe(router1);
  });

  it("hashRouter should return the same instance", () => {
    const router1 = hashRouter();
    const router2 = hashRouter();

    expect(router1).toBe(router2);
    expect(getAppState().hasData(DATA_KEY_HASH_ROUTER)).toBe(true);
    expect(getAppState().getData(DATA_KEY_HASH_ROUTER)).toBe(router1);
  });

  it("browserRouter and hashRouter should be distinct", () => {
    const browser = browserRouter();
    const hash = hashRouter();

    expect(browser).not.toBe(hash);
  });

  it("router instances should have required properties", () => {
    const router = browserRouter();

    expect(router).toHaveProperty("push");
    expect(router).toHaveProperty("replace");
    expect(router).toHaveProperty("go");
    expect(router.pathname).toBeInstanceOf(Seidr);
    expect(router.searchParams).toBeInstanceOf(Seidr);
    expect(router.routeParams).toBeInstanceOf(Seidr);
  });
});
