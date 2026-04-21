import { renderToString } from "@fimbul-works/seidr/ssr";
import { BlogApp } from "./app.js";

export function render(url: string) {
  return renderToString(() => BlogApp(url));
}
