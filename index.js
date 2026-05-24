// // const express = require('express');
// // const cors = require('cors');

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// // app.post('/api/chat', async (req, res) => {
// //   const { message, language, cyclePhase } = req.body;

// //   const systemPrompt = language === 'ur'
// //     ? `آپ ماہ ہیلتھ ایپ کی AI معاون ہیں۔ خواتین کی صحت کے بارے میں مددگار معلومات دیں۔ سائیکل فیز: ${cyclePhase}۔ اردو میں 150 الفاظ سے کم میں جواب دیں۔`
// //     : `You are the AI health assistant for Maah, a women's health app for South Asian women. Give helpful, warm, medically accurate advice about periods, PCOS, and women's wellness. Current cycle phase: ${cyclePhase}. Keep responses under 150 words. Always suggest seeing a doctor for serious symptoms.`;

// //   try {
// //     const response = await fetch(
// //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
// //       {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + message }] }]
// //         }),
// //       }
// //     );
// //     const data = await response.json();
// //     const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not respond.';
// //     res.json({ reply });
// //   } catch (e) {
// //     res.status(500).json({ error: e.message });
// //   }
// // });

// // app.get('/', (req, res) => res.json({ status: 'Maah backend running!' }));

// // app.listen(process.env.PORT || 3000, () => console.log('Server running!'));

// const express = require('express');
// const cors = require('cors');
// const https = require('https');

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.post('/api/chat', async (req, res) => {
//   const { message, language, cyclePhase } = req.body;
//   const apiKey = process.env.GEMINI_API_KEY;

//   const systemPrompt = language === 'ur'
//     ? `آپ ماہ ہیلتھ ایپ کی AI معاون ہیں۔ خواتین کی صحت کے بارے میں مددگار معلومات دیں۔ اردو میں 150 الفاظ سے کم میں جواب دیں۔`
//     : `You are the AI health assistant for Maah, a women's health app for South Asian women. Give helpful, warm, medically accurate advice about periods, PCOS, and women's wellness. Current cycle phase: ${cyclePhase}. Keep responses under 150 words.`;

//   const body = JSON.stringify({
//     contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + message }] }]
//   });

//   const options = {
//     hostname: 'generativelanguage.googleapis.com',
//     path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
//   };

//   const request = https.request(options, (response) => {
//     let data = '';
//     response.on('data', chunk => data += chunk);
//     response.on('end', () => {
//       try {
//         const parsed = JSON.parse(data);
//         const reply = parsed.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response.';
//         res.json({ reply });
//       } catch (e) {
//         res.status(500).json({ error: 'Parse error' });
//       }
//     });
//   });

//   request.on('error', (e) => res.status(500).json({ error: e.message }));
//   request.write(body);
//   request.end();
// });

// app.get('/', (req, res) => res.json({ status: 'Maah backend running!' }));
// app.listen(process.env.PORT || 3000, () => console.log('Server running!'));

const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, language, cyclePhase } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('Message received:', message);
  console.log('API Key exists:', !!apiKey);

  const prompt = `You are a women's health assistant for a Pakistani app called Maah. Answer helpfully about periods, PCOS, and women's health in under 150 words. User asks: ${message}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      console.log('Gemini response:', data.substring(0, 200));
      try {
        const parsed = JSON.parse(data);
        const reply = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          res.json({ reply });
        } else {
          console.log('Full response:', JSON.stringify(parsed));
          res.json({ reply: 'I am having trouble responding right now.' });
        }
      } catch (e) {
        res.status(500).json({ error: 'Parse error: ' + e.message });
      }
    });
  });

  request.on('error', (e) => {
    console.log('Request error:', e.message);
    res.status(500).json({ error: e.message });
  });
  request.write(body);
  request.end();
});

app.get('/', (req, res) => res.json({ status: 'Maah backend running!' }));
app.listen(process.env.PORT || 3000, () => console.log('Server running!'));