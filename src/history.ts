import { isClient } from "@fimbul-works/seidr";
import { getRouterState } from "./get-router-state.js";
import type { History } from "./types.js";

/**
 * Create a history navigator.
 *
 * @returns {History} History instance
 */
export const history = (): History => {
  const url = getRouterState().url;

  // Initialize history with the current URL
  const history: string[] = [url.value.href];
  let historyIndex = 0;

  return {
    push: (location: string) => {
      // Remove all history entries after the current index
      history.splice(historyIndex + 1);

      if (isClient()) {
        window.history.pushState({}, "", location);
      }

      history.push(location);
      historyIndex++;

      url.value = new URL(location, url.value);
    },
    replace: (location: string) => {
      if (isClient()) {
        window.history.replaceState({}, "", location);
      }

      // Replace the current history entry
      history[historyIndex] = location;
      // Note: replace doesn't affect entries after the current one in standard browser history,
      // but SPAs often clear forward history on replace or just keep it.
      // We'll follow the simple replace-at-index logic.

      url.value = new URL(location, url.value);
    },
    go: (delta: number) => {
      if (isClient()) {
        window.history.go(delta);
      }

      // Move in history
      historyIndex += delta;
      if (historyIndex < 0) {
        historyIndex = 0;
      }
      if (historyIndex >= history.length) {
        historyIndex = history.length - 1;
      }

      url.value = new URL(history[historyIndex], url.value);
    },
  };
};
