/**
 * What a public website gives away about its martech stack.
 *
 * Each entry is matched against the homepage HTML and the Google Tag Manager
 * containers it loads, since most pixels live inside GTM rather than on the
 * page. Labels match the tool tiles on the quote form, so a hit preselects the
 * tile. Warehouse tools leave no trace on a website and are not listed.
 */
export type Signature = { tool: string; patterns: RegExp[]; evidence: string };

export const TOOL_SIGNATURES: Signature[] = [
  { tool: 'GTM', evidence: 'Google Tag Manager container', patterns: [/googletagmanager\.com\/gtm\.js/i, /\bGTM-[A-Z0-9]{4,10}\b/] },
  // GA4 and Google Ads match on their ids only. The Google tag runtime inside
  // every GTM container names the collect and adservices domains anyway.
  { tool: 'GA4', evidence: 'GA4 measurement id', patterns: [/\bG-[A-Z0-9]{8,12}\b/] },
  { tool: 'Google Ads', evidence: 'Google Ads conversion id', patterns: [/\bAW-\d{6,12}\b/] },
  { tool: 'Meta Ads', evidence: 'Meta Pixel', patterns: [/connect\.facebook\.net\/[^"']*fbevents\.js/i, /\bfbq\(\s*['"]init/i] },
  { tool: 'HubSpot', evidence: 'HubSpot tracking or forms script', patterns: [/js\.hs-scripts\.com/i, /js\.hsforms\.net/i, /js\.hs-analytics\.net/i, /\b_hsq\b/] },
  { tool: 'Salesforce', evidence: 'Salesforce or Pardot script', patterns: [/pi\.pardot\.com/i, /WebToLead/i, /\.my\.salesforce\.com/i, /salesforceliveagent/i, /\bpiAId\b/] },
  { tool: 'Segment', evidence: 'Segment analytics.js', patterns: [/cdn\.segment\.(com|io)/i, /segment\.com\/analytics\.js/i] },
  { tool: 'RudderStack', evidence: 'RudderStack SDK', patterns: [/cdn\.rudderlabs\.com/i, /\brudderanalytics\b/i] },
  { tool: 'Mixpanel', evidence: 'Mixpanel SDK', patterns: [/cdn\.mxpnl\.com/i, /mixpanel\.init\(/i, /api-js\.mixpanel\.com/i] },
  { tool: 'Amplitude', evidence: 'Amplitude SDK', patterns: [/cdn\.amplitude\.com/i, /api2?\.amplitude\.com/i, /amplitude\.getInstance\(/i] },
  { tool: 'Braze', evidence: 'Braze web SDK', patterns: [/js\.appboycdn\.com/i, /\bbraze\.initialize\(/i, /sdk\.[a-z0-9-]+\.braze\.(com|eu)/i] },
  { tool: 'Customer.io', evidence: 'Customer.io tracking', patterns: [/assets\.customer\.io/i, /track\.customer\.io/i, /cdp\.customer\.io/i] },
  { tool: 'Intercom', evidence: 'Intercom Messenger', patterns: [/widget\.intercom\.io/i, /js\.intercomcdn\.com/i, /\bintercomSettings\b/] },
  { tool: 'Zendesk', evidence: 'Zendesk widget', patterns: [/static\.zdassets\.com/i, /\.zendesk\.com\/embeddable/i] },
  { tool: 'Hightouch', evidence: 'Hightouch Events SDK', patterns: [/cdn\.hightouch-events\.com/i, /\bhtevents\b/] },
];

/**
 * Readiness signals: not tools, but what an audit looks at next. Patterns look
 * for configured values, because the GTM runtime itself names these settings
 * in every container and a bare keyword would match everywhere.
 */
export const READINESS_CHECKS = [
  {
    key: 'consent',
    found: 'Consent banner or Consent Mode found',
    missing: 'No consent banner or Consent Mode found',
    patterns: [
      /gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/i,
      /cookiebot|onetrust|cookielaw\.org|cookieyes|usercentrics|termly|iubenda|didomi|osano|complianz/i,
    ],
  },
  {
    key: 'server_side',
    found: 'Server-side tagging found',
    missing: 'No server-side tagging found, so ad platforms only see browser events',
    patterns: [/(server_container_url|transport_url)["',:\]\s]+(value["',:\]\s]+)?["']https?:/i],
  },
] as const;
