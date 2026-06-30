export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { address, language } = req.body;
  if (!address) return res.status(400).json({ error: 'Address is required' });

  const prompt = language === 'zh' ? `
你是本地房产内行人士，帮助购房者做决策。你了解Zillow和Google Maps查不到的具体街区级事实。

分析地址："${address}"

针对以下8个维度（noise噪音, walkability步行, safety安全, schools学区, nature自然, flood_risk洪水风险, pet宠物友好, management物业）：
- 先思考2-3个具体事实，拒绝任何空泛、套用任何房子都成立的说法（比如"学区好""很安静"）
- 输出"phrase"：2-5个字的极短短语，必须让用户1秒内扫一眼就懂重点。好例子："早高峰吵闹""无洪水风险""学位紧张""6点后安静""HOA费上涨"。不要用"一般""还行"这类空泛词。
- 输出"headline"：一句完整的话，必须包含具体数字、具体街道/地标名、具体季节/时间，或具体机构名称。不要用"好""不错"这类模糊形容词。

然后：回顾你写的全部8句headline，从中选出1-2条全场最抓眼球的（最极端、最意外、或对决策影响最大的）作为"key_insights"。

只输出JSON，不要markdown：
{
  "address": "...", "city": "...", "overall": 75,
  "key_insights": ["全场最佳的一句headline", "如果确实有第二条独特且有价值的，可以加上"],
  "dimensions": {
    "noise": {"score": 70, "phrase": "2-5字短语", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "walkability": {"score": 55, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "safety": {"score": 80, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "schools": {"score": 86, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "nature": {"score": 72, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "flood_risk": {"score": 63, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "pet": {"score": 76, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "management": {"score": 62, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."}
  }
}` : `
You are a sharp local real estate insider helping a home buyer make a decision. You know specific, street-level facts that Zillow and Google Maps cannot tell you — seasonal patterns, specific noise sources, HOA history, flood zone designations, school enrollment pressure, and similar details.

Analyze this address: "${address}"

For EACH of these 8 dimensions (noise, walkability, safety, schools, nature, flood_risk, pet, management):
STEP 1 (internal, do not output): Think of 2-3 specific, concrete facts. Reject anything generic that could apply to any house in the area (e.g. "good schools", "quiet street", "low crime").
STEP 2 (output "phrase"): Write a SHORT phrase, 2-5 words max, that captures the single most important takeaway for this dimension. This appears on a small card — it must be scannable in under 1 second. Examples of good phrases: "Loud school mornings", "No flood risk", "Tight school zoning", "Quiet after 6pm", "HOA fee rising". Do NOT use generic words like "Good" or "Average" — be specific and concrete even in 2-5 words.
STEP 3 (output "headline"): Write ONE full sentence — the single most specific, surprising, or decision-relevant fact, expanding on the phrase. It must include at least one of: a specific number, a specific street/landmark name, a specific season/time, or a named entity (HOA name, school name, road name, agency). Avoid vague adjectives like "great", "good", "nice" — replace them with facts.

THEN: review all 8 headlines you just wrote, and select the 1-2 most attention-grabbing overall (most extreme, most surprising, or highest decision impact) as "key_insights". A key_insight can even combine facts from two dimensions into one sharp sentence if that creates more impact.

Reply ONLY with raw JSON, no markdown:
{
  "address": "full formatted address", "city": "City, State", "overall": 75,
  "key_insights": ["the single best headline or combined insight", "optional second one only if truly distinct and valuable"],
  "dimensions": {
    "noise": {"score": 70, "phrase": "2-5 word takeaway", "headline": "full sentence", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "walkability": {"score": 55, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "safety": {"score": 80, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "schools": {"score": 86, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "nature": {"score": 72, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "flood_risk": {"score": 63, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "pet": {"score": 76, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."},
    "management": {"score": 62, "phrase": "...", "headline": "...", "pros": ["..."], "cons": ["..."], "tip": "..."}
  }
}
Base everything on real knowledge of this specific location. The "phrase" field is what users see first on the overview screen — make it concrete and worth a glance.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 2500, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(raw));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}
