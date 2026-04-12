import { db } from "./db";
import { users, clothing, outfits } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { type User, type InsertUser, type Clothing, type InsertClothing, type Outfit, type InsertOutfit } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getClothing(id: string): Promise<Clothing | undefined>;
  getAllClothing(userId: string): Promise<Clothing[]>;
  getAvailableClothing(userId: string): Promise<Clothing[]>;
  getClothingByTagId(tagId: string, userId: string): Promise<Clothing | undefined>;
  createClothing(clothing: InsertClothing, userId: string): Promise<Clothing>;
  updateClothing(id: string, clothing: Partial<InsertClothing>): Promise<Clothing | undefined>;
  deleteClothing(id: string): Promise<boolean>;
  markClothingAsWorn(id: string): Promise<Clothing | undefined>;
  toggleClothingLaundry(id: string): Promise<Clothing | undefined>;

  getOutfit(id: string): Promise<Outfit | undefined>;
  getAllOutfits(userId: string): Promise<Outfit[]>;
  getFavoriteOutfits(userId: string): Promise<Outfit[]>;
  createOutfit(outfit: InsertOutfit, userId: string): Promise<Outfit>;
  updateOutfit(id: string, updates: Partial<InsertOutfit>): Promise<Outfit | undefined>;
  toggleOutfitFavorite(id: string): Promise<Outfit | undefined>;
  markOutfitAsWorn(id: string): Promise<Outfit | undefined>;
  deleteOutfit(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // ── Users ──────────────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user ?? undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // ── Clothing ───────────────────────────────────────────────────────────────

  async getClothing(id: string): Promise<Clothing | undefined> {
    const [item] = await db.select().from(clothing).where(eq(clothing.id, id));
    return item ?? undefined;
  }

  async getAllClothing(userId: string): Promise<Clothing[]> {
    return db
      .select()
      .from(clothing)
      .where(eq(clothing.userId, userId))
      .orderBy(desc(clothing.createdAt));
  }

  async getAvailableClothing(userId: string): Promise<Clothing[]> {
    return db
      .select()
      .from(clothing)
      .where(and(eq(clothing.userId, userId), eq(clothing.inLaundry, 0)))
      .orderBy(desc(clothing.createdAt));
  }

  async getClothingByTagId(tagId: string, userId: string): Promise<Clothing | undefined> {
    const [item] = await db
      .select()
      .from(clothing)
      .where(and(eq(clothing.tagId, tagId), eq(clothing.userId, userId)));
    return item ?? undefined;
  }

  async createClothing(c: InsertClothing, userId: string): Promise<Clothing> {
    const [item] = await db
      .insert(clothing)
      .values({ ...c, userId })
      .returning();
    return item;
  }

  async updateClothing(id: string, updates: Partial<InsertClothing>): Promise<Clothing | undefined> {
    const existing = await this.getClothing(id);
    if (!existing) return undefined;
    const [updated] = await db
      .update(clothing)
      .set(updates)
      .where(eq(clothing.id, id))
      .returning();
    return updated ?? undefined;
  }

  async deleteClothing(id: string): Promise<boolean> {
    const result = await db.delete(clothing).where(eq(clothing.id, id)).returning();
    return result.length > 0;
  }

  async markClothingAsWorn(id: string): Promise<Clothing | undefined> {
    const existing = await this.getClothing(id);
    if (!existing) return undefined;
    const [updated] = await db
      .update(clothing)
      .set({ lastWorn: new Date(), timesWorn: existing.timesWorn + 1 })
      .where(eq(clothing.id, id))
      .returning();
    return updated ?? undefined;
  }

  async toggleClothingLaundry(id: string): Promise<Clothing | undefined> {
    const existing = await this.getClothing(id);
    if (!existing) return undefined;
    const [updated] = await db
      .update(clothing)
      .set({ inLaundry: existing.inLaundry === 1 ? 0 : 1 })
      .where(eq(clothing.id, id))
      .returning();
    return updated ?? undefined;
  }

  // ── Outfits ────────────────────────────────────────────────────────────────

  async getOutfit(id: string): Promise<Outfit | undefined> {
    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, id));
    return outfit ?? undefined;
  }

  async getAllOutfits(userId: string): Promise<Outfit[]> {
    return db
      .select()
      .from(outfits)
      .where(eq(outfits.userId, userId))
      .orderBy(desc(outfits.createdAt));
  }

  async getFavoriteOutfits(userId: string): Promise<Outfit[]> {
    return db
      .select()
      .from(outfits)
      .where(and(eq(outfits.userId, userId), eq(outfits.isFavorite, 1)))
      .orderBy(desc(outfits.createdAt));
  }

  async createOutfit(o: InsertOutfit, userId: string): Promise<Outfit> {
    const [outfit] = await db
      .insert(outfits)
      .values({ ...o, userId })
      .returning();
    return outfit;
  }

  async updateOutfit(id: string, updates: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const existing = await this.getOutfit(id);
    if (!existing) return undefined;
    const [updated] = await db
      .update(outfits)
      .set(updates)
      .where(eq(outfits.id, id))
      .returning();
    return updated ?? undefined;
  }

  async toggleOutfitFavorite(id: string): Promise<Outfit | undefined> {
    const existing = await this.getOutfit(id);
    if (!existing) return undefined;
    const [updated] = await db
      .update(outfits)
      .set({ isFavorite: existing.isFavorite === 1 ? 0 : 1 })
      .where(eq(outfits.id, id))
      .returning();
    return updated ?? undefined;
  }

  async markOutfitAsWorn(id: string): Promise<Outfit | undefined> {
    const existing = await this.getOutfit(id);
    if (!existing) return undefined;
    const [updated] = await db
      .update(outfits)
      .set({ lastWorn: new Date(), timesWorn: existing.timesWorn + 1 })
      .where(eq(outfits.id, id))
      .returning();
    return updated ?? undefined;
  }

  async deleteOutfit(id: string): Promise<boolean> {
    const result = await db.delete(outfits).where(eq(outfits.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
