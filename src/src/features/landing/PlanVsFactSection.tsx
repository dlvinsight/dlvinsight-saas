import { CheckIcon } from 'lucide-react';

export const PlanVsFactSection = () => {
  const benefits = [
    'Accurate profit forecasting',
    'Performance gap analysis',
    'Strategic planning capabilities',
    'Risk mitigation',
  ];

  return (
    <div className="bg-muted/50 py-24">
      <div className="mx-auto max-w-screen-lg px-3">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Forecast First, Measure Second
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Create detailed P&L forecasts and compare them to actual results.
              Identify gaps, optimize performance, and make data-driven adjustments
              to hit your targets.
            </p>
            <ul className="mt-8 space-y-3">
              {benefits.map(benefit => (
                <li key={benefit} className="flex items-start">
                  <CheckIcon className="mr-3 mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="rounded-lg border bg-background p-6 shadow-lg">
              <div className="mb-4 text-sm font-medium text-muted-foreground">
                Plan vs. Fact Analysis
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Q4 Revenue</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Plan: $250K</span>
                    <span className="text-green-600">Fact: $267K</span>
                    <span className="text-green-600">+6.8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Gross Profit</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Plan: $75K</span>
                    <span className="text-red-600">Fact: $71K</span>
                    <span className="text-red-600">-5.3%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Ad Spend</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Plan: $50K</span>
                    <span className="text-red-600">Fact: $58K</span>
                    <span className="text-red-600">+16%</span>
                  </div>
                </div>
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between font-medium">
                    <span>Net Profit</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Plan: $25K</span>
                      <span className="text-red-600">Fact: $13K</span>
                      <span className="text-red-600">-48%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Unique Feature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
