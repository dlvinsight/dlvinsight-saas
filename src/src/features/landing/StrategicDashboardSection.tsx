import { BarChart3Icon, LineChartIcon, PieChartIcon, TargetIcon } from 'lucide-react';

export const StrategicDashboardSection = () => {
  const metrics = [
    {
      icon: TargetIcon,
      label: 'Goal Tracking',
      value: '87%',
      trend: '+12%',
    },
    {
      icon: LineChartIcon,
      label: 'Revenue Growth',
      value: '$1.2M',
      trend: '+23%',
    },
    {
      icon: PieChartIcon,
      label: 'Profit Margin',
      value: '18.5%',
      trend: '+3.2%',
    },
    {
      icon: BarChart3Icon,
      label: 'Product Performance',
      value: '92/100',
      trend: '+8pts',
    },
  ];

  return (
    <div className="py-24">
      <div className="mx-auto max-w-screen-lg px-3">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              From Data to Strategy
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Transform raw Amazon data into strategic insights with advanced
              business intelligence tools designed for serious sellers.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <TargetIcon className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Strategic Decision Making</div>
                  <div className="text-sm text-muted-foreground">
                    Data-driven insights for better business decisions
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <LineChartIcon className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Performance Monitoring</div>
                  <div className="text-sm text-muted-foreground">
                    Real-time tracking of key business metrics
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3Icon className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Business Intelligence</div>
                  <div className="text-sm text-muted-foreground">
                    Advanced analytics for competitive advantage
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-lg border bg-background p-6 shadow-lg">
              <div className="mb-6 text-sm font-medium text-muted-foreground">
                Executive Dashboard
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {metrics.map(metric => (
                  <div key={metric.label} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <metric.icon className="size-5 text-muted-foreground" />
                      <span className="text-xs font-medium text-green-600">
                        {metric.trend}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {metric.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <div className="text-sm font-medium">Key Insights</div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• Q4 revenue on track to exceed forecast by 15%</li>
                  <li>• Top 3 products driving 68% of total profit</li>
                  <li>• Customer acquisition cost decreased by 22%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
