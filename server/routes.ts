import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClothingSchema, insertOutfitSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

function getUserId(req: Request): string | null {
  return (req.headers["x-user-id"] as string) || null;
}

function requireUserId(req: Request, res: any): string | null {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Clothing Routes
  
  // Get all clothing items
  app.get("/api/clothing", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;
    try {
      const items = await storage.getAllClothing(userId);
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
    const userId = requireUserId(req, res);
    if (!userId) return;
    try {
      const validated = insertClothingSchema.parse(req.body);
      
      // Check if tag ID already exists for this user
      const existing = await storage.getClothingByTagId(validated.tagId, userId);
      if (existing) {
        return res.status(400).json({ error: "Tag ID already exists" });
      }

      const item = await storage.createClothing(validated, userId);
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
      const partialSchema = insertClothingSchema.partial();
      const validated = partialSchema.parse(req.body);
      
      if (validated.tagId) {
        const userId = getUserId(req);
        if (userId) {
          const existing = await storage.getClothingByTagId(validated.tagId, userId);
          if (existing && existing.id !== req.params.id) {
            return res.status(400).json({ error: "Tag ID already exists" });
          }
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

  // Toggle laundry status
  app.patch("/api/clothing/:id/laundry", async (req, res) => {
    try {
      const item = await storage.toggleClothingLaundry(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Clothing item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error toggling laundry status:", error);
      res.status(500).json({ error: "Failed to toggle laundry status" });
    }
  });

  // Get available clothing (not in laundry)
  app.get("/api/clothing/available", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;
    try {
      const items = await storage.getAvailableClothing(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching available clothing:", error);
      res.status(500).json({ error: "Failed to fetch available clothing" });
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
  app.get("/api/outfits", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;
    try {
      const outfits = await storage.getAllOutfits(userId);
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
    const userId = requireUserId(req, res);
    if (!userId) return;
    try {
      const validated = insertOutfitSchema.parse(req.body);
      const outfit = await storage.createOutfit(validated, userId);
      res.status(201).json(outfit);
    } catch (error) {
      console.error("Error creating outfit:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid outfit data", details: error });
      }
      res.status(500).json({ error: "Failed to create outfit" });
    }
  });

  // Get favorite outfits
  app.get("/api/outfits/favorites", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;
    try {
      const favorites = await storage.getFavoriteOutfits(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorite outfits:", error);
      res.status(500).json({ error: "Failed to fetch favorite outfits" });
    }
  });

  // Toggle outfit favorite status
  app.patch("/api/outfits/:id/favorite", async (req, res) => {
    try {
      const outfit = await storage.toggleOutfitFavorite(req.params.id);
      if (!outfit) {
        return res.status(404).json({ error: "Outfit not found" });
      }
      res.json(outfit);
    } catch (error) {
      console.error("Error toggling outfit favorite:", error);
      res.status(500).json({ error: "Failed to toggle outfit favorite" });
    }
  });

  // Mark outfit as worn
  app.patch("/api/outfits/:id/worn", async (req, res) => {
    try {
      const outfit = await storage.markOutfitAsWorn(req.params.id);
      if (!outfit) {
        return res.status(404).json({ error: "Outfit not found" });
      }
      res.json(outfit);
    } catch (error) {
      console.error("Error marking outfit as worn:", error);
      res.status(500).json({ error: "Failed to mark outfit as worn" });
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

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      const existing = await storage.getUserByUsername(username.trim());
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }
      const user = await storage.createUser({ username: username.trim(), password });
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username.trim());
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
