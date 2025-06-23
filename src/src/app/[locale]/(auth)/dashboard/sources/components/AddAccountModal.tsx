'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AddAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountAdded: (account: any) => void;
};

type Step = 'marketplace' | 'connection' | 'manual';

type MarketplaceOption = {
  id: string;
  name: string;
  code: string;
  region: string;
  currency: string;
  currencySymbol: string;
  endpoint: string;
};

const MARKETPLACES: MarketplaceOption[] = [
  {
    id: 'ATVPDKIKX0DER',
    name: 'Amazon.com',
    code: 'US',
    region: 'NA',
    currency: 'USD',
    currencySymbol: '$',
    endpoint: 'https://sellingpartnerapi-na.amazon.com',
  },
  {
    id: 'A1PA6795UKMFR9',
    name: 'Amazon.de',
    code: 'DE',
    region: 'EU',
    currency: 'EUR',
    currencySymbol: '€',
    endpoint: 'https://sellingpartnerapi-eu.amazon.com',
  },
  {
    id: 'A1RKKUPIHCS9HS',
    name: 'Amazon.es',
    code: 'ES',
    region: 'EU',
    currency: 'EUR',
    currencySymbol: '€',
    endpoint: 'https://sellingpartnerapi-eu.amazon.com',
  },
  {
    id: 'A13V1IB3VIYZZH',
    name: 'Amazon.fr',
    code: 'FR',
    region: 'EU',
    currency: 'EUR',
    currencySymbol: '€',
    endpoint: 'https://sellingpartnerapi-eu.amazon.com',
  },
  {
    id: 'A1F83G8C2ARO7P',
    name: 'Amazon.co.uk',
    code: 'UK',
    region: 'EU',
    currency: 'GBP',
    currencySymbol: '£',
    endpoint: 'https://sellingpartnerapi-eu.amazon.com',
  },
  {
    id: 'APJ6JRA9NG5V4',
    name: 'Amazon.it',
    code: 'IT',
    region: 'EU',
    currency: 'EUR',
    currencySymbol: '€',
    endpoint: 'https://sellingpartnerapi-eu.amazon.com',
  },
];

