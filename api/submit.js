export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ad, firma, telefon, email, sektor, mesaj } = req.body;
  if (!ad || !telefon) return res.status(400).json({ error: 'Ad ve telefon zorunludur' });

  const submission = {
    id: Date.now(),
    ad: ad || '', firma: firma || '', telefon: telefon || '',
    email: email || '', sektor: sektor || '', mesaj: mesaj || '',
    tarih: new Date().toISOString(), durum: 'Yeni'
  };

  try {
    const getRes = await fetch(
      'https://api.github.com/repos/lutfullahdoganme-cmd/ihracatin-medyasi/contents/data/submissions.json',
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'ihracatin-medyasi' } }
    );
    let submissions = [], sha = null;
    if (getRes.ok) {
      const file = await getRes.json();
      sha = file.sha;
      submissions = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
    }
    submissions.unshift(submission);
    const body = { message: `Yeni başvuru: ${ad}`, content: Buffer.from(JSON.stringify(submissions, null, 2)).toString('base64') };
    if (sha) body.sha = sha;
    await fetch(
      'https://api.github.com/repos/lutfullahdoganme-cmd/ihracatin-medyasi/contents/data/submissions.json',
      { method: 'PUT', headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'ihracatin-medyasi' }, body: JSON.stringify(body) }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Kayıt hatası' });
  }
}
