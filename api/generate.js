export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '서버에 OPENAI_API_KEY가 설정되지 않았습니다.' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1792"
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'OpenAI API Error' });
    }

    if (data.data && data.data[0]) {
      return res.status(200).json({ url: data.data[0].url });
    } else {
      return res.status(500).json({ error: '이미지를 생성하지 못했습니다.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
