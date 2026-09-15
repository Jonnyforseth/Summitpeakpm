const value = process.env.SITE_URL || 'https://www.summitpeakpm.com';
const parsed = new URL(value);
if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
  throw new Error('SITE_URL must be an http(s) origin without a path, credentials, query, or fragment.');
}
module.exports = { siteUrl: parsed.origin };
