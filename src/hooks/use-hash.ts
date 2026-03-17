import { getAppState, getRootComponent, isServer, noHydrate, Seidr } from "@fimbul-works/seidr";
import { HASH_SEIDR_ID } from "../constants";

export const USE_HASH_DATA_KEY = "seidr.router.hash";

/**
 * Returns the current hash as a derived Seidr.
 * This cannot be changed directly by the user.
 *
 * @returns {Seidr<string>} Derived Seidr of the current hash
 */
export const useHash = (): Seidr<string> => {
  const appState = getAppState();
  const isInitialized = appState.hasData(USE_HASH_DATA_KEY);

  // Create the hash seidr if not already initialized
  const hashSeidr: Seidr<string> = isInitialized
    ? appState.getData(USE_HASH_DATA_KEY)!
    : new Seidr<string>(isServer() ? "" : window.location.hash, {
        ...noHydrate,
        id: HASH_SEIDR_ID,
      });

  if (!isInitialized) {
    appState.setData(USE_HASH_DATA_KEY, hashSeidr);
  }

  // Return the hash directly on the server
  if (isServer()) {
    return hashSeidr;
  }

  // Add event listeners for hash changes if not already initialized
  if (!isInitialized) {
    // Minification shorthands
    const w = window;
    const listen = w.addEventListener.bind(w);
    const unlisten = w.removeEventListener.bind(w);
    const HASH_CHANGE = "hashchange";
    const POP_STATE = "popstate";
    const updateHashValue = () => (hashSeidr.value = window.location.hash);

    listen(HASH_CHANGE, updateHashValue);
    listen(POP_STATE, updateHashValue);

    // Clean up when the root component unmounts
    getRootComponent()?.onUnmount(() => {
      hashSeidr.destroy();
      unlisten(HASH_CHANGE, updateHashValue);
      unlisten(POP_STATE, updateHashValue);

      appState.deleteData(USE_HASH_DATA_KEY);
    });

    hashSeidr.observe((hash) => (window.location.hash = hash));
  }

  return hashSeidr;
};
