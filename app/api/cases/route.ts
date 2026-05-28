import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { checkAdminPassword } from "../../../lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { getDbPool } from "../../../lib/db";

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

// Helper: Read cases from JSON
async function readCases() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper: Write cases to JSON
async function writeCases(cases: object[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(cases, null, 2));
}

// ─── GET: Fetch all cases ─────────────────────────────────
export async function GET() {
  try {
    const pool = await getDbPool();
    if (pool) {
      const [rows] = await pool.query("SELECT * FROM cases ORDER BY createdAt DESC");
      // Map MySQL 1/0 back to boolean
      const mapped = (rows as any[]).map(row => ({
        ...row,
        isActive: !!row.isActive,
      }));
      return NextResponse.json(mapped);
    }
    const cases = await readCases();
    return NextResponse.json(cases);
  } catch (err) {
    console.error("GET cases error:", err);
    return NextResponse.json({ error: "Failed to load cases" }, { status: 500 });
  }
}

// ─── POST: Add a new case ─────────────────────────────────
export async function POST(req: Request) {
  try {
    // Admin password check
    const adminPass = req.headers.get("x-admin-password");
    const isAuthed = await checkAdminPassword(adminPass);
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    let imageUrl = "";
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

    let documentUrl = "";
    let documentName = "";
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

    const newCase = {
      id:           Date.now().toString(),
      title,
      patientName:  patientName || "",
      location:     location || "",
      urgency:      urgency || "medium",
      description,
      goalAmount:   parseFloat(goalAmount) || 0,
      raisedAmount: parseFloat(raisedAmount) || 0,
      imageUrl,
      documentUrl,
      documentName,
      createdAt:    new Date().toISOString(),
      isActive:     true,
    };

    const pool = await getDbPool();
    if (pool) {
      await pool.query(
        `INSERT INTO cases (id, title, patientName, location, urgency, description, goalAmount, raisedAmount, imageUrl, documentUrl, documentName, createdAt, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newCase.id,
          newCase.title,
          newCase.patientName,
          newCase.location,
          newCase.urgency,
          newCase.description,
          newCase.goalAmount,
          newCase.raisedAmount,
          newCase.imageUrl,
          newCase.documentUrl,
          newCase.documentName,
          newCase.createdAt,
          newCase.isActive ? 1 : 0,
        ]
      );
    } else {
      const cases = await readCases();
      cases.push(newCase);
      await writeCases(cases);
    }

    return NextResponse.json({ success: true, case: newCase });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to save case" }, { status: 500 });
  }
}
