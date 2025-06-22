import { PlanPeriod } from '../value-objects/PlanPeriod';
import { MetricType } from '../value-objects/MetricType';

export interface PlanMetric {
  metricType: MetricType;
  plannedValue: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

export interface PlanProps {
  id: string;
  organizationId: string;
  sellerAccountId: string;
  name: string;
  description?: string;
  period: PlanPeriod;
  metrics: PlanMetric[];
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Plan {
  private constructor(private props: PlanProps) {
    this.validate();
  }

  static create(props: PlanProps): Plan {
    return new Plan(props);
  }

  static createNew(params: {
    organizationId: string;
    sellerAccountId: string;
    name: string;
    description?: string;
    period: PlanPeriod;
    createdBy: string;
  }): Plan {
    const now = new Date();
    return new Plan({
      id: crypto.randomUUID(),
      organizationId: params.organizationId,
      sellerAccountId: params.sellerAccountId,
      name: params.name,
      description: params.description,
      period: params.period,
      metrics: [],
      status: 'DRAFT',
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error('Plan ID is required');
    }

    if (!this.props.organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!this.props.sellerAccountId) {
      throw new Error('Seller account ID is required');
    }

    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Plan name is required');
    }

    if (!this.props.createdBy) {
      throw new Error('Created by user ID is required');
    }

    // Validate metrics don't have duplicates
    const metricKeys = this.props.metrics.map(m => m.metricType.getKey());
    const uniqueKeys = new Set(metricKeys);
    if (metricKeys.length !== uniqueKeys.size) {
      throw new Error('Plan cannot have duplicate metrics');
    }

    // Validate calculated metrics have their dependencies
    this.validateCalculatedMetrics();
  }

  private validateCalculatedMetrics(): void {
    const metricKeys = new Set(this.props.metrics.map(m => m.metricType.getKey()));
    
    for (const metric of this.props.metrics) {
      if (metric.metricType.isCalculated()) {
        const formula = metric.metricType.getFormula();
        if (formula) {
          // Simple check for metric dependencies (this could be more sophisticated)
          const requiredMetrics = formula.match(/[A-Z_]+/g) || [];
          for (const required of requiredMetrics) {
            if (MetricType.fromKey(required) && !metricKeys.has(required)) {
              // Only validate if it's a valid metric key
              try {
                MetricType.fromKey(required);
                console.warn(
                  `Calculated metric ${metric.metricType.getKey()} depends on ${required} which is not in the plan`
                );
              } catch {
                // Not a metric key, likely a constant or operator
              }
            }
          }
        }
      }
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

  getName(): string {
    return this.props.name;
  }

  getDescription(): string | undefined {
    return this.props.description;
  }

  getPeriod(): PlanPeriod {
    return this.props.period;
  }

  getMetrics(): PlanMetric[] {
    return [...this.props.metrics];
  }

  getStatus(): 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' {
    return this.props.status;
  }

  getCreatedBy(): string {
    return this.props.createdBy;
  }

  getApprovedBy(): string | undefined {
    return this.props.approvedBy;
  }

  getApprovedAt(): Date | undefined {
    return this.props.approvedAt;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods
  addMetric(metric: PlanMetric): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Can only add metrics to draft plans');
    }

    const exists = this.props.metrics.some(
      m => m.metricType.equals(metric.metricType)
    );

    if (exists) {
      throw new Error(`Metric ${metric.metricType.getName()} already exists in plan`);
    }

    this.props.metrics.push(metric);
    this.props.updatedAt = new Date();
  }

  updateMetric(metricKey: string, updates: Partial<PlanMetric>): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Can only update metrics in draft plans');
    }

    const index = this.props.metrics.findIndex(
      m => m.metricType.getKey() === metricKey
    );

    if (index === -1) {
      throw new Error(`Metric ${metricKey} not found in plan`);
    }

    const currentMetric = this.props.metrics[index];
    if (!currentMetric) {
      throw new Error(`Metric at index ${index} not found`);
    }

    this.props.metrics[index] = {
      ...currentMetric,
      ...updates,
      metricType: currentMetric.metricType, // Ensure metricType is not overwritten
    };
    this.props.updatedAt = new Date();
  }

  removeMetric(metricKey: string): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Can only remove metrics from draft plans');
    }

    this.props.metrics = this.props.metrics.filter(
      m => m.metricType.getKey() !== metricKey
    );
    this.props.updatedAt = new Date();
  }

  approve(userId: string): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Can only approve draft plans');
    }

    if (this.props.metrics.length === 0) {
      throw new Error('Cannot approve plan with no metrics');
    }

    this.props.status = 'ACTIVE';
    this.props.approvedBy = userId;
    this.props.approvedAt = new Date();
    this.props.updatedAt = new Date();
  }

  complete(): void {
    if (this.props.status !== 'ACTIVE') {
      throw new Error('Can only complete active plans');
    }

    const now = new Date();
    if (now < this.props.period.getEndDate()) {
      throw new Error('Cannot complete plan before period ends');
    }

    this.props.status = 'COMPLETED';
    this.props.updatedAt = new Date();
  }

  archive(): void {
    if (this.props.status === 'ARCHIVED') {
      throw new Error('Plan is already archived');
    }

    this.props.status = 'ARCHIVED';
    this.props.updatedAt = new Date();
  }

  getMetricValue(metricKey: string): number | undefined {
    const metric = this.props.metrics.find(
      m => m.metricType.getKey() === metricKey
    );
    return metric?.plannedValue;
  }

  getTotalPlannedRevenue(): number {
    const revenueMetric = this.props.metrics.find(
      m => m.metricType.getKey() === 'NET_REVENUE' || 
           m.metricType.getKey() === 'GROSS_REVENUE'
    );
    return revenueMetric?.plannedValue || 0;
  }

  getTotalPlannedProfit(): number {
    const profitMetric = this.props.metrics.find(
      m => m.metricType.getKey() === 'NET_PROFIT'
    );
    return profitMetric?.plannedValue || 0;
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE' && 
           new Date() >= this.props.period.getStartDate() &&
           new Date() <= this.props.period.getEndDate();
  }

  canEdit(): boolean {
    return this.props.status === 'DRAFT';
  }
}