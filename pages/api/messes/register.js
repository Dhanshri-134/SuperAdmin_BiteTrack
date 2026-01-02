import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ error: "Unauthorized" });

    const token = auth.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    const {
      name,
      per_day_rate = 1,
      email,
      contact_info,
      prefix = "SM",
      description,
      location,
      rating = 0,
      total_reviews = 0,
      open_time,
      active_members = 0,
      specialties,
      monthly_price = "₹0",
      features,
      allowed_leave_days = 0,
    } = req.body;

    const query = `
      INSERT INTO messes
      (name, per_day_rate, email, contact_info, prefix, description, location, rating, total_reviews, open_time, active_members, specialties, monthly_price, features, allowed_leave_days)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING id, name
    `;

    const values = [
      name,
      per_day_rate,
      email || null,
      contact_info ? JSON.parse(contact_info) : null,
      prefix,
      description || null,
      location || null,
      rating,
      total_reviews,
      open_time || null,
      active_members,
      specialties ? specialties.split(",").map(s => s.trim()) : [],
      monthly_price,
      features ? features.split(",").map(f => f.trim()) : [],
      allowed_leave_days,
    ];

    const { rows } = await pgPool.query(query, values);

    res.status(200).json({ message: "Mess registered", mess: rows[0] });
  } catch (err) {
    console.error("Error registering mess:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
