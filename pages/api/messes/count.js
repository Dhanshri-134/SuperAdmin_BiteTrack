import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Query total mess count
    const query = `SELECT COUNT(*) AS total FROM messes`;
    const { rows } = await pgPool.query(query);

    res.status(200).json({ total: parseInt(rows[0].total, 10) });
  } catch (err) {
    console.error("Error fetching mess count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
