import {
  $,
  type Component,
  component,
  isSeidr,
  type Seidr,
  type SeidrChild,
  type SeidrElementProps,
  unwrapSeidr,
} from "@fimbul-works/seidr";
import { useNavigate } from "../hooks/index.js";
import { initRouter } from "../init-router.js";

/**
 * Link component props.
 */
export interface LinkProps<K extends keyof HTMLElementTagNameMap> {
  /** The route to navigate to */
  to: string | Seidr<string> | number;
  /** Optional HTML tag name (default: "a") */
  tagName?: K;
}

/**
 * Link component for Route.
 *
 * @template K - Key from the HTMLElementTagNameMap interface
 * @param {LinkProps & SeidrElementProps<K>} props - Link props with reactive bindings
 * @param {SeidrChild | SeidrChild[]} [children] - Optional child nodes
 * @returns {Component} Component that wraps an anchor element
 */
export const Link = <K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
  { to, tagName = "a" as K, ...restProps }: LinkProps<K> & SeidrElementProps<K>,
  children?: SeidrChild | SeidrChild[],
): Component =>
  component(() => {
    initRouter();

    // Disable hydration
    if (isSeidr(to)) {
      // to.options.hydrate = false;
    }

    const navigate = useNavigate();

    return $(
      tagName as K,
      {
        href: to,
        ...restProps,
        onclick: (e: Event) => {
          e.preventDefault();
          navigate(unwrapSeidr(to));
        },
      } as SeidrElementProps<K>,
      children,
    );
  }, "Link")();
