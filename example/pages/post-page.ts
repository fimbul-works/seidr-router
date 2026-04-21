import {
  component,
  inClient,
  inServer,
  isServer,
  Seidr,
  Suspense,
  type SuspenseState,
  Switch,
} from "@fimbul-works/seidr";
import { $article, $div, $h1 } from "@fimbul-works/seidr/html";
import { useRouteParams } from "../../src/index.js";
import { getPost } from "../blog-api.js";
import type { BlogPost } from "../types.js";

/**
 * Post page.
 */
export const PostPage = component(() => {
  const params = useRouteParams();
  const post = new Seidr<BlogPost | null>(null, { id: "post" });

  const postPromise: Promise<BlogPost | null> = isServer()
    ? inServer(async () => {
        post.value = await getPost(params.value.slug);
        return post.value;
      })
    : inClient(async () => {
        if (post.value?.slug === params.value.slug) {
          return post.value;
        }
        const res = await fetch(`/api/post/${params.value.slug}`);
        if (res.ok) {
          post.value = await res.json();
        }
        return post.value;
      });

  return Suspense(postPromise, ({ state, value, error }: SuspenseState<BlogPost | null>) => {
    return Switch(state, {
      resolved: () => {
        const p = value.value;
        if (!p) return $div({ className: "error" }, "Post not found");

        return $article({ className: "post-page" }, [
          $h1({}, p.title),
          $div({ className: "meta" }, new Date(p.date).toLocaleDateString()),
          $div({ className: "markdown-body", innerHTML: p.content }),
        ]);
      },
      pending: () => $div({}, "Loading post..."),
      error: () => $div({ className: "error" }, error.value?.message || "Something went wrong."),
    });
  });
}, "PostPage");
