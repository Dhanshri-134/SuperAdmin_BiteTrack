import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID required" });

    await pgPool.query(
      `DELETE FROM superadmin_notifications WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
}
