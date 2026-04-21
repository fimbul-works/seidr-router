import express from "express";
import { setupApiRoutes } from "./routes/api.js";
import { setupSsrRoute } from "./routes/ssr.js";

// Constants
const port = process.env.PORT || 4000;

// Create http server
const app = express();
app.use(express.json());

setupApiRoutes(app);
setupSsrRoute(app);

// Start http server
app.listen(port, () => console.log(`Seidr Blog Example started at http://127.0.0.1:${port} (${process.env.NODE_ENV})`));
