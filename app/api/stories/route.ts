import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { checkAdminPassword } from "../../../lib/auth";
import { getDbPool } from "../../../lib/db";

const DATA_PATH = path.join(process.cwd(), "data", "success_stories.json");

async function readStoriesJson() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeStoriesJson(items: object[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
}

// ─── GET: Fetch all successful stories ────────────────────
export async function GET() {
  try {
    const pool = await getDbPool();
    let dbItems: any[] = [];
    if (pool) {
      const [rows] = await pool.query("SELECT * FROM success_stories ORDER BY createdAt DESC");
      dbItems = rows as any[];
    } else {
      dbItems = await readStoriesJson();
      dbItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json(dbItems);
  } catch (err) {
    console.error("GET stories error:", err);
    return NextResponse.json({ error: "Failed to load successful stories" }, { status: 500 });
  }
}

// ─── POST: Add a new successful story ────────────────────
export async function POST(req: Request) {
  try {
    const adminPass = req.headers.get("x-admin-password");
    const isAuthed = await checkAdminPassword(adminPass);
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const image = formData.get("image") as File | null;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    let imageUrl = "";
    if (image && image.size > 0) {
      const imgBuffer = Buffer.from(await image.arrayBuffer());
      imageUrl = `data:${image.type};base64,${imgBuffer.toString("base64")}`;
    }

    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    const pool = await getDbPool();
    if (pool) {
      await pool.query(
        "INSERT INTO success_stories (id, title, description, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?)",
        [newItem.id, newItem.title, newItem.description, newItem.imageUrl, newItem.createdAt]
      );
    } else {
      const existing = await readStoriesJson();
      existing.push(newItem);
      await writeStoriesJson(existing);
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Upload story error:", error);
    return NextResponse.json({ error: "Failed to save successful story" }, { status: 500 });
  }
}
