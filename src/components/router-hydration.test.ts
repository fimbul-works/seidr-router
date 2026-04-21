import { $text, type CleanupFunction, component, List, type Seidr, Suspense, Switch } from "@fimbul-works/seidr";
import { $a, $div, $footer, $h1, $h2, $li, $nav, $p, $section, $ul } from "@fimbul-works/seidr/html";
import { hydrate, renderToString } from "@fimbul-works/seidr/ssr";
import {
  clearHydrationData,
  enableClientMode,
  enableSSRMode,
  resetRequestIdCounter,
} from "@fimbul-works/seidr/testing";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { useNavigate } from "../hooks";
import { usePathname } from "../hooks/use-pathname";
import { clearRouterState } from "../test/index";
import { Link } from "./link";
import { Router } from "./router";

describe("Router Hydration", () => {
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

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
      Router([
        { path: "/", component: HomePage, exact: true },
        { path: "/about", component: AboutPage },
        { path: "*", component: NotFoundPage },
      ]),
    ];
  }, "App");

  beforeAll(() => {
    cleanupClientMode = enableClientMode();
    resetRequestIdCounter();
    clearHydrationData();
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
    // 1. SSR a page
    const cleanupSSR = enableSSRMode();
    const { html, hydrationData } = await renderToString(App);
    cleanupSSR();

    // 2. Setup browser DOM
    const cleanupClientMode = enableClientMode();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    unmount = hydrate(App, container, hydrationData);
    cleanupClientMode();

    // Verify initial state
    expect(container.querySelector(".home-page")).toBeTruthy();
  });

  it("should unmount SSR fallback when navigating to a valid route", async () => {
    const App = component(() => {
      return [
        Navigation(),
        Router(
          [
            { path: "/", component: HomePage, exact: true },
            { path: "/about", component: AboutPage },
            { path: "*", component: NotFoundPage },
          ],
          {
            url: "/unknown",
          },
        ),
      ];
    }, "App");

    // 1. SSR a 404 page
    const cleanupSSR = enableSSRMode();
    const { html, hydrationData } = await renderToString(App);
    cleanupSSR();

    // 2. Setup browser DOM
    const cleanupClientMode = enableClientMode();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    unmount = hydrate(App, container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".not-found-page")).toBeTruthy();

    // 4. Navigate to "/about"
    const navigate = useNavigate();
    navigate("/about");

    // Verify unmount
    expect(container.querySelector(".about-page")).toBeTruthy();
    expect(container.querySelector(".not-found-page")).toBeFalsy();

    cleanupClientMode();
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
      (post: Seidr<BlogPost>) =>
        $li({ className: "post-card" }, [
          $h2({}, [Link({ to: `/post/${post.value.slug}` }, post.value.title)]),
          $div({ className: "meta" }, new Date(post.value.date).toLocaleDateString()),
          $div({ className: "excerpt", innerHTML: post.value.excerpt }),
          Link({ to: `/post/${post.value.slug}`, className: "read-more" }, "Read more →"),
        ]),
      "PostCard",
    );

    const HomePageComp = component(() => {
      const postsPromise: Promise<BlogPost[]> = Promise.resolve([
        {
          slug: "one",
          title: "First",
          excerpt: "This is the first post",
          date: "2026-01-01",
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
    }, "HomePageComp");

    const BlogApp = component(() => {
      return $div({ className: "app-container" }, [
        Header(),
        $div({ className: "main-content" }, Router([{ path: "/", component: HomePageComp }])),
        $footer({}, `© ${new Date().getFullYear()} Seidr Blog Example`),
      ]);
    }, "BlogApp");

    const cleanupSSR = enableSSRMode();
    const { hydrationData, html } = await renderToString(BlogApp);
    cleanupSSR();

    cleanupClientMode = enableClientMode();

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    unmount = hydrate(BlogApp, container, hydrationData);

    expect(container.innerHTML).toBe(html);

    cleanupClientMode();
  });
});
