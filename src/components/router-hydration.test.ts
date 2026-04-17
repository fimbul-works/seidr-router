import {
  $a,
  $div,
  $footer,
  $h1,
  $h2,
  $li,
  $nav,
  $p,
  $section,
  $text,
  $ul,
  type CleanupFunction,
  component,
  List,
  type Seidr,
  Suspense,
  Switch,
} from "@fimbul-works/seidr";
import { hydrate, renderToString } from "@fimbul-works/seidr/ssr";
import {
  clearHydrationData,
  enableClientMode,
  enableSSRMode,
  resetRequestIdCounter,
} from "@fimbul-works/seidr/testing";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { usePathname } from "../hooks/use-pathname";
import { initRouter } from "../init-router";
import { clearRouterState } from "../test/index";
import { Link } from "./link";
import { Router } from "./router";

describe("Router Hydration", () => {
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

  let homeUnmounted = false;
  let fallbackUnmounted = false;

  const HomePage = component(() => {
    const message = $text("Welcome to my homepage");
    return $section({ className: "home-page" }, [$h1(null, "Home"), $div(null, message)]);
  }, "HomePage");

  const AboutPage = component(() => {
    return $section({ className: "about-page" }, [
      $h1(null, "About"),
      $p(null, "This page tells something about me"),
      $p(null, "I am a developer from Finland"),
    ]);
  }, "AboutPage");

  const NotFoundPage = component(() => {
    return $section({ className: "not-found-page" }, [
      $h1(null, "Not Found"),
      $p(null, "The page you are looking for does not exist"),
      Link({ to: "/" }, "Back to home"),
    ]);
  }, "NotFoundPage");

  const Navigation = component(() => {
    const pathname = usePathname();
    const links = [
      { to: "/", textContent: "Home" },
      { to: "/about", textContent: "About" },
    ];
    return links.map((link) =>
      Link({
        to: link.to,
        textContent: link.textContent,
        className: pathname.as<string>((l) => (l === link.to ? "active" : "")),
      }),
    );
  }, "Navigation");

  const App = component(() => {
    return [
      Navigation(),
      Router(
        [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
        NotFoundPage,
      ),
    ];
  }, "App");

  beforeAll(() => {
    cleanupClientMode = enableClientMode();
    clearRouterState();
    resetRequestIdCounter();
    clearHydrationData();
  });

  beforeEach(() => {
    clearRouterState();
    homeUnmounted = false;
    fallbackUnmounted = false;
  });

  afterEach(() => {
    clearRouterState();
    unmount?.();
    document.body.innerHTML = "";
  });

  afterAll(() => {
    resetRequestIdCounter();
    clearHydrationData();
    cleanupClientMode();
  });

  it("should mount default route when navigating to home", async () => {
    // 1. SSR a 404 page
    const cleanupSSR = enableSSRMode();
    //process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(App, { ...initRouter("/") });
    //delete process.env.SEIDR_TEST_SSR;
    cleanupSSR();

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    unmount = hydrate(App, container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".home-page")).toBeTruthy();
    expect(container.querySelector(".not-found-page")).toBeFalsy();
  });

  it("should unmount SSR fallback when navigating to a valid route", async () => {
    // 1. SSR a 404 page
    const cleanupSSR = enableSSRMode();
    // process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(App, { ...initRouter("/unknown") });
    // delete process.env.SEIDR_TEST_SSR;
    cleanupSSR();

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    initRouter("/unknown");
    window.history.pushState({}, "", "/unknown");

    unmount = hydrate(App, container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".not-found-page")).toBeTruthy();
    expect(container.querySelector(".home-page")).toBeFalsy();

    // 4. Navigate to "/about"
    window.history.pushState({}, "", "/about");
    window.dispatchEvent(new PopStateEvent("popstate"));

    // Verify unmount
    expect(container.querySelector(".about-page")).toBeTruthy();
    expect(container.querySelector(".not-found-page")).toBeFalsy();
    expect(fallbackUnmounted).toBe(true);
    expect(homeUnmounted).toBe(false);
  });

  it("should unmount SSR route when navigating to fallback", async () => {
    // 1. SSR Home page
    const cleanupSSR = enableSSRMode();
    // process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(App, { path: "/" });
    // delete process.env.SEIDR_TEST_SSR;
    cleanupSSR();

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    initRouter("/");
    window.history.pushState({}, "", "/");
    unmount = hydrate(App, container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".fallback")).toBeFalsy();

    // 4. Navigate to "/unknown"
    window.history.pushState({}, "", "/unknown");
    window.dispatchEvent(new PopStateEvent("popstate"));

    // Verify unmount
    expect(container.querySelector(".home")).toBe(null);
    expect(container.querySelector(".fallback")).toBeTruthy();
    expect(homeUnmounted).toBe(true);
    expect(fallbackUnmounted).toBe(false);
  });

  it("should handle complex application hydration", async () => {
    type BlogPost = {
      slug: string;
      title: string;
      excerpt: string;
      date: string;
    };

    const Header = component(
      () =>
        $nav({ className: "navbar" }, [
          Link({ to: "/", className: "brand" }, "Seidr Blog"),
          $div({ className: "links" }, [
            Link({ to: "/" }, "Home"),
            $a({ href: "https://github.com/fimbul-works/seidr", target: "_blank" }, "GitHub"),
          ]),
        ]),
      "Header",
    );

    const PostCard = component(
      (post: BlogPost) =>
        $li({ className: "post-card" }, [
          $h2({}, [Link({ to: `/post/${post.slug}` }, post.title)]),
          $div({ className: "meta" }, new Date(post.date).toLocaleDateString()),
          $div({ className: "excerpt", innerHTML: post.excerpt }),
          Link({ to: `/post/${post.slug}`, className: "read-more" }, "Read more →"),
        ]),
      "PostCard",
    );

    const HomePage = component(() => {
      const postsPromise: Promise<BlogPost[]> = Promise.resolve([
        {
          slug: "one",
          title: "First",
          excerpt: "This is the first post",
          date: "2026-01-01",
        },
        {
          slug: "two",
          title: "Second",
          excerpt: "This is the second post",
          date: "2026-02-01",
        },
        {
          slug: "three",
          title: "Third",
          excerpt: "This is the third post",
          date: "2026-03-01",
        },
      ]);

      return Suspense(
        postsPromise!,
        component(({ state, value, error }) => {
          return Switch(state, {
            pending: component(() => $div({}, "Loading posts..."), "Pending"),
            resolved: component(
              () =>
                $div({ className: "home-page" }, [
                  $h1({}, "Latest Posts"),
                  $ul({ className: "post-list" }, [List(value as Seidr<BlogPost[]>, (p) => p.slug, PostCard)]),
                ]),
              "Resolved",
            ),
            error: component(() => $div({}, error.value?.message || "Error"), "Error"),
          });
        }, "Posts"),
      );
    }, "HomePage");

    const BlogApp = component(() => {
      return $div({ className: "app-container" }, [
        Header(),
        $div({ className: "main-content" }, Router([{ path: "/", component: HomePage }])),
        $footer({}, `© ${new Date().getFullYear()} Seidr Blog Example`),
      ]);
    }, "BlogApp");

    const { hydrationData, html } = await renderToString(BlogApp);

    const container = document.createElement("div");
    container.innerHTML = html;

    cleanupClientMode = enableClientMode();
    unmount = hydrate(BlogApp, container, hydrationData);

    expect(container.innerHTML).toBe(html);
  });
});
