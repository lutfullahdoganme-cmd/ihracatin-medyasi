export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Yetkisiz' });
  try {
    const r = await fetch(
      'https://api.github.com/repos/lutfullahdoganme-cmd/ihracatin-medyasi/contents/data/submissions.json',
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'ihracatin-medyasi' } }
    );
    if (!r.ok) return res.json([]);
    const file = await r.json();
    return res.json(JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8')));
  } catch { return res.status(500).json({ error: 'Hata' }); }
}
