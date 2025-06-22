import { useTranslations } from 'next-intl';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section } from '@/features/landing/Section';

export const FAQ = () => {
  const t = useTranslations('FAQ');

  return (
    <Section>
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Everything you need to know about DLV Insight
        </p>
      </div>
      <Accordion type="multiple" className="mx-auto max-w-2xl">
        <AccordionItem value="item-1">
          <AccordionTrigger>{t('question1')}</AccordionTrigger>
          <AccordionContent>{t('answer1')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>{t('question2')}</AccordionTrigger>
          <AccordionContent>{t('answer2')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>{t('question3')}</AccordionTrigger>
          <AccordionContent>{t('answer3')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>{t('question4')}</AccordionTrigger>
          <AccordionContent>{t('answer4')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>{t('question5')}</AccordionTrigger>
          <AccordionContent>{t('answer5')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6">
          <AccordionTrigger>{t('question6')}</AccordionTrigger>
          <AccordionContent>{t('answer6')}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Section>
  );
};
