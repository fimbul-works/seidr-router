import { component } from "@fimbul-works/seidr";
import { $footer } from "@fimbul-works/seidr/html";

/**
 * Page footer.
 */
export const Footer = component(() => $footer({}, `© ${new Date().getFullYear()} Seidr Blog Example`), "Footer");
