// import jwt from "jsonwebtoken";
// import { pgPool } from "@/lib/db";

// export default async function handler(req, res) {
//   if (req.method !== "GET") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Token required" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role !== "superadmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const result = await pgPool.query(`
//       WITH active_users AS (
//         SELECT 
//           m.id AS mess_id,
//           COUNT(u.id)::int AS active_users
//         FROM messes m
//         LEFT JOIN users u
//           ON u.mess_id = m.id AND u.status = 'Active'
//         GROUP BY m.id
//       ),
//       pricing AS (
//         SELECT
//           au.mess_id,
//           au.active_users,
//           CASE
//             WHEN au.active_users <= 100 THEN 1.25
//             WHEN au.active_users <= 300 THEN 1.00
//             WHEN au.active_users <= 500 THEN 0.80
//             ELSE 0.60
//           END AS rate
//         FROM active_users au
//       ),
//       last_payment AS (
//         SELECT
//           mp.mess_id,
//           MAX(mp.to_date) AS last_paid_till
//         FROM mess_payments mp
//         WHERE mp.status = 'pending'
//         GROUP BY mp.mess_id
//       )
//       SELECT
//         SUM(
//           GREATEST(
//             (CURRENT_DATE - COALESCE(lp.last_paid_till, m.created_at::date)),
//             0
//           ) * (p.active_users * p.rate)
//         )::numeric(12,2) AS total_receivable
//       FROM messes m
//       JOIN pricing p ON p.mess_id = m.id
//       LEFT JOIN last_payment lp ON lp.mess_id = m.id;
//     `);

//     return res.status(200).json({
//       totalReceivable: result.rows[0].total_receivable || 0,
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(401).json({ message: "Invalid token" });
//   }
// }
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
      WITH active_users AS (
        SELECT 
          m.id AS mess_id,
          COUNT(u.id)::int AS active_users
        FROM messes m
        LEFT JOIN users u
          ON u.mess_id = m.id AND u.status = 'Active'
        GROUP BY m.id
      ),
      pricing AS (
        SELECT
          au.mess_id,
          au.active_users,
          CASE
            WHEN au.active_users <= 100 THEN 1.25
            WHEN au.active_users <= 300 THEN 1.00
            WHEN au.active_users <= 500 THEN 0.80
            ELSE 0.60
          END AS rate
        FROM active_users au
      ),
      last_paid AS (
        SELECT
          mp.mess_id,
          MAX(mp.to_date) AS last_paid_till
        FROM mess_payments mp
        WHERE mp.status = 'paid'
        GROUP BY mp.mess_id
      )
      SELECT
        SUM(
          GREATEST(
            (CURRENT_DATE - COALESCE(lp.last_paid_till, m.created_at::date)),
            0
          ) * (p.active_users * p.rate)
        )::numeric(12,2) AS total_pending
      FROM messes m
      JOIN pricing p ON p.mess_id = m.id
      LEFT JOIN last_paid lp ON lp.mess_id = m.id;
    `);

    return res.status(200).json({
     totalReceivable: result.rows[0].total_pending || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
