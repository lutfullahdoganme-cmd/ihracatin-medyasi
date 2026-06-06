export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Yetkisiz' });
  const { id, durum } = req.body;
  try {
    const r = await fetch(
      'https://api.github.com/repos/lutfullahdoganme-cmd/ihracatin-medyasi/contents/data/submissions.json',
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'ihracatin-medyasi' } }
    );
    if (!r.ok) return res.status(404).json({ error: 'Bulunamadı' });
    const file = await r.json();
    let subs = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
    subs = subs.map(s => s.id === id ? { ...s, durum } : s);
    await fetch(
      'https://api.github.com/repos/lutfullahdoganme-cmd/ihracatin-medyasi/contents/data/submissions.json',
      { method: 'PUT', headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'ihracatin-medyasi' }, body: JSON.stringify({ message: 'Lead güncellendi', content: Buffer.from(JSON.stringify(subs, null, 2)).toString('base64'), sha: file.sha }) }
    );
    return res.status(200).json({ success: true });
  } catch { return res.status(500).json({ error: 'Güncelleme hatası' }); }
}
