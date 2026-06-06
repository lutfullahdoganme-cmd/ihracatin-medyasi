export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Yetkisiz' });
  try {
    const r = await fetch(
      'https://api.github.com/repos/lutfullahdoganme-cmd/ihracatin-medyasi/contents/data/analytics.json',
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'ihracatin' } }
    );
    if (!r.ok) return res.json({ total: 0, days: {}, pages: {}, devices: { mobile: 0, desktop: 0 }, referrers: {} });
    const file = await r.json();
    return res.json(JSON.parse(Buffer.from(file.content, 'base64').toString()));
  } catch { return res.status(500).json({ error: 'Hata' }); }
}