export function AddAccountModal({ open, onOpenChange, onAccountAdded }: AddAccountModalProps) {
  const t = useTranslations('Sources.AddAccount');
  const [step, setStep] = useState<Step>('marketplace');
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceOption | null>(null);
  const [currency, setCurrency] = useState<string>('');
  const [accountName, setAccountName] = useState('');

  // Manual connection fields
  const [awsEnvironment, setAwsEnvironment] = useState('PRODUCTION');
  const [accountType, setAccountType] = useState('Seller');
  const [lwaClientId, setLwaClientId] = useState('');
  const [lwaClientSecret, setLwaClientSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const handleMarketplaceSelect = (marketplace: MarketplaceOption) => {
    setSelectedMarketplace(marketplace);
    setCurrency(marketplace.currency);
  };

  const handleConnectToSellerCentral = async () => {
    if (!selectedMarketplace) {
      return;
    }

    try {
      // Store current state in session storage for OAuth callback
      const state = {
        marketplace: selectedMarketplace,
        accountName,
        returnUrl: window.location.pathname,
      };
      sessionStorage.setItem('sp-api-oauth-state', JSON.stringify(state));

      // Redirect to OAuth initiation endpoint for production
      const params = new URLSearchParams({
        marketplace: selectedMarketplace.code,
        environment: 'PRODUCTION',
      });

      window.location.href = `/api/amazon/oauth/initiate?${params.toString()}`;
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      // TODO: Replace with proper error handling
      // eslint-disable-next-line no-alert
      alert('Failed to initiate authentication');
    }
  };

  const handleSandboxAuth = async () => {
    if (!selectedMarketplace) {
      return;
    }

    // For sandbox, we use the pre-configured sandbox credentials directly
    // No OAuth flow needed for sandbox environment
    setAwsEnvironment('SANDBOX');
    setLwaClientId(process.env.NEXT_PUBLIC_AMAZON_SP_API_LWA_APP_ID || '');
    setLwaClientSecret(''); // Will be filled from env on backend
    setRefreshToken('Atzr|IwEBIG-SandboxRefreshToken-ForTesting'); // Sandbox test token
    setAccountName(`${selectedMarketplace.name} Sandbox`);
    setStep('manual');
  };

  const handleManualSetup = () => {
    setStep('manual');
  };

  const handleSaveManualCredentials = async () => {
    if (!selectedMarketplace) {
      return;
    }

    try {
      const accountData = {
        name: accountName || `${selectedMarketplace.name} Account`,
        marketplace: selectedMarketplace.name,
        marketplaceCode: selectedMarketplace.code,
        marketplaceId: selectedMarketplace.id,
        apiType: 'sp-api' as const,
        status: 'active' as const,
        currency: selectedMarketplace.currency,
        currencySymbol: selectedMarketplace.currencySymbol,
        credentials: {
          awsEnvironment,
          accountType,
          lwaClientId,
          lwaClientSecret,
          refreshToken,
          endpoint: selectedMarketplace.endpoint,
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
      onAccountAdded(savedAccount);
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
      // TODO: Show error message to user
      // eslint-disable-next-line no-alert
      alert(error instanceof Error ? error.message : 'Failed to save account. Please try again.');
    }
  };

  const resetForm = () => {
    setStep('marketplace');
    setSelectedMarketplace(null);
    setCurrency('');
    setAccountName('');
    setLwaClientId('');
    setLwaClientSecret('');
    setRefreshToken('');
  };

  const canProceedFromMarketplace = selectedMarketplace !== null;
  const canSaveManualCredentials = lwaClientId && lwaClientSecret && refreshToken;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        {step === 'marketplace' && (
          <div className="space-y-6">
            <div>
              <Label className="mb-4 block text-base font-semibold">
                {t('choose_marketplace')}
              </Label>
              <RadioGroup
                value={selectedMarketplace?.id}
                onValueChange={(value) => {
                  const marketplace = MARKETPLACES.find(m => m.id === value);
                  if (marketplace) {
                    handleMarketplaceSelect(marketplace);
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {MARKETPLACES.map(marketplace => (
                    <Card key={marketplace.id} className="cursor-pointer">
                      <CardHeader className="p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={marketplace.id} id={marketplace.id} />
                          <Label htmlFor={marketplace.id} className="flex-1 cursor-pointer">
                            <CardTitle className="text-sm">{marketplace.code}</CardTitle>
                            <CardDescription>{marketplace.name}</CardDescription>
                          </Label>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {selectedMarketplace && (
              <div>
                <Label htmlFor="currency" className="mb-2 block text-base font-semibold">
                  {t('choose_currency')}
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={selectedMarketplace.currency}>
                      {selectedMarketplace.currencySymbol}
                      {' '}
                      {selectedMarketplace.currency}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setStep('connection')}
                disabled={!canProceedFromMarketplace}
              >
                {t('next')}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'connection' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Button
                onClick={handleConnectToSellerCentral}
                className="w-full"
                size="lg"
              >
                {t('connect_seller_central')}
              </Button>

              <Button
                onClick={handleSandboxAuth}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                {t('sandbox_auth')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('or')}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleManualSetup}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {t('manual_setup')}
              </Button>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep('marketplace')}
                variant="ghost"
              >
                <ArrowLeft className="mr-2 size-4" />
                {t('back')}
              </Button>
            </div>
          </div>
        )}

        {step === 'manual' && (
          <div className="space-y-6">
            {awsEnvironment === 'SANDBOX' && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  {t('sandbox_notice')}
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountName">{t('account_name')}</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder={selectedMarketplace?.name}
                />
              </div>

              <div>
                <Label htmlFor="awsEnvironment">{t('aws_environment')}</Label>
                <Select value={awsEnvironment} onValueChange={setAwsEnvironment}>
                  <SelectTrigger id="awsEnvironment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCTION">PRODUCTION</SelectItem>
                    <SelectItem value="SANDBOX">SANDBOX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="awsRegion">{t('aws_region')}</Label>
                <Input
                  id="awsRegion"
                  value={selectedMarketplace?.code || ''}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="accountType">{t('account_type')}</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger id="accountType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seller">Seller</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lwaClientId">{t('lwa_client_id')}</Label>
                <Input
                  id="lwaClientId"
                  type="password"
                  value={lwaClientId}
                  onChange={e => setLwaClientId(e.target.value)}
                  placeholder="••••••••••"
                />
              </div>

              <div>
                <Label htmlFor="lwaClientSecret">{t('lwa_client_secret')}</Label>
                <Input
                  id="lwaClientSecret"
                  type="password"
                  value={lwaClientSecret}
                  onChange={e => setLwaClientSecret(e.target.value)}
                  placeholder="••••••••••"
                />
              </div>

              <div>
                <Label htmlFor="refreshToken">{t('refresh_token')}</Label>
                <Input
                  id="refreshToken"
                  type="password"
                  value={refreshToken}
                  onChange={e => setRefreshToken(e.target.value)}
                  placeholder="••••••••••"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep('connection')}
                variant="ghost"
              >
                <ArrowLeft className="mr-2 size-4" />
                {t('back')}
              </Button>
              <Button
                onClick={handleSaveManualCredentials}
                disabled={!canSaveManualCredentials}
              >
                {t('save_credentials')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

