import { isClient } from "@fimbul-works/seidr";
import { performDefaultSetup } from "@fimbul-works/seidr/testing";
import { DUMMY_BASE_URL } from "../constants.js";

// Set the origin to match DUMMY_BASE_URL to avoid pushState SecurityError in JSDOM
if (isClient()) {
  window.history.replaceState(null, "", DUMMY_BASE_URL);
}

// Perform default setup
performDefaultSetup();
