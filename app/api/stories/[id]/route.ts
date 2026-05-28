import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { checkAdminPassword } from "../../../../lib/auth";
import { getDbPool } from "../../../../lib/db";

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
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
}

// ─── DELETE: Delete a successful story by ID ──────────────
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

    const pool = await getDbPool();
    if (pool) {
      const [res] = await pool.query("DELETE FROM success_stories WHERE id = ?", [params.id]);
      if ((res as any).affectedRows === 0) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 });
      }
    } else {
      const items = await readStoriesJson();
      const filtered = items.filter((item: { id: string }) => item.id !== params.id);
      if (filtered.length === items.length) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 });
      }
      await writeStoriesJson(filtered);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE story error:", err);
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}

// ─── PATCH: Edit a successful story by ID ──────────────
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminPass = req.headers.get("x-admin-password");
    const isAuthed = await checkAdminPassword(adminPass);
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const title = formData.get("title") as string | null;
      const description = formData.get("description") as string | null;
      const image = formData.get("image") as File | null;

      if (!title || !description) {
        return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
      }

      // Get the existing story
      let existingStory: any = null;
      const pool = await getDbPool();
      if (pool) {
        const [rows] = await pool.query("SELECT * FROM success_stories WHERE id = ?", [params.id]);
        if (Array.isArray(rows) && rows.length > 0) {
          existingStory = rows[0];
        }
      } else {
        const items = await readStoriesJson();
        existingStory = items.find((item: any) => item.id === params.id);
      }

      if (!existingStory) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 });
      }

      let imageUrl = existingStory.imageUrl || "";
      if (image && image.size > 0) {
        const imgBuffer = Buffer.from(await image.arrayBuffer());
        imageUrl = `data:${image.type};base64,${imgBuffer.toString("base64")}`;
      }

      body = {
        title,
        description,
        imageUrl,
      };
    } else {
      body = await req.json();
    }

    const pool = await getDbPool();
    if (pool) {
      const keys = Object.keys(body);
      if (keys.length > 0) {
        const assignments = keys.map(k => `${k} = ?`).join(", ");
        const values = keys.map(k => body[k]);
        await pool.query(`UPDATE success_stories SET ${assignments} WHERE id = ?`, [...values, params.id]);
      }
    } else {
      const items = await readStoriesJson();
      const updated = items.map((item: { id: string }) =>
        item.id === params.id ? { ...item, ...body } : item
      );
      await writeStoriesJson(updated);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH story error:", err);
    return NextResponse.json({ error: "Failed to update successful story" }, { status: 500 });
  }
}
