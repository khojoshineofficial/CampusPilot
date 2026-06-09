const https = require('https');

const API_KEY = process.env.ARKESEL_API_KEY;
const SENDER_ID = process.env.ARKESEL_SENDER_ID || 'CampusPilot';

/**
 * Send SMS to one or more phone numbers via Arkesel.
 * @param {string|string[]} to  - phone number(s) e.g. "0241234567" or ["024..","026.."]
 * @param {string} message       - SMS body (max ~160 chars per SMS)
 */
async function sendSms(to, message) {
  if (!API_KEY) {
    console.warn('[SMS] ARKESEL_API_KEY not set — skipping SMS');
    return;
  }

  const numbers = Array.isArray(to) ? to.join(',') : to;
  if (!numbers) return;

  const params = new URLSearchParams({
    action: 'send-sms',
    api_key: API_KEY,
    to: numbers,
    from: SENDER_ID,
    sms: message,
  });

  const url = `https://sms.arkesel.com/sms/api?${params.toString()}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json['action-status'] === 'success' || json.status === '101') {
            console.log(`[SMS] Sent to ${numbers}`);
          } else {
            console.error('[SMS] Arkesel error:', data);
          }
        } catch {
          console.error('[SMS] Bad response:', data);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.error('[SMS] Request failed:', err.message);
      resolve();
    });
  });
}

/**
 * Bulk-send an announcement SMS to all matching users.
 * Batches numbers to avoid URL length limits (max 50 per call).
 */
async function sendAnnouncementSms(phones, announcementTitle, content) {
  if (!phones.length) return;

  // Trim message to stay within SMS limits
  const MAX = 155;
  const body = `[CampusPilot] ${announcementTitle}\n${content}`.slice(0, MAX);

  // Batch into groups of 50
  for (let i = 0; i < phones.length; i += 50) {
    const batch = phones.slice(i, i + 50);
    await sendSms(batch, body);
  }
}

module.exports = { sendSms, sendAnnouncementSms };
