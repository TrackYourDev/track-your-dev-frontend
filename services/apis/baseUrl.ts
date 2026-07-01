// The backend now lives inside this Next.js app as API routes under /api, so the
// frontend calls the same origin. Leave NEXT_PUBLIC_API_BASE_URL unset to use
// relative URLs (recommended); set it only to target a different host.
export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';