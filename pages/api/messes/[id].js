import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  // 🔐 Auth
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (method === "GET") {
    try {
      const { rows } = await pgPool.query(
        `
        SELECT
          id,
          name,
          per_day_rate,
          email,
          contact_info,
          prefix,
          description,
          location,
          open_time,
          active_members,
          specialties,
          monthly_price,
          features,
          allowed_leave_days
        FROM messes
        WHERE id = $1
        `,
        [id]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Mess not found" });
      }

      res.status(200).json({ mess: rows[0] });
    } catch (err) {
      console.error("Fetch mess error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }else if (method === "PUT") {
  try {
    const {
      name,
      per_day_rate,
      email,
      contact_info,
      prefix,
      description,
      location,
      open_time,
      specialties,
      monthly_price,
      features,
      allowed_leave_days,
    } = req.body;

    await pgPool.query(
      `
      UPDATE messes
      SET
        name = $1,
        per_day_rate = $2,
        email = $3,
        contact_info = $4,
        prefix = $5,
        description = $6,
        location = $7,
        open_time = $8,
        specialties = $9,
        monthly_price = $10,
        features = $11,
        allowed_leave_days = $12,
        updated_at = NOW()
      WHERE id = $13
      `,
      [
        name,
        per_day_rate,
        email || null,
        contact_info ? JSON.parse(contact_info) : null,
        prefix,
        description || null,
        location || null,
        open_time || null,
        specialties
          ? specialties.split(",").map((s) => s.trim())
          : [],
        monthly_price,
        features
          ? features.split(",").map((f) => f.trim())
          : [],
        allowed_leave_days,
        id,
      ]
    );

    res.status(200).json({ message: "Mess updated successfully" });
  } catch (err) {
    console.error("Update mess error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
