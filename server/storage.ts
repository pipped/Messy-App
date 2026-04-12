import { type User, type InsertUser, type Clothing, type InsertClothing, type Outfit, type InsertOutfit } from "@shared/schema";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

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

// ── helpers to map SQLite rows ↔ domain types ─────────────────────────────────

function rowToClothing(row: any): Clothing {
  return {
    id: row.id,
    tagId: row.tag_id,
    name: row.name,
    category: row.category,
    color: row.color,
    season: row.season,
    occasion: row.occasion,
    imageUrl: row.image_url ?? null,
    inLaundry: row.in_laundry,
    lastWorn: row.last_worn ? new Date(row.last_worn) : null,
    timesWorn: row.times_worn,
    createdAt: new Date(row.created_at),
    washingInstructions: row.washing_instructions ?? null,
    notes: row.notes ?? null,
    purchasePrice: row.purchase_price ?? null,
  };
}

function rowToOutfit(row: any): Outfit {
  return {
    id: row.id,
    name: row.name,
    clothingIds: JSON.parse(row.clothing_ids ?? "[]"),
    occasion: row.occasion,
    season: row.season,
    isFavorite: row.is_favorite,
    lastWorn: row.last_worn ? new Date(row.last_worn) : null,
    timesWorn: row.times_worn,
    createdAt: new Date(row.created_at),
  };
}

function rowToUser(row: any): User {
  return { id: row.id, username: row.username, password: row.password };
}

// ── SqliteStorage ─────────────────────────────────────────────────────────────

export class SqliteStorage implements IStorage {
  private db: Database.Database;

  constructor(dbPath: string) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clothing (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        tag_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        color TEXT NOT NULL,
        season TEXT NOT NULL,
        occasion TEXT NOT NULL,
        image_url TEXT,
        in_laundry INTEGER NOT NULL DEFAULT 0,
        last_worn TEXT,
        times_worn INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- Migrate: add new columns if they don't exist yet (SQLite supports this)
    `);

    const addColumnIfMissing = (sql: string) => {
      try { this.db.exec(sql); } catch (_) { /* column already exists */ }
    };
    addColumnIfMissing("ALTER TABLE clothing ADD COLUMN washing_instructions TEXT");
    addColumnIfMissing("ALTER TABLE clothing ADD COLUMN notes TEXT");
    addColumnIfMissing("ALTER TABLE clothing ADD COLUMN purchase_price TEXT");
    addColumnIfMissing("ALTER TABLE clothing ADD COLUMN user_id TEXT");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS outfits (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        name TEXT NOT NULL,
        clothing_ids TEXT NOT NULL DEFAULT '[]',
        occasion TEXT NOT NULL,
        season TEXT NOT NULL,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        last_worn TEXT,
        times_worn INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    addColumnIfMissing("ALTER TABLE outfits ADD COLUMN user_id TEXT");
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    return row ? rowToUser(row) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const row = this.db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    return row ? rowToUser(row) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    this.db.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)").run(id, insertUser.username, insertUser.password);
    return { id, username: insertUser.username, password: insertUser.password };
  }

  // ── Clothing ───────────────────────────────────────────────────────────────

  async getClothing(id: string): Promise<Clothing | undefined> {
    const row = this.db.prepare("SELECT * FROM clothing WHERE id = ?").get(id);
    return row ? rowToClothing(row) : undefined;
  }

  async getAllClothing(userId: string): Promise<Clothing[]> {
    const rows = this.db.prepare("SELECT * FROM clothing WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    return rows.map(rowToClothing);
  }

  async getAvailableClothing(userId: string): Promise<Clothing[]> {
    const rows = this.db.prepare("SELECT * FROM clothing WHERE user_id = ? AND in_laundry = 0 ORDER BY created_at DESC").all(userId);
    return rows.map(rowToClothing);
  }

  async getClothingByTagId(tagId: string, userId: string): Promise<Clothing | undefined> {
    const row = this.db.prepare("SELECT * FROM clothing WHERE tag_id = ? AND user_id = ?").get(tagId, userId);
    return row ? rowToClothing(row) : undefined;
  }

  async createClothing(c: InsertClothing, userId: string): Promise<Clothing> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO clothing (id, tag_id, name, category, color, season, occasion, image_url, in_laundry, last_worn, times_worn, created_at, washing_instructions, notes, purchase_price, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, c.tagId, c.name, c.category, c.color, c.season, c.occasion,
      c.imageUrl ?? null,
      c.inLaundry ?? 0,
      c.lastWorn ? new Date(c.lastWorn).toISOString() : null,
      c.timesWorn ?? 0,
      now,
      c.washingInstructions ?? null,
      c.notes ?? null,
      c.purchasePrice ?? null,
      userId,
    );
    return rowToClothing(this.db.prepare("SELECT * FROM clothing WHERE id = ?").get(id));
  }

  async updateClothing(id: string, updates: Partial<InsertClothing>): Promise<Clothing | undefined> {
    const existing = await this.getClothing(id);
    if (!existing) return undefined;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.tagId !== undefined)              { fields.push("tag_id = ?");              values.push(updates.tagId); }
    if (updates.name !== undefined)               { fields.push("name = ?");                values.push(updates.name); }
    if (updates.category !== undefined)           { fields.push("category = ?");            values.push(updates.category); }
    if (updates.color !== undefined)              { fields.push("color = ?");               values.push(updates.color); }
    if (updates.season !== undefined)             { fields.push("season = ?");              values.push(updates.season); }
    if (updates.occasion !== undefined)           { fields.push("occasion = ?");            values.push(updates.occasion); }
    if (updates.imageUrl !== undefined)           { fields.push("image_url = ?");           values.push(updates.imageUrl); }
    if (updates.inLaundry !== undefined)          { fields.push("in_laundry = ?");          values.push(updates.inLaundry); }
    if (updates.lastWorn !== undefined)           { fields.push("last_worn = ?");           values.push(updates.lastWorn ? new Date(updates.lastWorn).toISOString() : null); }
    if (updates.timesWorn !== undefined)          { fields.push("times_worn = ?");          values.push(updates.timesWorn); }
    if (updates.washingInstructions !== undefined){ fields.push("washing_instructions = ?");values.push(updates.washingInstructions ?? null); }
    if (updates.notes !== undefined)              { fields.push("notes = ?");               values.push(updates.notes ?? null); }
    if (updates.purchasePrice !== undefined)      { fields.push("purchase_price = ?");      values.push(updates.purchasePrice ?? null); }

    if (fields.length === 0) return existing;
    values.push(id);
    this.db.prepare(`UPDATE clothing SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    return rowToClothing(this.db.prepare("SELECT * FROM clothing WHERE id = ?").get(id));
  }

