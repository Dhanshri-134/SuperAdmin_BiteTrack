import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";
import { sendRejectionEmail } from "@/lib/email/brevo";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);

    const { messId } = req.body;
    if (!messId) {
      return res.status(400).json({ error: "Mess ID required" });
    }

    // 1️⃣ Fetch mess details BEFORE delete
    const { rows } = await pgPool.query(
      `
      SELECT name, email
      FROM messes
      WHERE id = $1 AND subscription_status = 'pending_approval'
      `,
      [messId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Mess not found" });
    }

    const { name, email } = rows[0];

    // 2️⃣ Send rejection email (if email exists)
    if (email) {
      await sendRejectionEmail({
        to: email,
        messName: name,
      });
    }

    // 3️⃣ Delete mess
    await pgPool.query(
      `DELETE FROM messes WHERE id = $1`,
      [messId]
    );

    res.status(200).json({ message: "Mess rejected and removed" });
  } catch (err) {
    console.error("Reject mess error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
