import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  // Dummy authentication, replace with real DB check
  if (username === 'superadmin' && password === 'admin123') {
    const token = jwt.sign({ role: 'superadmin' }, process.env.JWT_SECRET);
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
