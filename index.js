const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { message, language, cyclePhase } = req.body;

  const systemPrompt = language === 'ur'
    ? `آپ ماہ ہیلتھ ایپ کی AI معاون ہیں۔ آپ خواتین کی صحت کے بارے میں مددگار اور درست معلومات دیتی ہیں۔ سائیکل فیز: ${cyclePhase}۔ ہمیشہ اردو میں جواب دیں۔ 150 الفاظ سے کم میں جواب دیں۔`
    : `You are the AI health assistant for Maah, a women's health app for South Asian women. Give helpful, warm, medically accurate advice about periods, PCOS, and women's wellness. Current cycle phase: ${cyclePhase}. Keep responses under 150 words. Always suggest seeing a doctor for serious symptoms.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });
    res.json({ reply: response.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'Maah backend running!' }));

app.listen(process.env.PORT || 3000, () => console.log('Server running!'));