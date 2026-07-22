export interface TrendPoint {
  label: string;
  critical: number;
  warning: number;
  low: number;
}

export interface DistributionPoint {
  name: string;
  value: number;
}

export interface UsagePoint {
  label: string;
  cpu: number;
  memory: number;
}
