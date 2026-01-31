import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const { id, title, message, notification_type, priority } = req.body;

    if (!id || !title || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await pgPool.query(
      `
      UPDATE superadmin_notifications
      SET title = $1,
          message = $2,
          notification_type = $3,
          priority = $4
      WHERE id = $5
      `,
      [title, message, notification_type, priority, id]
    );

    res.status(200).json({ message: "Notification updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
}
