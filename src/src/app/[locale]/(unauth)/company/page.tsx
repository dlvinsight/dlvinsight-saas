import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Company',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const CompanyPage = (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  return (
    <>
      <Navbar />
      
      {/* Hero Section with Prague Background */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          {/* Prague background image */}
          <Image
            src="/assets/images/prague.jpg"
            alt="Prague cityscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-gray-900/80" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
              From Prague to Global E-commerce Excellence
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-200">
              Building the analytics platform that transforms Amazon sellers from data collectors to strategic decision makers.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Start Free Trial
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Metrics */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">€29M+</p>
              <p className="mt-2 text-sm text-gray-600">Total Sales Managed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">16</p>
              <p className="mt-2 text-sm text-gray-600">Amazon Marketplaces</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">25%</p>
              <p className="mt-2 text-sm text-gray-600">YoY Growth Achieved</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">8+</p>
              <p className="mt-2 text-sm text-gray-600">Years of Experience</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          
          {/* Company Overview with CTA */}
          <section className="mb-16">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">The DLV Insight Story</h2>
            <p className="mb-6 text-lg text-gray-700">
              DLV Insight™ emerged from a simple frustration: Why do Amazon sellers have access to endless data 
              but still make decisions based on gut feeling? After managing €29M+ in sales across 16 marketplaces, 
              I realized the problem wasn't data access—it was the lack of strategic analysis tools.
            </p>
            <p className="mb-8 text-lg text-gray-700">
              Today, DLV Insight is the only platform offering true Plan vs. Fact P&L analysis, helping sellers 
              move from reactive operations to strategic growth.
            </p>
            
            <div className="rounded-lg bg-blue-50 p-8">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Ready to Transform Your Amazon Business?</h3>
              <p className="mb-4 text-gray-700">
                Join forward-thinking sellers who use data to drive decisions, not just track them.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Get Started Free →
              </Link>
            </div>
          </section>

          {/* About the Founder with Photo */}
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">Meet the Founder</h2>
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="mb-8 lg:mb-0">
                {/* Founder photo */}
                <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-lg bg-gray-200 lg:h-80 lg:w-full">
                  <Image
                    src="/assets/images/profile2.png"
                    alt="Serhii Yaremenko, Ph.D."
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex justify-center gap-4">
                  <a
                    href="https://www.linkedin.com/in/yaremenko-serhii/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="mailto:info@dlvinsight.com"
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Email</span>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-2xl font-semibold text-gray-900">Serhii Yaremenko, Ph.D.</h3>
                <p className="mb-4 text-xl text-gray-600">CEO & Founder, DLV Insight</p>
                
                <blockquote className="mb-6 border-l-4 border-blue-600 pl-4 text-lg italic text-gray-700">
                  "After scaling my e-commerce business to €10M+ annually, I learned that success isn't about 
                  having more data—it's about asking the right questions and getting actionable answers."
                </blockquote>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    My journey in e-commerce began over 8 years ago, but my approach has always been different. 
                    With a Ph.D. in Computer Science specializing in Cybernetics, I view e-commerce as a complex 
                    system that requires mathematical precision and strategic thinking.
                  </p>
                  <p>
                    As CEO of MSVenturesGroup, I've navigated the challenges of scaling across 16 Amazon marketplaces, 
                    achieving consistent 25% YoY growth. But the tools available always fell short—they showed what 
                    happened, never what should happen next.
                  </p>
                  <p>
                    DLV Insight is my answer to that gap. It's the platform I wished existed when managing millions 
                    in inventory decisions and planning for seasonal peaks.
                  </p>
                </div>

                {/* Credentials */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-900">Academic Excellence</h4>
                    <p className="text-sm text-gray-600">Ph.D. in Computer Science (Cybernetics)</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-900">Business Impact</h4>
                    <p className="text-sm text-gray-600">€29M+ in managed e-commerce sales</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Company Values with Icons */}
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">Our Core Values</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">Honesty</h3>
                <p className="text-sm text-gray-600">Radical transparency in all we do</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">Mathematical Exactness</h3>
                <p className="text-sm text-gray-600">Precision in every calculation</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">Systems Thinking</h3>
                <p className="text-sm text-gray-600">Holistic approach to problems</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">Practical Results</h3>
                <p className="text-sm text-gray-600">Real-world impact matters</p>
              </div>
            </div>
          </section>

          {/* Why Choose DLV Insight */}
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">Why Amazon Sellers Choose DLV Insight</h2>
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Built by a Seller, for Sellers</h3>
                <p className="text-gray-700">
                  Unlike generic analytics tools, DLV Insight is built by someone who's faced the same challenges 
                  you're facing—inventory planning, cash flow management, and strategic growth decisions.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Plan vs. Fact: Our Unique Advantage</h3>
                <p className="text-gray-700">
                  We're the only platform that lets you create strategic plans and continuously compare them to 
                  actual results. Stop flying blind and start managing by exception.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">European Quality, Global Reach</h3>
                <p className="text-gray-700">
                  Based in Prague, we bring European standards of data privacy and precision to the global 
                  e-commerce market. GDPR-compliant and built for international sellers.
                </p>
              </div>
            </div>
          </section>

          {/* Business Registration */}
          <section className="mb-16">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">Trust & Transparency</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">Business Registration</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <span className="font-medium">Company:</span>
                    {' '}
                    Serhii Yaremenko, Ph.D.
                  </li>
                  <li>
                    <span className="font-medium">ICO:</span>
                    {' '}
                    19445784
                  </li>
                  <li>
                    <span className="font-medium">Address:</span>
                    {' '}
                    Varšavská 715/36, Praha 2, Czech Republic
                  </li>
                </ul>
              </div>
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">Compliance & Security</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ GDPR Compliant</li>
                  <li>✓ SOC 2 Type II (in progress)</li>
                  <li>✓ Bank-level encryption</li>
                  <li>✓ Amazon SP-API certified</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section with ID for anchor */}
          <section id="contact" className="mb-16">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">Let's Build Your Success Together</h2>
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
              <div className="mb-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Ready to transform your Amazon business?</h3>
                <p className="text-gray-700">
                  Whether you're managing $1M or $100M in sales, let's discuss how DLV Insight can help you 
                  make better decisions and achieve predictable growth.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Start Free Trial
                </Link>
                <a
                  href="mailto:info@dlvinsight.com?subject=Demo Request"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Schedule a Demo
                </a>
              </div>
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Email:</span>
                  {' '}
                  <a href="mailto:info@dlvinsight.com" className="text-blue-600 hover:text-blue-800">
                    info@dlvinsight.com
                  </a>
                </p>
                <p>
                  <span className="font-medium">LinkedIn:</span>
                  {' '}
                  <a
                    href="https://www.linkedin.com/in/yaremenko-serhii/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Connect with Serhii
                  </a>
                </p>
              </div>
            </div>
          </section>

          <div className="border-t pt-8 text-center">
            <p className="text-lg italic text-gray-600">
              "Honesty and Mathematical Exactness" - Building the future of e-commerce analytics from Prague to the world.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyPage;