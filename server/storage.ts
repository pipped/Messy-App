import { type User, type InsertUser, type Clothing, type InsertClothing, type Outfit, type InsertOutfit, users, clothing, outfits } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getClothing(id: string): Promise<Clothing | undefined>;
  getAllClothing(): Promise<Clothing[]>;
  getClothingByTagId(tagId: string): Promise<Clothing | undefined>;
  createClothing(clothing: InsertClothing): Promise<Clothing>;
  updateClothing(id: string, clothing: Partial<InsertClothing>): Promise<Clothing | undefined>;
  deleteClothing(id: string): Promise<boolean>;
  markClothingAsWorn(id: string): Promise<Clothing | undefined>;

  getOutfit(id: string): Promise<Outfit | undefined>;
  getAllOutfits(): Promise<Outfit[]>;
  getFavoriteOutfits(): Promise<Outfit[]>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  updateOutfit(id: string, updates: Partial<InsertOutfit>): Promise<Outfit | undefined>;
  toggleOutfitFavorite(id: string): Promise<Outfit | undefined>;
  markOutfitAsWorn(id: string): Promise<Outfit | undefined>;
  deleteOutfit(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getClothing(id: string): Promise<Clothing | undefined> {
    const [item] = await db.select().from(clothing).where(eq(clothing.id, id));
    return item || undefined;
  }

  async getAllClothing(): Promise<Clothing[]> {
    return db.select().from(clothing).orderBy(desc(clothing.createdAt));
  }

  async getClothingByTagId(tagId: string): Promise<Clothing | undefined> {
    const [item] = await db.select().from(clothing).where(eq(clothing.tagId, tagId));
    return item || undefined;
  }

  async createClothing(insertClothing: InsertClothing): Promise<Clothing> {
    const [item] = await db.insert(clothing).values({
      ...insertClothing,
      imageUrl: insertClothing.imageUrl || null,
      lastWorn: insertClothing.lastWorn || null,
    }).returning();
    return item;
  }

  async updateClothing(id: string, updates: Partial<InsertClothing>): Promise<Clothing | undefined> {
    const [item] = await db
      .update(clothing)
      .set(updates)
      .where(eq(clothing.id, id))
      .returning();
    return item || undefined;
  }

  async deleteClothing(id: string): Promise<boolean> {
    const result = await db.delete(clothing).where(eq(clothing.id, id)).returning();
    return result.length > 0;
  }

  async markClothingAsWorn(id: string): Promise<Clothing | undefined> {
    const existing = await this.getClothing(id);
    if (!existing) return undefined;

    const [item] = await db
      .update(clothing)
      .set({
        lastWorn: new Date(),
        timesWorn: existing.timesWorn + 1,
      })
      .where(eq(clothing.id, id))
      .returning();
    return item || undefined;
  }

  async getOutfit(id: string): Promise<Outfit | undefined> {
    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, id));
    return outfit || undefined;
  }

  async getAllOutfits(): Promise<Outfit[]> {
    return db.select().from(outfits).orderBy(desc(outfits.createdAt));
  }

  async getFavoriteOutfits(): Promise<Outfit[]> {
    return db.select().from(outfits).where(eq(outfits.isFavorite, 1)).orderBy(desc(outfits.createdAt));
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const [outfit] = await db.insert(outfits).values({
      ...insertOutfit,
      lastWorn: insertOutfit.lastWorn || null,
    }).returning();
    return outfit;
  }

  async updateOutfit(id: string, updates: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const [outfit] = await db
      .update(outfits)
      .set(updates)
      .where(eq(outfits.id, id))
      .returning();
    return outfit || undefined;
  }

  async toggleOutfitFavorite(id: string): Promise<Outfit | undefined> {
    const existing = await this.getOutfit(id);
    if (!existing) return undefined;

    const [outfit] = await db
      .update(outfits)
      .set({
        isFavorite: existing.isFavorite === 1 ? 0 : 1,
      })
      .where(eq(outfits.id, id))
      .returning();
    return outfit || undefined;
  }

  async markOutfitAsWorn(id: string): Promise<Outfit | undefined> {
    const existing = await this.getOutfit(id);
    if (!existing) return undefined;

    const [outfit] = await db
      .update(outfits)
      .set({
        lastWorn: new Date(),
        timesWorn: existing.timesWorn + 1,
      })
      .where(eq(outfits.id, id))
      .returning();
    return outfit || undefined;
  }

  async deleteOutfit(id: string): Promise<boolean> {
    const result = await db.delete(outfits).where(eq(outfits.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

export async function seedDatabaseIfEmpty(): Promise<void> {
  const existingItems = await db.select().from(clothing).limit(1);
  if (existingItems.length > 0) {
    console.log("Database already has clothing items, skipping seed.");
    return;
  }

  console.log("Seeding database with sample clothing items...");

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
    { tagId: "TAG-DEMO-003", name: "Black Leather Jacket", category: "outerwear", color: "Black", season: "fall", occasion: "casual", timesWorn: 3 },
    { tagId: "TAG-DEMO-005", name: "Navy Blazer", category: "outerwear", color: "Navy", season: "all", occasion: "business", timesWorn: 2 },
    { tagId: "TAG-DEMO-013", name: "Denim Jacket", category: "outerwear", color: "Blue", season: "spring", occasion: "casual", timesWorn: 5 },
    { tagId: "TAG-DEMO-014", name: "Leather Belt", category: "accessory", color: "Brown", season: "all", occasion: "any", timesWorn: 10 },
    { tagId: "TAG-DEMO-015", name: "Sunglasses", category: "accessory", color: "Black", season: "summer", occasion: "any", timesWorn: 8 },
  ];

  await db.insert(clothing).values(sampleClothes);
  console.log(`Seeded ${sampleClothes.length} sample clothing items.`);
}
