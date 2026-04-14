export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://leftbrainconsult.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, email, companySize, challenge } = req.body;

  if (!email || !firstName) {
    return res.status(400).json({ error: 'First name and email are required.' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const PLAYBOOK_LIST_ID = parseInt(process.env.PLAYBOOK_LIST_ID); // Set this in Vercel env vars

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: {
          PRENOM: firstName,
          COMPANY_SIZE: companySize || '',
          CHALLENGE: challenge || '',
        },
        listIds: [PLAYBOOK_LIST_ID],
        updateEnabled: true, // update if contact already exists
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Brevo error:', err);
      return res.status(500).json({ error: 'Failed to subscribe.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
