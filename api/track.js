export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).end();

  const { page, referrer, mobile } = req.body || {};
  const today = new Date().toISOString().slice(0, 10);
  const REPO = 'lutfullahdoganme-cmd/ihracatin-medyasi';
  const FILE = 'data/analytics.json';
  const headers = { Authorization: `token ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'ihracatin', 'Content-Type': 'application/json' };

  try {
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, { headers });
    let data = { total: 0, days: {}, pages: {}, devices: { mobile: 0, desktop: 0 }, referrers: {} };
    let sha = null;
    if (getRes.ok) {
      const file = await getRes.json();
      sha = file.sha;
      data = JSON.parse(Buffer.from(file.content, 'base64').toString());
    }
    data.total = (data.total || 0) + 1;
    data.days[today] = (data.days[today] || 0) + 1;
    const p = (page || '/').split('?')[0];
    data.pages[p] = (data.pages[p] || 0) + 1;
    if (mobile) data.devices.mobile = (data.devices.mobile || 0) + 1;
    else data.devices.desktop = (data.devices.desktop || 0) + 1;
    if (referrer) {
      try {
        const ref = new URL(referrer).hostname.replace('www.', '');
        if (ref && !ref.includes('ihracatinmedyasi')) data.referrers[ref] = (data.referrers[ref] || 0) + 1;
      } catch {}
    }
    const body = { message: 'ziyaret', content: Buffer.from(JSON.stringify(data)).toString('base64') };
    if (sha) body.sha = sha;
    await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, { method: 'PUT', headers, body: JSON.stringify(body) });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: false });
  }
}
