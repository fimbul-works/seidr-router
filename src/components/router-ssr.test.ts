import { $, type CleanupFunction, component } from "@fimbul-works/seidr";
import { renderToString } from "@fimbul-works/seidr/ssr";
import { clearTestAppState, enableSSRMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useNavigate, useRouterParams } from "../hooks";
import { clearRouterState } from "../test";
import { Router } from "./router";

describe("Router SSR", () => {
  let cleanupEnv: CleanupFunction;

  beforeEach(() => {
    cleanupEnv = enableSSRMode();
    clearRouterState();
    clearTestAppState();
  });

  afterEach(() => {
    cleanupEnv();
  });

  const Home = component(() => $("div", { className: "home", textContent: "Home Component" }), "Home");
  const About = component(() => $("div", { className: "about", textContent: "About Component" }), "About");
  const Fallback = component(() => $("div", { className: "fallback", textContent: "404 Component" }), "Fallback");

  it("should render matching route to string", async () => {
    const App = component(
      () =>
        Router([
          { path: "/", component: Home, exact: true },
          { path: "/about", component: About },
        ]),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain('class="home"');
    expect(html).toContain("Home Component");
    expect(html).not.toContain("About Component");
  });

  it("should render another route to string", async () => {
    const App = component(
      () =>
        Router(
          [
            { path: "/", component: Home, exact: true },
            { path: "/about", component: About },
          ],
          { url: "/about" },
        ),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain('class="about"');
    expect(html).toContain("About Component");
    expect(html).not.toContain("Home Component");
  });

  it("should render wildcard to string when no match", async () => {
    const App = component(
      () =>
        Router(
          [
            { path: "/", component: Home, exact: true },
            { path: "*", component: Fallback },
          ],
          { url: "/not-found" },
        ),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain('class="fallback"');
    expect(html).toContain("404");
  });

  it("should handle dynamic params in SSR via useRouterParams", async () => {
    const User = component(() => {
      const params = useRouterParams();
      return $("div", { className: "user", textContent: params.as((p: any) => `User ${p.id}`) });
    }, "User");
    const App = component(() => Router([{ path: "/user/:id", component: User }], { url: "/user/123" }), "App");

    const { html } = await renderToString(App);
    expect(html).toContain("User 123");
  });

  it("should handle RegExp patterns in SSR via useRouterParams", async () => {
    const Post = component(() => {
      const params = useRouterParams();
      return $("div", { className: "post", textContent: params.as((p: any) => `Post ${p.id}`) });
    }, "Post");

    const App = component(
      () => Router([{ path: /^\/post\/(?<id>\d+)$/, component: Post }], { url: "/post/456" }),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain("Post 456");
  });

  it("should handle navigate during SSR render", async () => {
    let navigateWasCalled = false;

    const TestComponent = component(() => {
      const navigate = useNavigate();
      navigateWasCalled = true;
      navigate("/");
      return $("div", { textContent: "Test Component" });
    }, "Test");

    const App = component(() => Router([{ path: "/", component: TestComponent }]), "App");

    const { html } = await renderToString(App);
    expect(navigateWasCalled).toBe(true);
    expect(html).toContain("Test Component");
  });

  it("should isolate path between SSR requests", async () => {
    const HomePage = component(() => $("div", { textContent: "Home Page" }), "HomePage");
    const AboutPage = component(() => $("div", { textContent: "About Page" }), "AboutPage");

    const App = component(
      (url: string) =>
        Router(
          [
            { path: "/", component: HomePage, exact: true },
            { path: "/about", component: AboutPage },
          ],
          { url },
        ),
      "App",
    );

    const result1 = await renderToString(() => App("/about"));
    expect(result1.html).toContain("About Page");

    const result2 = await renderToString(() => App("/"));
    expect(result2.html).toContain("Home Page");
    expect(result2.html).not.toContain("About Page");
  });
});
