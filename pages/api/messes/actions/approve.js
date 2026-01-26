import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";
import { sendApprovalEmail } from "@/lib/email/brevo";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🔐 Auth
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);

    const { messId } = req.body;
    if (!messId) {
      return res.status(400).json({ error: "Mess ID required" });
    }

    // 1️⃣ Get mess details
    const { rows: messRows } = await pgPool.query(
      `SELECT name, email FROM messes WHERE id = $1 AND subscription_status = 'pending_approval'`,
      [messId]
    );

    if (!messRows.length) {
      return res.status(404).json({ error: "Mess not found or already approved" });
    }

    const messName = messRows[0].name;
    const email = messRows[0].email;

    // 2️⃣ Prefix (first letters or DM)
    const prefix =
      messName.toLowerCase().includes("demo")
        ? "DM"
        : messName.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const baseKey = `${prefix}${month}${year}`;

    // 3️⃣ Monthly counter
    const { rows: countRows } = await pgPool.query(
      `SELECT COUNT(*) FROM messes WHERE secret_key LIKE $1`,
      [`${baseKey}%`]
    );

    const counter = String(Number(countRows[0].count) + 1).padStart(2, "0");

    const secretKey = `${baseKey}${counter}`;

    // 4️⃣ Approve mess
    await pgPool.query(
      `
      UPDATE messes
      SET
        subscription_status = 'trial',
        trial_start_date = CURRENT_DATE,
        trial_end_date = CURRENT_DATE + INTERVAL '14 days',
        secret_key = $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      [secretKey, messId]
    );
console.log("📧 Sending approval email to:", email);

await sendApprovalEmail({
  to: email,
  messName,
  secretKey,
});

console.log("✅ Email send function finished");


    res.status(200).json({
      message: "Mess approved successfully",
      secret_key: secretKey,
    });
  } catch (err) {
    console.error("Approve mess error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
