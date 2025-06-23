import { BrainCircuitIcon, CalendarIcon, DollarSignIcon, PackageIcon } from 'lucide-react';

export const ForecastingSection = () => {
  const features = [
    {
      icon: DollarSignIcon,
      title: 'Revenue Predictions',
      description: 'Forecast sales with AI-powered accuracy',
    },
    {
      icon: PackageIcon,
      title: 'Inventory Planning',
      description: 'Never run out of stock or overstock again',
    },
    {
      icon: CalendarIcon,
      title: 'Seasonal Insights',
      description: 'Plan for peak seasons and holidays',
    },
    {
      icon: BrainCircuitIcon,
      title: 'Smart Recommendations',
      description: 'AI-driven strategic suggestions',
    },
  ];

  return (
    <div className="bg-muted/50 py-24">
      <div className="mx-auto max-w-screen-lg px-3">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Predict Tomorrow's Success Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            AI-powered forecasting engine analyzes historical data, market trends,
            and seasonality to predict future performance with unprecedented accuracy.
          </p>
        </div>

        <div className="mt-12">
          <div className="rounded-lg border bg-background p-8 shadow-lg">
            <div className="mb-6 text-center text-sm font-medium text-muted-foreground">
              90-Day Revenue Forecast
            </div>
            <div className="relative h-48">
              <svg className="size-full" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,150 Q 100,130 200,100 T 400,60"
                  fill="none"
                  stroke="rgb(99, 102, 241)"
                  strokeWidth="2"
                />
                <path
                  d="M 0,150 Q 100,130 200,100 T 400,60 L 400,200 L 0,200 Z"
                  fill="url(#gradient)"
                />
                <path
                  d="M 200,100 Q 250,95 300,85 T 400,60"
                  fill="none"
                  stroke="rgb(99, 102, 241)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
                <circle cx="200" cy="100" r="4" fill="rgb(99, 102, 241)" />
                <text x="190" y="90" className="fill-current text-xs font-medium">
                  Today
                </text>
                <text x="350" y="50" className="fill-current text-xs font-medium">
                  +23%
                </text>
              </svg>
            </div>
            <div className="mt-6 flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-indigo-500" />
                <span className="text-muted-foreground">Historical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full border-2 border-indigo-500" />
                <span className="text-muted-foreground">Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-indigo-500/30" />
                <span className="text-muted-foreground">Confidence Interval</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(feature => (
            <div key={feature.title} className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="size-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
