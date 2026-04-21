import { SeidrError } from "@fimbul-works/seidr";
import { getRouterTree } from "./get-router-tree.js";

/**
 * Unregister a router tree node for the given component scope.
 *
 * @param {string} id - The router component ID to unregister
 * @throws {SeidrError} If the router with the given ID is not registered
 */
export const unregisterRouter = (id: string): void => {
  const tree = getRouterTree();

  // Check existing router for the current scope
  if (!tree.has(id)) {
    throw new SeidrError(`Router with ID ${id} is not registered`);
  }

  const router = tree.get(id)!;

  // Recursively unregister child routers
  if (router.childrenIds.size > 0) {
    router.childrenIds.forEach((childId) => unregisterRouter(childId));
    router.childrenIds.clear();
  }

  // Remove parent-child relationship if there is a parent router
  if (router.parentId) {
    const parent = tree.get(router.parentId);
    if (parent) {
      parent.childrenIds.delete(id);
    }
  }

  tree.delete(id);
};
