import { getRouterState } from "../get-router-state.js";
import type { RouterTreeNode } from "../types.js";

/**
 * Get the current router tree.
 *
 * @returns {Map<string, RouterTreeNode>} The the router tree
 * @throws {SeidrError} If the router is not initialized
 */
export const getRouterTree = (): Map<string, RouterTreeNode> => getRouterState().tree;
