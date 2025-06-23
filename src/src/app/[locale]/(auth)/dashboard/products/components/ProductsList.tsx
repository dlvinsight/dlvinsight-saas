'use client';

import { useOrganization } from '@clerk/nextjs';
import { Package, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { fetchSellerAccounts } from '../../sources/actions';
import { fetchProducts } from '../actions';

type SellerAccount = {
  id: string;
  name: string;
  marketplace: string;
  marketplaceCode: string;
  marketplaceId: string;
  apiType: 'sp-api' | 'adv-api';
  status: 'active' | 'inactive' | 'error';
  lastSync: Date | null;
  createdAt: Date;
};

type Product = {
  sku: string;
  asin: string;
  productName: string;
  brand: string;
  status: string;
  price: number | null;
  currency: string;
  imageUrl: string | null;
};

export function ProductsList() {
  const t = useTranslations('Products');
  const { organization } = useOrganization();
  const [accounts, setAccounts] = useState<SellerAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoadingAccounts(true);
      const result = await fetchSellerAccounts();
      if (result.success) {
        setAccounts(result.accounts);
        // Auto-select first account if available
        if (result.accounts.length > 0 && !selectedAccountId) {
          const firstAccount = result.accounts[0];
          if (firstAccount) {
            setSelectedAccountId(firstAccount.id);
          }
        }
      }
      setIsLoadingAccounts(false);
    };

    loadAccounts();
  }, [organization?.id, selectedAccountId]);

  const handleFetchProducts = async () => {
    if (!selectedAccountId) {
      return;
    }

    setIsLoadingProducts(true);
    try {
      const result = await fetchProducts(selectedAccountId);
      if (result.success) {
        setProducts(result.products);
      } else {
        // eslint-disable-next-line no-alert
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // eslint-disable-next-line no-alert
      alert('Failed to fetch products');
    }
    setIsLoadingProducts(false);
  };

  if (isLoadingAccounts) {
    return (
      <div className="rounded-lg bg-muted/50 py-12 text-center">
        <p className="text-muted-foreground">{t('loading_accounts')}</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-lg bg-muted/50 py-12 text-center">
        <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
        <p className="mb-4 text-muted-foreground">{t('no_accounts')}</p>
        <Button variant="outline" asChild>
          <a href="/dashboard/sources">{t('go_to_sources')}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder={t('select_account')} />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                  {' - '}
                  {account.marketplace}
                  {' ('}
                  {account.marketplaceCode}
                  {')'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleFetchProducts}
          disabled={!selectedAccountId || isLoadingProducts}
        >
          <RefreshCw className={`mr-2 size-4 ${isLoadingProducts ? 'animate-spin' : ''}`} />
          {t('fetch_products')}
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 py-16 text-center">
          <Package className="mx-auto mb-4 size-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">{t('no_products')}</h3>
          <p className="text-muted-foreground">{t('no_products_description')}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.sku')}</TableHead>
                <TableHead>{t('table.asin')}</TableHead>
                <TableHead>{t('table.product_name')}</TableHead>
                <TableHead>{t('table.brand')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead className="text-right">{t('table.price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.sku}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.asin}</TableCell>
                  <TableCell>{product.productName || '-'}</TableCell>
                  <TableCell>{product.brand || '-'}</TableCell>
                  <TableCell>{product.status}</TableCell>
                  <TableCell className="text-right">
                    {product.price !== null
                      ? (
                        `${product.currency} ${product.price.toFixed(2)}`
                      )
                      : (
                        '-'
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
