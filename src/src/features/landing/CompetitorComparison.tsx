import { CheckIcon, XIcon } from 'lucide-react';

export const CompetitorComparison = () => {
  const features = [
    {
      feature: 'Reporting',
      otherTools: 'Past performance',
      dlvInsight: 'Past + Future planning',
    },
    {
      feature: 'P&L Tracking',
      otherTools: 'Basic profit tracking',
      dlvInsight: 'Plan vs. Fact analysis',
    },
    {
      feature: 'Customer Analytics',
      otherTools: false,
      dlvInsight: 'LTV cohort analysis',
    },
    {
      feature: 'Forecasting',
      otherTools: false,
      dlvInsight: 'AI-powered predictions',
    },
    {
      feature: 'Strategic Planning',
      otherTools: false,
      dlvInsight: 'Proactive strategy tools',
    },
  ];

  return (
    <div className="bg-muted/50 py-24">
      <div className="mx-auto max-w-screen-lg px-3">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Why DLV Insight vs. Other Amazon Tools?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            See how we compare to other popular Amazon analytics tools
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-lg border bg-background shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">
                    Other Tools
                  </th>
                  <th className="bg-primary/5 px-6 py-4 text-center text-sm font-medium">
                    DLV Insight
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((row, index) => (
                  <tr key={row.feature} className={index !== features.length - 1 ? 'border-b' : ''}>
                    <td className="px-6 py-4 text-sm font-medium">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.otherTools ? (
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckIcon className="size-4 text-green-600" />
                          {row.otherTools}
                        </div>
                      ) : (
                        <XIcon className="inline size-4 text-red-600" />
                      )}
                    </td>
                    <td className="bg-primary/5 px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2 text-sm font-medium">
                        <CheckIcon className="size-4 text-green-600" />
                        {row.dlvInsight}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border bg-background p-6 text-center">
            <div className="text-3xl font-bold text-primary">5x</div>
            <div className="mt-2 text-sm text-muted-foreground">
              More strategic insights
            </div>
          </div>
          <div className="rounded-lg border bg-background p-6 text-center">
            <div className="text-3xl font-bold text-primary">23%</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Average profit increase
            </div>
          </div>
          <div className="rounded-lg border bg-background p-6 text-center">
            <div className="text-3xl font-bold text-primary">90%</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Forecast accuracy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};