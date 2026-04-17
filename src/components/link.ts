import {
  $,
  type Component,
  component,
  type Seidr,
  type SeidrChild,
  type SeidrElementProps,
  unwrapSeidr,
} from "@fimbul-works/seidr";
import { useNavigate } from "../hooks/index.js";

/**
 * Link component props.
 */
export interface LinkProps<K extends keyof HTMLElementTagNameMap> {
  /** The route to navigate to */
  to: string | Seidr<string>;
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
    const navigate = useNavigate();

    const el = $(
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

    return el;
  }, "Link")();
