export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { characterDesc } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '서버에 GEMINI_API_KEY가 설정되지 않았습니다.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `다음은 사용자가 입력한 이모티콘 캐릭터의 간단한 설명입니다: "${characterDesc}"\n이 설명을 DALL-E 3가 아주 선명하고 매력적인 캐릭터로 그릴 수 있도록, 형태, 색상, 의상, 표정, 분위기 등을 구체적이고 생동감 넘치는 2~3문장의 묘사로 확장해주세요. 한국어로 답변해주세요. 다른 부가 설명 없이 묘사된 텍스트만 출력하세요.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Gemini API Error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return res.status(200).json({ result: text.trim() });
    } else {
      return res.status(500).json({ error: 'Gemini로부터 응답을 받지 못했습니다.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
