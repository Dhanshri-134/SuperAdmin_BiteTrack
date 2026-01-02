import jwt from "jsonwebtoken";
import { pgPool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // optional filter
    const { messId } = req.query;

    const result = await pgPool.query(
      `
      SELECT
        mp.id,
        mp.mess_id,
        m.name AS mess_name,

        mp.from_date,
        mp.to_date,

        mp.active_users,
        mp.rate,
        mp.amount,

        mp.status,
        mp.created_at
      FROM mess_payments mp
      JOIN messes m ON m.id = mp.mess_id
      ${messId ? "WHERE mp.mess_id = $1" : ""}
      WHERE mp.status = 'pending'

      ORDER BY mp.created_at DESC
      `,
      messId ? [messId] : []
    );

    return res.status(200).json(result.rows);

  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
