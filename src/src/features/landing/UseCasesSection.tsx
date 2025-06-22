import { RocketIcon, TrendingUpIcon, CrownIcon } from 'lucide-react';

export const UseCasesSection = () => {
  const useCases = [
    {
      icon: RocketIcon,
      title: 'New Sellers',
      subtitle: 'Launch with Confidence',
      features: [
        'Plan your first product launch',
        'Forecast break-even timeline',
        'Avoid common profitability mistakes',
      ],
      accentColor: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: TrendingUpIcon,
      title: 'Growing Sellers',
      subtitle: 'Scale Strategically',
      features: [
        'Optimize product mix for maximum profit',
        'Plan inventory for seasonal demand',
        'Identify your most valuable customers',
      ],
      accentColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: CrownIcon,
      title: 'Established Sellers',
      subtitle: 'Maximize Profitability',
      features: [
        'Advanced P&L optimization',
        'Long-term strategic planning',
        'Portfolio performance analysis',
      ],
      accentColor: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="py-24">
      <div className="mx-auto max-w-screen-lg px-3">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Perfect for Every Stage of Your Amazon Journey
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Whether you're just starting or scaling to millions, DLV Insight grows with you
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="group relative">
              <div className="h-full rounded-lg border bg-background p-6 transition-shadow hover:shadow-lg">
                <div className={`inline-flex rounded-lg p-3 ${useCase.bgColor}`}>
                  <useCase.icon className={`size-6 ${useCase.accentColor}`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{useCase.title}</h3>
                <p className={`mt-1 text-sm font-medium ${useCase.accentColor}`}>
                  {useCase.subtitle}
                </p>
                <ul className="mt-4 space-y-3">
                  {useCase.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className={`mr-2 mt-1.5 size-1.5 shrink-0 rounded-full ${useCase.bgColor}`} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-primary/5 p-8 text-center">
          <h3 className="text-xl font-semibold">No matter where you are in your journey</h3>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            DLV Insight provides the strategic planning tools and insights you need to succeed
          </p>
        </div>
      </div>
    </div>
  );
};