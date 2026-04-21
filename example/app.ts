import { component } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { Router } from "../src/index.js";
import type { Route } from "../src/types.js";
import { Footer } from "./components/footer.js";
import { Header } from "./components/header.js";
import { HomePage, NotFoundPage, PostPage } from "./pages/index.js";

// Route definitions
export const routes: Route[] = [
  { path: "/", component: HomePage, exact: true },
  { path: "/post/:slug", component: PostPage },
  { path: "*", component: NotFoundPage },
];

// Main App
export const BlogApp = component<string>((url: string) => {
  return $div({ className: "app-container" }, [
    Header(),
    $div({ className: "main-content" }, [Router(routes, { url })]),
    Footer(),
  ]);
}, "BlogApp");
