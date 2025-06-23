import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const TOKEN_ENDPOINT = 'https://api.amazon.com/auth/o2/token';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('spapi_oauth_code');
  const state = searchParams.get('state');
  const sellingPartnerId = searchParams.get('selling_partner_id');
  // const mwsAuthToken = searchParams.get('mws_auth_token'); // For migration scenarios

  // Validate state parameter
  const cookieStore = cookies();
  const savedState = cookieStore.get('sp-api-oauth-state')?.value;
  const environment = cookieStore.get('sp-api-oauth-env')?.value || 'PRODUCTION';

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL('/dashboard/sources?error=invalid_state', request.nextUrl.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/sources?error=no_code', request.nextUrl.origin),
    );
  }

  try {
    // Exchange authorization code for refresh token
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.AMAZON_SP_API_LWA_APP_ID!,
        client_secret: process.env.AMAZON_SP_API_LWA_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/dashboard/sources?error=token_exchange_failed', request.nextUrl.origin),
      );
    }

    const tokenData = await tokenResponse.json();
    const { refresh_token } = tokenData;

    // Clear OAuth cookies
    const response = NextResponse.redirect(
      new URL(
        `/dashboard/sources?oauth_success=true&refresh_token=${encodeURIComponent(refresh_token)}&environment=${environment}&selling_partner_id=${sellingPartnerId || ''}`,
        request.nextUrl.origin,
      ),
    );

    response.cookies.delete('sp-api-oauth-state');
    response.cookies.delete('sp-api-oauth-env');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/sources?error=oauth_failed', request.nextUrl.origin),
    );
  }
}
