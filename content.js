// Content script — extracts email addresses from the visible DOM, mailto: links, and raw HTML.
(function () {
  const EMAIL_REGEX =
    /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,24})/g;

  function decodeHtmlEntities(str) {
    if (!str) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  function collectEmails() {
    const found = new Set();

    // 1. Visible text nodes.
    try {
      const bodyText = document.body ? document.body.innerText : "";
      const matches = bodyText.match(EMAIL_REGEX);
      if (matches) matches.forEach((m) => found.add(m.toLowerCase()));
    } catch (e) {}

    // 2. Raw HTML (catches obfuscated or hidden emails).
    try {
      const html = document.documentElement
        ? document.documentElement.outerHTML
        : "";
      const decoded = decodeHtmlEntities(html);
      const matches = decoded.match(EMAIL_REGEX);
      if (matches) matches.forEach((m) => found.add(m.toLowerCase()));
    } catch (e) {}

    // 3. mailto: anchor links.
    try {
      document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
        const href = a.getAttribute("href") || "";
        const stripped = href.replace(/^mailto:/i, "").split("?")[0];
        const matches = stripped.match(EMAIL_REGEX);
        if (matches) matches.forEach((m) => found.add(m.toLowerCase()));
      });
    } catch (e) {}

    // Filter out clearly invalid or asset-like matches (e.g. embedded in image filenames).
    const cleaned = Array.from(found).filter((email) => {
      if (email.length > 254) return false;
      if (/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp|css|js)$/i.test(email))
        return false;
      return true;
    });

    return cleaned.sort();
  }

  const emails = collectEmails();
  return {
    url: window.location.href,
    title: document.title,
    emails: emails,
  };
})();
