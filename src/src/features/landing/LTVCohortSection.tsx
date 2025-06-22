import { TrendingUpIcon } from 'lucide-react';

export const LTVCohortSection = () => {
  const benefits = [
    'Customer value optimization',
    'Acquisition cost optimization',
    'Retention strategy insights',
    'Profit maximization',
  ];

  return (
    <div className="py-24">
      <div className="mx-auto max-w-screen-lg px-3">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-lg border bg-background p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Customer Lifetime Value by Cohort
                </span>
                <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                  <TrendingUpIcon className="size-3" />
                  MVP Feature
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Jan 2024 Cohort</span>
                    <span className="font-medium">$284 LTV</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full bg-gradient-to-r from-green-500 to-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Feb 2024 Cohort</span>
                    <span className="font-medium">$256 LTV</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[90%] bg-gradient-to-r from-blue-500 to-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Mar 2024 Cohort</span>
                    <span className="font-medium">$198 LTV</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[70%] bg-gradient-to-r from-purple-500 to-purple-600" />
                  </div>
                </div>
                <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
                  Average CAC: $45 • ROI: 5.2x
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Know Your Customer's True Value
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Advanced cohort analysis reveals customer lifetime value patterns, 
              helping you optimize acquisition costs and maximize long-term 
              profitability.
            </p>
            <ul className="mt-8 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start">
                  <div className="mr-3 mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};