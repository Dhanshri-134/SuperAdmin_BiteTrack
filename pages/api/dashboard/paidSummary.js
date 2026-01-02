import jwt from "jsonwebtoken";
import { pgPool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin")
      return res.status(403).json({ message: "Access denied" });

    const result = await pgPool.query(`
      SELECT
        SUM(amount)::numeric(12,2) AS total_received
      FROM mess_payments
      WHERE status = 'paid';
    `);

    return res.status(200).json({
      totalPayable: result.rows[0].total_received || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
