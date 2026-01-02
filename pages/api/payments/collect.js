import jwt from "jsonwebtoken";
import { pgPool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { messId } = req.body;
    if (!messId) {
      return res.status(400).json({ message: "messId required" });
    }

    const result = await pgPool.query(`
      WITH active_users AS (
        SELECT COUNT(*)::int AS active_users
        FROM users
        WHERE mess_id = $1 AND status = 'Active'
      ),
      pricing AS (
        SELECT
          active_users,
          CASE
            WHEN active_users <= 100 THEN 1.25
            WHEN active_users <= 300 THEN 1.00
            WHEN active_users <= 500 THEN 0.80
            ELSE 0.60
          END AS rate
        FROM active_users
      ),
      last_payment AS (
        SELECT MAX(to_date) AS last_paid_till
        FROM mess_payments
        WHERE mess_id = $1 AND status = 'paid'
      )
      SELECT
        p.active_users,
        p.rate,
        COALESCE(lp.last_paid_till + INTERVAL '1 day', m.created_at::date) AS from_date,
        CURRENT_DATE AS to_date
      FROM pricing p
      CROSS JOIN messes m
      LEFT JOIN last_payment lp ON true
      WHERE m.id = $1;
    `, [messId]);

    const row = result.rows[0];

    if (!row || row.from_date > row.to_date) {
      return res.status(400).json({ message: "Nothing to collect" });
    }

    const days =
      Math.floor(
        (new Date(row.to_date) - new Date(row.from_date)) / 86400000
      ) + 1;

    const amount =
      days * row.active_users * row.rate;

    await pgPool.query(`
      INSERT INTO mess_payments
      (mess_id, active_users, rate, amount, from_date, to_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'paid')
    `, [
      messId,
      row.active_users,
      row.rate,
      amount,
      row.from_date,
      row.to_date,
    ]);

    return res.status(200).json({
      message: "Payment collected successfully",
      days,
      amount,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
