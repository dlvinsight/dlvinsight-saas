import { PlanPeriod } from '../value-objects/PlanPeriod';
import { MetricType } from '../value-objects/MetricType';

export interface ActualMetric {
  metricType: MetricType;
  actualValue: number;
  dataQuality: 'COMPLETE' | 'PARTIAL' | 'ESTIMATED';
  lastUpdated: Date;
}

export interface ActualResultProps {
  id: string;
  organizationId: string;
  sellerAccountId: string;
  planId: string;
  period: PlanPeriod;
  metrics: ActualMetric[];
  dataCompleteness: number; // Percentage 0-100
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ActualResult {
  private constructor(private props: ActualResultProps) {
    this.validate();
  }

  static create(props: ActualResultProps): ActualResult {
    return new ActualResult(props);
  }

  static createForPlan(params: {
    planId: string;
    organizationId: string;
    sellerAccountId: string;
    period: PlanPeriod;
  }): ActualResult {
    const now = new Date();
    return new ActualResult({
      id: crypto.randomUUID(),
      organizationId: params.organizationId,
      sellerAccountId: params.sellerAccountId,
      planId: params.planId,
      period: params.period,
      metrics: [],
      dataCompleteness: 0,
      lastSyncedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error('Actual result ID is required');
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

    if (this.props.dataCompleteness < 0 || this.props.dataCompleteness > 100) {
      throw new Error('Data completeness must be between 0 and 100');
    }

    // Validate metrics don't have duplicates
    const metricKeys = this.props.metrics.map(m => m.metricType.getKey());
    const uniqueKeys = new Set(metricKeys);
    if (metricKeys.length !== uniqueKeys.size) {
      throw new Error('Actual result cannot have duplicate metrics');
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

  getPeriod(): PlanPeriod {
    return this.props.period;
  }

  getMetrics(): ActualMetric[] {
    return [...this.props.metrics];
  }

  getDataCompleteness(): number {
    return this.props.dataCompleteness;
  }

  getLastSyncedAt(): Date {
    return this.props.lastSyncedAt;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods
  updateMetric(metric: ActualMetric): void {
    const index = this.props.metrics.findIndex(
      m => m.metricType.equals(metric.metricType)
    );

    if (index === -1) {
      this.props.metrics.push(metric);
    } else {
      this.props.metrics[index] = metric;
    }

    this.props.updatedAt = new Date();
    this.recalculateDataCompleteness();
  }

  updateMetrics(metrics: ActualMetric[]): void {
    for (const metric of metrics) {
      this.updateMetric(metric);
    }
  }

  getMetricValue(metricKey: string): number | undefined {
    const metric = this.props.metrics.find(
      m => m.metricType.getKey() === metricKey
    );
    return metric?.actualValue;
  }

  getMetricQuality(metricKey: string): 'COMPLETE' | 'PARTIAL' | 'ESTIMATED' | undefined {
    const metric = this.props.metrics.find(
      m => m.metricType.getKey() === metricKey
    );
    return metric?.dataQuality;
  }

  private recalculateDataCompleteness(): void {
    if (this.props.metrics.length === 0) {
      this.props.dataCompleteness = 0;
      return;
    }

    const completeMetrics = this.props.metrics.filter(
      m => m.dataQuality === 'COMPLETE'
    ).length;

    const partialMetrics = this.props.metrics.filter(
      m => m.dataQuality === 'PARTIAL'
    ).length;

    // Complete metrics count as 100%, partial as 50%, estimated as 25%
    const totalScore = 
      (completeMetrics * 1) + 
      (partialMetrics * 0.5) + 
      ((this.props.metrics.length - completeMetrics - partialMetrics) * 0.25);

    this.props.dataCompleteness = Math.round(
      (totalScore / this.props.metrics.length) * 100
    );
  }

  markSynced(syncedAt: Date = new Date()): void {
    this.props.lastSyncedAt = syncedAt;
    this.props.updatedAt = new Date();
  }

  isDataComplete(): boolean {
    return this.props.dataCompleteness >= 95;
  }

  isDataStale(hoursThreshold: number = 24): boolean {
    const hoursSinceSync = 
      (Date.now() - this.props.lastSyncedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > hoursThreshold;
  }

  needsUpdate(): boolean {
    // Needs update if data is incomplete or stale
    return !this.isDataComplete() || this.isDataStale();
  }

  getTotalActualRevenue(): number {
    const revenueMetric = this.props.metrics.find(
      m => m.metricType.getKey() === 'NET_REVENUE' || 
           m.metricType.getKey() === 'GROSS_REVENUE'
    );
    return revenueMetric?.actualValue || 0;
  }

  getTotalActualProfit(): number {
    const profitMetric = this.props.metrics.find(
      m => m.metricType.getKey() === 'NET_PROFIT'
    );
    return profitMetric?.actualValue || 0;
  }

  getProfitMargin(): number {
    const revenue = this.getTotalActualRevenue();
    const profit = this.getTotalActualProfit();
    
    if (revenue === 0) return 0;
    return (profit / revenue) * 100;
  }

  // Calculate metrics that weren't directly imported
  calculateDerivedMetrics(): void {
    // This would implement the formulas defined in MetricType
    // For now, keeping it simple
    const updatedAt = new Date();
    
    // Example: Calculate profit margin if we have revenue and profit
    const revenue = this.getMetricValue('NET_REVENUE');
    const profit = this.getMetricValue('NET_PROFIT');
    
    if (revenue && profit && revenue > 0) {
      const profitMargin = (profit / revenue) * 100;
      this.updateMetric({
        metricType: MetricType.fromKey('PROFIT_MARGIN'),
        actualValue: profitMargin,
        dataQuality: 'COMPLETE',
        lastUpdated: updatedAt,
      });
    }

    // Add more calculated metrics as needed
  }
}