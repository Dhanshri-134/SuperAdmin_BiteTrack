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

    // Query brief mess info
    const query = `
      SELECT
        id,
        name,
        per_day_rate,
        email,
        contact_info,
        prefix,
        description,
        location,
        rating,
        total_reviews,
        open_time,
        active_members,
        specialties,
        monthly_price,
        features,
        allowed_leave_days,
        updated_at
      FROM messes
      ORDER BY id DESC
    `;
    
    const { rows } = await pgPool.query(query);

    res.status(200).json({ messes: rows });
  } catch (err) {
    console.error("Error fetching messes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
