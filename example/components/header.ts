import { component } from "@fimbul-works/seidr";
import { $a, $div, $nav } from "@fimbul-works/seidr/html";
import { Link } from "../../src/components/link";

/**
 * Page header.
 */
export const Header = component(
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
