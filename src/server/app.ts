import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import apiRoutes from "./routes/api.ts";
import { initSchema } from "./database/schema.ts";
import { seed } from "./database/seed.ts";

export async function createApp() {
  const app = express();
  app.use(express.json());

  // Initialize DB
  initSchema();
  seed();

  // API Routes
  app.use("/api", apiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  return app;
}
