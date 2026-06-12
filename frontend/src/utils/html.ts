// Scraped card text arrives with HTML entities (&amp;, &#39;, …) — decode them
// for plain-text rendering instead of injecting markup into the DOM.
export function decodeHtmlEntities(html: string): string {
  const ta = document.createElement('textarea');
  ta.innerHTML = html;
  return ta.value;
}
