import { component } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";

/**
 * Not found page.
 */
export const NotFoundPage = component(() => $div({ className: "error" }, "Page not found"), "NotFoundPage");
