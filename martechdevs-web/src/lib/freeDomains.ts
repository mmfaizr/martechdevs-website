/**
 * Personal mailbox domains. Any email can request a quote, but these never
 * become a company in the CRM or in Intercom, or every Gmail lead would share
 * one "gmail.com" account.
 */
const FREE_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me',
  'protonmail.com', 'gmx.com', 'mail.com', 'yandex.com', 'zoho.com',
]);

/** The email's domain when it belongs to a company, else blank. */
export function companyDomain(email: string): string {
  const domain = email.trim().toLowerCase().split('@')[1] || '';
  return FREE_DOMAINS.has(domain) ? '' : domain;
}
