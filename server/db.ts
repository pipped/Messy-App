import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Prefer individual PG vars (Replit-provisioned) over DATABASE_URL (may be stale Neon URL)
const pool = process.env.PGHOST
  ? new Pool({
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || "5432"),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({ connectionString: process.env.DATABASE_URL });

export { pool };
export const db = drizzle(pool, { schema });
