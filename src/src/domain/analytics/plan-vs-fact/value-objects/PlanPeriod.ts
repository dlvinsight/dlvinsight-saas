export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export class PlanPeriod {
  private constructor(
    private readonly startDate: Date,
    private readonly endDate: Date,
    private readonly periodType: PeriodType,
  ) {
    this.validate();
  }

  static create(startDate: Date, endDate: Date, periodType: PeriodType): PlanPeriod {
    return new PlanPeriod(startDate, endDate, periodType);
  }

  static createMonthly(year: number, month: number): PlanPeriod {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return new PlanPeriod(startDate, endDate, 'MONTHLY');
  }

  static createQuarterly(year: number, quarter: 1 | 2 | 3 | 4): PlanPeriod {
    const quarterStartMonth = (quarter - 1) * 3;
    const startDate = new Date(year, quarterStartMonth, 1);
    const endDate = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999);
    return new PlanPeriod(startDate, endDate, 'QUARTERLY');
  }

  static createYearly(year: number): PlanPeriod {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    return new PlanPeriod(startDate, endDate, 'YEARLY');
  }

  private validate(): void {
    if (this.startDate >= this.endDate) {
      throw new Error('Start date must be before end date');
    }

    const daysDiff = Math.ceil(
      (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Validate period type matches date range
    switch (this.periodType) {
      case 'DAILY':
        if (daysDiff !== 1) {
          throw new Error('Daily period must span exactly 1 day');
        }
        break;
      case 'WEEKLY':
        if (daysDiff < 6 || daysDiff > 8) {
          throw new Error('Weekly period must span 7 days');
        }
        break;
      case 'MONTHLY':
        if (daysDiff < 28 || daysDiff > 31) {
          throw new Error('Monthly period must span 28-31 days');
        }
        break;
      case 'QUARTERLY':
        if (daysDiff < 89 || daysDiff > 92) {
          throw new Error('Quarterly period must span 90-92 days');
        }
        break;
      case 'YEARLY':
        if (daysDiff < 365 || daysDiff > 366) {
          throw new Error('Yearly period must span 365-366 days');
        }
        break;
    }
  }

  getStartDate(): Date {
    return new Date(this.startDate);
  }

  getEndDate(): Date {
    return new Date(this.endDate);
  }

  getPeriodType(): PeriodType {
    return this.periodType;
  }

  getLabel(): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
    };

    switch (this.periodType) {
      case 'DAILY':
        return this.startDate.toLocaleDateString('en-US', {
          ...options,
          day: 'numeric',
        });
      case 'WEEKLY':
        return `Week of ${this.startDate.toLocaleDateString('en-US', {
          ...options,
          day: 'numeric',
        })}`;
      case 'MONTHLY':
        return this.startDate.toLocaleDateString('en-US', options);
      case 'QUARTERLY':
        const quarter = Math.floor(this.startDate.getMonth() / 3) + 1;
        return `Q${quarter} ${this.startDate.getFullYear()}`;
      case 'YEARLY':
        return this.startDate.getFullYear().toString();
    }
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  getDaysInPeriod(): number {
    return Math.ceil(
      (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  equals(other: PlanPeriod): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime()
      && this.endDate.getTime() === other.endDate.getTime()
      && this.periodType === other.periodType
    );
  }

  overlaps(other: PlanPeriod): boolean {
    return (
      this.startDate <= other.endDate
      && this.endDate >= other.startDate
    );
  }
}
