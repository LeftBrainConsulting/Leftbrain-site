export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Basic email validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [3],
        updateEnabled: true
      })
    });

    // 204 = created, 200 = updated (already existed) — both are success
    if (response.status === 201 || response.status === 200 || response.status === 204) {
      return res.status(200).json({ success: true });
    } else {
      const data = await response.json();
      return res.status(500).json({ error: data.message || 'Brevo error' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
