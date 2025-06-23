import crypto from 'node:crypto';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// SP-API OAuth endpoints by region
const OAUTH_ENDPOINTS: Record<string, string> = {
  NA: 'https://sellercentral.amazon.com/apps/authorize/consent',
  EU: 'https://sellercentral-europe.amazon.com/apps/authorize/consent',
  FE: 'https://sellercentral.amazon.com.au/apps/authorize/consent',
};

// Marketplace to region mapping
const MARKETPLACE_REGIONS: Record<string, string> = {
  US: 'NA',
  CA: 'NA',
  MX: 'NA',
  BR: 'NA',
  UK: 'EU',
  DE: 'EU',
  FR: 'EU',
  IT: 'EU',
  ES: 'EU',
  NL: 'EU',
  SE: 'EU',
  PL: 'EU',
  BE: 'EU',
  AE: 'EU',
  TR: 'EU',
  SA: 'EU',
  EG: 'EU',
  IN: 'EU',
  AU: 'FE',
  SG: 'FE',
  JP: 'FE',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const marketplace = searchParams.get('marketplace');
  const environment = searchParams.get('environment');

  if (!marketplace) {
    return NextResponse.json({ error: 'Marketplace is required' }, { status: 400 });
  }

  const region = MARKETPLACE_REGIONS[marketplace];
  if (!region) {
    return NextResponse.json({ error: 'Invalid marketplace' }, { status: 400 });
  }

  // Generate state parameter for security
  const state = crypto.randomBytes(16).toString('base64url');

  // Store state in cookies for validation during callback
  const response = NextResponse.redirect(buildOAuthUrl(region, marketplace, state, environment === 'SANDBOX'));

  response.cookies.set('sp-api-oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  response.cookies.set('sp-api-oauth-env', environment || 'PRODUCTION', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  return response;
}

function buildOAuthUrl(region: string, _marketplace: string, state: string, isSandbox: boolean): string {
  const baseUrl = OAUTH_ENDPOINTS[region];
  const appId = process.env.AMAZON_SP_API_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/amazon/oauth/callback`;

  const params = new URLSearchParams({
    application_id: appId!,
    state,
    redirect_uri: redirectUri,
  });

  // For sandbox, we'll use version=beta parameter
  if (isSandbox) {
    params.append('version', 'beta');
  }

  return `${baseUrl}?${params.toString()}`;
}
