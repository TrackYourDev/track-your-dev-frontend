// app/api/auth/github/callback/route.js
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        // Must match the redirect_uri used in the authorize step (lib/auth.ts).
        redirect_uri:
          process.env.GITHUB_REDIRECT_URI ||
          `${new URL(request.url).origin}/api/auth/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Token exchange failed');
    }

    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'trackyourdev',
      },
    });

    const userData = await userResponse.json();

    // Store user session (example with cookies)
    const response = NextResponse.redirect(new URL('https://github.com/apps/trackyourdev/installations/new', request.url));

    // Cookie scope is environment-driven so login works on any domain:
    //  - Set AUTH_COOKIE_DOMAIN (e.g. ".trackyour.dev") to share the cookie across
    //    subdomains in production.
    //  - Leave it unset (e.g. on localhost) for a host-only cookie.
    // SameSite=None requires Secure (https only), so fall back to Lax on http.
    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    response.cookies.set('github_token', tokenData.access_token, cookieOptions);
    response.cookies.set('user_id', userData.id.toString(), cookieOptions);

    // Return the response with redirect
    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}