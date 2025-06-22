import { MetricType } from '../value-objects/MetricType';
import { Plan } from './Plan';
import { ActualResult } from './ActualResult';

export interface VarianceMetric {
  metricType: MetricType;
  plannedValue: number;
  actualValue: number;
  variance: number; // Actual - Planned
  variancePercentage: number; // ((Actual - Planned) / Planned) * 100
  status: 'FAVORABLE' | 'UNFAVORABLE' | 'NEUTRAL';
  dataQuality: 'COMPLETE' | 'PARTIAL' | 'ESTIMATED';
}

export interface VarianceProps {
  id: string;
  organizationId: string;
  sellerAccountId: string;
  planId: string;
  actualResultId: string;
  metrics: VarianceMetric[];
  overallStatus: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
  analysisNotes?: string;
  calculatedAt: Date;
}

export class Variance {
  private constructor(private props: VarianceProps) {
    this.validate();
  }

  static create(props: VarianceProps): Variance {
    return new Variance(props);
  }

  static calculate(plan: Plan, actualResult: ActualResult): Variance {
    if (plan.getId() !== actualResult.getPlanId()) {
      throw new Error('Plan and actual result must be related');
    }

    if (!plan.getPeriod().equals(actualResult.getPeriod())) {
      throw new Error('Plan and actual result must have the same period');
    }

    const varianceMetrics: VarianceMetric[] = [];

    // Calculate variance for each planned metric
    for (const planMetric of plan.getMetrics()) {
      const actualMetric = actualResult.getMetrics().find(
        a => a.metricType.equals(planMetric.metricType)
      );

      if (actualMetric) {
        const variance = actualMetric.actualValue - planMetric.plannedValue;
        const variancePercentage = planMetric.plannedValue !== 0
          ? (variance / planMetric.plannedValue) * 100
          : 0;

        const status = Variance.determineStatus(
          planMetric.metricType,
          variance,
          variancePercentage
        );

        varianceMetrics.push({
          metricType: planMetric.metricType,
          plannedValue: planMetric.plannedValue,
          actualValue: actualMetric.actualValue,
          variance,
          variancePercentage,
          status,
          dataQuality: actualMetric.dataQuality,
        });
      }
    }

    const overallStatus = Variance.determineOverallStatus(varianceMetrics);

    return new Variance({
      id: crypto.randomUUID(),
      organizationId: plan.getOrganizationId(),
      sellerAccountId: plan.getSellerAccountId(),
      planId: plan.getId(),
      actualResultId: actualResult.getId(),
      metrics: varianceMetrics,
      overallStatus,
      calculatedAt: new Date(),
    });
  }

  private static determineStatus(
    metricType: MetricType,
    variance: number,
    variancePercentage: number
  ): 'FAVORABLE' | 'UNFAVORABLE' | 'NEUTRAL' {
    // Tolerance threshold (5%)
    const threshold = 5;

    if (Math.abs(variancePercentage) <= threshold) {
      return 'NEUTRAL';
    }

    // For revenue and profit metrics, positive variance is favorable
    if (['REVENUE', 'PROFIT', 'UNITS'].includes(metricType.getCategory())) {
      return variance > 0 ? 'FAVORABLE' : 'UNFAVORABLE';
    }

    // For cost metrics, negative variance is favorable
    if (['COST', 'ADVERTISING'].includes(metricType.getCategory())) {
      return variance < 0 ? 'FAVORABLE' : 'UNFAVORABLE';
    }

    // For percentage metrics, depends on the specific metric
    if (metricType.getUnit() === 'PERCENTAGE') {
      switch (metricType.getKey()) {
        case 'PROFIT_MARGIN':
          return variance > 0 ? 'FAVORABLE' : 'UNFAVORABLE';
        case 'ACOS':
        case 'TACOS':
          return variance < 0 ? 'FAVORABLE' : 'UNFAVORABLE';
        default:
          return 'NEUTRAL';
      }
    }

    return 'NEUTRAL';
  }

  private static determineOverallStatus(
    metrics: VarianceMetric[]
  ): 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' {
    if (metrics.length === 0) {
      return 'OFF_TRACK';
    }

    // Priority metrics for overall status
    const priorityMetrics = ['NET_PROFIT', 'NET_REVENUE', 'PROFIT_MARGIN'];
    const priorityVariances = metrics.filter(
      m => priorityMetrics.includes(m.metricType.getKey())
    );

    // Count unfavorable variances
    const unfavorableCount = metrics.filter(
      m => m.status === 'UNFAVORABLE'
    ).length;

    const unfavorablePercentage = (unfavorableCount / metrics.length) * 100;

