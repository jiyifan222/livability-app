export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, language } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  const prompt = language === 'zh'
    ? `你是一个专业的居住体验分析师。根据地址"${address}"，生成一份详细的居住体验报告。

只输出原始JSON，不要markdown，不要代码块，不要任何解释：
{"address":"完整格式化地址","city":"城市, 州/省","overall":78,"summary":"两句话描述这里的居住感受","scores":{"walkability":72,"transit":55,"safety":80,"noise":75,"amenities":82},"pros":["优点1","优点2","优点3"],"cons":["缺点1","缺点2"],"nearby":[{"type":"grocery","name":"超市名称","distance":"0.5 mi"},{"type":"transit","name":"交通站点","distance":"0.3 mi"},{"type":"restaurant","name":"餐饮选择","distance":"0.2 mi"},{"type":"park","name":"公园名称","distance":"0.4 mi"},{"type":"hospital","name":"医院名称","distance":"1.5 mi"},{"type":"school","name":"学校名称","distance":"0.6 mi"}],"insider_tip":"一条当地人才知道的居住小贴士"}

根据对该地址的真实了解给出评分，尽量准确具体。`
    : `You are a professional livability analyst. Generate a detailed living experience report for: "${address}".

Reply ONLY with raw JSON, no markdown, no backticks, no explanation:
{"address":"full formatted address","city":"City, State","overall":78,"summary":"2 sentences about living here","scores":{"walkability":72,"transit":55,"safety":80,"noise":75,"amenities":82},"pros":["pro1","pro2","pro3"],"cons":["con1","con2"],"nearby":[{"type":"grocery","name":"Store name","distance":"0.5 mi"},{"type":"transit","name":"Transit stop","distance":"0.3 mi"},{"type":"restaurant","name":"Dining options","distance":"0.2 mi"},{"type":"park","name":"Park name","distance":"0.4 mi"},{"type":"hospital","name":"Hospital name","distance":"1.5 mi"},{"type":"school","name":"School name","distance":"0.6 mi"}],"insider_tip":"One tip only a local would know"}

Use real knowledge of this location. Be specific and accurate.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const report = JSON.parse(raw);

    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}
