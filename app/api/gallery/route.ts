import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { checkAdminPassword } from "../../../lib/auth";
import { getDbPool } from "../../../lib/db";

const DATA_PATH = path.join(process.cwd(), "data", "gallery.json");

const DEFAULT_GALLERY = [
  { id: "def_1", src: "/NGO%20IMAGES/WhatsApp%20Image%202026-05-12%20at%2015.20.58.jpeg", aspect: "aspect-[4/3]", createdAt: "2026-05-12T00:00:01.000Z" },
  { id: "def_2", src: "/NGO%20IMAGES/WhatsApp%20Image%202026-05-12%20at%2015.20.59.jpeg", aspect: "aspect-[3/4]", createdAt: "2026-05-12T00:00:02.000Z" },
  { id: "def_3", src: "/NGO%20IMAGES/WhatsApp%20Image%202026-05-12%20at%2015.21.00.jpeg", aspect: "aspect-square", createdAt: "2026-05-12T00:00:03.000Z" },
  { id: "def_4", src: "/NGO%20IMAGES/WhatsApp%20Image%202026-05-12%20at%2015.21.14.jpeg", aspect: "aspect-[16/9]", createdAt: "2026-05-12T00:00:04.000Z" },
  { id: "def_5", src: "/NGO%20IMAGES/WhatsApp%20Image%202026-05-12%20at%2015.21.15.jpeg", aspect: "aspect-square", createdAt: "2026-05-12T00:00:05.000Z" },
  { id: "def_6", src: "/NGO%20IMAGES/WhatsApp%20Image%202026-05-12%20at%2015.22.54.jpeg", aspect: "aspect-[3/4]", createdAt: "2026-05-12T00:00:06.000Z" },
  { id: "def_7", src: "/NGO%20IMAGES/dog.jpeg", aspect: "aspect-[4/3]", createdAt: "2026-05-12T00:00:07.000Z" },
];

async function readGalleryJson() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeGalleryJson(items: object[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
}

// ─── GET: Fetch all gallery images ────────────────────────
export async function GET() {
  try {
    const pool = await getDbPool();
    let dbItems: any[] = [];
    if (pool) {
      const [rows] = await pool.query("SELECT * FROM gallery ORDER BY createdAt DESC");
      dbItems = rows as any[];
    } else {
      dbItems = await readGalleryJson();
      dbItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Merge uploaded items at the top, then default static items
    const allItems = [...dbItems, ...DEFAULT_GALLERY];
    return NextResponse.json(allItems);
  } catch (err) {
    console.error("GET gallery error:", err);
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
  }
}

// ─── POST: Add a new gallery image ────────────────────────
export async function POST(req: Request) {
  try {
    const adminPass = req.headers.get("x-admin-password");
    const isAuthed = await checkAdminPassword(adminPass);
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const aspect = (formData.get("aspect") as string) || "aspect-square";

    if (!image || image.size === 0) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const imgBuffer = Buffer.from(await image.arrayBuffer());
    const base64Data = `data:${image.type};base64,${imgBuffer.toString("base64")}`;

    const newItem = {
      id: Date.now().toString(),
      src: base64Data,
      aspect,
      createdAt: new Date().toISOString(),
    };

    const pool = await getDbPool();
    if (pool) {
      await pool.query(
        "INSERT INTO gallery (id, src, aspect, createdAt) VALUES (?, ?, ?, ?)",
        [newItem.id, newItem.src, newItem.aspect, newItem.createdAt]
      );
    } else {
      const existing = await readGalleryJson();
      existing.push(newItem);
      await writeGalleryJson(existing);
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Upload gallery error:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}
