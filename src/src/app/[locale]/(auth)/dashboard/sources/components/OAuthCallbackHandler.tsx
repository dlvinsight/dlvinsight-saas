'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

type OAuthCallbackHandlerProps = {
  onAccountAdded?: (account: any) => void;
};

export function OAuthCallbackHandler({ onAccountAdded }: OAuthCallbackHandlerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const success = searchParams.get('oauth_success');
      const error = searchParams.get('error');
      const refreshToken = searchParams.get('refresh_token');
      const environment = searchParams.get('environment');
      const sellingPartnerId = searchParams.get('selling_partner_id');

      if (error) {
        const errorMessages: Record<string, string> = {
          invalid_state: 'Security validation failed. Please try again.',
          no_code: 'Authorization code not received. Please try again.',
          token_exchange_failed: 'Failed to exchange authorization code. Please try again.',
          oauth_failed: 'OAuth authentication failed. Please try again.',
        };

        toast.error(errorMessages[error] || 'Authentication failed. Please try again.');
        router.replace('/dashboard/sources');
        return;
      }

      if (success === 'true' && refreshToken) {
        try {
          // Retrieve stored OAuth state from session storage
          const storedStateStr = sessionStorage.getItem('sp-api-oauth-state');
          if (!storedStateStr) {
            toast.error('Session expired. Please try again.');
            router.replace('/dashboard/sources');
            return;
          }

          const storedState = JSON.parse(storedStateStr);
          const { marketplace, accountName } = storedState;

          // Create the account with OAuth credentials
          const accountData = {
            name: accountName || `${marketplace.name} Account`,
            marketplace: marketplace.name,
            marketplaceCode: marketplace.code,
            marketplaceId: marketplace.id,
            apiType: 'sp-api' as const,
            status: 'active' as const,
            currency: marketplace.currency,
            currencySymbol: marketplace.currencySymbol,
            credentials: {
              awsEnvironment: environment || 'PRODUCTION',
              accountType: 'Seller',
              lwaClientId: '', // Will be fetched from backend
              lwaClientSecret: '', // Will be stored server-side only
              refreshToken: decodeURIComponent(refreshToken),
              endpoint: environment === 'SANDBOX'
                ? marketplace.endpoint.replace('https://sellingpartnerapi', 'https://sandbox.sellingpartnerapi')
                : marketplace.endpoint,
              sellingPartnerId: sellingPartnerId || undefined,
            },
          };

          const response = await fetch('/api/seller-accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(accountData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save account');
          }

          const savedAccount = await response.json();

          // Clean up session storage
          sessionStorage.removeItem('sp-api-oauth-state');

          toast.success('Amazon account connected successfully!');

          if (onAccountAdded) {
            onAccountAdded(savedAccount);
          }

          router.replace('/dashboard/sources');
        } catch (error) {
          console.error('Error saving OAuth account:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to save account');
          router.replace('/dashboard/sources');
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, onAccountAdded]);

  return null;
}

