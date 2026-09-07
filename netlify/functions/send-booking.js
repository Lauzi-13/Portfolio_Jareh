// Netlify serverless function: receives a booking enquiry from the
// portfolio's contact form and forwards it to Terrency's WhatsApp
// automatically via CallMeBot (https://www.callmebot.com/), keeping
// the CallMeBot phone number + API key out of the public frontend code.
//
// Required environment variables (set in Netlify: Site settings ->
// Environment variables):
//   CALLMEBOT_PHONE   - the WhatsApp number CallMeBot was activated for
//                        (digits only, e.g. 260977309502)
//   CALLMEBOT_APIKEY  - the API key CallMeBot sent back after activation

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { name, phone, eventType, eventDate, message, company } = data;

  // Honeypot: bots tend to fill every field. Pretend success, do nothing.
  if (company) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  if (!name || !phone) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Name and phone are required' }) };
  }

  const callMeBotPhone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_APIKEY;

  if (!callMeBotPhone || !apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'WhatsApp notifier is not configured on the server yet' }),
    };
  }

  const lines = [
    'New Booking Enquiry — Terrency Mdluli Portfolio',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Event Type: ${eventType || 'Not specified'}`,
    `Event Date: ${eventDate || 'Not specified'}`,
    `Details: ${message || 'None provided'}`,
  ];
  const text = encodeURIComponent(lines.join('\n'));
  const url = `https://api.callmebot.com/whatsapp.php?phone=${callMeBotPhone}&text=${text}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const resultText = await response.text();

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'CallMeBot rejected the request', details: resultText }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Could not reach CallMeBot', details: String(err) }),
    };
  }
};
