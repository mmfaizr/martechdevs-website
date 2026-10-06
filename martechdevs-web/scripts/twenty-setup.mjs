// One-off Twenty setup for the quote form. Safe to rerun, it skips what exists.
//   TWENTY_API_KEY=... node scripts/twenty-setup.mjs
// Adds the quote fields to People, so the thank-you workflow and the team can
// see what each lead asked for.

const key = process.env.TWENTY_API_KEY;
if (!key) throw new Error('TWENTY_API_KEY is not set');
const base = process.env.TWENTY_API_URL || 'https://api.twenty.com';

async function twenty(method, path, body) {
  const res = await fetch(`${base}/rest/metadata${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} answered ${res.status}: ${JSON.stringify(json)}`);
  return json.data;
}

const PERSON_FIELDS = [
  ['quoteTools', 'Quote tools', 'TEXT', 'Tools picked on the website quote form'],
  ['quoteAreas', 'Quote areas', 'TEXT', 'Areas they need help with, from the quote form'],
  ['quoteOffer', 'Quote offer', 'TEXT', 'Offer shown with the form, blank when none'],
  ['quoteSource', 'Quote source', 'TEXT', 'utm source, campaign and gclid from the visit'],
  ['quoteSubmittedAt', 'Quote submitted at', 'DATE_TIME', 'Last time they sent the quote form'],
];

const person = (await twenty('GET', '/objects?limit=200')).find((o) => o.nameSingular === 'person');
const existing = new Set(person.fields.map((f) => f.name));
for (const [name, label, type, description] of PERSON_FIELDS) {
  if (existing.has(name)) {
    console.log(`person.${name} exists`);
    continue;
  }
  await twenty('POST', '/fields', { objectMetadataId: person.id, name, label, type, description, icon: 'IconForms' });
  console.log(`person.${name} created`);
}