  async deleteClothing(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM clothing WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async markClothingAsWorn(id: string): Promise<Clothing | undefined> {
    const existing = await this.getClothing(id);
    if (!existing) return undefined;
    this.db.prepare("UPDATE clothing SET last_worn = ?, times_worn = times_worn + 1 WHERE id = ?")
      .run(new Date().toISOString(), id);
    return rowToClothing(this.db.prepare("SELECT * FROM clothing WHERE id = ?").get(id));
  }

  async toggleClothingLaundry(id: string): Promise<Clothing | undefined> {
    const existing = await this.getClothing(id);
    if (!existing) return undefined;
    const newVal = existing.inLaundry === 1 ? 0 : 1;
    this.db.prepare("UPDATE clothing SET in_laundry = ? WHERE id = ?").run(newVal, id);
    return rowToClothing(this.db.prepare("SELECT * FROM clothing WHERE id = ?").get(id));
  }

  // ── Outfits ────────────────────────────────────────────────────────────────

  async getOutfit(id: string): Promise<Outfit | undefined> {
    const row = this.db.prepare("SELECT * FROM outfits WHERE id = ?").get(id);
    return row ? rowToOutfit(row) : undefined;
  }

  async getAllOutfits(userId: string): Promise<Outfit[]> {
    const rows = this.db.prepare("SELECT * FROM outfits WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    return rows.map(rowToOutfit);
  }

  async getFavoriteOutfits(userId: string): Promise<Outfit[]> {
    const rows = this.db.prepare("SELECT * FROM outfits WHERE user_id = ? AND is_favorite = 1 ORDER BY created_at DESC").all(userId);
    return rows.map(rowToOutfit);
  }

  async createOutfit(o: InsertOutfit, userId: string): Promise<Outfit> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO outfits (id, name, clothing_ids, occasion, season, is_favorite, last_worn, times_worn, created_at, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, o.name, JSON.stringify(o.clothingIds), o.occasion, o.season,
      o.isFavorite ?? 0,
      o.lastWorn ? new Date(o.lastWorn).toISOString() : null,
      o.timesWorn ?? 0,
      now,
      userId,
    );
    return rowToOutfit(this.db.prepare("SELECT * FROM outfits WHERE id = ?").get(id));
  }

  async updateOutfit(id: string, updates: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const existing = await this.getOutfit(id);
    if (!existing) return undefined;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined)        { fields.push("name = ?");        values.push(updates.name); }
    if (updates.clothingIds !== undefined) { fields.push("clothing_ids = ?"); values.push(JSON.stringify(updates.clothingIds)); }
    if (updates.occasion !== undefined)    { fields.push("occasion = ?");     values.push(updates.occasion); }
    if (updates.season !== undefined)      { fields.push("season = ?");       values.push(updates.season); }
    if (updates.isFavorite !== undefined)  { fields.push("is_favorite = ?");  values.push(updates.isFavorite); }
    if (updates.lastWorn !== undefined)    { fields.push("last_worn = ?");    values.push(updates.lastWorn ? new Date(updates.lastWorn).toISOString() : null); }
    if (updates.timesWorn !== undefined)   { fields.push("times_worn = ?");   values.push(updates.timesWorn); }

    if (fields.length === 0) return existing;
    values.push(id);
    this.db.prepare(`UPDATE outfits SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    return rowToOutfit(this.db.prepare("SELECT * FROM outfits WHERE id = ?").get(id));
  }

  async toggleOutfitFavorite(id: string): Promise<Outfit | undefined> {
    const existing = await this.getOutfit(id);
    if (!existing) return undefined;
    const newVal = existing.isFavorite === 1 ? 0 : 1;
    this.db.prepare("UPDATE outfits SET is_favorite = ? WHERE id = ?").run(newVal, id);
    return rowToOutfit(this.db.prepare("SELECT * FROM outfits WHERE id = ?").get(id));
  }

  async markOutfitAsWorn(id: string): Promise<Outfit | undefined> {
    const existing = await this.getOutfit(id);
    if (!existing) return undefined;
    this.db.prepare("UPDATE outfits SET last_worn = ?, times_worn = times_worn + 1 WHERE id = ?")
      .run(new Date().toISOString(), id);
    return rowToOutfit(this.db.prepare("SELECT * FROM outfits WHERE id = ?").get(id));
  }

  async deleteOutfit(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM outfits WHERE id = ?").run(id);
    return result.changes > 0;
  }
}

const DB_PATH = path.join(process.cwd(), "data", "wardrobe.db");
export const storage = new SqliteStorage(DB_PATH);
