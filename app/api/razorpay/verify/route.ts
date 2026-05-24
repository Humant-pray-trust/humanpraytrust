import { NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { getAdminConfig } from "../../../../lib/auth";
import { getDbPool } from "../../../../lib/db";

const DATA_PATH = path.join(process.cwd(), "data", "donations.json");

async function writeDonation(donation: any) {
  try {
    const pool = await getDbPool();
    if (pool) {
      await pool.query(
        `INSERT INTO donations (id, paymentId, orderId, name, email, phone, pan, message, amount, cause, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          donation.id,
          donation.paymentId || "",
          donation.orderId || "",
          donation.name || "",
          donation.email || "",
          donation.phone || "",
          donation.pan || "",
          donation.message || "",
          donation.amount || 0,
          donation.cause || "",
          donation.createdAt
        ]
      );
      console.log("Donation saved to Hostinger MySQL successfully.");
      return;
    }

    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    let existing = [];
    try {
      const raw = await fs.readFile(DATA_PATH, "utf-8");
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }
    existing.push(donation);
    await fs.writeFile(DATA_PATH, JSON.stringify(existing, null, 2));
  } catch (error) {
    console.error("Failed to save donation:", error);
  }
}

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donorData } = await req.json();

    const config = await getAdminConfig();
    const key_secret = config.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment is authentic, save donation
    const donationRecord = {
      id: Date.now().toString(),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      ...donorData,
      createdAt: new Date().toISOString()
    };

    await writeDonation(donationRecord);

    return NextResponse.json({ success: true, donationId: donationRecord.id });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
