import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { checkAdminPassword } from "../../../../lib/auth";
import { getDbPool } from "../../../../lib/db";

const DATA_PATH = path.join(process.cwd(), "data", "gallery.json");

async function readGalleryJson() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeGalleryJson(items: object[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
}

// ─── DELETE: Delete a gallery image by ID ─────────────────
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminPass = req.headers.get("x-admin-password");
    const isAuthed = await checkAdminPassword(adminPass);
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Default static items cannot be deleted
    if (params.id.startsWith("def_")) {
      return NextResponse.json({ error: "Default system images cannot be deleted" }, { status: 400 });
    }

    const pool = await getDbPool();
    if (pool) {
      const [res] = await pool.query("DELETE FROM gallery WHERE id = ?", [params.id]);
      if ((res as any).affectedRows === 0) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
    } else {
      const items = await readGalleryJson();
      const filtered = items.filter((item: { id: string }) => item.id !== params.id);
      if (filtered.length === items.length) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      await writeGalleryJson(filtered);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE gallery error:", err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
