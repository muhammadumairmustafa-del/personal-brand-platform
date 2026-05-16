// Single source of truth for cross-file constants. Server still pins the
// model independently (see app/api/ai/route.js) — this is for client display
// and to keep magic numbers from leaking across files.

export const AI_MODEL_LABEL = 'Claude Sonnet 4.5';

// Rate-limit defaults shown to the user. The server enforces from its own env;
// these mirror the defaults in app/api/ai/route.js.
export const AI_HOUR_LIMIT = 30;
export const AI_DAY_LIMIT = 150;

// Mobile list cap before "Load more". 50 keeps lists responsive on slower phones.
export const MOBILE_LIST_PAGE = 50;

// Upload cap — must mirror MAX_BYTES in app/api/upload/route.js.
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_ALLOWED_MIME = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'
];

// Voice profile cache TTL — rebuild if older than 7 days.
export const VOICE_PROFILE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
