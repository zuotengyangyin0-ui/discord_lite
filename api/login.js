// api/login.js
const fetch = require('node-fetch');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'X-Captcha-Rqtoken');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Captcha-Key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { login, password, captcha_key } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const discordRes = await fetch("https://discord.com/api/v9/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(captcha_key && { "X-Captcha-Key": captcha_key }),
      },
      body: JSON.stringify({ login, password }),
    });

    const data = await discordRes.json();
    const rqtoken = discordRes.headers.get('x-captcha-rqtoken');
    if (rqtoken) {
      res.setHeader('X-Captcha-Rqtoken', rqtoken);
    }
    
    res.status(discordRes.status).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
