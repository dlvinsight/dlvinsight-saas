import { getTranslations } from 'next-intl/server';

import { TitleBar } from '@/features/dashboard/TitleBar';

import { SourcesList } from './components/SourcesList';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Sources',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function SourcesPage() {
  const t = await getTranslations('Sources');

  return (
    <>
      <TitleBar
        title={t('page_title')}
        description={t('page_description')}
      />
      <SourcesList />
    </>
  );
}

