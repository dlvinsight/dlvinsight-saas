export type MetricCategory = 
  | 'REVENUE'
  | 'COST'
  | 'PROFIT'
  | 'UNITS'
  | 'ADVERTISING'
  | 'INVENTORY';

export interface MetricDefinition {
  key: string;
  name: string;
  category: MetricCategory;
  unit: 'CURRENCY' | 'PERCENTAGE' | 'COUNT';
  isCalculated: boolean;
  formula?: string;
}

export class MetricType {
  private static readonly METRICS: Record<string, MetricDefinition> = {
    // Revenue Metrics
    GROSS_REVENUE: {
      key: 'GROSS_REVENUE',
      name: 'Gross Revenue',
      category: 'REVENUE',
      unit: 'CURRENCY',
      isCalculated: false,
    },
    NET_REVENUE: {
      key: 'NET_REVENUE',
      name: 'Net Revenue',
      category: 'REVENUE',
      unit: 'CURRENCY',
      isCalculated: true,
      formula: 'GROSS_REVENUE - RETURNS - REFUNDS',
    },
    
    // Cost Metrics
    COGS: {
      key: 'COGS',
      name: 'Cost of Goods Sold',
      category: 'COST',
      unit: 'CURRENCY',
      isCalculated: false,
    },
    AMAZON_FEES: {
      key: 'AMAZON_FEES',
      name: 'Amazon Fees',
      category: 'COST',
      unit: 'CURRENCY',
      isCalculated: false,
    },
    FBA_FEES: {
      key: 'FBA_FEES',
      name: 'FBA Fees',
      category: 'COST',
      unit: 'CURRENCY',
      isCalculated: false,
    },
    ADVERTISING_SPEND: {
      key: 'ADVERTISING_SPEND',
      name: 'Advertising Spend',
      category: 'ADVERTISING',
      unit: 'CURRENCY',
      isCalculated: false,
    },
    
    // Profit Metrics
    GROSS_PROFIT: {
      key: 'GROSS_PROFIT',
      name: 'Gross Profit',
      category: 'PROFIT',
      unit: 'CURRENCY',
      isCalculated: true,
      formula: 'NET_REVENUE - COGS',
    },
    NET_PROFIT: {
      key: 'NET_PROFIT',
      name: 'Net Profit',
      category: 'PROFIT',
      unit: 'CURRENCY',
      isCalculated: true,
      formula: 'GROSS_PROFIT - AMAZON_FEES - FBA_FEES - ADVERTISING_SPEND - OTHER_EXPENSES',
    },
    PROFIT_MARGIN: {
      key: 'PROFIT_MARGIN',
      name: 'Profit Margin',
      category: 'PROFIT',
      unit: 'PERCENTAGE',
      isCalculated: true,
      formula: '(NET_PROFIT / NET_REVENUE) * 100',
    },
    
    // Unit Metrics
    UNITS_SOLD: {
      key: 'UNITS_SOLD',
      name: 'Units Sold',
      category: 'UNITS',
      unit: 'COUNT',
      isCalculated: false,
    },
    UNITS_RETURNED: {
      key: 'UNITS_RETURNED',
      name: 'Units Returned',
      category: 'UNITS',
      unit: 'COUNT',
      isCalculated: false,
    },
    
    // Advertising Metrics
    ACOS: {
      key: 'ACOS',
      name: 'ACoS (Advertising Cost of Sale)',
      category: 'ADVERTISING',
      unit: 'PERCENTAGE',
      isCalculated: true,
      formula: '(ADVERTISING_SPEND / AD_REVENUE) * 100',
    },
    TACOS: {
      key: 'TACOS',
      name: 'TACoS (Total ACoS)',
      category: 'ADVERTISING',
      unit: 'PERCENTAGE',
      isCalculated: true,
      formula: '(ADVERTISING_SPEND / NET_REVENUE) * 100',
    },
    
    // Inventory Metrics
    INVENTORY_VALUE: {
      key: 'INVENTORY_VALUE',
      name: 'Inventory Value',
      category: 'INVENTORY',
      unit: 'CURRENCY',
      isCalculated: false,
    },
    DAYS_OF_INVENTORY: {
      key: 'DAYS_OF_INVENTORY',
      name: 'Days of Inventory',
      category: 'INVENTORY',
      unit: 'COUNT',
      isCalculated: true,
      formula: 'INVENTORY_UNITS / (UNITS_SOLD / DAYS_IN_PERIOD)',
    },
  };

  private constructor(private readonly definition: MetricDefinition) {}

  static fromKey(key: string): MetricType {
    const definition = MetricType.METRICS[key];
    if (!definition) {
      throw new Error(`Unknown metric type: ${key}`);
    }
    return new MetricType(definition);
  }

  static getAllByCategory(category: MetricCategory): MetricType[] {
    return Object.values(MetricType.METRICS)
      .filter(def => def.category === category)
      .map(def => new MetricType(def));
  }

  static getPlanningMetrics(): MetricType[] {
    // Return metrics that are typically planned/forecasted
    const planningKeys = [
      'GROSS_REVENUE',
      'UNITS_SOLD',
      'COGS',
      'AMAZON_FEES',
      'FBA_FEES',
      'ADVERTISING_SPEND',
      'NET_PROFIT',
      'PROFIT_MARGIN',
      'INVENTORY_VALUE',
    ];
    
    return planningKeys.map(key => MetricType.fromKey(key));
  }

  getKey(): string {
    return this.definition.key;
  }

  getName(): string {
    return this.definition.name;
  }

  getCategory(): MetricCategory {
    return this.definition.category;
  }

  getUnit(): 'CURRENCY' | 'PERCENTAGE' | 'COUNT' {
    return this.definition.unit;
  }

  isCalculated(): boolean {
    return this.definition.isCalculated;
  }

  getFormula(): string | undefined {
    return this.definition.formula;
  }

  equals(other: MetricType): boolean {
    return this.definition.key === other.definition.key;
  }

  toString(): string {
    return this.definition.key;
  }
}