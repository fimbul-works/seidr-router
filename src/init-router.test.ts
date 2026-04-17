import { type CleanupFunction, getAppState, Seidr } from "@fimbul-works/seidr";
import { describeDualMode, enableClientMode, enableSSRMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DATA_KEY_ROUTER_URL, DUMMY_BASE_URL } from "./constants";
import { initRouter } from "./init-router";

describeDualMode("initRouter", ({ isSSR }) => {
  let cleanup: CleanupFunction;

  beforeEach(() => {
    cleanup = isSSR ? enableSSRMode() : enableClientMode();
  });

  afterEach(() => {
    cleanup?.();
    vi.restoreAllMocks();
  });

  it("should initialize router with a string URL", () => {
    const url = "/user";
    const data = initRouter(url);

    expect(data).toEqual({
      [DATA_KEY_ROUTER_URL]: `${DUMMY_BASE_URL}${url}`,
    });
  });

  it("should initialize router with a URL object", () => {
    const url = new URL("/user", DUMMY_BASE_URL);
    const data = initRouter(url);

    expect(data).toEqual({
      [DATA_KEY_ROUTER_URL]: url.href,
    });
  });

  it("should initialize router with a Location object", () => {
    const url = window.location;
    const data = initRouter(url);

    expect(data).toEqual({
      [DATA_KEY_ROUTER_URL]: window.location.href,
    });
  });

  it("should setup AppState with observable value", () => {
    const url = "/user";
    initRouter(url);

    const urlSeidr = getAppState().getData(DATA_KEY_ROUTER_URL);
    expect(urlSeidr).toBeInstanceOf(Seidr);
    expect((urlSeidr as Seidr).value).toBeInstanceOf(URL);
    expect((urlSeidr as Seidr).value.href).toBe(new URL(url, DUMMY_BASE_URL).href);
  });

  if (!isSSR) {
    it("should update URL on popstate event", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      const url = "/user";
      initRouter(url);

      expect(addEventListenerSpy).toHaveBeenCalledWith("popstate", expect.any(Function));
    });
  }
});
