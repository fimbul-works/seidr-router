/// <reference types="vite/client" />
import "./style.css";

import { $getById, hydrate } from "@fimbul-works/seidr";
import { BlogApp } from "./app.js";

declare global {
  interface Window {
    __SEIDR_HYDRATION_DATA__: any;
  }
}

const hydrationData = window.__SEIDR_HYDRATION_DATA__;

hydrate(() => BlogApp(window.location.pathname), $getById("app"), hydrationData);
