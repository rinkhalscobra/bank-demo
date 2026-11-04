const DEFAULT_NAME = 'Banking';
const DEFAULT_TITLE = 'Secure Digital Banking';
const DESCRIPTION = 'Secure digital banking, payments, transfers, cards, and account management';

/** Keep every browser, search and sharing label aligned with saved CRM branding. */
export function updateSiteMetadata(brandName: string) {
  const name = brandName.trim() || DEFAULT_NAME;
  const title = name === DEFAULT_NAME ? DEFAULT_TITLE : `${name} | ${DEFAULT_TITLE}`;
  const description = name === DEFAULT_NAME ? `${DESCRIPTION}.` : `${DESCRIPTION} with ${name}.`;
  document.title = name === DEFAULT_NAME ? DEFAULT_TITLE : name;

  const fields: [string, string, string][] = [
    ['name', 'application-name', name],
    ['name', 'apple-mobile-web-app-title', name],
    ['name', 'description', description],
    ['property', 'og:site_name', name],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['itemprop', 'name', title],
    ['itemprop', 'description', description],
  ];

  for (const [attribute, key, content] of fields) {
    const matches = document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (matches.length) {
      matches.forEach((meta) => meta.setAttribute('content', content));
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute(attribute, key);
      meta.content = content;
      document.head.appendChild(meta);
    }
  }
}
