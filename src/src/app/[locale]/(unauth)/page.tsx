import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CompetitorComparison } from '@/features/landing/CompetitorComparison';
import { ForecastingSection } from '@/features/landing/ForecastingSection';
import { LTVCohortSection } from '@/features/landing/LTVCohortSection';
import { PlanVsFactSection } from '@/features/landing/PlanVsFactSection';
import { StrategicDashboardSection } from '@/features/landing/StrategicDashboardSection';
import { UseCasesSection } from '@/features/landing/UseCasesSection';
import { CTA } from '@/templates/CTA';
import { FAQ } from '@/templates/FAQ';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const IndexPage = (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  return (
    <>
      <Navbar />
      <Hero />
      <PlanVsFactSection />
      <LTVCohortSection />
      <ForecastingSection />
      <StrategicDashboardSection />
      <CompetitorComparison />
      <UseCasesSection />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
};

export default IndexPage;
