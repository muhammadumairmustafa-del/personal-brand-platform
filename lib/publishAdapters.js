// Adapter interface for publishing to social platforms. Each adapter exports
// `publish({ userId, content, metadata })` returning `{ ok, externalUrl?, error? }`.
//
// LinkedIn and X are stubbed — they throw a clear "not configured" until the
// owner adds OAuth credentials. This keeps the scheduler workable end-to-end
// (queue, retry, status) without blocking on developer-app approvals.

async function notConfigured(platform) {
  return {
    ok: false,
    error: `${platform} publishing is not yet configured. Add OAuth credentials and update lib/publishAdapters.js.`,
  };
}

export const adapters = {
  linkedin: async () => notConfigured('LinkedIn'),
  x: async () => notConfigured('X / Twitter'),
  twitter: async () => notConfigured('X / Twitter'),

  // The "manual" adapter just marks the post as ready and stores a copy of the
  // content + a reminder timestamp. Useful for users who don't want auto-posting:
  // they get a notification + a pre-filled draft when it's time to ship.
  manual: async ({ content }) => ({ ok: true, externalUrl: null, manualReminder: true, content }),
};

export function getAdapter(platform) {
  const key = (platform || '').toLowerCase().trim();
  return adapters[key] || adapters.manual;
}
