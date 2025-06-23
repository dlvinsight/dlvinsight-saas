import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ProductsList } from './components/ProductsList';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Products' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ProductsPage() {
  const t = await getTranslations('Products');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('page_title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('page_description')}</p>
      </div>
      <ProductsList />
    </div>
  );
}
