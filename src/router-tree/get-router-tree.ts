import { getAppState, SeidrError } from "@fimbul-works/seidr";
import { DATA_KEY_ROUTER_TREE } from "../constants.js";
import type { RouterTreeNode } from "../types.js";

/**
 * Get the current URL as a Seidr observable.
 *
 * @returns {Map<string, RouterTreeNode>} The the router tree
 */
export function getRouterTree(): Map<string, RouterTreeNode> {
  // @ts-expect-error
  if (__SEIDR_DEV__ && !getAppState().hasData(DATA_KEY_ROUTER_TREE)) {
    throw new SeidrError("Router is not initialized");
  }
  return getAppState().getData<Map<string, RouterTreeNode>>(DATA_KEY_ROUTER_TREE)!;
}