    // Check priority metrics first
    const priorityUnfavorable = priorityVariances.filter(
      m => m.status === 'UNFAVORABLE'
    ).length;

    if (priorityUnfavorable > 0) {
      // Any priority metric unfavorable means at risk or off track
      return unfavorablePercentage > 30 ? 'OFF_TRACK' : 'AT_RISK';
    }

    // Overall assessment
    if (unfavorablePercentage <= 20) {
      return 'ON_TRACK';
    } else if (unfavorablePercentage <= 40) {
      return 'AT_RISK';
    } else {
      return 'OFF_TRACK';
    }
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error('Variance ID is required');
    }

    if (!this.props.organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!this.props.sellerAccountId) {
      throw new Error('Seller account ID is required');
    }

    if (!this.props.planId) {
      throw new Error('Plan ID is required');
    }

    if (!this.props.actualResultId) {
      throw new Error('Actual result ID is required');
    }
  }

  // Getters
  getId(): string {
    return this.props.id;
  }

  getOrganizationId(): string {
    return this.props.organizationId;
  }

  getSellerAccountId(): string {
    return this.props.sellerAccountId;
  }

  getPlanId(): string {
    return this.props.planId;
  }

  getActualResultId(): string {
    return this.props.actualResultId;
  }

  getMetrics(): VarianceMetric[] {
    return [...this.props.metrics];
  }

  getOverallStatus(): 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' {
    return this.props.overallStatus;
  }

  getAnalysisNotes(): string | undefined {
    return this.props.analysisNotes;
  }

  getCalculatedAt(): Date {
    return this.props.calculatedAt;
  }

  // Business Methods
  getMetricVariance(metricKey: string): VarianceMetric | undefined {
    return this.props.metrics.find(
      m => m.metricType.getKey() === metricKey
    );
  }

  getUnfavorableMetrics(): VarianceMetric[] {
    return this.props.metrics.filter(m => m.status === 'UNFAVORABLE');
  }

  getFavorableMetrics(): VarianceMetric[] {
    return this.props.metrics.filter(m => m.status === 'FAVORABLE');
  }

  getLargestPositiveVariance(): VarianceMetric | undefined {
    return this.props.metrics.reduce((prev, current) => {
      if (!prev || current.variancePercentage > prev.variancePercentage) {
        return current;
      }
      return prev;
    }, undefined as VarianceMetric | undefined);
  }

  getLargestNegativeVariance(): VarianceMetric | undefined {
    return this.props.metrics.reduce((prev, current) => {
      if (!prev || current.variancePercentage < prev.variancePercentage) {
        return current;
      }
      return prev;
    }, undefined as VarianceMetric | undefined);
  }

  getRevenueVariance(): number {
    const revenueMetric = this.getMetricVariance('NET_REVENUE') || 
                         this.getMetricVariance('GROSS_REVENUE');
    return revenueMetric?.variance || 0;
  }

  getProfitVariance(): number {
    const profitMetric = this.getMetricVariance('NET_PROFIT');
    return profitMetric?.variance || 0;
  }

  getVarianceSummary(): {
    totalMetrics: number;
    favorable: number;
    unfavorable: number;
    neutral: number;
    overallPerformance: string;
  } {
    const favorable = this.props.metrics.filter(m => m.status === 'FAVORABLE').length;
    const unfavorable = this.props.metrics.filter(m => m.status === 'UNFAVORABLE').length;
    const neutral = this.props.metrics.filter(m => m.status === 'NEUTRAL').length;

    let overallPerformance = 'Mixed results';
    if (favorable > unfavorable * 2) {
      overallPerformance = 'Exceeding expectations';
    } else if (unfavorable > favorable * 2) {
      overallPerformance = 'Below expectations';
    } else if (Math.abs(favorable - unfavorable) <= 1) {
      overallPerformance = 'Meeting expectations';
    }

    return {
      totalMetrics: this.props.metrics.length,
      favorable,
      unfavorable,
      neutral,
      overallPerformance,
    };
  }

  addAnalysisNotes(notes: string): void {
    this.props.analysisNotes = notes;
  }

  getPerformanceGaps(): Array<{
    metric: string;
    gap: number;
    percentage: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
  }> {
    return this.props.metrics
      .filter(m => m.status === 'UNFAVORABLE')
      .map(m => ({
        metric: m.metricType.getName(),
        gap: m.variance,
        percentage: m.variancePercentage,
        impact: (Math.abs(m.variancePercentage) > 20 ? 'HIGH' :
                Math.abs(m.variancePercentage) > 10 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
      }))
      .sort((a, b) => Math.abs(b.percentage) - Math.abs(a.percentage));
  }
}