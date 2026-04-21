import { component, inClient, inServer, isServer, List, Seidr, Suspense, Switch } from "@fimbul-works/seidr";
import { $div, $h1, $h2, $li, $ul } from "@fimbul-works/seidr/html";
import { Link } from "../../src/components/link.js";
import { getPosts } from "../blog-api.js";
import type { BlogPost } from "../types.js";

/**
 * Single post card in a list.
 */
const PostCard = component(
  (post: Seidr<BlogPost>) =>
    $li({ className: "post-card" }, Link(
      { to: `/post/${post.value.slug}` },
      [
        $h2({}, post.value.title),
        $div({ className: "date" }, new Date(post.value.date).toLocaleDateString()),
        $div({ className: "excerpt", innerHTML: post.value.excerpt }),
        "Read more →",
      ]),
    ),
  "PostCard",
);

/**
 * Home page.
 */
export const HomePage = component(() => {
  const posts = new Seidr<BlogPost[]>([], { id: "posts" });
  const loadTime = new Seidr<number>(0, { id: "loadtime" });

  const postsPromise: Promise<BlogPost[]> = isServer()
    ? inServer(async () => {
        posts.value = await getPosts();
        loadTime.value = Date.now();
        return posts.value;
      })
    : inClient(async () => {
        if (posts.value?.length > 0 && Date.now() - loadTime.value < 60000) {
          return posts.value;
        }
        const res = await fetch("/api/post");
        const data = await res.json();
        posts.value = data;
        loadTime.value = Date.now();
        return posts.value;
      });

  return Suspense(
    postsPromise,
    component(({ state, value, error }) => {
      return Switch(state, {
        resolved: () =>
          $div({ className: "home-page" }, [
            $h1({}, "Latest Posts"),
            $ul({ className: "post-list" }, [List(value as Seidr<BlogPost[]>, (p) => p.slug, PostCard)]),
          ]),
        pending: () => $div({}, "Loading posts..."),
        error: () => $div({ className: "error" }, error.value?.message || "Something went wrong."),
      });
    }, "PostsSuspense"),
  );
}, "HomePage");
