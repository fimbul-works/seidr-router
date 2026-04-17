import { getAppState, type Seidr } from "@fimbul-works/seidr";
import { DATA_KEY_ROUTER_TREE, DATA_KEY_ROUTER_URL } from "../constants.js";

/**
 * Clear cached path from AppState.
 * Used for testing.
 */
export const clearRouterState = () => {
  const state = getAppState();

  state.getData<Seidr>(DATA_KEY_ROUTER_URL)?.destroy();
  state.deleteData(DATA_KEY_ROUTER_URL);

  state.getData<Seidr>(DATA_KEY_ROUTER_TREE)?.destroy();
  state.deleteData(DATA_KEY_ROUTER_TREE);
};
