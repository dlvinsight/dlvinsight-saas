'use client';

import { useOrganization } from '@clerk/nextjs';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  createTestSellerAccount,
  fetchSellerAccounts,
  removeSellerAccount,
  testSellerAccountConnection,
} from '../actions';
import { AddAccountModal } from './AddAccountModal';
import { OAuthCallbackHandler } from './OAuthCallbackHandler';

type SellerAccount = {
  id: string;
  name: string;
  marketplace: string;
  marketplaceCode: string;
  apiType: 'sp-api' | 'adv-api';
  status: 'active' | 'inactive' | 'error';
  lastSync: Date | null;
};

export function SourcesList() {
  const t = useTranslations('Sources');
  const { organization } = useOrganization();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<SellerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      const result = await fetchSellerAccounts();
      if (result.success) {
        setAccounts(result.accounts);
      }
      setIsLoading(false);
    };

    loadAccounts();
  }, [organization?.id]); // Refetch when organization changes

  const handleAddAccount = () => {
    setIsAddModalOpen(true);
  };

  const handleTestDatabase = async () => {
    const result = await createTestSellerAccount();

    if (result.success) {
      // eslint-disable-next-line no-alert
      alert(`Success! ${result.message}`);
    } else {
      // eslint-disable-next-line no-alert
      alert(`Error: ${result.error}`);
    }
  };

  const handleTestConnection = async (accountId: string) => {
    const result = await testSellerAccountConnection(accountId);

    if (result.success) {
      // eslint-disable-next-line no-alert
      alert(`Success: ${result.message}`);
    } else {
      // eslint-disable-next-line no-alert
      alert(`Error: ${result.error}`);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    // eslint-disable-next-line no-confirm
    if (confirm('Are you sure you want to remove this account?')) {
      const result = await removeSellerAccount(accountId);

      if (result.success) {
        // Remove from local state
        setAccounts(accounts.filter(acc => acc.id !== accountId));
        // eslint-disable-next-line no-alert
        alert('Account removed successfully');
      } else {
        // eslint-disable-next-line no-alert
        alert(`Error: ${result.error}`);
      }
    }
  };

  const getStatusBadge = (status: SellerAccount['status']) => {
    const variants = {
      active: 'default' as const,
      inactive: 'secondary' as const,
      error: 'destructive' as const,
    };

    return (
      <Badge variant={variants[status]}>
        {t(`status.${status}`)}
      </Badge>
    );
  };

  const getApiTypeBadge = (apiType: SellerAccount['apiType']) => {
    return (
      <Badge variant="outline">
        {apiType.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('accounts_title')}</h2>
        <div className="flex gap-2">
          <Button onClick={handleTestDatabase} size="sm" variant="outline">
            Test Database
          </Button>
          <Button onClick={handleAddAccount} size="sm">
            <Plus className="mr-2 size-4" />
            {t('add_account')}
          </Button>
        </div>
      </div>

      {isLoading
        ? (
            <div className="rounded-lg bg-muted/50 py-12 text-center">
              <p className="text-muted-foreground">Loading accounts...</p>
            </div>
          )
        : accounts.length === 0
          ? (
              <div className="rounded-lg bg-muted/50 py-12 text-center">
                <p className="mb-4 text-muted-foreground">{t('no_accounts')}</p>
                <Button onClick={handleAddAccount}>
                  <Plus className="mr-2 size-4" />
                  {t('add_first_account')}
                </Button>
              </div>
            )
          : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.account_name')}</TableHead>
                      <TableHead>{t('table.marketplace')}</TableHead>
                      <TableHead>{t('table.api_type')}</TableHead>
                      <TableHead>{t('table.status')}</TableHead>
                      <TableHead>{t('table.last_sync')}</TableHead>
                      <TableHead className="text-right">{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map(account => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>
                          {account.marketplace}
                          {' '}
                          (
                          {account.marketplaceCode}
                          )
                        </TableCell>
                        <TableCell>{getApiTypeBadge(account.apiType)}</TableCell>
                        <TableCell>{getStatusBadge(account.status)}</TableCell>
                        <TableCell>
                          {account.lastSync
                            ? new Date(account.lastSync).toLocaleString()
                            : t('never_synced')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestConnection(account.id)}
                            >
                              Test Connection
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Settings className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRemoveAccount(account.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

      <AddAccountModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAccountAdded={(newAccount) => {
          setAccounts([...accounts, newAccount]);
        }}
      />

      <OAuthCallbackHandler
        onAccountAdded={(newAccount) => {
          setAccounts([...accounts, newAccount]);
        }}
      />
    </div>
  );
}
