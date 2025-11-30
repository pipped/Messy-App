import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClothingSchema, insertOutfitSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Clothing Routes
  
  // Get all clothing items
  app.get("/api/clothing", async (_req, res) => {
    try {
      const items = await storage.getAllClothing();
      res.json(items);
    } catch (error) {
      console.error("Error fetching clothing:", error);
      res.status(500).json({ error: "Failed to fetch clothing items" });
    }
  });

  // Get single clothing item
  app.get("/api/clothing/:id", async (req, res) => {
    try {
      const item = await storage.getClothing(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Clothing item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching clothing item:", error);
      res.status(500).json({ error: "Failed to fetch clothing item" });
    }
  });

  // Create new clothing item
  app.post("/api/clothing", async (req, res) => {
    try {
      const validated = insertClothingSchema.parse(req.body);
      
      // Check if tag ID already exists
      const existing = await storage.getClothingByTagId(validated.tagId);
      if (existing) {
        return res.status(400).json({ error: "Tag ID already exists" });
      }

      const item = await storage.createClothing(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating clothing item:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid clothing data", details: error });
      }
      res.status(500).json({ error: "Failed to create clothing item" });
    }
  });

  // Update clothing item
  app.patch("/api/clothing/:id", async (req, res) => {
    try {
      // Validate with partial schema
      const partialSchema = insertClothingSchema.partial();
      const validated = partialSchema.parse(req.body);
      
      // If updating tagId, check for duplicates
      if (validated.tagId) {
        const existing = await storage.getClothingByTagId(validated.tagId);
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ error: "Tag ID already exists" });
        }
      }

      const item = await storage.updateClothing(req.params.id, validated);
      if (!item) {
        return res.status(404).json({ error: "Clothing item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating clothing item:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid clothing data", details: error });
      }
      res.status(500).json({ error: "Failed to update clothing item" });
    }
  });

  // Mark clothing as worn
  app.patch("/api/clothing/:id/worn", async (req, res) => {
    try {
      const item = await storage.markClothingAsWorn(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Clothing item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error marking clothing as worn:", error);
      res.status(500).json({ error: "Failed to mark clothing as worn" });
    }
  });

  // Delete clothing item
  app.delete("/api/clothing/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClothing(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Clothing item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting clothing item:", error);
      res.status(500).json({ error: "Failed to delete clothing item" });
    }
  });

  // Outfit Routes

  // Get all outfits
  app.get("/api/outfits", async (_req, res) => {
    try {
      const outfits = await storage.getAllOutfits();
      res.json(outfits);
    } catch (error) {
      console.error("Error fetching outfits:", error);
      res.status(500).json({ error: "Failed to fetch outfits" });
    }
  });

  // Get single outfit
  app.get("/api/outfits/:id", async (req, res) => {
    try {
      const outfit = await storage.getOutfit(req.params.id);
      if (!outfit) {
        return res.status(404).json({ error: "Outfit not found" });
      }
      res.json(outfit);
    } catch (error) {
      console.error("Error fetching outfit:", error);
      res.status(500).json({ error: "Failed to fetch outfit" });
    }
  });

  // Create new outfit
  app.post("/api/outfits", async (req, res) => {
    try {
      const validated = insertOutfitSchema.parse(req.body);
      const outfit = await storage.createOutfit(validated);
      res.status(201).json(outfit);
    } catch (error) {
      console.error("Error creating outfit:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid outfit data", details: error });
      }
      res.status(500).json({ error: "Failed to create outfit" });
    }
  });

  // Delete outfit
  app.delete("/api/outfits/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOutfit(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Outfit not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting outfit:", error);
      res.status(500).json({ error: "Failed to delete outfit" });
    }
  });

  // Object Storage Routes

  // Get upload URL for image
  app.post("/api/objects/upload", async (_req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ uploadURL, objectPath });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve public objects
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded objects (public access)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Update clothing image after upload
  app.put("/api/clothing/:id/image", async (req, res) => {
    try {
      if (!req.body.imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.imageURL);
      
      const item = await storage.updateClothing(req.params.id, { imageUrl: objectPath });
      if (!item) {
        return res.status(404).json({ error: "Clothing item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating clothing image:", error);
      res.status(500).json({ error: "Failed to update clothing image" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
