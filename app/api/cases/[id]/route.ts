import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { checkAdminPassword } from "../../../../lib/auth";
import { getDbPool } from "../../../../lib/db";
import { v2 as cloudinary } from "cloudinary";

const DATA_PATH = path.join(process.cwd(), "data", "cases.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const isCloudinaryConfigured = 
  !!(process.env.CLOUDINARY_CLOUD_NAME && 
     process.env.CLOUDINARY_API_KEY && 
     process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function readCases() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeCases(cases: object[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(cases, null, 2));
}

// ─── DELETE: Remove a case by ID ─────────────────────────
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
      const [res] = await pool.query("DELETE FROM cases WHERE id = ?", [params.id]);
      if ((res as any).affectedRows === 0) {
        return NextResponse.json({ error: "Case not found" }, { status: 404 });
      }
    } else {
      const cases = await readCases();
      const updated = cases.filter((c: { id: string }) => c.id !== params.id);

      if (updated.length === cases.length) {
        return NextResponse.json({ error: "Case not found" }, { status: 404 });
      }

      await writeCases(updated);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE case error:", err);
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 });
  }
}

// ─── PATCH: Toggle active status ─────────────────────────
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
      const title       = formData.get("title") as string;
      const description = formData.get("description") as string;
      const goalAmount  = formData.get("goalAmount") as string;
      const patientName = formData.get("patientName") as string;
      const location    = formData.get("location") as string;
      const urgency     = formData.get("urgency") as string;
      const image       = formData.get("image") as File | null;
      const document    = formData.get("document") as File | null;
      const raisedAmount = formData.get("raisedAmount") as string;

      // Get the existing case to see what existing URLs we have
      let existingCase: any = null;
      const pool = await getDbPool();
      if (pool) {
        const [rows] = await pool.query("SELECT * FROM cases WHERE id = ?", [params.id]);
        if (Array.isArray(rows) && rows.length > 0) {
          existingCase = rows[0];
        }
      } else {
        const cases = await readCases();
        existingCase = cases.find((c: any) => c.id === params.id);
      }

      if (!existingCase) {
        return NextResponse.json({ error: "Case not found" }, { status: 404 });
      }

      let imageUrl = existingCase.imageUrl || "";
      if (image && image.size > 0) {
        const imgBuffer = Buffer.from(await image.arrayBuffer());
        const pool = await getDbPool();
        if (pool) {
          imageUrl = `data:${image.type};base64,${imgBuffer.toString("base64")}`;
        } else {
          if (isCloudinaryConfigured) {
            const base64Image = `data:${image.type};base64,${imgBuffer.toString("base64")}`;
            const uploadRes = await cloudinary.uploader.upload(base64Image, {
              folder: "noble-vision/images",
            });
            imageUrl = uploadRes.secure_url;
          } else {
            await fs.mkdir(path.join(UPLOAD_DIR, "images"), { recursive: true });
            const imgName   = Date.now() + "_" + image.name.replace(/\s+/g, "_");
            await fs.writeFile(path.join(UPLOAD_DIR, "images", imgName), imgBuffer);
            imageUrl = `/uploads/images/${imgName}`;
          }
        }
      }

      let documentUrl = existingCase.documentUrl || "";
      let documentName = existingCase.documentName || "";
      if (document && document.size > 0) {
        const docBuffer = Buffer.from(await document.arrayBuffer());
        const pool = await getDbPool();
        if (pool) {
          documentUrl = `data:${document.type};base64,${docBuffer.toString("base64")}`;
          documentName = document.name;
        } else {
          if (isCloudinaryConfigured) {
            const base64Doc = `data:${document.type};base64,${docBuffer.toString("base64")}`;
            const uploadRes = await cloudinary.uploader.upload(base64Doc, {
              folder: "noble-vision/documents",
              resource_type: "auto",
            });
            documentUrl  = uploadRes.secure_url;
            documentName = document.name;
          } else {
            await fs.mkdir(path.join(UPLOAD_DIR, "documents"), { recursive: true });
            const docName   = Date.now() + "_" + document.name.replace(/\s+/g, "_");
            await fs.writeFile(path.join(UPLOAD_DIR, "documents", docName), docBuffer);
            documentUrl  = `/uploads/documents/${docName}`;
            documentName = document.name;
          }
        }
      }

      body = {
        title,
        patientName: patientName || "",
        location: location || "",
        urgency: urgency || "medium",
        description,
        goalAmount: parseFloat(goalAmount) || 0,
        raisedAmount: parseFloat(raisedAmount) || 0,
        imageUrl,
        documentUrl,
        documentName
      };
    } else {
      body = await req.json();
    }

    const pool = await getDbPool();
    if (pool) {
      if (body.isActive !== undefined && Object.keys(body).length === 1) {
        await pool.query("UPDATE cases SET isActive = ? WHERE id = ?", [body.isActive ? 1 : 0, params.id]);
      } else {
        const keys = Object.keys(body);
        if (keys.length > 0) {
          const assignments = keys.map(k => `${k} = ?`).join(", ");
          const values = keys.map(k => body[k]);
          await pool.query(`UPDATE cases SET ${assignments} WHERE id = ?`, [...values, params.id]);
        }
      }
    } else {
      const cases = await readCases();
      const updated = cases.map((c: { id: string }) =>
        c.id === params.id ? { ...c, ...body } : c
      );

      await writeCases(updated);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH case error:", err);
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}
