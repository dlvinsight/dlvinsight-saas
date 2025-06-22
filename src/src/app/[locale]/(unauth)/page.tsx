import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CTA } from '@/templates/CTA';
import { DemoBanner } from '@/templates/DemoBanner';
import { FAQ } from '@/templates/FAQ';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';
import { Sponsors } from '@/templates/Sponsors';
import { PlanVsFactSection } from '@/features/landing/PlanVsFactSection';
import { LTVCohortSection } from '@/features/landing/LTVCohortSection';
import { ForecastingSection } from '@/features/landing/ForecastingSection';
import { StrategicDashboardSection } from '@/features/landing/StrategicDashboardSection';
import { CompetitorComparison } from '@/features/landing/CompetitorComparison';
import { UseCasesSection } from '@/features/landing/UseCasesSection';

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
      <DemoBanner />
      <Navbar />
      <Hero />
      <Sponsors />
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
