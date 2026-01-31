import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const {
      title,
      message,
      notification_type = "general",
      priority = "normal",
      expires_at = null,
      mess_ids = null, // null | [] | [ids]
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message required" });
    }

    let targetMessIds = mess_ids;

    /* =======================================================
       CASE 1: NULL or empty → send to ALL messes
       ======================================================= */
    if (!Array.isArray(mess_ids) || mess_ids.length === 0) {
      const { rows } = await pgPool.query(
        `SELECT id FROM messes WHERE subscription_status IS NOT NULL`
      );

      targetMessIds = rows.map((r) => r.id);

      if (targetMessIds.length === 0) {
        return res
          .status(400)
          .json({ error: "No messes found to send notification" });
      }
    }

    /* =======================================================
       INSERT ONE ROW PER mess_id
       ======================================================= */
    const values = targetMessIds.map((messId) => [
      title,
      message,
      notification_type,
      priority,
      expires_at,
      messId,
    ]);

    const placeholders = values
      .map(
        (_, i) =>
          `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
      )
      .join(",");

    await pgPool.query(
      `
      INSERT INTO superadmin_notifications
      (title, message, notification_type, priority, expires_at, mess_id)
      VALUES ${placeholders}
      `,
      values.flat()
    );

    res.status(200).json({
      message: `Notification sent to ${targetMessIds.length} messes`,
    });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
}
