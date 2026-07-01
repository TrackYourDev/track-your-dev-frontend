// Kicks off the GitHub OAuth flow used by the landing-page login buttons.
// Requires NEXT_PUBLIC_GITHUB_CLIENT_ID to be set at build time (Next.js inlines
// NEXT_PUBLIC_* vars into the client bundle). The GitHub OAuth app's callback URL
// must point at this app's /api/auth/github/callback route.
export const startGithubLogin = () => {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

  if (!clientId) {
    console.error(
      "NEXT_PUBLIC_GITHUB_CLIENT_ID is not set — cannot start GitHub login."
    );
    return;
  }

  // Send GitHub back to THIS origin's callback (localhost in dev, your prod domain
  // in prod) instead of relying on the OAuth app's single default callback URL.
  // Override with NEXT_PUBLIC_GITHUB_REDIRECT_URI to pin a fixed value (if you set
  // it, set GITHUB_REDIRECT_URI on the server to the same value).
  const redirectUri =
    process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI ||
    `${window.location.origin}/api/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "user:email",
    state: "abc",
    redirect_uri: redirectUri,
  });

  window.open(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
    "_self"
  );
};
