// One-off Attio setup for the quote form. Safe to rerun, it skips what exists.
//   ATTIO_API_KEY=... node scripts/attio-setup.mjs
// Adds the quote fields to People (so the sequence email can use them) and the
// "Quote requests" list the workflow triggers on.

const key = process.env.ATTIO_API_KEY;
if (!key) throw new Error('ATTIO_API_KEY is not set');

async function attio(method, path, body) {
  const res = await fetch(`https://api.attio.com/v2${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} answered ${res.status}: ${JSON.stringify(json)}`);
  return json.data;
}

const PERSON_ATTRIBUTES = [
  ['quote_tools', 'Quote tools', 'text', 'Tools picked on the website quote form'],
  ['quote_areas', 'Quote areas', 'text', 'Areas they need help with, from the quote form'],
  ['quote_offer', 'Quote offer', 'text', 'Offer shown with the form, blank when none'],
  ['quote_source', 'Quote source', 'text', 'utm source, campaign and gclid from the visit'],
  ['quote_submitted_at', 'Quote submitted at', 'timestamp', 'Last time they sent the quote form'],
];

const existing = new Set((await attio('GET', '/objects/people/attributes')).map((a) => a.api_slug));
for (const [api_slug, title, type, description] of PERSON_ATTRIBUTES) {
  if (existing.has(api_slug)) {
    console.log(`people.${api_slug} exists`);
    continue;
  }
  await attio('POST', '/objects/people/attributes', {
    api_slug, title, type, description,
    is_required: false, is_unique: false, is_multiselect: false, config: {},
  });
  console.log(`people.${api_slug} created`);
}

const lists = await attio('GET', '/lists');
if (lists.some((l) => l.api_slug === 'quote_requests')) {
  console.log('list quote_requests exists');
} else {
  await attio('POST', '/lists', {
    name: 'Quote requests',
    api_slug: 'quote_requests',
    parent_object: 'people',
    workspace_access: 'full-access',
    workspace_member_access: [],
  });
  console.log('list quote_requests created');
}
