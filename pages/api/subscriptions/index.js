import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { rows } = await pgPool.query(`
    SELECT
      id,
      name,
      email,
      subscription_status,
      subscription_plan,
      subscription_start_date,
      subscription_end_date
    FROM messes
    ORDER BY subscription_end_date NULLS LAST
  `);

  res.status(200).json({ messes: rows });
}
