import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { checkAdminPassword } from "../../../lib/auth";
import { getDbPool } from "../../../lib/db";

const DATA_PATH = path.join(process.cwd(), "data", "donations.json");

async function readDonations() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const adminPass = req.headers.get("x-admin-password");
    const isAuthed = await checkAdminPassword(adminPass);
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = await getDbPool();
    if (pool) {
      const [rows] = await pool.query("SELECT * FROM donations ORDER BY createdAt DESC");
      return NextResponse.json(rows);
    }

    const donations = await readDonations();
    return NextResponse.json(donations);
  } catch (err) {
    console.error("GET donations error:", err);
    return NextResponse.json({ error: "Failed to load donations" }, { status: 500 });
  }
}
