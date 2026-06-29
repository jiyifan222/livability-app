export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { address, language, customPrompt } = req.body;
  if (!address) return res.status(400).json({ error: 'Address is required' });

  const prompt = customPrompt || (language === 'zh'
    ? `分析地址"${address}"，只输出JSON：{"address":"...","city":"...","overall":75,"summary":"..."}`
    : `Analyze "${address}", reply ONLY with JSON: {"address":"...","city":"...","overall":75,"summary":"..."}`);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(raw));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}
