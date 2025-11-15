import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Clothing item schema
export const clothing = pgTable("clothing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tagId: text("tag_id").notNull().unique(), // RFID/NFC tag identifier
  name: text("name").notNull(),
  category: text("category").notNull(), // top, bottom, shoes, outerwear, accessory
  color: text("color").notNull(),
  season: text("season").notNull(), // spring, summer, fall, winter, all
  occasion: text("occasion").notNull(), // casual, formal, athletic, business
  imageUrl: text("image_url"), // Optional photo of the item
  lastWorn: timestamp("last_worn"), // Track when item was last worn
  timesWorn: integer("times_worn").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertClothingSchema = createInsertSchema(clothing).omit({
  id: true,
  createdAt: true,
}).extend({
  tagId: z.string().min(1, "Tag ID is required"),
  name: z.string().min(1, "Name is required"),
  category: z.enum(["top", "bottom", "shoes", "outerwear", "accessory"]),
  color: z.string().min(1, "Color is required"),
  season: z.enum(["spring", "summer", "fall", "winter", "all"]),
  occasion: z.enum(["casual", "formal", "athletic", "business", "any"]),
  imageUrl: z.string().optional(),
  lastWorn: z.coerce.date().optional(),
  timesWorn: z.number().default(0),
});

export type InsertClothing = z.infer<typeof insertClothingSchema>;
export type Clothing = typeof clothing.$inferSelect;

// Outfit schema for saving favorite combinations
export const outfits = pgTable("outfits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clothingIds: text("clothing_ids").array().notNull(), // Array of clothing item IDs
  occasion: text("occasion").notNull(),
  season: text("season").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  timesWorn: integer("times_worn").notNull().default(0),
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Outfit name is required"),
  clothingIds: z.array(z.string()).min(1, "At least one clothing item required"),
  occasion: z.string().min(1, "Occasion is required"),
  season: z.string().min(1, "Season is required"),
  timesWorn: z.number().default(0),
});

export type InsertOutfit = z.infer<typeof insertOutfitSchema>;
export type Outfit = typeof outfits.$inferSelect;
