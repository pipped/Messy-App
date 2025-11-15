import { type User, type InsertUser, type Clothing, type InsertClothing, type Outfit, type InsertOutfit } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clothing methods
  getClothing(id: string): Promise<Clothing | undefined>;
  getAllClothing(): Promise<Clothing[]>;
  getClothingByTagId(tagId: string): Promise<Clothing | undefined>;
  createClothing(clothing: InsertClothing): Promise<Clothing>;
  updateClothing(id: string, clothing: Partial<InsertClothing>): Promise<Clothing | undefined>;
  deleteClothing(id: string): Promise<boolean>;
  markClothingAsWorn(id: string): Promise<Clothing | undefined>;

  // Outfit methods
  getOutfit(id: string): Promise<Outfit | undefined>;
  getAllOutfits(): Promise<Outfit[]>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  deleteOutfit(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clothing: Map<string, Clothing>;
  private outfits: Map<string, Outfit>;

  constructor() {
    this.users = new Map();
    this.clothing = new Map();
    this.outfits = new Map();

    // Add some sample clothing items for demo
    this.seedSampleData();
  }

  private seedSampleData() {
    const sampleClothes: InsertClothing[] = [
      // Tops
      {
        tagId: "TAG-DEMO-001",
        name: "Classic White T-Shirt",
        category: "top",
        color: "White",
        season: "all",
        occasion: "casual",
        timesWorn: 5,
      },
      {
        tagId: "TAG-DEMO-006",
        name: "Black V-Neck Tee",
        category: "top",
        color: "Black",
        season: "all",
        occasion: "casual",
        timesWorn: 3,
      },
      {
        tagId: "TAG-DEMO-007",
        name: "Striped Button-Down",
        category: "top",
        color: "Blue",
        season: "all",
        occasion: "business",
        timesWorn: 7,
      },
      {
        tagId: "TAG-DEMO-008",
        name: "Gray Hoodie",
        category: "top",
        color: "Gray",
        season: "fall",
        occasion: "casual",
        timesWorn: 9,
      },
      // Bottoms
      {
        tagId: "TAG-DEMO-002",
        name: "Blue Denim Jeans",
        category: "bottom",
        color: "Blue",
        season: "all",
        occasion: "casual",
        timesWorn: 8,
      },
      {
        tagId: "TAG-DEMO-009",
        name: "Black Chinos",
        category: "bottom",
        color: "Black",
        season: "all",
        occasion: "business",
        timesWorn: 4,
      },
      {
        tagId: "TAG-DEMO-010",
        name: "Khaki Shorts",
        category: "bottom",
        color: "Khaki",
        season: "summer",
        occasion: "casual",
        timesWorn: 6,
      },
      // Shoes
      {
        tagId: "TAG-DEMO-004",
        name: "White Sneakers",
        category: "shoes",
        color: "White",
        season: "all",
        occasion: "casual",
        timesWorn: 12,
      },
      {
        tagId: "TAG-DEMO-011",
        name: "Brown Loafers",
        category: "shoes",
        color: "Brown",
        season: "all",
        occasion: "business",
        timesWorn: 2,
      },
      {
        tagId: "TAG-DEMO-012",
        name: "Running Shoes",
        category: "shoes",
        color: "Gray",
        season: "all",
        occasion: "athletic",
        timesWorn: 15,
      },
      // Outerwear
      {
        tagId: "TAG-DEMO-003",
        name: "Black Leather Jacket",
        category: "outerwear",
        color: "Black",
        season: "fall",
        occasion: "casual",
        timesWorn: 3,
      },
      {
        tagId: "TAG-DEMO-005",
        name: "Navy Blazer",
        category: "outerwear",
        color: "Navy",
        season: "all",
        occasion: "business",
        timesWorn: 2,
      },
      {
        tagId: "TAG-DEMO-013",
        name: "Denim Jacket",
        category: "outerwear",
        color: "Blue",
        season: "spring",
        occasion: "casual",
        timesWorn: 5,
      },
      // Accessories
      {
        tagId: "TAG-DEMO-014",
        name: "Leather Belt",
        category: "accessory",
        color: "Brown",
        season: "all",
        occasion: "any",
        timesWorn: 10,
      },
      {
        tagId: "TAG-DEMO-015",
        name: "Sunglasses",
        category: "accessory",
        color: "Black",
        season: "summer",
        occasion: "any",
        timesWorn: 8,
      },
    ];

    sampleClothes.forEach((item) => {
      const id = randomUUID();
      const clothing: Clothing = {
        ...item,
        id,
        imageUrl: null,
        lastWorn: null,
        createdAt: new Date(),
      };
      this.clothing.set(id, clothing);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Clothing methods
  async getClothing(id: string): Promise<Clothing | undefined> {
    return this.clothing.get(id);
  }

  async getAllClothing(): Promise<Clothing[]> {
    return Array.from(this.clothing.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getClothingByTagId(tagId: string): Promise<Clothing | undefined> {
    return Array.from(this.clothing.values()).find(
      (item) => item.tagId === tagId
    );
  }

  async createClothing(insertClothing: InsertClothing): Promise<Clothing> {
    const id = randomUUID();
    const clothing: Clothing = {
      ...insertClothing,
      id,
      imageUrl: insertClothing.imageUrl || null,
      lastWorn: insertClothing.lastWorn || null,
      createdAt: new Date(),
    };
    this.clothing.set(id, clothing);
    return clothing;
  }

  async updateClothing(
    id: string,
    updates: Partial<InsertClothing>
  ): Promise<Clothing | undefined> {
    const existing = this.clothing.get(id);
    if (!existing) return undefined;

    const updated: Clothing = {
      ...existing,
      ...updates,
    };
    this.clothing.set(id, updated);
    return updated;
  }

  async deleteClothing(id: string): Promise<boolean> {
    return this.clothing.delete(id);
  }

  async markClothingAsWorn(id: string): Promise<Clothing | undefined> {
    const item = this.clothing.get(id);
    if (!item) return undefined;

    const updated: Clothing = {
      ...item,
      lastWorn: new Date(),
      timesWorn: item.timesWorn + 1,
    };
    this.clothing.set(id, updated);
    return updated;
  }

  // Outfit methods
  async getOutfit(id: string): Promise<Outfit | undefined> {
    return this.outfits.get(id);
  }

  async getAllOutfits(): Promise<Outfit[]> {
    return Array.from(this.outfits.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const id = randomUUID();
    const outfit: Outfit = {
      ...insertOutfit,
      id,
      createdAt: new Date(),
    };
    this.outfits.set(id, outfit);
    return outfit;
  }

  async deleteOutfit(id: string): Promise<boolean> {
    return this.outfits.delete(id);
  }
}

export const storage = new MemStorage();
