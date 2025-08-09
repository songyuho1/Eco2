import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Legacy imports (old schema) - keeping for backward compatibility
// import { insertGameSessionSchema, insertGameSessionChoiceSchema } from "@shared/schema";
import reignsRoutes from "./reigns-routes";
import esgRoutes from "./esg-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get stories by theme
  app.get("/api/stories/:theme", async (req, res) => {
    try {
      const { theme } = req.params;
      const stories = await storage.getStoriesByTheme(theme);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Create new game session (legacy - keeping for compatibility)
  app.post("/api/sessions", async (req, res) => {
    try {
      // Skip validation for now since we're transitioning to new schema
      const session = await storage.createSession(req.body);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // Get game session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSession(id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Update game session
  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const session = await storage.updateSession(id, updates);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Add choice to session
  app.post("/api/sessions/:sessionId/choices", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const choiceData = {
        ...req.body,
        sessionId
      };
      // Skip validation for now since we're transitioning to new schema
      const validatedData = choiceData;
      const sessionChoice = await storage.addSessionChoice(validatedData);
      res.json(sessionChoice);
    } catch (error) {
      res.status(400).json({ message: "Invalid choice data" });
    }
  });

  // New Reigns-style ESG game routes - using simple ESG router
  app.use("/api/reigns", esgRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
