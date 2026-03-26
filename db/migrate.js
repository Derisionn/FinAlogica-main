import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../backend/.env") });

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log("✅ Connected to Neon database.");

    const schemaSQL = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "schema.sql"), "utf-8");
    console.log("▶ Running schema.sql...");
    await client.query(schemaSQL);
    console.log("✅ Tables created successfully.");

    const seedSQL = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "seed.sql"), "utf-8");
    console.log("▶ Running seed.sql...");
    await client.query(seedSQL);
    console.log("✅ Seed data inserted successfully.");

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
