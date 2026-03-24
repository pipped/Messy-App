import { type User, type InsertUser, type Clothing, type InsertClothing, type Outfit, type InsertOutfit } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getClothing(id: string): Promise<Clothing | undefined>;
  getAllClothing(): Promise<Clothing[]>;
  getAvailableClothing(): Promise<Clothing[]>;
  getClothingByTagId(tagId: string): Promise<Clothing | undefined>;
  createClothing(clothing: InsertClothing): Promise<Clothing>;
  updateClothing(id: string, clothing: Partial<InsertClothing>): Promise<Clothing | undefined>;
  deleteClothing(id: string): Promise<boolean>;
  markClothingAsWorn(id: string): Promise<Clothing | undefined>;
  toggleClothingLaundry(id: string): Promise<Clothing | undefined>;

  getOutfit(id: string): Promise<Outfit | undefined>;
  getAllOutfits(): Promise<Outfit[]>;
  getFavoriteOutfits(): Promise<Outfit[]>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  updateOutfit(id: string, updates: Partial<InsertOutfit>): Promise<Outfit | undefined>;
  toggleOutfitFavorite(id: string): Promise<Outfit | undefined>;
  markOutfitAsWorn(id: string): Promise<Outfit | undefined>;
  deleteOutfit(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private clothingItems: Map<string, Clothing> = new Map();
  private outfitItems: Map<string, Outfit> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const sampleClothes: InsertClothing[] = [
      { tagId: "TAG-DEMO-001", name: "Classic White T-Shirt", category: "top", color: "White", season: "all", occasion: "casual", timesWorn: 5 },
      { tagId: "TAG-DEMO-006", name: "Black V-Neck Tee", category: "top", color: "Black", season: "all", occasion: "casual", timesWorn: 3 },
      { tagId: "TAG-DEMO-007", name: "Striped Button-Down", category: "top", color: "Blue", season: "all", occasion: "business", timesWorn: 7 },
      { tagId: "TAG-DEMO-008", name: "Gray Hoodie", category: "top", color: "Gray", season: "fall", occasion: "casual", timesWorn: 9 },
      { tagId: "TAG-DEMO-002", name: "Blue Denim Jeans", category: "bottom", color: "Blue", season: "all", occasion: "casual", timesWorn: 8 },
      { tagId: "TAG-DEMO-009", name: "Black Chinos", category: "bottom", color: "Black", season: "all", occasion: "business", timesWorn: 4 },
      { tagId: "TAG-DEMO-010", name: "Khaki Shorts", category: "bottom", color: "Khaki", season: "summer", occasion: "casual", timesWorn: 6 },
      { tagId: "TAG-DEMO-004", name: "White Sneakers", category: "shoes", color: "White", season: "all", occasion: "casual", timesWorn: 12 },
      { tagId: "TAG-DEMO-011", name: "Brown Loafers", category: "shoes", color: "Brown", season: "all", occasion: "business", timesWorn: 2 },
      { tagId: "TAG-DEMO-012", name: "Running Shoes", category: "shoes", color: "Gray", season: "all", occasion: "athletic", timesWorn: 15 },
      { tagId: "TAG-DEMO-003", name: "Black Leather Jacket", category: "outerwear", color: "Black", season: "fall", occasion: "casual", timesWorn: 3, inLaundry: 1 },
      { tagId: "TAG-DEMO-005", name: "Navy Blazer", category: "outerwear", color: "Navy", season: "all", occasion: "business", timesWorn: 2 },
      { tagId: "TAG-DEMO-013", name: "Denim Jacket", category: "outerwear", color: "Blue", season: "spring", occasion: "casual", timesWorn: 5 },
      { tagId: "TAG-DEMO-014", name: "Leather Belt", category: "accessory", color: "Brown", season: "all", occasion: "any", timesWorn: 10 },
      { tagId: "TAG-DEMO-015", name: "Sunglasses", category: "accessory", color: "Black", season: "summer", occasion: "any", timesWorn: 8 },
    ];

    const now = new Date();
    for (const c of sampleClothes) {
      const id = randomUUID();
      this.clothingItems.set(id, {
        id,
        tagId: c.tagId,
        name: c.name,
        category: c.category,
        color: c.color,
        season: c.season,
        occasion: c.occasion,
        imageUrl: c.imageUrl ?? null,
        inLaundry: c.inLaundry ?? 0,
        lastWorn: c.lastWorn ?? null,
        timesWorn: c.timesWorn ?? 0,
        createdAt: now,
      });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async getClothing(id: string): Promise<Clothing | undefined> {
    return this.clothingItems.get(id);
  }

  async getAllClothing(): Promise<Clothing[]> {
    return Array.from(this.clothingItems.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getAvailableClothing(): Promise<Clothing[]> {
    return Array.from(this.clothingItems.values())
      .filter(c => c.inLaundry === 0)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClothingByTagId(tagId: string): Promise<Clothing | undefined> {
    return Array.from(this.clothingItems.values()).find(c => c.tagId === tagId);
  }

  async createClothing(insertClothing: InsertClothing): Promise<Clothing> {
    const id = randomUUID();
    const item: Clothing = {
      id,
      tagId: insertClothing.tagId,
      name: insertClothing.name,
      category: insertClothing.category,
      color: insertClothing.color,
      season: insertClothing.season,
      occasion: insertClothing.occasion,
      imageUrl: insertClothing.imageUrl ?? null,
      inLaundry: insertClothing.inLaundry ?? 0,
      lastWorn: insertClothing.lastWorn ?? null,
      timesWorn: insertClothing.timesWorn ?? 0,
      createdAt: new Date(),
    };
    this.clothingItems.set(id, item);
    return item;
  }

  async updateClothing(id: string, updates: Partial<InsertClothing>): Promise<Clothing | undefined> {
    const existing = this.clothingItems.get(id);
    if (!existing) return undefined;
    const updated: Clothing = { ...existing, ...updates };
    this.clothingItems.set(id, updated);
    return updated;
  }

  async deleteClothing(id: string): Promise<boolean> {
    return this.clothingItems.delete(id);
  }

  async markClothingAsWorn(id: string): Promise<Clothing | undefined> {
    const existing = this.clothingItems.get(id);
    if (!existing) return undefined;
    const updated: Clothing = {
      ...existing,
      lastWorn: new Date(),
      timesWorn: existing.timesWorn + 1,
    };
    this.clothingItems.set(id, updated);
    return updated;
  }

  async toggleClothingLaundry(id: string): Promise<Clothing | undefined> {
    const existing = this.clothingItems.get(id);
    if (!existing) return undefined;
    const updated: Clothing = {
      ...existing,
      inLaundry: existing.inLaundry === 1 ? 0 : 1,
    };
    this.clothingItems.set(id, updated);
    return updated;
  }

  async getOutfit(id: string): Promise<Outfit | undefined> {
    return this.outfitItems.get(id);
  }

  async getAllOutfits(): Promise<Outfit[]> {
    return Array.from(this.outfitItems.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getFavoriteOutfits(): Promise<Outfit[]> {
    return Array.from(this.outfitItems.values())
      .filter(o => o.isFavorite === 1)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const id = randomUUID();
    const outfit: Outfit = {
      id,
      name: insertOutfit.name,
      clothingIds: insertOutfit.clothingIds,
      occasion: insertOutfit.occasion,
      season: insertOutfit.season,
      isFavorite: insertOutfit.isFavorite ?? 0,
      lastWorn: insertOutfit.lastWorn ?? null,
      timesWorn: insertOutfit.timesWorn ?? 0,
      createdAt: new Date(),
    };
    this.outfitItems.set(id, outfit);
    return outfit;
  }

  async updateOutfit(id: string, updates: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const existing = this.outfitItems.get(id);
    if (!existing) return undefined;
    const updated: Outfit = { ...existing, ...updates };
    this.outfitItems.set(id, updated);
    return updated;
  }

  async toggleOutfitFavorite(id: string): Promise<Outfit | undefined> {
    const existing = this.outfitItems.get(id);
    if (!existing) return undefined;
    const updated: Outfit = {
      ...existing,
      isFavorite: existing.isFavorite === 1 ? 0 : 1,
    };
    this.outfitItems.set(id, updated);
    return updated;
  }

  async markOutfitAsWorn(id: string): Promise<Outfit | undefined> {
    const existing = this.outfitItems.get(id);
    if (!existing) return undefined;
    const updated: Outfit = {
      ...existing,
      lastWorn: new Date(),
      timesWorn: existing.timesWorn + 1,
    };
    this.outfitItems.set(id, updated);
    return updated;
  }

  async deleteOutfit(id: string): Promise<boolean> {
    return this.outfitItems.delete(id);
  }
}

export const storage = new MemStorage();

export async function seedDatabaseIfEmpty(): Promise<void> {
  // No-op: MemStorage seeds itself in constructor
}
